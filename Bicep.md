# Bicep

Le langage de Microsoft pour décrire des ressources Azure. Il se compile en ARM
JSON : c'est un transpileur, pas un moteur d'exécution. Donc pas d'état, pas de
`.tfstate`, pas de verrou. Le pendant côté HashiCorp est dans [[Terraform]], et
le contexte de l'examen dans [[AZ-104]].

## Réponses rapides

**Je viens de Terraform, qu'est-ce qui change ?** La syntaxe et l'absence
d'état. `resource`, `module` et `output` gardent le même rôle.

**`param` ou `var` ?** `param` est l'entrée, c'est la `variable` de Terraform.
`var` est une valeur calculée locale, c'est le `local`. Inversé par rapport à
l'intuition, c'est le piège classique.

**Où est le `.tfvars` ?** C'est le `.bicepparam`, posé à côté du template, avec
`using './main.bicep'` en première ligne.

**Où est l'état ?** Nulle part. ARM lit l'état réel du resource group à chaque
déploiement. Pas de drift possible, mais rien ne sait ce qu'il faut détruire.

**Comment je fais `terraform plan` ?** `az deployment group what-if`.

**Et `terraform destroy` ?** Rien nativement. Soit `az group delete`, soit une
deployment stack, plus bas.

**Une ressource sans version d'API ?** Impossible, le type la contient :
`'Microsoft.Compute/virtualMachines@2023-09-01'`.

**C'est quoi `@secure()` ?** Le `sensitive = true` de Terraform. La valeur
n'entre ni dans les logs ni dans l'historique de déploiement, et ne peut pas
ressortir en `output`. Interdit de lui donner une valeur par défaut.

**Pourquoi les parenthèses de `@secure()` ?** Un décorateur est un appel de
fonction. Sans argument, les parenthèses restent, vides. `@secure` tout seul est
une erreur de syntaxe.

**Un décorateur s'applique à quoi ?** À la déclaration juste en dessous, et à
elle seule. On peut en empiler plusieurs.

## Le piège du fichier de paramètres

Dès qu'on utilise un `.bicepparam`, **tous** les paramètres sans valeur par
défaut doivent y être assignés, sinon `BCP258`. L'idée de laisser l'Azure CLI
réclamer un secret en interactif ne marche plus.

`readEnvironmentVariable` n'existe **que** dans le `.bicepparam`, jamais dans le
`.bicep`. Dans le template on déclare un type, dans le fichier de paramètres on
assigne une valeur.

```bicep
// main.bicep : on declare
@secure()
param sshKey string

// dev.bicepparam : on assigne
param sshKey = trim(readEnvironmentVariable('SSH_PUBLIC_KEY'))
```

C'est le moyen de ne jamais recopier une clé à la main : un script exporte la
variable juste avant d'appeler `az`.

## Deployment stacks

Le substitut d'état, quand on veut détruire proprement.

```bash
az stack group create --resource-group RG --name mon-stack \
  --template-file main.bicep --parameters dev.bicepparam \
  --action-on-unmanage deleteAll --deny-settings-mode none --yes

az stack group delete --resource-group RG --name mon-stack \
  --action-on-unmanage deleteAll --yes
```

La stack retient les ressources qu'elle gère et sait les supprimer sans toucher
au resource group. Indispensable quand celui-ci est partagé, ou qu'on n'a pas le
droit d'en créer.

**Attention aux ressources implicites.** Le disque OS d'une VM n'est pas déclaré
dans le template, la stack ne le gère donc pas et le laisse derrière elle. Le
correctif tient en une ligne, `deleteOption: 'Delete'` dans `osDisk`.

## Ce que les vérifications attrapent, et ce qu'elles ratent

Trois barrières successives :

1. **`az bicep lint` et `format`**, en local. Syntaxe, paramètre inutilisé,
   secret par défaut. Aucune connaissance d'Azure.
2. **`validate` et `what-if`**, preflight ARM. Schéma, policy qui refuse, taille
   indisponible, quota dépassé.
3. **La création réelle.** Certaines limites ne sortent qu'ici.

Vus seulement à l'étape 3, sur le TP :

- `IPv4BasicSkuPublicIpCountLimitReached`, les IP publiques Basic sont retirées
- `cannot boot Hypervisor Generation '2'`, la taille de VM est en génération 1
  et l'image en génération 2

Le second se prévient en lisant `HyperVGenerations` dans
`az vm list-skus --size <taille>` et en le comparant au suffixe `-gen2` du SKU
d'image.

## Contraintes d'un abonnement de formation

Trois vérifications avant d'écrire quoi que ce soit, elles expliquent la moitié
des échecs :

```bash
az role assignment list --assignee <moi> --all -o table   # mes droits reels
az policy assignment list                                 # les tailles autorisees
az vm list-usage --location <region>                      # les quotas par famille
```

Sur l'abonnement Simplon : Reader sur l'abonnement, Owner sur mon seul resource
group. Donc aucune création de resource group possible, et une policy limite les
tailles de VM à une liste blanche.

## Terraform ou Bicep

**Bicep gagne sur** le support des nouveautés Azure dès le premier jour, la
concision, et zéro backend à configurer.

**Terraform gagne sur** le multi-cloud, l'écosystème de modules, et le fait de
savoir exactement quoi détruire grâce à son état.

Le point qui compte en CI : Terraform sait ce qu'il a créé, Bicep non. Un
workflow de destruction Bicep vise explicitement un resource group ou une
deployment stack. Sur une CI partagée par une promo entière, c'est plus risqué,
et ça se documente.

## Liens

- [[Accueil]]
- [[Terraform]]
- [[AZ-104]]
