Thème : [[Durcissement Linux]]

# Durcissement SSH

1. Sur ton poste, créer une clé :
   ```bash
   ssh-keygen -t ed25519 -C "<toi>@<poste>"
   ```
2. La copier sur le serveur, puis tester la connexion par clé :
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub <user>@<serveur>
   ssh <user>@<serveur>
   ```
3. Vérifier que le serveur lit le dossier `sshd_config.d` :
   ```bash
   grep -i '^Include' /etc/ssh/sshd_config
   ```
4. Créer `/etc/ssh/sshd_config.d/10-hardening.conf` :
   ```
   PermitRootLogin no
   PasswordAuthentication no
   KbdInteractiveAuthentication no
   AllowUsers <user>
   ```
5. Valider la config, puis redémarrer (`ssh` sur Debian et Ubuntu, `sshd` sur RHEL) :
   ```bash
   sudo sshd -t
   sudo systemctl restart ssh
   ```
6. Garder la session ouverte et tester dans un **deuxième terminal**.
7. Contrôler les valeurs réellement appliquées :
   ```bash
   sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication|allowusers'
   ```

Version Ansible, avec validation avant écriture :
```yaml
- name: Harden the SSH server
  ansible.builtin.copy:
    dest: /etc/ssh/sshd_config.d/10-hardening.conf
    content: |
      PermitRootLogin no
      PasswordAuthentication no
      KbdInteractiveAuthentication no
      AllowUsers ansible
    owner: root
    group: root
    mode: "0644"
    validate: /usr/sbin/sshd -t -f %s
  notify: Restart SSH
```
