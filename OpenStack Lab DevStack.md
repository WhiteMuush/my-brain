# OpenStack Lab DevStack

DevStack installe tout OpenStack sur une seule machine, depuis les sources.
Outil d'apprentissage, **jamais de production**. Voir [[OpenStack]].

## Le dépôt

https://github.com/WhiteMuush/Simplon-OpenStack

```bash
make env        # crée .env et les tfvars
make one-shot   # VM Azure, DevStack, environ 1 h
make connect    # SSH + Horizon sur localhost:8080
make demo       # crée une instance en Terraform et s'y connecte
make stop       # désalloue, sinon la facturation continue
```

Terraform décrit la VM hôte, Ansible installe DevStack dessus. Les étapes
ci-dessous restent utiles pour comprendre ce que fait le playbook.

## Règles de base

**Dans une VM jetable, toujours.** `stack.sh` réécrit le réseau et les
iptables, et il n'existe aucune désinstallation propre.

12 Go de RAM, 6 cœurs, 80 Go de disque. Compter 30 à 60 min d'installation.

## La VM sur Proxmox

`--cpu host` est obligatoire, sinon Nova n'a pas KVM et tourne dix fois plus
lentement. Vérifier d'abord sur l'hôte :

```bash
cat /sys/module/kvm_intel/parameters/nested     # Y attendu
```

```bash
cd /var/lib/vz/template/iso/
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img

qm create 110 --name devstack --memory 12288 --cores 6 --cpu host \
  --net0 virtio,bridge=vmbr1 --scsihw virtio-scsi-single --ostype l26 --agent 1
qm importdisk 110 /var/lib/vz/template/iso/noble-server-cloudimg-amd64.img local-lvm
qm set 110 --scsi0 local-lvm:vm-110-disk-0,discard=on
qm disk resize 110 scsi0 +78G
qm set 110 --ide2 local-lvm:cloudinit --boot order=scsi0 --serial0 socket --vga serial0
qm set 110 --ciuser ubuntu --sshkeys /root/cles-vm.pub \
  --ipconfig0 ip=10.10.10.30/24,gw=10.10.10.1 --nameserver 10.0.2.3
qm start 110
qm snapshot 110 avant-devstack
```

**Adresse fixe obligatoire** : DevStack fige l'IP à l'installation.
**Snapshot avant `stack.sh`** : c'est le seul bouton annuler.

## Vérifier KVM dans la VM

```bash
sudo apt update && sudo apt install -y cpu-checker && sudo kvm-ok
```

Si KVM n'est pas disponible, ajouter `LIBVIRT_TYPE=qemu` dans la config. Ça
marche mais c'est lent, utilisable seulement avec CirrOS.

## Installer

DevStack refuse de tourner en root.

```bash
sudo apt install -y git
sudo useradd -s /bin/bash -d /opt/stack -m stack
sudo chmod +x /opt/stack
echo "stack ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/stack
sudo -u stack -i

git clone https://opendev.org/openstack/devstack
cd devstack
git branch -r | grep stable | tail -5     # prendre la dernière
git checkout stable/XXXX.X
```

Ne pas figer un numéro de version : une nouvelle sort tous les six mois.

## Config

`/opt/stack/devstack/local.conf` :

```ini
[[local|localrc]]
ADMIN_PASSWORD=labpassword
DATABASE_PASSWORD=$ADMIN_PASSWORD
RABBIT_PASSWORD=$ADMIN_PASSWORD
SERVICE_PASSWORD=$ADMIN_PASSWORD

HOST_IP=10.10.10.30
FLOATING_RANGE=10.10.10.192/26
PUBLIC_INTERFACE=ens18

disable_service tempest
disable_service swift

LOGFILE=/opt/stack/logs/stack.sh.log
```

`HOST_IP` : l'adresse de la VM, jamais une IP publique.
`FLOATING_RANGE` : dans le réseau du labo, **hors plage DHCP**, sinon conflit.
`tempest` : suite de tests inutile ici et très longue.

## Lancer

```bash
./stack.sh                     # 30 à 60 min
tail -50 /opt/stack/logs/stack.sh.log      # la vraie erreur est là
./unstack.sh && ./clean.sh     # avant un nouvel essai
```

Après trois échecs, revenir au snapshot.

**Ne survit pas à un redémarrage.** Relancer `./stack.sh`, ou mettre la VM en
pause plutôt que l'éteindre.

## Utiliser

Horizon sur `http://10.10.10.30/dashboard`, compte `admin`.

```bash
source /opt/stack/devstack/openrc admin admin
openstack service list
```

Suite dans [[OpenStack Commandes]].

## Sur une VM cloud

Azure ou OVH : prendre une taille qui supporte la virtualisation imbriquée
(séries D ou E, **jamais la série B**) et mettre le Security Type sur
`Standard`, car Trusted Launch la bloque.

Les IP flottantes n'y sont pas routables, le réseau reste interne à la VM.
