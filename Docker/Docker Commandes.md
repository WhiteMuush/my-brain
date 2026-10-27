Thème : [[Docker]]

# Docker Commandes

1. Installer depuis le dépôt officiel (Debian ; sur Ubuntu, remplacer `debian` par `ubuntu`) :
   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
     | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```
2. Utiliser Docker sans sudo (le groupe `docker` équivaut à root sur la machine) :
   ```bash
   sudo usermod -aG docker "$USER"
   newgrp docker
   ```
3. Commandes du quotidien :
   ```bash
   # Images
   docker build -t <image>:<tag> .
   docker images
   docker history <image>:<tag>            # couches et commandes de l'image
   docker rmi <image>:<tag>

   # Conteneurs
   docker run -d --name <nom> -p 127.0.0.1:8080:8080 <image>:<tag>
   docker ps -a
   docker logs -f <nom>
   docker exec -it <nom> sh
   docker inspect <nom>
   docker stats
   docker stop <nom> && docker rm <nom>

   # Registry
   docker login <registry>
   docker tag <image>:<tag> <registry>/<projet>/<image>:<tag>
   docker push <registry>/<projet>/<image>:<tag>

   # Ménage
   docker system df
   docker system prune                     # conteneurs arrêtés, réseaux et images orphelines
   ```
