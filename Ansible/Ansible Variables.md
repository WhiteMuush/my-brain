Thème : [[Ansible]]

# Ansible Variables

1. Utiliser une variable : toujours `"{{ nom }}"`, avec les guillemets quand la valeur commence par `{{`.
   ```yaml
   - name: Create the app directory
     ansible.builtin.file:
       path: "{{ app_dir }}"
       state: directory
   ```
   Sans guillemets, YAML croit que c'est un dictionnaire et plante.

2. Où mettre une variable, de la plus faible à la plus forte (la plus forte gagne) :
   1. `roles/<rôle>/defaults/main.yml` : valeur par défaut d'un rôle, faite pour être changée.
   2. `group_vars/all.yml` : pour tous les serveurs.
   3. `group_vars/<groupe>.yml` : pour un groupe.
   4. `host_vars/<serveur>.yml` : pour un seul serveur.
   5. `vars:` dans le playbook.
   6. `roles/<rôle>/vars/main.yml` : valeur interne au rôle, pas faite pour être changée.
   7. `set_fact` et `register` pendant l'exécution.
   8. `-e` en ligne de commande : gagne toujours.

   Règle simple : les valeurs par défaut dans `defaults/` du rôle, les valeurs propres à un environnement dans `group_vars/` ou `host_vars/`.

3. Les facts, les infos récoltées sur chaque serveur :
   ```yaml
   - name: Show what Ansible knows
     ansible.builtin.debug:
       msg: "{{ ansible_facts['distribution'] }} {{ ansible_facts['distribution_version'] }}, IP {{ ansible_facts['default_ipv4']['address'] }}"
   ```
   - Voir tous les facts d'un serveur :
     ```bash
     ansible web-01 -m ansible.builtin.setup | less
     ansible web-01 -m ansible.builtin.setup -a 'filter=ansible_distribution*'
     ```

4. Faire une tâche seulement dans certains cas avec `when` :
   ```yaml
   - name: Install nginx on Debian and Ubuntu
     ansible.builtin.apt:
       name: nginx
     when: ansible_facts['os_family'] == "Debian"
   ```
   - Pas de `{{ }}` dans un `when` : c'est déjà une expression.
   - Plusieurs conditions en liste = toutes doivent être vraies.

5. Répéter une tâche avec `loop` :
   ```yaml
   - name: Create the users
     ansible.builtin.user:
       name: "{{ item.name }}"
       groups: "{{ item.groups }}"
       append: true
     loop:
       - { name: alice, groups: sudo }
       - { name: bob, groups: docker }
   ```
   - `item` = l'élément en cours de la liste.
   - `append: true` : ajoute les groupes sans retirer ceux que l'utilisateur a déjà.

6. Garder le résultat d'une tâche avec `register` :
   ```yaml
   - name: Read the app version
     ansible.builtin.command: /opt/app/bin/app --version
     register: app_version
     changed_when: false

   - name: Show it
     ansible.builtin.debug:
       msg: "Version : {{ app_version.stdout }}"
   ```
   - `app_version.stdout` : ce que la commande a affiché. Aussi `.rc` (code retour), `.stderr`, `.changed`.
   - `changed_when: false` : cette commande ne fait que lire, donc elle ne doit jamais s'afficher en `changed`.

7. Les filtres les plus utiles :
   - `{{ port | default(8080) }}` : valeur si la variable n'existe pas.
   - `{{ token | mandatory }}` : plante tout de suite si la variable manque, au lieu d'échouer plus loin.
   - `{{ nom | upper }}`, `{{ nom | lower }}` : majuscules, minuscules.
   - `{{ groups['web'] | join(',') }}` : la liste des serveurs du groupe web, séparés par des virgules.
   - `{{ ma_liste | length }}` : le nombre d'éléments.

8. Lire une variable d'environnement de ta machine (pratique pour les secrets en CI) :
   ```yaml
   api_token: "{{ lookup('ansible.builtin.env', 'API_TOKEN') | mandatory }}"
   ```

9. Forcer une valeur pour un seul lancement :
   ```bash
   ansible-playbook site.yml -e app_version=1.4.2
   ```
