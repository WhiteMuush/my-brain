Thème : [[Ansible]]

# Ansible Playbook

1. Un playbook complet, avec ce qu'on utilise le plus souvent :
   ```yaml
   ---
   - name: Configure the web servers
     hosts: web
     become: true
     gather_facts: true
     vars:
       app_port: 8080

     tasks:
       - name: Install the packages
         ansible.builtin.apt:
           name: [nginx, curl]
           state: present
           update_cache: true
           cache_valid_time: 3600
         tags: [packages]

       - name: Deploy the nginx config
         ansible.builtin.template:
           src: templates/site.conf.j2
           dest: /etc/nginx/sites-available/default
           owner: root
           group: root
           mode: "0644"
         notify: Reload nginx
         tags: [config]

       - name: Make sure nginx is running
         ansible.builtin.service:
           name: nginx
           state: started
           enabled: true

     handlers:
       - name: Check the nginx config
         ansible.builtin.command: nginx -t
         changed_when: false
         listen: Reload nginx

       - name: Reload the nginx service
         ansible.builtin.service:
           name: nginx
           state: reloaded
         listen: Reload nginx
   ```

2. Ce que fait chaque ligne :

   **En tête du play**
   - `name` : une phrase qui dit ce que fait le play. Elle s'affiche pendant l'exécution.
   - `hosts: web` : le groupe de l'inventaire visé.
   - `become: true` : passe en root avec sudo. Tu peux aussi le mettre seulement sur les tâches qui en ont besoin.
   - `gather_facts: true` : récupère les infos du serveur au début (OS, IP...). Activé par défaut.
   - `vars` : des variables pour ce play.

   **Les tâches**
   - Une tâche = un `name` + un module. Toujours écrire le nom complet du module (`ansible.builtin.apt`, pas `apt`).
   - `name: [nginx, curl]` : donner une liste au module `apt` installe tout en une fois, plus rapide qu'une boucle.
   - `update_cache: true` + `cache_valid_time: 3600` : fait un `apt update`, sauf s'il date de moins d'une heure.
   - `mode: "0644"` : **toujours entre guillemets**. Sans guillemets, YAML lit un nombre et les droits deviennent faux.
   - `tags` : une étiquette pour lancer seulement certaines tâches avec `--tags config`.

   **Les handlers**
   - `notify: Reload nginx` : "si cette tâche a changé quelque chose, préviens le handler Reload nginx".
   - Le handler se lance **une seule fois, à la fin du play**, même si 5 tâches l'ont prévenu.
   - Si rien n'a changé, il ne se lance pas. Pas de redémarrage inutile.
   - `listen: Reload nginx` : les deux handlers écoutent le même nom. Ils se lancent dans l'ordre où ils sont écrits.
   - Résultat : `nginx -t` teste d'abord la config. Si elle est fausse, Ansible s'arrête **avant** de recharger, et le nginx en place continue de tourner.
   - Le nom dans `notify` doit être **exactement** celui du `listen` (ou du `name` d'un handler).

3. Lancer :
   ```bash
   ansible-playbook site.yml --syntax-check     # erreurs de YAML ou de structure
   ansible-playbook site.yml --check --diff     # simulation
   ansible-playbook site.yml --diff             # pour de vrai
   ```
   En simulation, les tâches `command` et `shell` ne tournent pas : Ansible ne peut pas deviner leur effet.

4. Lire le résultat :
   - `ok` (vert) : rien à faire, c'était déjà bon.
   - `changed` (jaune) : Ansible a modifié quelque chose.
   - `skipping` (bleu) : tâche sautée, sa condition `when` était fausse.
   - `failed` (rouge) : erreur. Ansible arrête ce serveur, les autres continuent.
   - `unreachable` : SSH impossible.
   - Le `PLAY RECAP` à la fin résume tout par serveur. Il faut `failed=0` et `unreachable=0`.

5. Contrôler l'idempotence : relancer une 2e fois. Il faut `changed=0` partout.
   Une tâche toujours en `changed` est mal écrite (souvent un `command` sans `creates` ou `changed_when`).

6. Mettre à jour un groupe de serveurs petit à petit :
   ```yaml
   - name: Update the web servers
     hosts: web
     serial: 1
     max_fail_percentage: 0
   ```
   - `serial: 1` : un serveur à la fois. Les autres continuent de répondre pendant ce temps.
   - `max_fail_percentage: 0` : au premier échec, on s'arrête avant de casser les suivants.
