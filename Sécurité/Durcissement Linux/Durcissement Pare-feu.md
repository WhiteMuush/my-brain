Thème : [[Durcissement Linux]]

# Durcissement Pare-feu

1. Installer ufw :
   ```bash
   sudo apt install ufw
   ```
2. Fixer les règles par défaut :
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   ```
3. Autoriser SSH **avant** d'activer, sinon la session est coupée :
   ```bash
   sudo ufw limit OpenSSH
   ```
   Ou seulement depuis une IP :
   ```bash
   sudo ufw allow from <ip> to any port 22 proto tcp
   ```
4. Ouvrir les autres ports utiles :
   ```bash
   sudo ufw allow 443/tcp
   ```
5. Activer et vérifier :
   ```bash
   sudo ufw enable
   sudo ufw status numbered
   ```
6. Supprimer une règle par son numéro :
   ```bash
   sudo ufw delete <numéro>
   ```

Version Ansible (collection `community.general`), dans cet ordre :
```yaml
- name: Allow SSH before enabling the firewall
  community.general.ufw:
    rule: limit
    name: OpenSSH

- name: Deny incoming traffic by default
  community.general.ufw:
    direction: incoming
    policy: deny

- name: Enable the firewall
  community.general.ufw:
    state: enabled
```
