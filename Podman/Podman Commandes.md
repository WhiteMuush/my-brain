Thème : [[Podman]]

# Podman Commandes

1. Installer (Debian et Ubuntu) :
   ```bash
   sudo apt-get install -y podman
   podman info | grep -i rootless          # rootless: true attendu en utilisateur normal
   ```
2. Les commandes sont celles de Docker, sans démon ni sudo :
   ```bash
   podman build -t <image>:<tag> .
   podman run -d --name <nom> -p 8080:8080 <image>:<tag>
   podman ps -a
   podman logs -f <nom>
   podman exec -it <nom> sh
   podman stop <nom> && podman rm <nom>
   podman images
   podman system prune
   ```
3. Toujours écrire le nom complet de l'image, sinon Podman demande quel registry utiliser :
   ```bash
   podman pull docker.io/library/nginx:<version>-alpine
   ```
4. En rootless, un port en dessous de 1024 est refusé : publier sur `8080`, pas sur `80`.
5. Un volume monté depuis l'hôte sur un système SELinux demande `:Z` :
   ```bash
   podman run -v ./data:/data:Z <image>:<tag>
   ```
6. Regrouper des conteneurs dans un pod, comme Kubernetes :
   ```bash
   podman pod create --name <pod> -p 8080:8080
   podman run -d --pod <pod> --name app <image>:<tag>
   podman run -d --pod <pod> --name db docker.io/library/postgres:<version>-alpine
   ```
7. Passer d'un pod Podman à du YAML Kubernetes, et inversement :
   ```bash
   podman kube generate <pod> > pod.yaml
   podman kube play pod.yaml
   podman kube down pod.yaml
   ```
