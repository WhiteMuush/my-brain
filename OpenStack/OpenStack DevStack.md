Thème : [[OpenStack]]

# OpenStack DevStack

Tout OpenStack sur une seule VM, pour apprendre. Jamais en production.

1. Préparer une VM jetable : Ubuntu LTS, 12 Go de RAM, 6 cœurs, 80 Go de disque, **IP fixe**. Faire un snapshot avant l'installation.
2. Vérifier la virtualisation :
   ```bash
   grep -cE '(vmx|svm)' /proc/cpuinfo      # 0 = pas de KVM, ajouter LIBVIRT_TYPE=qemu
   ```
3. Créer l'utilisateur `stack` (DevStack refuse root) :
   ```bash
   sudo apt-get install -y git acl
   sudo useradd -s /bin/bash -d /opt/stack -m stack
   sudo chmod +x /opt/stack
   echo "stack ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/stack
   sudo -u stack -i
   ```
4. Récupérer DevStack sur la dernière branche stable :
   ```bash
   git clone https://opendev.org/openstack/devstack
   cd devstack
   git branch -r | grep stable | tail -3
   git checkout stable/<version>
   ```
5. Écrire `local.conf` :
   ```ini
   [[local|localrc]]
   ADMIN_PASSWORD=<mot de passe>
   DATABASE_PASSWORD=$ADMIN_PASSWORD
   RABBIT_PASSWORD=$ADMIN_PASSWORD
   SERVICE_PASSWORD=$ADMIN_PASSWORD

   HOST_IP=<ip privée de la VM>
   FLOATING_RANGE=172.24.4.0/24

   disable_service tempest
   disable_service swift

   LOGFILE=/opt/stack/logs/stack.sh.log
   LOGDAYS=2
   ```
6. Si la VM a moins de 16 Go, ajouter du swap (sinon `stack.sh` est tué en route) :
   ```bash
   sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   ```
7. Lancer (30 à 60 minutes) :
   ```bash
   ./stack.sh
   ```
8. En cas d'échec :
   ```bash
   tail -50 /opt/stack/logs/stack.sh.log
   ./unstack.sh && ./clean.sh && ./stack.sh
   ```
9. Horizon sans l'exposer sur internet :
   ```bash
   ssh -L 8080:localhost:80 <user>@<vm>
   ```
   Puis http://localhost:8080/dashboard

DevStack ne survit pas à un redémarrage : relancer `./stack.sh` ou revenir au snapshot.
