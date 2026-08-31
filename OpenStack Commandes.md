# OpenStack Commandes

Client `openstack`, la même CLI pour tous les services. Voir [[OpenStack]].

## Installer le client

```bash
sudo apt install -y pipx
pipx install python-openstackclient
pipx ensurepath
```

## S'authentifier

`~/.config/openstack/clouds.yaml` :

```yaml
clouds:
  lab:
    auth:
      auth_url: http://10.10.10.30/identity
      username: admin
      password: labpassword
      project_name: admin
      user_domain_name: Default
      project_domain_name: Default
    region_name: RegionOne
    identity_api_version: 3
```

```bash
chmod 600 ~/.config/openstack/clouds.yaml
export OS_CLOUD=lab          # à mettre dans ~/.zshrc
openstack token issue
```

## Regarder

```bash
openstack image list
openstack flavor list
openstack network list
openstack server list
openstack compute service list     # les agents connus
openstack hypervisor list          # les serveurs et leurs ressources
```

## Créer une instance

```bash
openstack keypair create ma-cle > ~/ma-cle.pem && chmod 600 ~/ma-cle.pem

openstack security group create web
openstack security group rule create --proto tcp --dst-port 22 web

openstack server create --flavor m1.tiny --image cirros \
  --network private --key-name ma-cle --security-group web ma-vm

openstack floating ip create public
openstack server add floating ip ma-vm 10.10.10.200
```

CirrOS pèse 50 Mo, c'est l'image faite pour tester. Ne pas attendre le
démarrage d'une Ubuntu à chaque essai.

## Déboguer

```bash
openstack console log show ma-vm
openstack server show ma-vm
env | grep '^OS_'                  # conflit de variables
```

## Pièges

**401 avec un Request-ID** : le serveur a répondu et refusé. URL et réseau bons,
identifiants faux.

**`OS_CLOUD` et les variables `OS_*` se marchent dessus.** Jamais les deux dans
le même terminal.

**Le mot de passe de `clouds.yaml` est en clair.** `chmod 600`, jamais dans Git.

**Ne pas exposer Horizon sur internet.** Tunnel :
`ssh -L 8080:localhost:80 user@machine` puis `http://localhost:8080/dashboard`.
