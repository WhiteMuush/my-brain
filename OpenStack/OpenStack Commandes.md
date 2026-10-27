Thème : [[OpenStack]]

# OpenStack Commandes

```bash
# Regarder
openstack image list
openstack flavor list
openstack network list
openstack server list
openstack quota show                  # ce qu'il reste dans le projet

# Créer une instance
openstack keypair create --public-key ~/.ssh/id_ed25519.pub <cle>

openstack security group create web
openstack security group rule create --protocol tcp --dst-port 22 --remote-ip <ton ip>/32 web
openstack security group rule create --protocol tcp --dst-port 443 web

openstack server create --flavor <flavor> --image <image> \
  --network <réseau> --key-name <cle> --security-group web <vm>

openstack floating ip create <réseau externe>
openstack server add floating ip <vm> <ip flottante>

# Gérer
openstack server stop <vm>
openstack server start <vm>
openstack server delete <vm>

# Volumes
openstack volume create --size 10 <volume>
openstack server add volume <vm> <volume>

# Déboguer
openstack server show <vm>
openstack console log show <vm>       # démarrage de la VM, utile si SSH ne répond pas
openstack server event list <vm>
```

Ne jamais ouvrir le port 22 à `0.0.0.0/0` : toujours une IP ou une plage précise.
