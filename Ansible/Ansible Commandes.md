Thème : [[Ansible]]

# Ansible Commandes

```bash
# Inventaire et accès
ansible-inventory --graph                          # arbre des groupes et hôtes
ansible all -m ansible.builtin.ping                # tester SSH et Python
ansible web -m ansible.builtin.setup -a 'filter=ansible_distribution*'   # lire des facts

# Commande ponctuelle
ansible web -b -m ansible.builtin.command -a 'uptime'

# Playbook
ansible-playbook site.yml --syntax-check           # syntaxe seulement
ansible-playbook site.yml --check --diff           # simulation, rien ne change
ansible-playbook site.yml --diff                   # appliquer
ansible-playbook site.yml -l web-01                # limiter à un hôte
ansible-playbook site.yml --tags ssh               # limiter à des tâches taguées
ansible-playbook site.yml --start-at-task "<nom>"  # reprendre après un échec
ansible-playbook site.yml -vvv                     # debug SSH

# Collections et rôles
ansible-galaxy collection install -r requirements.yml
ansible-galaxy role init roles/<nom>

# Documentation d'un module
ansible-doc ansible.builtin.copy
```

Secrets : [[Secrets Ansible Vault]]. Lint : [[Scan ansible-lint]].
