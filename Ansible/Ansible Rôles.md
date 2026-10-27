Thème : [[Ansible]]

# Ansible Rôles

1. Créer le rôle :
   ```bash
   ansible-galaxy role init roles/<nom>
   ```
2. Mettre les variables dans `defaults/main.yml`, préfixées par le nom du rôle :
   ```yaml
   ---
   app_user: app
   app_dir: /opt/app
   app_version: "1.2.3"
   app_sha256: <somme sha256 de l'archive>
   ```
3. Écrire `tasks/main.yml` : un `name` par tâche, modules en nom complet (`ansible.builtin.*`) :
   ```yaml
   ---
   - name: Install base packages
     ansible.builtin.apt:
       name: [git, curl, jq]
       state: present
       update_cache: true
       cache_valid_time: 3600

   - name: Download the archive
     ansible.builtin.get_url:
       url: "https://exemple.org/app-{{ app_version }}.tar.gz"
       dest: "{{ app_dir }}/app-{{ app_version }}.tar.gz"
       checksum: "sha256:{{ app_sha256 }}"
       mode: "0644"

   - name: Deploy the config
     ansible.builtin.template:
       src: app.conf.j2
       dest: /etc/app/app.conf
       mode: "0640"
     notify: Restart app
   ```
4. Écrire le handler dans `handlers/main.yml` :
   ```yaml
   ---
   - name: Restart app
     ansible.builtin.service:
       name: app
       state: restarted
   ```
5. Garder chaque tâche idempotente :
   - `creates: <fichier>` sur `command` et `shell`
   - `changed_when: false` sur une commande qui ne fait que lire
   - `validate: <commande> %s` sur un fichier de config
   - `checksum:` sur un téléchargement
6. Lire un secret depuis l'environnement, jamais en clair dans le dépôt :
   ```yaml
   app_token: "{{ lookup('ansible.builtin.env', 'APP_TOKEN') | mandatory }}"
   ```
   et ajouter `no_log: true` sur la tâche qui l'utilise.
7. Ajouter le rôle dans `site.yml`, puis tester :
   ```bash
   ansible-playbook site.yml --check --diff
   ansible-playbook site.yml --diff
   ansible-playbook site.yml --diff     # 2e passage : changed=0 attendu
   ```
