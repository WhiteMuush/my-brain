Thème : [[Secrets]]

# Secrets Ansible Vault

1. Créer le fichier de mot de passe, hors du dépôt :
   ```bash
   echo '<mot de passe>' > ~/.vault_pass
   chmod 600 ~/.vault_pass
   ```
2. Créer le fichier chiffré :
   ```bash
   ansible-vault create inventories/dev/group_vars/all/vault.yml --vault-password-file ~/.vault_pass
   ```
   Contenu, chaque secret préfixé par `vault_` :
   ```yaml
   vault_db_password: "<secret>"
   ```
3. Le référencer en clair dans `inventories/dev/group_vars/all/vars.yml` :
   ```yaml
   db_password: "{{ vault_db_password }}"
   ```
4. Ajouter `no_log: true` sur chaque tâche qui manipule le secret.
5. Lancer le playbook :
   ```bash
   ansible-playbook site.yml --vault-password-file ~/.vault_pass
   ansible-playbook site.yml --ask-vault-pass
   ```
6. Commandes du quotidien :
   ```bash
   ansible-vault view vault.yml
   ansible-vault edit vault.yml
   ansible-vault encrypt fichier.yml
   ansible-vault rekey vault.yml                          # changer le mot de passe
   ansible-vault encrypt_string '<secret>' --name 'db_password'   # une seule valeur
   ```

Sans Vault, lire le secret depuis l'environnement :
```yaml
db_password: "{{ lookup('ansible.builtin.env', 'DB_PASSWORD') | mandatory }}"
```
