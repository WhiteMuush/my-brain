Thème : [[Podman]]

# Podman Compose

1. Installer :
   ```bash
   sudo apt-get install -y podman-compose
   ```
2. Reprendre le même `compose.yaml` que Docker, avec les noms d'images complets :
   ```yaml
   services:
     db:
       image: docker.io/library/postgres:<version>-alpine
   ```
3. Lancer :
   ```bash
   podman compose up -d
   podman compose ps
   podman compose logs -f
   podman compose down
   ```
4. Ports de l'hôte au-dessus de 1024 en rootless (`8080:80`, pas `80:80`).
5. Si un service doit démarrer avec la machine, passer plutôt par systemd et Quadlet.
