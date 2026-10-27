Thème : [[Secrets]]

# Secrets Terraform

1. Déclarer la variable sensible, sans `default` :
   ```hcl
   variable "db_password" {
     type      = string
     sensitive = true
   }
   ```
2. La passer par l'environnement :
   ```bash
   export TF_VAR_db_password='<secret>'
   ```
3. Marquer aussi la sortie qui la contient :
   ```hcl
   output "connection_string" {
     value     = <ressource>.connection_string
     sensitive = true
   }
   ```
4. Mettre dans le `.gitignore` :
   ```
   .terraform/
   *.tfstate
   *.tfstate.*
   *.tfvars
   *.tfplan
   tfplan.bin
   .env
   ```
5. Garder le state dans un backend distant à accès restreint, par exemple le state GitLab.
   `sensitive` masque l'affichage, mais **le state garde les valeurs en clair**.
6. Si un fichier secret est déjà suivi par Git :
   ```bash
   git rm --cached <fichier>
   git commit -m "Stop tracking <fichier>"
   ```
   Puis changer le secret : il reste dans l'historique.
