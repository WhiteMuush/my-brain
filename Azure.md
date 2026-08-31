# Azure

Notes de labo autour de Kubernetes sur AKS et du stockage objet. Presque
toutes les surprises viennent d'une seule idée : Azure sépare le **plan de
gestion**, la fiche de la ressource, du **plan de données**, son contenu.

Être propriétaire d'un storage account ne donne aucun droit sur les blobs qu'il
contient. Ce sont deux systèmes de permissions distincts.

## Le décor du projet Velero

| Quoi | Valeur |
|---|---|
| Resource group | `mpetitRG` |
| Cluster AKS | `aks-velero`, France Central |
| Storage account | `mpaccountstorage` |
| Container | `storagevelerocontainer` |
| Identité managée | `id-velero` |

```bash
az aks get-credentials --resource-group mpetitRG --name aks-velero
```

## Workload Identity

Ce qui remplace les clés d'accès. Quatre pièces, et il faut les quatre, sinon
tout paraît correct et rien ne marche.

1. Le cluster émet des jetons OIDC : `oidc_issuer_enabled = true`
2. Le webhook les injecte dans les pods : `workload_identity_enabled = true`
3. Une identité managée, avec son rôle sur la ressource cible
4. Une *federated credential* qui déclare la confiance entre les deux mondes

```hcl
resource "azurerm_federated_identity_credential" "velero" {
  name                      = "velero-federated-credential"
  user_assigned_identity_id = azurerm_user_assigned_identity.velero.id
  audience                  = ["api://AzureADTokenExchange"]
  issuer                    = azurerm_kubernetes_cluster.velero.oidc_issuer_url
  subject                   = "system:serviceaccount:velero:velero"
}
```

Le `subject` se lit littéralement : le ServiceAccount `velero`, du namespace
`velero`, de ce cluster, peut endosser cette identité. Rien d'autre ne le peut.

Côté cluster, l'annotation qui ferme la boucle :

```bash
kubectl annotate serviceaccount velero -n velero \
  azure.workload.identity/client-id=$(az identity show -g mpetitRG -n id-velero --query clientId -o tsv)
```

Terraform dit à Azure **qui a le droit**. L'annotation dit au ServiceAccount
**quoi endosser**. Les deux bouts doivent se répondre.

Et le pod doit porter le label `azure.workload.identity/use=true`, sinon le
webhook n'injecte rien. Voir Velero.

## Moindre privilège sur le stockage

La doc du plugin attribue le rôle au niveau souscription. Le scoper sur le seul
storage account :

```hcl
resource "azurerm_role_assignment" "velero_storage" {
  scope                = azurerm_storage_account.velero.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.velero.principal_id
}
```

## Points à comprendre

**Plan de gestion et plan de données ne se recouvrent pas.** Owner sur le
storage account permet de le supprimer, pas de lire un blob. Il faut un rôle
`Storage Blob Data Reader` ou `Contributor` en plus, explicitement.

**Un 403 sur `Microsoft.Storage/storageAccounts/read` peut être inoffensif.** Le
plugin Velero interroge le plan de gestion pour découvrir l'URL du endpoint, se
fait refuser avec un rôle data seul, et retombe sur l'URL par défaut qui est la
bonne. C'est un `level=info`, pas une panne.

**Une attribution de rôle met une à deux minutes à se propager.** Un refus juste
après un `apply` ne veut pas dire que la configuration est fausse. Attendre et
réessayer avant de partir déboguer.

**`az role assignment` veut l'object id AAD**, pas une adresse mail
personnelle. Le compte de formation n'a rien à voir avec le Gmail :

```bash
az ad signed-in-user show --query "{id:id, upn:userPrincipalName}"
```

**Un nom de storage account est unique dans tout Azure.** 3 à 24 caractères,
minuscules et chiffres uniquement. D'où l'intérêt d'un suffixe aléatoire, voir
Terraform State GitLab.

**AKS crée un deuxième resource group `MC_...`.** Le *node resource group* :
VMSS, load balancer, NSG, disques. Il a son propre historique de déploiement, et
beaucoup de ressources « invisibles » sont là-dedans.

**L'onglet Deployments reste vide avec Terraform.** Terraform appelle
directement les API des resource providers, sans passer par un template ARM,
donc il n'écrit aucun historique de déploiement. Ce n'est pas un bug.

## Pièges rencontrés

L'IP publique d'un `Service` de type `LoadBalancer` **change** après chaque
suppression et recréation, Azure libère l'ancienne. Toujours relire la sortie :

```bash
kubectl get svc nginx -n velero-lab
```

L'issuer OIDC seul ne suffit pas, vérifier que Workload Identity est bien actif :

```bash
az aks show -g mpetitRG -n aks-velero \
  --query "{oidc:oidcIssuerProfile.enabled, wi:securityProfile.workloadIdentity.enabled}"
```

Un `terraform apply` pendant une suppression en cours se fait rejeter. Attendre
que l'état ne soit plus `Deleting` :

```bash
az aks show -g mpetitRG -n aks-velero --query provisioningState -o tsv
```

Lister les blobs sans rôle data, en passant par la clé du compte :

```bash
az storage blob list --account-name mpaccountstorage \
  --container-name storagevelerocontainer --auth-mode key --query "[].name" -o tsv
```

Vider un container, sans confirmation, attention :

```bash
az storage blob delete-batch --account-name mpaccountstorage \
  --source storagevelerocontainer --auth-mode key
```

## Raccourcis du projet

```bash
make kubeconfig     # pointe kubectl sur le cluster
make setup-velero   # installe Velero avec Workload Identity
make blobs          # liste ce que Velero a ecrit dans le container
make destroy        # detruit tout, un AKS se facture a l'heure
```

## Doc

https://learn.microsoft.com/azure/aks/workload-identity-overview

https://learn.microsoft.com/azure/storage/blobs/authorize-access-azure-active-directory,
la distinction plan de gestion et plan de données.
