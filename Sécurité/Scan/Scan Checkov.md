Thème : [[Scan]]

# Scan Checkov

1. Installer :
   ```bash
   pipx install checkov
   ```
2. Scanner le code Terraform :
   ```bash
   checkov -d terraform/ --framework terraform --compact
   ```
3. Scanner le plan, plus précis car les valeurs sont résolues :
   ```bash
   terraform plan -out=tfplan.bin
   terraform show -json tfplan.bin > tfplan.json
   checkov -f tfplan.json
   ```
4. Ignorer une règle sur une ressource, avec la raison :
   ```hcl
   resource "<type>" "<nom>" {
     # checkov:skip=<ID_DE_LA_REGLE>: <raison>
   }
   ```
5. En CI, sortie lisible par GitLab :
   ```bash
   checkov -d terraform/ -o junitxml > checkov.xml
   ```
   `--soft-fail` pour signaler sans bloquer pendant la mise en place.
