# Terraform

Les étapes pour monter un projet propre depuis zéro, et les règles qui évitent
d'avoir à le refaire. Le stockage du state a sa propre note :
[[Terraform State GitLab]].

## L'arborescence de départ

Un projet Terraform est un dossier de fichiers `.tf`. Terraform les lit tous
ensemble, dans n'importe quel ordre : le découpage ne sert qu'à la lecture
humaine, jamais à l'exécution.

```
terraform/
  versions.tf        contraintes de version et bloc backend
  providers.tf       configuration des providers
  variables.tf       declaration des entrees
  main.tf            les ressources
  outputs.tf         ce qu'on veut recuperer apres l'apply
  terraform.tfvars   les valeurs reelles, jamais versionne
```

Séparer `versions.tf` de `providers.tf` a une raison : le premier contient des
contraintes figées qu'on touche rarement, le second des réglages qui bougent
avec le projet. Sur un petit projet, les fusionner ne gêne personne.

## L'ordre des étapes

1. **`terraform init`** télécharge les providers et configure le backend. À
   relancer après tout changement de version ou de backend.
2. **`terraform fmt -recursive`** normalise l'indentation. Le lancer tôt évite
   les diffs de mise en forme qui polluent les revues.
3. **`terraform validate`** vérifie la syntaxe et la cohérence des types, sans
   contacter le cloud. Il exige un `init` préalable.
4. **`terraform plan -out=tfplan.bin`** calcule ce qui va changer et le
   sauvegarde.
5. **`terraform apply tfplan.bin`** applique exactement le plan relu.

L'étape 4 et l'étape 5 vont ensemble. Un `apply` sans plan sauvegardé recalcule
tout et peut appliquer autre chose que ce qu'on a lu, si l'infrastructure a
bougé entre-temps.

## Épingler les versions

```hcl
terraform {
  required_version = ">= 1.9"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.0"
    }
  }
}
```

`~> 5.0` accepte les correctifs et les versions mineures de la branche 5, mais
refuse le passage en 6. C'est le bon compromis : on récupère les corrections
sans subir un changement cassant du jour au lendemain.

`= 5.0.0` fige au patch près. Utile pour reproduire un bug à l'identique,
pénible au quotidien puisque chaque correctif demande une modification du code.

**Le fichier `.terraform.lock.hcl` se commite.** Il enregistre les versions
exactes et les sommes de contrôle des providers réellement téléchargés. C'est
lui qui garantit que ta machine et la CI utilisent les mêmes binaires. Ne pas
le versionner rouvre la porte au classique « ça marche chez moi ».

## Les variables

Chaque variable porte un type explicite et une description. Le type n'est pas
décoratif : il transforme une erreur silencieuse en erreur de validation.

```hcl
variable "location" {
  description = "Région Azure où déployer les ressources."
  type        = string
  default     = "francecentral"
}

variable "common_tags" {
  description = "Étiquettes appliquées à toutes les ressources."
  type        = map(string)
  default     = {
    project     = "azure-files"
    managed_by  = "terraform"
  }
}
```

**Un `default` est un choix, pas un remplissage.** Le mettre sur une valeur
raisonnable et stable, comme une région. L'éviter sur ce qui identifie
l'environnement, comme un nom de resource group : mieux vaut une erreur au
`plan` qu'un déploiement silencieux au mauvais endroit.

**Jamais de secret dans un `default`.** Un mot de passe ou un identifiant
d'abonnement écrit là part dans Git. Pour une entrée sensible, marquer
`sensitive = true` et la passer par `TF_VAR_nom` ou un `.tfvars` ignoré. Le
drapeau masque la valeur dans les sorties, il ne la chiffre pas dans le state.

Ajouter une validation quand la contrainte est connue à l'avance :

```hcl
variable "storage_account_name" {
  type = string

  validation {
    condition     = can(regex("^[a-z0-9]{3,24}$", var.storage_account_name))
    error_message = "3 à 24 caractères, minuscules et chiffres uniquement."
  }
}
```

L'erreur tombe au `plan`, en une seconde, au lieu d'arriver du côté d'Azure
après plusieurs minutes d'`apply`.

## Les sorties

`outputs.tf` expose ce dont on a besoin après coup : une URL, un identifiant, un
nom généré. Sans sortie, il faut fouiller le portail ou le state.

```hcl
output "storage_account_id" {
  description = "Identifiant du storage account."
  value       = azurerm_storage_account.shared.id
}
```

Une sortie qui contient un secret se marque `sensitive = true`, sinon elle
s'affiche en clair dans les logs de CI.

## Ce qui ne se versionne jamais

```
**/.terraform/
*.tfstate
*.tfstate.*
*.tfvars
tfplan.bin
.env
```

**Le state contient les valeurs en clair.** Clés d'accès, chaînes de connexion,
mots de passe générés : tout y est, même ce qui est marqué `sensitive`. Un
`tfstate` commité est une fuite de secrets, pas une maladresse de rangement.

`tfplan.bin` est dans le même cas, un plan embarque les valeurs à écrire.

Le dossier `.terraform/` recopie la configuration du backend après un `init`,
mot de passe compris selon la méthode utilisée.

**Un `.gitignore` n'agit pas sur un fichier déjà suivi.** Il faut d'abord
`git rm --cached <fichier>`, puis committer la suppression.

## Points à comprendre

**Terraform est déclaratif, pas séquentiel.** On décrit l'état voulu, l'outil
calcule le chemin pour y arriver. Il n'y a ni compteur, ni mémoire du passage
précédent en dehors du state.

**L'ordre des ressources dans le fichier ne compte pas.** Terraform déduit les
dépendances des références entre ressources. Écrire
`azurerm_storage_account.shared.id` crée la dépendance. `depends_on` ne sert que
pour les dépendances invisibles, quand rien ne se référence directement.

**Un `data` lit, une `resource` crée.** Pour utiliser un resource group déjà
existant, un bloc `data` le récupère sans le gérer ni le détruire. Le déclarer
en `resource` reviendrait à en prendre possession, et un `destroy`
l'emporterait.

**Beaucoup de champs `name` sont en ForceNew.** Les modifier détruit puis
recrée la ressource. Ne jamais y mettre une valeur mouvante comme un SHA de
commit ou un `uuid()`. Pour la traçabilité, les `tags` sont mutables, c'est là
que ça va.

**`for_each` vaut mieux que `count` dès qu'il y a plus d'un élément.** Avec
`count`, les ressources sont indexées par position : supprimer le premier
élément d'une liste décale tous les autres et provoque une destruction en
cascade. `for_each` les indexe par clé, chaque élément reste indépendant.

**`-target` est une issue de secours.** Appliquer une seule ressource contourne
le graphe de dépendances et laisse un state partiellement à jour. Acceptable
pour débloquer une situation, jamais dans un usage normal.

## Pièges rencontrés

**`Error: address argument is required`.** Un bloc `backend "http" {}` vide sans
configuration fournie au `init`. Détail complet dans
[[Terraform State GitLab]].

**Un type de variable qui ne correspond pas à l'argument.** Déclarer
`common_tags` en `type = string` alors que l'argument `tags` attend une
`map(string)` fait échouer le `plan`. L'erreur nomme la variable, pas la ligne
de la ressource, ce qui envoie chercher au mauvais endroit.

**Confondre deux ressources aux noms voisins.** `azurerm_storage_container` est
un conteneur Blob, `azurerm_storage_share` un partage de fichiers SMB. Les deux
vivent dans un storage account, un seul se monte en lecteur réseau. Voir
[[Azure]].

**Les exemples en ligne sont souvent périmés.** Sur azurerm, la majorité des
tutoriels sont en 3.x ou 4.x et ne passent pas en 5.x. Le registre officiel du
provider affiche la documentation par version, c'est la seule référence fiable.

## Valider sans toucher au cloud

```bash
terraform init -backend=false
terraform validate
terraform fmt -recursive -check
```

`-backend=false` saute la configuration du state. Pratique pour vérifier la
syntaxe sans token ni accès réseau, et c'est ce qu'on met dans une CI de
validation.

Des analyseurs complètent la vérification : `tflint` pour les erreurs propres au
provider, `checkov` ou `trivy` pour les défauts de sécurité comme un accès
public laissé ouvert.

## Raccourcis du projet

```bash
make init       # init + selection du backend
make fmt        # mise en forme
make validate   # syntaxe et types, sans reseau
make plan       # revue, sauvegardee dans tfplan.bin
make apply      # applique le plan relu
make destroy    # detruit tout
```

Un `Makefile` documente les commandes autant qu'il les raccourcit. Il évite
surtout d'oublier un drapeau au mauvais moment.

## Doc

https://developer.hashicorp.com/terraform/language

https://developer.hashicorp.com/terraform/language/style

https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs
