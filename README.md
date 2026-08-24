<h1 align="center">My Brain</h1>

<p align="center">
  Coffre Obsidian personnel : notes techniques, apprentissage DevOps et veille.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-7C3AED?style=flat-square&logo=obsidian&logoColor=white" alt="Obsidian">
  <img src="https://img.shields.io/badge/Markdown-000000?style=flat-square&logo=markdown&logoColor=white" alt="Markdown">
  <img src="https://img.shields.io/badge/Sync-Obsidian%20Git-F05032?style=flat-square&logo=git&logoColor=white" alt="Obsidian Git">
  <img src="https://img.shields.io/badge/Dépôt-privé-6B7280?style=flat-square" alt="Privé">
</p>

---

## Ce que c'est

Un dossier de fichiers Markdown, rien de plus. Pas de base de données, pas de
format propriétaire. Chaque note est un fichier `.md` lisible avec n'importe
quel éditeur, même sans Obsidian.

Le dossier `.obsidian/` contient la configuration du coffre : thème, greffons,
groupes de couleur du graphe. Il voyage avec les notes, donc un clone sur une
autre machine retrouve exactement le même environnement.

## Organisation

Un point d'entrée unique, et des notes par thème en dessous. Pas de toile
d'araignée : on relie seulement ce qui a une raison de l'être.

```
Accueil.md        le point de départ, liste les thèmes
Proxmox.md        virtualisation, VMs, réseau du labo
Ansible.md        automatisation
```

Les liens s'écrivent entre doubles crochets, par exemple `[[Proxmox]]`. Un lien
vers une note inexistante apparaît en grisé et la crée au clic. C'est voulu :
on pose le lien quand le besoin arrive, la note vient après.

## Synchronisation

Le greffon **Obsidian Git** commite et pousse automatiquement toutes les dix
minutes, uniquement s'il y a eu des modifications.

| Réglage | Valeur |
|---|---|
| Vault backup interval | `10` minutes |
| Auto pull on startup | activé |

Pour forcer un envoi immédiat : `Ctrl+P` puis `Git: Commit-and-sync`.

> La synchronisation ne tourne que quand Obsidian est ouvert. Un fichier modifié
> en dehors de l'application ne partira qu'à la prochaine ouverture.

## Remonter le coffre ailleurs

```bash
git clone git@github.com:WhiteMuush/my-brain.git
```

Puis dans Obsidian : **Ouvrir un coffre** → **Ouvrir un dossier existant** →
choisir le dossier cloné. La configuration et les greffons sont déjà là.

## Ce qui n'est pas versionné

`.obsidian/workspace.json` enregistre la position des fenêtres et change à
chaque clic. Le versionner produirait un commit à chaque ouverture de note, il
est donc exclu par le `.gitignore`.
