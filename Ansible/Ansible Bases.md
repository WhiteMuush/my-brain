Thème : [[Ansible]]

# Ansible Bases

Ansible, c'est un outil qui se connecte en SSH à tes serveurs et qui les configure pour toi.
Tu écris **ce que tu veux obtenir** ("nginx installé et démarré"), et Ansible fait le nécessaire.
Rien à installer sur les serveurs : il leur faut juste SSH et Python.

1. Le vocabulaire, à connaître avant tout :
   - **Nœud de contrôle** : ta machine, celle qui lance Ansible. Linux ou WSL, pas Windows directement.
   - **Hôte géré** : un serveur qu'Ansible configure.
   - **Inventaire** : la liste de tes serveurs, rangés en groupes (`web`, `db`...).
   - **Module** : une action toute prête. `apt` installe un paquet, `copy` copie un fichier, `service` démarre un service. Il en existe des milliers.
   - **Tâche** : un appel à un module, avec un nom qui dit ce qu'elle fait.
   - **Playbook** : un fichier YAML qui dit "sur tel groupe de serveurs, fais ces tâches".
   - **Rôle** : un paquet de tâches réutilisable, rangé dans un dossier (ex. un rôle `nginx`).
   - **Handler** : une tâche qui ne se lance que si on la prévient. Typiquement : redémarrer un service après avoir changé sa config.
   - **Facts** : les infos qu'Ansible récupère sur chaque serveur au début (OS, IP, RAM...).

2. L'idée la plus importante : **l'idempotence**.
   Lancer le même playbook 10 fois donne le même résultat qu'une seule fois.
   Si nginx est déjà installé, Ansible ne fait rien et l'affiche en vert (`ok`).
   C'est pour ça qu'on décrit un **état voulu** et pas une suite de commandes.

3. Installer Ansible sur ta machine :
   ```bash
   sudo apt-get install -y pipx
   pipx install --include-deps ansible
   pipx inject ansible ansible-lint
   pipx ensurepath
   ansible --version
   ```
   - `pipx` installe Ansible dans son propre coin, sans casser le Python du système.
   - `--include-deps` installe aussi les commandes `ansible-playbook`, `ansible-galaxy`, etc.
   - `ansible --version` doit afficher la version et le chemin de la config utilisée.

4. Vérifier que tu peux joindre un serveur :
   ```bash
   ssh <user>@<serveur>                                     # d'abord à la main
   ansible all -i '<serveur>,' -u <user> -m ansible.builtin.ping
   ```
   - `-i '<serveur>,'` : inventaire écrit directement dans la commande. La virgule à la fin est obligatoire.
   - `-m ansible.builtin.ping` : ce n'est pas un ping réseau. Il vérifie que SSH marche **et** que Python est présent.
   - Réponse attendue : `"ping": "pong"` en vert.

5. Ton premier playbook, `premier.yml` :
   ```yaml
   ---
   - name: Install and start nginx
     hosts: all
     become: true
     tasks:
       - name: Install nginx
         ansible.builtin.apt:
           name: nginx
           state: present
           update_cache: true

       - name: Make sure nginx is running
         ansible.builtin.service:
           name: nginx
           state: started
           enabled: true
   ```
   - `hosts: all` : sur quels serveurs. Ici tous ceux de l'inventaire.
   - `become: true` : passe en root avec sudo, nécessaire pour installer un paquet.
   - `state: present` : "nginx doit être installé". S'il l'est déjà, rien ne se passe.
   - `state: started` + `enabled: true` : démarré maintenant **et** au prochain redémarrage.

6. Le lancer, d'abord en simulation :
   ```bash
   ansible-playbook -i '<serveur>,' -u <user> premier.yml --check --diff
   ansible-playbook -i '<serveur>,' -u <user> premier.yml
   ```
   - `--check` : simule, ne change rien.
   - `--diff` : montre ce qui changerait dans les fichiers.
   - Relance-le une 2e fois : tout doit être `ok`, rien en `changed`. C'est l'idempotence.

Pour un vrai projet, on range tout ça dans des fichiers : voir la note Ansible Structure projet.
