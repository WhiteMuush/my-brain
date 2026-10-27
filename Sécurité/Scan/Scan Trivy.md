Thème : [[Scan]]

# Scan Trivy

1. Installer (Debian et Ubuntu) :
   ```bash
   sudo apt-get install -y wget gnupg
   wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
   echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee /etc/apt/sources.list.d/trivy.list
   sudo apt-get update && sudo apt-get install -y trivy
   ```
2. Scanner une image :
   ```bash
   trivy image <image>:<tag>
   ```
3. Scanner un dossier (dépendances et secrets) :
   ```bash
   trivy fs .
   ```
4. Scanner du Terraform ou des manifests :
   ```bash
   trivy config terraform/
   ```
5. Faire échouer la CI sur les failles graves :
   ```bash
   trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 <image>:<tag>
   ```
6. Ignorer une faille acceptée : ajouter son identifiant dans `.trivyignore`, avec une ligne de commentaire qui dit pourquoi.
