Thème : [[Ansible]]

# Ansible Structure projet

1. Créer l'arborescence :
   ```
   ansible/
   ├── ansible.cfg
   ├── site.yml
   ├── requirements.yml
   ├── inventories/
   │   └── dev/
   │       ├── hosts.yml
   │       └── group_vars/
   └── roles/
       └── common/
           ├── defaults/main.yml
           ├── tasks/main.yml
           ├── handlers/main.yml
           └── templates/
   ```
2. Écrire `ansible.cfg` :
   ```ini
   [defaults]
   inventory = inventories/dev/hosts.yml
   remote_user = ansible
   private_key_file = ~/.ssh/<cle-ansible>
   interpreter_python = auto_silent
   callbacks_enabled = ansible.posix.profile_tasks

   [ssh_connection]
   ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o StrictHostKeyChecking=accept-new
   pipelining = True
   ```
3. Écrire l'inventaire `inventories/dev/hosts.yml` :
   ```yaml
   web:
     hosts:
       web-01:
         ansible_host: 10.0.1.10
   ```
4. Écrire `site.yml` :
   ```yaml
   ---
   - name: Configure the web servers
     hosts: web
     become: true
     roles:
       - common
   ```
5. Déclarer les collections dans `requirements.yml` :
   ```yaml
   collections:
     - name: ansible.posix
       version: ">=2.0.0,<3.0.0"
     - name: community.general
   ```
6. Installer les collections, puis tester l'accès :
   ```bash
   cd ansible
   ansible-galaxy collection install -r requirements.yml
   ansible all -m ansible.builtin.ping
   ```
