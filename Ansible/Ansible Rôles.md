Thème : [[Ansible]]

# Ansible Rôles

Un rôle, c'est un dossier qui range tout ce qu'il faut pour installer une chose (nginx, docker, un utilisateur...).
Tu l'écris une fois, puis tu l'appelles depuis n'importe quel playbook.

1. Créer le rôle :
   ```bash
   ansible-galaxy role init roles/<nom>
   ```
   Ça crée ces dossiers :
   ```
   roles/<nom>/
   ├── defaults/main.yml    valeurs par défaut, faites pour être changées
   ├── vars/main.yml        valeurs internes, pas faites pour être changées
   ├── tasks/main.yml       les tâches, le cœur du rôle
   ├── handlers/main.yml    les handlers (redémarrer un service...)
   ├── templates/           fichiers .j2 avec des variables
   ├── files/               fichiers copiés tels quels
   ├── meta/main.yml        description et dépendances du rôle
   └── tests/               à supprimer si tu ne t'en sers pas
   ```
   - `defaults` contre `vars` : `defaults` a la priorité la plus **faible**, donc n'importe quel `group_vars` peut la changer. `vars` a une priorité **forte**, à garder pour ce qui ne doit pas bouger.
   - Supprimer les dossiers vides : moins de bruit.

2. Mettre les variables dans `defaults/main.yml`, **préfixées par le nom du rôle** :
   ```yaml
   ---
   # Utilisateur qui fait tourner l'appli
   app_user: app
   # Dossier d'installation
   app_dir: /opt/app
   # Version à installer, à changer avec la somme sha256 qui va avec
   app_version: "1.2.3"
   app_sha256: <somme sha256 de l'archive>
   ```
   - Le préfixe `app_` évite qu'une variable d'un autre rôle porte le même nom et écrase la tienne.
   - Une ligne de commentaire au-dessus de chaque variable : c'est la doc du rôle.

3. Écrire `tasks/main.yml` :
   ```yaml
   ---
   - name: Create the app user
     ansible.builtin.user:
       name: "{{ app_user }}"
       system: true
       shell: /usr/sbin/nologin
       create_home: false

   - name: Create the app directory
     ansible.builtin.file:
       path: "{{ app_dir }}"
       state: directory
       owner: "{{ app_user }}"
       group: "{{ app_user }}"
       mode: "0750"

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
       owner: root
       group: "{{ app_user }}"
       mode: "0640"
     notify: Restart app
   ```
   - `system: true` + `shell: /usr/sbin/nologin` : un compte de service. Personne ne peut s'y connecter.
   - `mode: "0750"` : le propriétaire fait tout, son groupe lit, les autres rien.
   - `dest` avec le **nom complet du fichier** dans `get_url` : avec juste un dossier, Ansible retélécharge à chaque fois.
   - `checksum` : vérifie que l'archive est bien la bonne. Si quelqu'un l'a modifiée, la tâche échoue.
   - `mode: "0640"` sur la config : lisible par l'appli, invisible pour les autres comptes (utile s'il y a un mot de passe dedans).

4. Écrire `handlers/main.yml` :
   ```yaml
   ---
   - name: Restart app
     ansible.builtin.service:
       name: app
       state: restarted
   ```

5. Si `tasks/main.yml` devient long, le couper en morceaux :
   ```yaml
   ---
   - name: Install
     ansible.builtin.import_tasks: install.yml

   - name: Configure
     ansible.builtin.import_tasks: configure.yml
   ```

6. Les règles pour qu'un rôle soit idempotent :
   - Toujours préférer un vrai module (`apt`, `file`, `service`...) à `command` ou `shell`.
   - Si `command` est obligatoire, ajouter `creates: <fichier>` : la commande ne se relance pas si le fichier existe déjà.
   - Une commande qui ne fait que lire : `changed_when: false`.
   - Un fichier de config complet : `validate: <commande de test> %s`.
   - Jamais `ignore_errors: true` pour faire passer une erreur : ça cache les vrais problèmes.

7. Un secret ne s'écrit jamais en clair dans le rôle :
   ```yaml
   app_token: "{{ lookup('ansible.builtin.env', 'APP_TOKEN') | mandatory }}"
   ```
   Et `no_log: true` sur la tâche qui l'utilise, pour qu'il n'apparaisse pas dans les logs. Voir aussi la note Secrets Ansible Vault.

8. Appeler le rôle dans `site.yml`, puis tester :
   ```yaml
   - name: Install the app
     hosts: app
     become: true
     roles:
       - <nom>
   ```
   ```bash
   ansible-playbook site.yml --check --diff
   ansible-playbook site.yml --diff
   ansible-playbook site.yml --diff     # 2e passage : changed=0 attendu
   ```

9. Vérifier la qualité :
   ```bash
   ansible-lint roles/<nom>
   ```
