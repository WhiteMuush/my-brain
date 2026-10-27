Thème : [[Podman]]

# Podman systemd

Lancer un conteneur au démarrage avec Quadlet, sans démon.

1. Créer le dossier des unités utilisateur :
   ```bash
   mkdir -p ~/.config/containers/systemd
   ```
2. Écrire `~/.config/containers/systemd/<app>.container` :
   ```ini
   [Unit]
   Description=<app>

   [Container]
   Image=docker.io/library/nginx:<version>-alpine
   PublishPort=8080:80
   Volume=<app>-data:/data
   Environment=LOG_LEVEL=info
   # Mise à jour automatique de l'image avec podman auto-update
   AutoUpdate=registry

   [Service]
   Restart=always

   [Install]
   WantedBy=default.target
   ```
3. Générer et démarrer le service :
   ```bash
   systemctl --user daemon-reload
   systemctl --user start <app>.service
   systemctl --user status <app>.service
   ```
4. Garder les services de l'utilisateur actifs sans session ouverte :
   ```bash
   sudo loginctl enable-linger "$USER"
   ```
5. Logs :
   ```bash
   journalctl --user -u <app>.service -f
   ```
6. Pour un service système (root), mettre le fichier dans `/etc/containers/systemd/` et utiliser `sudo systemctl` sans `--user`.
