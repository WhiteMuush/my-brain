# Stockage

Domaine stockage de [[AZ-104]], 15 à 20 % de l'examen. Tout part du **storage
account**, qui est l'unité de facturation, de configuration réseau et de nommage.

Cette note est le sommaire. Chaque sujet a sa fiche.

| Fiche | Ce qu'elle couvre |
|---|---|
| [[Stockage Compte]] | Types de compte, nommage, services, Premium contre Standard |
| [[Stockage Redondance]] | LRS, ZRS, GRS, GZRS et les variantes RA- |
| [[Stockage Blob]] | Types de blob, niveaux d'accès, lifecycle, réplication d'objets |
| [[Stockage Accès]] | Clés, SAS, Entra ID et RBAC |
| [[Stockage Chiffrement]] | SSE, clés gérées par le client, chiffrement d'infrastructure |
| [[Stockage Réseau]] | Pare-feu, service endpoints, private endpoints, domaine personnalisé |
| [[Azure Files]] | Partages SMB et NFS, snapshots, soft delete, File Sync |

## Les cinq réflexes qui répondent à la moitié des questions

1. **L'identité bat le secret.** Entra ID et RBAC passent avant la clé de compte
   ou le SAS partagé, dans à peu près toutes les questions de scénario.
2. **Rien ne se convertit en place.** Ni Standard vers Premium, ni block blob
   vers page blob. On recrée, puis on copie.
3. **Le froid coûte moins cher à stocker et plus cher à tout le reste.** Pénalité
   d'écriture au moment du changement de niveau, durée minimale de séjour, délai
   de réhydratation.
4. **Le réglage du compte écrase celui du conteneur.** Si l'accès anonyme est
   coupé au niveau du compte, régler le conteneur ne change rien.
5. **Plan de gestion et plan de données sont deux mondes.** Être `Owner` du
   compte ne donne aucun droit de lecture sur les blobs. Voir [[AZ-104]].

## Commandes utiles

```bash
az storage account create -n <compte> -g <rg> -l francecentral \
  --sku Standard_LRS --kind StorageV2

az storage account list -g <rg> -o table
az storage account keys list -n <compte> -g <rg> -o table

# opérations plan de données avec son identité Entra ID
az storage container list --account-name <compte> --auth-mode login -o table
az storage blob upload --account-name <compte> --auth-mode login \
  -c <container> -n <nom> -f ./fichier
```

Le `--auth-mode login` est ce qui force le passage par Entra ID au lieu de la clé
du compte. Sans lui, la CLI cherche une clé et échoue si elle n'y a pas accès.
