Thème : [[Ansible]]

# Ansible Templates

Un template, c'est un fichier de config avec des trous. Ansible remplit les trous avec tes variables, puis copie le résultat sur le serveur.
Le langage des trous s'appelle **Jinja2**, et le fichier finit par `.j2`.

1. Écrire `roles/nginx/templates/site.conf.j2` :
   ```jinja
   {{ ansible_managed | comment }}

   server {
       listen {{ nginx_port }};
       server_name {{ nginx_server_name | default(inventory_hostname) }};

   {% for location in nginx_locations %}
       location {{ location.path }} {
           proxy_pass {{ location.backend }};
       }
   {% endfor %}

   {% if nginx_enable_gzip %}
       gzip on;
   {% endif %}
   }
   ```
   - `{{ variable }}` : remplacé par la valeur de la variable.
   - `{% for ... %}` ... `{% endfor %}` : répète le bloc pour chaque élément de la liste.
   - `{% if ... %}` ... `{% endif %}` : met le bloc seulement si la condition est vraie.
   - `{# texte #}` : un commentaire Jinja, qui n'apparaît pas dans le fichier final.
   - `{{ ansible_managed | comment }}` : ajoute en haut "fichier géré par Ansible". Ça prévient les collègues que leurs modifs à la main seront écrasées.
   - `inventory_hostname` : le nom du serveur dans l'inventaire.

2. Donner les valeurs dans `roles/nginx/defaults/main.yml` :
   ```yaml
   nginx_port: 80
   nginx_enable_gzip: true
   nginx_locations:
     - path: /
       backend: http://127.0.0.1:8080
     - path: /api
       backend: http://127.0.0.1:9000
   ```

3. Déployer le template :
   ```yaml
   - name: Deploy the site config
     ansible.builtin.template:
       src: site.conf.j2
       dest: /etc/nginx/sites-available/default
       owner: root
       group: root
       mode: "0644"
       backup: true
     notify: Reload nginx
   ```
   - `src` : dans un rôle, Ansible cherche tout seul dans le dossier `templates/` du rôle.
   - `backup: true` : garde une copie datée de l'ancien fichier sur le serveur, au cas où.
   - `notify` : recharge nginx seulement si le fichier a vraiment changé. Le handler teste la config avec `nginx -t` avant de recharger (exemple complet dans la note Ansible Playbook).
   - `validate: <commande> %s` : teste le fichier **avant** de le mettre en place. À utiliser seulement pour un fichier de config **complet**, comme `sshd_config` (`validate: /usr/sbin/sshd -t -f %s`). Un morceau de config, comme un site nginx, échouerait toujours au test.

4. Voir le résultat sans rien changer :
   ```bash
   ansible-playbook site.yml --check --diff --tags config
   ```
   `--diff` affiche les lignes ajoutées et retirées dans le fichier.

`template` ou `copy` ?
- `copy` : le fichier est identique partout. Il va dans `files/`.
- `template` : le fichier contient des variables. Il va dans `templates/`.
