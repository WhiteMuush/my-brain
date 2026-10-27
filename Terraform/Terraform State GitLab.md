Thème : [[Terraform]]

# Terraform State GitLab

1. Créer un Personal Access Token GitLab avec le scope `api` (`read_api` ne suffit pas).
2. Déclarer le backend vide dans `versions.tf` :
   ```hcl
   terraform {
     backend "http" {}
   }
   ```
3. Exporter la configuration (chemin du projet encodé, `/` devient `%2F`) :
   ```bash
   STATE_URL="https://gitlab.com/api/v4/projects/<groupe>%2F<projet>/terraform/state/<nom-du-state>"
   export TF_HTTP_ADDRESS="$STATE_URL"
   export TF_HTTP_LOCK_ADDRESS="$STATE_URL/lock"
   export TF_HTTP_UNLOCK_ADDRESS="$STATE_URL/lock"
   export TF_HTTP_LOCK_METHOD="POST"
   export TF_HTTP_UNLOCK_METHOD="DELETE"
   export TF_HTTP_USERNAME="<utilisateur GitLab>"
   export TF_HTTP_PASSWORD="<token>"
   export TF_HTTP_RETRY_WAIT_MIN="5"
   ```
4. Vérifier le token avant l'init :
   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' -u "$TF_HTTP_USERNAME:$TF_HTTP_PASSWORD" "$STATE_URL"
   ```
   `200` : un state existe. `404` : pas encore de state. `401` : utilisateur ou token refusé.
5. Lancer `terraform init`, ou `terraform init -migrate-state` si un `terraform.tfstate` local existe.
6. Contrôler dans GitLab : **Operate > Terraform states**.
7. En CI, aucun token à stocker :
   ```yaml
   variables:
     TF_HTTP_USERNAME: gitlab-ci-token
     TF_HTTP_PASSWORD: $CI_JOB_TOKEN
   ```
8. Si un run coupé laisse un verrou, vérifier que personne n'applique, puis :
   ```bash
   terraform force-unlock <lock-id>
   ```
