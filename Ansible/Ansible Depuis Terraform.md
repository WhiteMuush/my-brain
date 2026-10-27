Thème : [[Ansible]]

# Ansible Depuis Terraform

Le partage des rôles : **Terraform crée** la machine (VM, réseau, IP), **Ansible la configure** (paquets, services, fichiers).
Le lien entre les deux, c'est l'adresse IP : Terraform la donne, Ansible s'en sert.

1. Terraform crée la VM avec un compte `ansible` et ta clé publique SSH.
   Ce compte sert seulement à Ansible, avec sudo. Ton compte perso reste à part.

2. Terraform expose ce dont Ansible a besoin :
   ```hcl
   output "public_ip" {
     value = <ressource ip>.address
   }

   output "admin_username" {
     value = "ansible"
   }
   ```
   - Un `output` est une valeur que Terraform affiche après l'apply, et qu'on peut relire ensuite avec `terraform output`.

3. Option A, la plus simple : l'inventaire lit l'IP dans une variable d'environnement.
   ```yaml
   servers:
     hosts:
       vm-01:
         ansible_host: "{{ lookup('ansible.builtin.env', 'TARGET_IP') }}"
   ```
   - Rien n'est écrit en dur : si Terraform recrée la VM avec une nouvelle IP, il n'y a rien à modifier.
   ```bash
   TARGET_IP="$(terraform -chdir=terraform/environments/dev output -raw public_ip)" \
     ansible-playbook -i ansible/inventories/dev/hosts.yml ansible/site.yml --diff
   ```
   - `-chdir=...` : lance Terraform dans ce dossier sans y aller avec `cd`.
   - `output -raw` : donne la valeur brute, sans guillemets, utilisable dans une commande.
   - `TARGET_IP=... ansible-playbook ...` sur la même ligne : la variable n'existe que pour cette commande.

4. Option B : générer un fichier d'inventaire.
   ```bash
   ip="$(terraform -chdir=terraform output -raw public_ip)"
   user="$(terraform -chdir=terraform output -raw admin_username)"
   printf '[servers]\n%s ansible_user=%s\n' "$ip" "$user" > ansible/inventory.ini
   ```
   - Mettre `inventory.ini` dans le `.gitignore` : il est regénéré à chaque fois.

5. Une VM recréée a une nouvelle clé d'hôte SSH, que SSH refuse ("REMOTE HOST IDENTIFICATION HAS CHANGED").
   Pour des VMs jetables, ne pas la garder, dans `ansible.cfg` :
   ```ini
   [ssh_connection]
   ssh_args = -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/dev/null
   ```
   - `UserKnownHostsFile=/dev/null` : n'enregistre jamais la clé. À réserver aux VMs jetables, pas aux serveurs durables.

6. Attendre que la VM soit prête : elle est "créée" pour Terraform bien avant que SSH réponde.
   ```bash
   until ssh -o ConnectTimeout=5 -o BatchMode=yes ansible@"$ip" true; do sleep 5; done
   ssh ansible@"$ip" 'cloud-init status --wait'
   ```
   - `BatchMode=yes` : n'attend jamais un mot de passe, échoue tout de suite si la clé ne passe pas.
   - `cloud-init status --wait` : attend la fin du premier démarrage. Sinon `apt` est encore verrouillé et ta première tâche échoue.

7. Si SSH est fermé par défaut, l'ouvrir pour ton IP seulement le temps du run, et le refermer même en cas d'erreur :
   ```bash
   (
     open_ssh_for_my_ip
     trap close_ssh EXIT
     ansible-playbook site.yml --diff
   )
   ```
   - Les parenthèses lancent un sous-shell : le `trap ... EXIT` s'exécute quand il se termine, que le playbook réussisse ou plante.
   - `open_ssh_for_my_ip` et `close_ssh` : tes fonctions qui ajoutent puis retirent la règle de pare-feu chez ton hébergeur.
