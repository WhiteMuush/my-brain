Thème : [[Terraform]]

# Terraform Commandes

## Démarrer

```bash
terraform init                       # providers + backend
terraform init -reconfigure          # après un changement de backend
terraform init -migrate-state        # copier un state local vers le backend
terraform init -backend=false        # valider sans accès au backend
```

## Vérifier

```bash
terraform fmt -recursive             # formater
terraform fmt -check -recursive      # échoue si mal formaté (CI)
terraform validate                   # syntaxe et types, sans cloud
terraform test                       # lance les fichiers tests/*.tftest.hcl
```

## Déployer

```bash
terraform plan -out=tfplan.bin       # calculer et sauvegarder le plan
terraform apply tfplan.bin           # appliquer exactement le plan relu
terraform destroy                    # tout supprimer
```

## Lire

```bash
terraform output                     # toutes les sorties
terraform output -raw public_ip      # une sortie brute, pour un script
terraform state list                 # ressources suivies
terraform state show <adresse>       # détail d'une ressource
```

## Réparer

```bash
terraform import <adresse> <id>      # adopter une ressource créée à la main
terraform state rm <adresse>         # ne plus suivre, sans détruire
terraform force-unlock <lock-id>     # verrou resté après un run coupé
terraform apply -target=<adresse>    # secours uniquement
```

## Lancer depuis un autre dossier

```bash
terraform -chdir=terraform/environments/dev plan
```
