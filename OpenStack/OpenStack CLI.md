Thème : [[OpenStack]]

# OpenStack CLI

1. Installer le client :
   ```bash
   sudo apt-get install -y pipx
   pipx install python-openstackclient
   pipx ensurepath
   ```
2. Écrire `~/.config/openstack/clouds.yaml` (le mot de passe y est en clair, jamais dans Git) :
   ```yaml
   clouds:
     <cloud>:
       auth:
         auth_url: https://<keystone>/v3
         username: <utilisateur>
         password: <mot de passe>
         project_name: <projet>
         user_domain_name: Default
         project_domain_name: Default
       region_name: <région>
       interface: public
       identity_api_version: 3
   ```
   Le fournisseur donne souvent ce fichier tout prêt dans Horizon : **Accès API > Télécharger clouds.yaml**.
3. Protéger le fichier :
   ```bash
   chmod 600 ~/.config/openstack/clouds.yaml
   ```
4. Choisir le cloud et tester :
   ```bash
   export OS_CLOUD=<cloud>
   openstack token issue
   ```
5. Ne jamais mélanger `OS_CLOUD` avec les variables `OS_*` d'un fichier `openrc` :
   ```bash
   env | grep '^OS_'
   ```

Erreur 401 : le serveur a répondu, ce sont les identifiants qui sont faux.
