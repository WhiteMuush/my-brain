Thème : [[Helm]]

# Helm Commandes

1. Installer Helm depuis l'archive officielle, avec vérification de la somme (version sur https://github.com/helm/helm/releases) :
   ```bash
   V=<version, ex. v4.x.y>
   curl -fsSLO "https://get.helm.sh/helm-${V}-linux-amd64.tar.gz"
   curl -fsSLO "https://get.helm.sh/helm-${V}-linux-amd64.tar.gz.sha256sum"
   sha256sum -c "helm-${V}-linux-amd64.tar.gz.sha256sum"
   tar -xzf "helm-${V}-linux-amd64.tar.gz"
   sudo install -m 0755 linux-amd64/helm /usr/local/bin/helm
   ```
2. Commandes du quotidien :
   ```bash
   # Dépôts classiques
   helm repo add <nom> <url>
   helm repo update
   helm search repo <chart> --versions | head

   # Charts OCI : voir la dernière version
   helm show chart oci://<registry>/<chart> | grep '^version'

   # Lire les valeurs possibles d'un chart
   helm show values <repo>/<chart> > values-defaut.yaml

   # Installer ou mettre à jour, toujours avec une version précise
   helm upgrade --install <release> <repo>/<chart> \
     --version <version> \
     --namespace <ns> --create-namespace \
     --values values.yaml \
     --wait

   # Voir le rendu sans rien installer
   helm template <release> <repo>/<chart> --version <version> --values values.yaml

   # Suivre
   helm list -A
   helm status <release> -n <ns>
   helm get values <release> -n <ns>
   helm history <release> -n <ns>

   # Revenir en arrière, désinstaller
   helm rollback <release> <révision> -n <ns>
   helm uninstall <release> -n <ns>
   ```
3. Ranger chaque release dans le projet :
   ```
   helm/<release>/values.yaml     les valeurs modifiées seulement
   ```
