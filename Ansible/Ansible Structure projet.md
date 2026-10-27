Thème : [[Ansible]]

# Ansible Structure projet

1. Créer l'arborescence :
   ```
   ansible/
   ├── ansible.cfg              les réglages d'Ansible pour ce projet
   ├── site.yml                 le playbook principal
   ├── requirements.yml         les collections à installer
   ├── inventories/
   │   ├── dev/
   │   │   ├── hosts.yml        les serveurs de dev
   │   │   ├── group_vars/      les variables par groupe
   │   │   └── host_vars/       les variables par serveur
   │   └── prod/
   │       └── ...              pareil pour la prod
   └── roles/
       └── common/              un rôle (voir la note Ansible Rôles)
   ```
   - Un dossier d'inventaire **par environnement** : tu changes de cible juste avec `-i inventories/prod/hosts.yml`.
   - Le code (rôles, playbooks) est le même partout. Seules les variables changent entre dev et prod.

2. Écrire `ansible.cfg` :
   ```ini
   [defaults]
   inventory = inventories/dev/hosts.yml
   remote_user = ansible
   private_key_file = ~/.ssh/<cle-ansible>
   interpreter_python = auto_silent
   forks = 10
   callbacks_enabled = ansible.posix.profile_tasks

   [ssh_connection]
   ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o StrictHostKeyChecking=accept-new
   pipelining = True
   ```
   - `inventory` : l'inventaire utilisé si tu ne donnes pas `-i`. Mets celui de dev, pour ne jamais toucher la prod par accident.
   - `remote_user` : le compte SSH utilisé sur les serveurs. Un compte dédié `ansible` est plus propre que ton compte perso.
   - `private_key_file` : la clé SSH de ce compte.
   - `interpreter_python = auto_silent` : Ansible trouve Python tout seul sur le serveur, sans afficher d'avertissement.
   - `forks = 10` : nombre de serveurs traités en même temps. 5 par défaut.
   - `callbacks_enabled = ansible.posix.profile_tasks` : affiche le temps de chaque tâche, pratique pour trouver les lentes. Demande la collection `ansible.posix`.
   - `ControlMaster` + `ControlPersist=60s` : garde la connexion SSH ouverte 60 s et la réutilise. Beaucoup plus rapide.
   - `StrictHostKeyChecking=accept-new` : accepte la clé d'un serveur jamais vu, mais refuse si la clé d'un serveur connu change. C'est la protection contre l'usurpation.
   - `pipelining = True` : moins d'allers-retours SSH par tâche. Plus rapide.

3. Piège WSL : Ansible **ignore** `ansible.cfg` si le dossier est accessible en écriture à tout le monde, ce qui est le cas sous `/mnt/c/...`.
   - Message : `Ansible is being run in a world writable directory ... ignoring it as an ansible.cfg source`.
   - Solution : garder le projet dans ton home Linux (`~/projets/...`), ou forcer le fichier :
     ```bash
     export ANSIBLE_CONFIG="$PWD/ansible.cfg"
     ```

4. Écrire `requirements.yml` :
   ```yaml
   collections:
     - name: ansible.posix
       version: ">=2.0.0,<3.0.0"
     - name: community.general
   ```
   - Une **collection** = un paquet de modules en plus. `ansible.posix` apporte par exemple `authorized_key`, `community.general` apporte `ufw`.
   - `version: ">=2.0.0,<3.0.0"` : accepte les mises à jour de la v2, mais pas une v3 qui pourrait tout casser.

5. Installer les collections :
   ```bash
   ansible-galaxy collection install -r requirements.yml
   ```

6. Écrire `site.yml`, qui appelle les rôles :
   ```yaml
   ---
   - name: Configure every server
     hosts: all
     become: true
     roles:
       - common

   - name: Configure the web servers
     hosts: web
     become: true
     roles:
       - nginx
   ```
   - Un playbook peut contenir **plusieurs "plays"** : chacun cible un groupe différent.
   - Ici, `common` passe sur tous les serveurs, puis `nginx` seulement sur le groupe `web`.

7. Vérifier que tout est lu correctement :
   ```bash
   ansible --version              # la ligne "config file" doit montrer ton ansible.cfg
   ansible-inventory --graph      # tes groupes et serveurs
   ansible all -m ansible.builtin.ping
   ```
