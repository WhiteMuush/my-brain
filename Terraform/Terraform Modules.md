Thème : [[Terraform]]

# Terraform Modules

1. Créer `modules/<nom>/` avec `main.tf`, `variables.tf` et `outputs.tf`.
2. Typer chaque variable et valider ce qui est connu d'avance :
   ```hcl
   variable "name_prefix" {
     description = "Préfixe de nommage des ressources."
     type        = string
   }

   variable "subnet_prefix" {
     description = "Plage du sous-réseau."
     type        = string
     default     = "10.0.1.0/24"

     validation {
       condition     = can(cidrhost(var.subnet_prefix, 0))
       error_message = "subnet_prefix doit être un CIDR valide."
     }
   }

   variable "tags" {
     type    = map(string)
     default = {}
   }
   ```
3. Exposer ce dont l'appelant a besoin dans `outputs.tf` :
   ```hcl
   output "subnet_id" {
     value = <ressource>.this.id
   }
   ```
4. Appeler le module depuis l'environnement :
   ```hcl
   module "network" {
     source = "../../modules/network"

     name_prefix = var.name_prefix
     tags        = local.common_tags
   }
   ```
5. Écrire le test `modules/<nom>/tests/<nom>.tftest.hcl`, sans rien créer grâce au provider simulé :
   ```hcl
   mock_provider "<nom du provider>" {}

   variables {
     name_prefix = "test"
   }

   run "names_follow_prefix" {
     command = plan

     assert {
       condition     = <ressource>.this.name == "net-test"
       error_message = "Le nom doit être net-<name_prefix>."
     }
   }

   run "rejects_invalid_subnet_prefix" {
     command = plan

     variables {
       subnet_prefix = "pas-un-cidr"
     }

     expect_failures = [var.subnet_prefix]
   }
   ```
6. Lancer le test depuis le dossier du module :
   ```bash
   terraform init -backend=false
   terraform test
   ```
