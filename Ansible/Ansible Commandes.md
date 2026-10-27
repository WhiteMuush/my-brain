Thème : [[Ansible]]

# Ansible Commandes

1. Voir et tester l'inventaire :
   ```bash
   ansible-inventory --graph
   ansible-inventory --host web-01
   ansible all -m ansible.builtin.ping
   ```
   - `--graph` : l'arbre de tes groupes et serveurs.
   - `--host web-01` : toutes les variables que ce serveur reçoit.
   - `ping` : vérifie SSH et Python sur chaque serveur. `pong` en vert = c'est bon.

2. Lancer une commande rapide sans playbook (commande "ad hoc") :
   ```bash
   ansible web -m ansible.builtin.command -a 'uptime'
   ansible web -b -m ansible.builtin.apt -a 'name=htop state=present'
   ansible web -m ansible.builtin.setup -a 'filter=ansible_distribution*'
   ```
   - `web` : le groupe visé. `all` pour tous.
   - `-m` : le module. `-a` : ses paramètres.
   - `-b` : "become", passe en root avec sudo.
   - `setup` : affiche les facts. `filter` n'en garde qu'une partie.

3. Lancer un playbook :
   ```bash
   ansible-playbook site.yml --syntax-check
   ansible-playbook site.yml --check --diff
   ansible-playbook site.yml --diff
   ```
   - `--syntax-check` : vérifie juste que le fichier est bien écrit. Ne se connecte à rien.
   - `--check` : simulation. Rien ne change sur les serveurs.
   - `--diff` : montre les lignes modifiées dans les fichiers. À mettre tout le temps.

4. Viser juste :
   ```bash
   ansible-playbook site.yml -i inventories/prod/hosts.yml
   ansible-playbook site.yml --limit web-01
   ansible-playbook site.yml --tags config
   ansible-playbook site.yml --skip-tags packages
   ansible-playbook site.yml --list-hosts
   ansible-playbook site.yml --list-tasks
   ```
   - `-i` : choisir l'inventaire (dev, prod...).
   - `--limit` : un serveur ou un groupe précis.
   - `--tags` / `--skip-tags` : lancer ou sauter les tâches avec cette étiquette.
   - `--list-hosts` / `--list-tasks` : affiche qui et quoi serait touché, sans rien lancer. À faire avant la prod.

5. Reprendre et débugger :
   ```bash
   ansible-playbook site.yml --start-at-task "Deploy the config"
   ansible-playbook site.yml --step
   ansible-playbook site.yml -v
   ansible-playbook site.yml -vvv
   ```
   - `--start-at-task` : repart de cette tâche après une erreur, sans tout refaire.
   - `--step` : demande confirmation avant chaque tâche.
   - `-v` : affiche le résultat de chaque tâche. `-vvv` : tout le détail SSH, quand la connexion coince.

6. Passer une variable pour un seul lancement :
   ```bash
   ansible-playbook site.yml -e app_version=1.4.2
   ```

7. Collections et rôles :
   ```bash
   ansible-galaxy collection install -r requirements.yml
   ansible-galaxy collection list
   ansible-galaxy role init roles/<nom>
   ```

8. Trouver comment utiliser un module :
   ```bash
   ansible-doc ansible.builtin.copy
   ansible-doc -s ansible.builtin.copy
   ansible-doc -l | grep -i ufw
   ```
   - `ansible-doc <module>` : la doc complète avec des exemples en bas.
   - `-s` : juste la liste des paramètres, version courte.
   - `-l` : tous les modules installés. Le `grep` sert à chercher.
