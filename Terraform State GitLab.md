# Terraform State GitLab

Les bases du projet sont dans [[Terraform]]. Cette note ne traite que du
stockage du state.

GitLab héberge des states Terraform via son API, sans storage account ni bucket
S3 à provisionner. C'est le backend `http`, avec le verrouillage géré par
GitLab.

Le bloc reste **vide** dans le code : la configuration arrive par
l'environnement, donc aucun secret sur le disque.

```hcl
terraform {
  backend "http" {}
}
```

## Les variables à exporter

Terraform lit automatiquement les `TF_HTTP_*` pour ce backend.

```bash
BASE="https://gitlab.com/api/v4/projects/WhiteMuush%2Fsimplon-kubernetes-velero-azure/terraform/state/aks-velero"
export TF_HTTP_ADDRESS="$BASE"
export TF_HTTP_LOCK_ADDRESS="$BASE/lock"
export TF_HTTP_UNLOCK_ADDRESS="$BASE/lock"
export TF_HTTP_LOCK_METHOD="POST"
export TF_HTTP_UNLOCK_METHOD="DELETE"
export TF_HTTP_USERNAME="WhiteMuush"
export TF_HTTP_PASSWORD="<PAT scope api>"
export TF_HTTP_RETRY_WAIT_MIN="5"
```

Le chemin du projet s'écrit **URL-encodé**, le `/` devient `%2F`. Ça évite
d'aller chercher l'ID numérique du projet.

Le token est un Personal Access Token avec le scope `api`. `read_api` ne suffit
pas, il faut écrire le state.

## Le script du projet

`scripts/tf-env.sh` demande le token en saisie masquée, vérifie qu'il est valide
auprès de GitLab, exporte les variables, puis lance `terraform init`. Rien n'est
écrit sur le disque.

```bash
source scripts/tf-env.sh   # garde la config pour tout le shell
make state-setup           # equivalent ponctuel
```

Il faut le **sourcer**, pas l'exécuter : un script exécuté tourne dans un
sous-processus, ses `export` meurent avec lui.

## Points à comprendre

**Le bloc vide n'est pas une erreur.** C'est une *partial configuration* : on
déclare le backend et on le remplit au moment du `init`. Sans le remplir, on
obtient `Error: address argument is required`.

**Un fichier `backend.hcl` n'accepte que des chaînes littérales.** Pas
d'interpolation, pas de variables, pas de référence à une autre clé : on
réécrit l'URL entière à chaque ligne. Et y mettre le mot de passe en fait un
secret à gitignorer.

**Après un `init`, la config du backend est recopiée dans
`.terraform/terraform.tfstate`.** Mot de passe compris, potentiellement. Ce
dossier ne doit jamais partir sur le dépôt.

**Un `make` ne peut pas exporter vers le shell appelant.** Chaque ligne de
recette tourne dans son propre sous-shell. D'où le `. script && commande` sur
une seule ligne, pour que l'export survive le temps de la commande.

## Terraform, les pièges généraux

**Pas de compteur, c'est déclaratif.** On ne peut pas incrémenter un suffixe à
chaque `apply`. Terraform compare un état voulu à la réalité, il ne se souvient
pas du passage précédent.

**Pour un nom unique, `random_string`.** C'est une *ressource*, pas une
fonction : tirée une fois, écrite dans le state, relue ensuite. C'est cette
persistance qui rend le nom stable.

```hcl
resource "random_string" "suffix" {
  length = 6
  lower = true
  upper = false
  numeric = true
  special = false
}
```

**Ne jamais mettre une valeur mouvante dans un `name`.** Le SHA du commit,
`uuid()`, un compteur : beaucoup de champs `name` sont en `ForceNew`, la
ressource serait détruite et recréée à chaque fois. Pour la traçabilité, les
`tags` sont mutables, c'est là que va le SHA.

**Le `serial` du state est illisible depuis sa propre config.** Le lire pour
construire une ressource incrémenterait le serial, donc la valeur serait déjà
périmée. `terraform_remote_state` sert à lire le state d'un **autre** projet.

**azurerm 5.0 a changé `azurerm_federated_identity_credential`.** `parent_id` et
`resource_group_name` ont fusionné en `user_assigned_identity_id`. Les exemples
en ligne sont en 3.x ou 4.x et ne passent pas. Voir Azure.

## Pièges rencontrés

Un script en **CRLF** échoue avec `Syntax error: word unexpected` sous
`/bin/sh`. Cause : `core.autocrlf=true` réécrit les fins de ligne au checkout,
et sous WSL on travaille côté Linux. Correctif au niveau du dépôt :

```
# .gitattributes
* text=auto eol=lf
```

```bash
git add --renormalize .              # sur un depot deja clone
git config --global core.autocrlf input
sed -i 's/\r$//' script.sh           # reparation immediate
file script.sh                       # "with CRLF line terminators" = probleme
```

Valider sans backend, quand on n'a pas le token sous la main : copier les `.tf`
ailleurs, retirer le bloc `backend`, puis :

```bash
terraform init -backend=false && terraform validate
```

Toujours appliquer depuis un plan sauvegardé, pour appliquer exactement ce qu'on
a relu :

```bash
terraform plan -out=tfplan.bin
terraform apply tfplan.bin
```

`tfplan.bin` peut contenir des valeurs sensibles, il se gitignore.

## À gitignorer

```
**/.terraform/
*.tfstate
*.tfstate.*
*.tfvars
tfplan.bin
backend.hcl
.env
```

Un `.gitignore` n'a **aucun effet** sur un fichier déjà suivi. Il faut
`git rm --cached <fichier>`.

## Raccourcis du projet

```bash
make state-setup    # configure le backend, demande le token
make plan           # revue, sauvegardee dans tfplan.bin
make apply          # applique le plan relu
make destroy        # detruit tout
```

## Doc

https://docs.gitlab.com/ee/user/infrastructure/iac/terraform_state.html

https://developer.hashicorp.com/terraform/language/backend/http
