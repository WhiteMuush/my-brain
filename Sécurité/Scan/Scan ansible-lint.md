Thème : [[Scan]]

# Scan ansible-lint

1. Installer :
   ```bash
   pipx install ansible-lint
   ```
2. Créer `.ansible-lint` à la racine du dossier Ansible :
   ```yaml
   profile: production
   exclude_paths:
     - .cache/
   ```
3. Lancer :
   ```bash
   ansible-playbook site.yml --syntax-check
   ansible-lint
   ```
4. Corriger automatiquement ce qui peut l'être :
   ```bash
   ansible-lint --fix
   ```
5. Ignorer une règle sur une seule ligne :
   ```yaml
   - name: Read the version
     ansible.builtin.command: app --version  # noqa: no-changed-when
   ```
