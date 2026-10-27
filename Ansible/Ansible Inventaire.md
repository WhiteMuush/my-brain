Thème : [[Ansible]]

# Ansible Inventaire

L'inventaire, c'est l'annuaire de tes serveurs. Ansible y lit qui existe, comment s'y connecter, et dans quels groupes ils sont.

1. Écrire `inventories/dev/hosts.yml` :
   ```yaml
   all:
     children:
       web:
         hosts:
           web-01:
             ansible_host: 10.0.1.10
           web-02:
             ansible_host: 10.0.1.11
       db:
         hosts:
           db-01:
             ansible_host: 10.0.1.20
             ansible_port: 2222
       prod_like:
         children:
           web:
           db:
   ```
   - `all` : le groupe qui contient tout le monde, il existe toujours.
   - `children` : les sous-groupes. Ici `web`, `db` et `prod_like`.
   - `web-01` : le **nom** du serveur pour Ansible. Il sert dans les logs et pour `--limit`.
   - `ansible_host` : la vraie adresse (IP ou DNS) utilisée pour SSH.
   - `ansible_port` : le port SSH, si ce n'est pas 22.
   - `prod_like` : un **groupe de groupes**. Cibler `prod_like` revient à cibler `web` et `db`.

2. La même chose en format INI, plus court (les deux formats marchent) :
   ```ini
   [web]
   web-01 ansible_host=10.0.1.10
   web-02 ansible_host=10.0.1.11

   [db]
   db-01 ansible_host=10.0.1.20 ansible_port=2222

   [prod_like:children]
   web
   db
   ```
   - Une plage de serveurs s'écrit `web-[01:05] ...`, ce qui donne web-01 à web-05.

3. Les variables de connexion les plus utiles :
   - `ansible_host` : adresse du serveur.
   - `ansible_user` : compte SSH, si différent de `remote_user` dans `ansible.cfg`.
   - `ansible_port` : port SSH.
   - `ansible_ssh_private_key_file` : clé SSH pour ce serveur.
   - `ansible_python_interpreter` : chemin de Python, si la détection auto se trompe.
   - `ansible_become_password` : mot de passe sudo. À mettre dans Vault, jamais en clair.

4. Ne pas mettre les autres variables dans `hosts.yml` : les ranger dans des fichiers à côté.
   ```
   inventories/dev/
   ├── hosts.yml
   ├── group_vars/
   │   ├── all.yml          pour tous les serveurs
   │   ├── web.yml          pour le groupe web
   │   └── db.yml           pour le groupe db
   └── host_vars/
       └── db-01.yml        pour ce serveur seulement
   ```
   - Le nom du fichier = le nom du groupe ou du serveur. Ansible les charge tout seul.
   - Exemple de `group_vars/web.yml` :
     ```yaml
     nginx_port: 443
     app_env: dev
     ```

5. Vérifier ce qu'Ansible a compris :
   ```bash
   ansible-inventory -i inventories/dev/hosts.yml --graph
   ansible-inventory -i inventories/dev/hosts.yml --host web-01
   ansible web -i inventories/dev/hosts.yml -m ansible.builtin.ping
   ```
   - `--graph` : l'arbre des groupes et des serveurs.
   - `--host web-01` : toutes les variables que ce serveur recevra, une fois tout fusionné. Parfait pour débugger.

6. Cibler une partie seulement :
   ```bash
   ansible-playbook site.yml --limit web-01
   ansible-playbook site.yml --limit 'web:!web-02'
   ```
   - `--limit web-01` : un seul serveur.
   - `'web:!web-02'` : le groupe web, sauf web-02. Les guillemets évitent que le shell interprète le `!`.
