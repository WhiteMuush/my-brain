Thème : [[Ansible]]

# Ansible Commandes

Les commandes du quotidien, une par besoin.

> [!IMPORTANT]
> Toujours lancer `ansible` depuis le dossier qui contient `ansible.cfg`.

## Le minimum

```bash
ansible <groupe> -m <module> -a "<arguments>"
```

- **`-m`** : le module, **`-a`** : ses arguments.
- Ajouter **`-b`** pour passer root.

## Toutes les commandes

1. **Tester la connexion** :

   ```bash
   ansible all -m ansible.builtin.ping
   ```

   - `SUCCESS` et `pong` en vert = SSH et Python marchent.

2. **Voir mes serveurs** :

   ```bash
   ansible-inventory --graph
   ```

   - Affiche les groupes et les serveurs de l'inventaire.

3. **Lancer une commande Linux** :

   ```bash
   ansible web -m ansible.builtin.command -a "uptime"
   ```

   - **`web`** : le groupe visé, `all` pour tous.
   - **`-a`** : la commande à lancer.

4. **Installer un paquet** :

   ```bash
   ansible web -b -m ansible.builtin.apt -a "name=tree state=present update_cache=true"
   ```

   - **`-b`** : passe root avec sudo.
   - **`state=present`** : l'état voulu, "doit être installé".

5. **Lancer un playbook** :

   ```bash
   ansible-playbook site.yml --check --diff
   ansible-playbook site.yml --diff
   ```

   - **`--check`** : simulation, rien ne change.
   - **`--diff`** : montre ce qui change dans les fichiers.

6. **Viser un seul serveur** :

   ```bash
   ansible-playbook site.yml --limit srv01
   ```

7. **Comprendre une erreur** :

   ```bash
   ansible-playbook site.yml -vvv
   ```

   - Affiche tout le détail, utile quand la connexion SSH coince.

8. **Trouver comment utiliser un module** :

   - Exemple avec le module apt : [doc du module apt](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_module.html).
   - Pour un autre module, remplacer `apt` dans l'adresse.
   - Aller directement aux **Examples** en bas de la page.

> [!TIP]
> Un module spécialisé (`apt`, `copy`, `service`) dit `CHANGED` seulement s'il a vraiment modifié quelque chose.
> `command` dit toujours `CHANGED`, car il ne sait pas ce que fait la commande.
