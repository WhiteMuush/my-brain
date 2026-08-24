# Proxmox

Un système à installer sur une machine nue, pas un logiciel qu'on ajoute à côté.
On l'administre depuis un navigateur, sur le port 8006.

## Réponses rapides

**Ça fait tourner quoi ?** Des VMs KVM et des conteneurs LXC. Un LXC est une
petite machine avec son systemd et son SSH, ce n'est pas un conteneur Docker.

**Et Docker alors ?** Pas natif. On crée une VM et on installe Docker dedans.

**Un cluster ?** Trois machines minimum. À deux il n'y a pas de majorité pour
décider qui a raison quand la liaison casse.

**`local` ou `local-lvm` ?** `local` pour les ISO et les sauvegardes,
`local-lvm` pour les disques de VM.

**Un disque de 20 Go, ça prend 20 Go ?** Non, seulement ce qui est écrit. Coche
`Discard` à la création, sinon l'espace libéré dans la VM n'est jamais rendu.

**Télécharger une ISO ?** `local (pve)` → `ISO Images` → `Download from URL`.
Elle atterrit dans `/var/lib/vz/template/iso/`.

**ISO ou image cloud ?** Image cloud pour aller vite et pouvoir refaire à
l'identique. L'ISO une seule fois, pour fabriquer un template qu'on clone
ensuite.

**Quel pont réseau ?** `vmbr1` ici. `vmbr0` ne distribue rien parce que mon
Proxmox tourne lui-même dans une VM. Sur un vrai serveur c'est `vmbr0` et il n'y
a rien à configurer.

**La VM n'a pas de réseau ?** Pas de DHCP sur `vmbr1`, il faut une adresse fixe.
Bloc de config plus bas.

**Bloqué sur `Booting from Hard Disk` ?** GRUB n'est pas installé. `Options` →
`Boot Order` → CD en premier → démarrer → `Advanced options` → `Rescue mode` →
shell sur la partition racine → `grub-install /dev/sda` puis `update-grub`.
Remettre le disque en premier après.

**Changer l'ordre de démarrage ?** `VM` → `Options` → `Boot Order`. Normalement
on n'y touche jamais, Proxmox le règle bien tout seul.

**Détacher une ISO ?** `Hardware` → `CD/DVD Drive` → `Edit` → `Do not use any
media`.

## Adresse fixe dans une VM Debian

```bash
ip -br addr              # trouver le nom, en général ens18
sudo nano /etc/network/interfaces
```

```
auto ens18
iface ens18 inet static
    address 10.10.10.20/24
    gateway 10.10.10.1
    dns-nameservers 10.0.2.3
```

```bash
sudo systemctl restart networking
ping -c2 deb.debian.org
```

## Créer une VM depuis une image cloud

```bash
qm create 102 --name debian2 --memory 2048 --cores 2 \
  --net0 virtio,bridge=vmbr1 --scsihw virtio-scsi-single --ostype l26 --agent 1
qm importdisk 102 /var/lib/vz/template/iso/debian-13-genericcloud-amd64.qcow2 local-lvm
qm set 102 --scsi0 local-lvm:vm-102-disk-0
qm disk resize 102 scsi0 +17G
qm set 102 --ide2 local-lvm:cloudinit --boot order=scsi0 --serial0 socket --vga serial0
qm set 102 --ciuser debian --sshkeys /root/cles-vm.pub \
  --ipconfig0 ip=10.10.10.21/24,gw=10.10.10.1 --nameserver 10.0.2.3
qm start 102
```

## Mon labo

| Quoi | Adresse |
|---|---|
| Interface web | https://127.0.0.1:8006 |
| Proxmox, côté sortie | 10.0.2.15 sur vmbr0 |
| Proxmox, côté labo | 10.10.10.1 sur vmbr1, passerelle des VMs |
| debian-01 | 10.10.10.20 |
| DNS | 10.0.2.3 |

```bash
ssh -i ~/.ssh/id_ed25519_proxmoxlab -p 2222 root@127.0.0.1   # Proxmox
ssh debian@10.10.10.20                                        # une VM, depuis Proxmox
```

## Chemins

Config d'une VM : `/etc/pve/qemu-server/<id>.conf`
Réseau de Proxmox : `/etc/network/interfaces`
ISO : `/var/lib/vz/template/iso/`

## Doc

https://pve.proxmox.com/wiki/Network_Configuration, section Masquerading pour le
pont NAT.

https://pve.proxmox.com/pve-docs/pve-admin-guide.html pour le reste.
