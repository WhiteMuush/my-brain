Thème : [[Ansible]]

# Ansible Depuis Terraform

1. Terraform crée la VM avec un compte `ansible` et ta clé publique.
2. Terraform expose l'adresse et le compte :
   ```hcl
   output "public_ip" {
     value = <ressource ip>.address
   }

   output "admin_username" {
     value = "ansible"
   }
   ```
3. L'inventaire lit l'IP depuis l'environnement, rien n'est écrit en dur :
   ```yaml
   servers:
     hosts:
       vm-01:
         ansible_host: "{{ lookup('ansible.builtin.env', 'TARGET_IP') }}"
   ```
4. Si la VM est recréée souvent, ne pas garder sa clé d'hôte dans `ansible.cfg` :
   ```ini
   [ssh_connection]
   ssh_args = -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/dev/null
   ```
5. Lancer Ansible avec l'IP sortie de Terraform :
   ```bash
   TARGET_IP="$(terraform -chdir=terraform/environments/dev output -raw public_ip)" \
     ansible-playbook -i ansible/inventories/dev/hosts.yml ansible/site.yml --diff
   ```
6. Variante avec un fichier d'inventaire généré :
   ```bash
   ip="$(terraform -chdir=terraform output -raw public_ip)"
   user="$(terraform -chdir=terraform output -raw admin_username)"
   printf '[servers]\n%s ansible_user=%s\n' "$ip" "$user" > ansible/inventory.ini
   ```
   Mettre `inventory.ini` dans le `.gitignore`.
7. Si SSH est fermé par défaut, l'ouvrir pour ton IP le temps du run, et le refermer même en cas d'échec :
   ```bash
   (
     open_ssh_for_my_ip
     trap close_ssh EXIT
     ansible-playbook site.yml --diff
   )
   ```
