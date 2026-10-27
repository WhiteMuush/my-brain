Thème : [[Terraform]]

# Terraform Structure projet

1. Créer l'arborescence :
   ```
   terraform/
   ├── environments/
   │   └── dev/
   │       ├── versions.tf      versions et backend
   │       ├── providers.tf     configuration des providers
   │       ├── main.tf          appel des modules
   │       ├── variables.tf
   │       ├── outputs.tf
   │       └── tests/dev.tftest.hcl
   └── modules/
       └── network/
           ├── main.tf
           ├── variables.tf
           ├── outputs.tf
           └── tests/network.tftest.hcl
   ```
2. Épingler les versions dans `versions.tf` :
   ```hcl
   terraform {
     required_version = ">= 1.9"

     required_providers {
       <nom> = {
         source  = "<namespace>/<nom>"
         version = "~> 5.0"
       }
     }
   }
   ```
3. Poser des tags communs dans `main.tf` :
   ```hcl
   locals {
     common_tags = {
       project     = "<projet>"
       environment = "dev"
       managed_by  = "terraform"
     }
   }
   ```
4. Créer le `.gitignore` :
   ```
   .terraform/
   *.tfstate
   *.tfstate.*
   *.tfvars
   *.tfplan
   tfplan.bin
   .env
   crash.log
   override.tf
   *_override.tf
   ```
5. Commiter `.terraform.lock.hcl` : il fige les versions exactes des providers.
6. Lancer `terraform init` depuis `environments/dev`.
