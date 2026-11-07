# My-Brain

Vault Obsidian de documentation rapide : Docker, Kubernetes, Terraform, Ansible et sécurité.

Chaque note dit comment on fait, sans plus.

## Installer sur Linux

1. **Installer Git et Obsidian** :

   ```bash
   sudo apt install -y git flatpak
   flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
   flatpak install -y flathub md.obsidian.Obsidian
   ```

   - Sans Flatpak, prendre le paquet `.deb` ou l'AppImage sur le site d'Obsidian.

2. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/WhiteMuush/my-brain.git ~/my-brain
   ```

3. **Ouvrir le coffre** : dans Obsidian, choisir **Ouvrir un dossier comme coffre**, puis `~/my-brain`.

4. **Activer le graphe figé** : **Paramètres**, **Plugins communautaires**, **Activer**, puis cocher **Graphe figé**.

   - Le plugin est déjà dans le dépôt : rien à télécharger.
   - Obsidian n'active aucun plugin tout seul après un clone, c'est voulu.

5. **Partir de la note My-Brain**, ou ouvrir la vue graphe.

Le style de lecture `lisibilite` est actif dès l'ouverture.

Aucune synchronisation n'est fournie : le clone reste local.

## Structure

- `My-Brain.md` liste les thèmes.
- Un dossier par thème, avec une note du même nom qui liste ses notes.
- Chaque note commence par `Thème : [[Parent]]`.
- Le nom d'une note commence par le nom de son thème.

## Format des notes

- **Une phrase par ligne**, une ligne vide entre les étapes.
- **Mots-clés en gras** pour accrocher l'œil.
- **Encadrés colorés** à sens fixe :
  - `[!TIP]` vert : la solution.
  - `[!WARNING]` orange : un piège.
  - `[!CAUTION]` rouge : une action dangereuse.
  - `[!IMPORTANT]` violet : la règle à retenir.
