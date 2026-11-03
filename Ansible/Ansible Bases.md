Thème : [[Ansible]]

# Ansible Bases

## Le minimum

- **Ansible** se connecte en **SSH** à tes serveurs et les configure à ta place.
- Sur les serveurs, il faut juste **SSH et Python**, aucun agent.
- Tu décris **l'état voulu** ("tree installé"), pas les commandes à taper.
- Relancer donne le même résultat : c'est **l'idempotence**.
- **Vert `ok`** = c'était déjà bon, **jaune `changed`** = Ansible a modifié quelque chose.

## Pour aller plus loin

1. **Le vocabulaire, à connaître avant tout** :
   - **Nœud de contrôle** : ta machine, celle qui lance Ansible.
     Linux ou WSL, pas Windows directement.
   - **Hôte géré** : un serveur qu'Ansible configure.
   - **Inventaire** : la liste de tes serveurs, rangés en groupes (`web`, `db`...).
   - **Module** : une action toute prête.
     `apt` installe un paquet, `copy` copie un fichier, `service` démarre un service.
     Il en existe des milliers.
   - **Tâche** : un appel à un module, avec un nom qui dit ce qu'elle fait.
   - **Playbook** : un fichier YAML qui dit "sur tel groupe de serveurs, fais ces tâches".
   - **Rôle** : un paquet de tâches réutilisable, rangé dans un dossier (ex. un rôle `nginx`).
   - **Handler** : une tâche qui ne se lance que si on la prévient.
     Typiquement : redémarrer un service après avoir changé sa config.
   - **Facts** : les infos qu'Ansible récupère sur chaque serveur au début (OS, IP, RAM...).

2. L'idée la plus importante : **l'idempotence**.
   Lancer le même playbook 10 fois donne le même résultat qu'une seule fois.
   Si nginx est déjà installé, Ansible ne fait rien et l'affiche en vert (`ok`).
   C'est pour ça qu'on décrit un **état voulu** et pas une suite de commandes.

3. **Installer Ansible sur ta machine** :

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

Étape suivante : la note Ansible Inventaire.
