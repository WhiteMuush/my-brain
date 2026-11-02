Thème : [[Docker]]

# Docker Debug

Méthode pour trouver une panne dans un projet Compose.

> [!IMPORTANT]
> **Observer d'abord, modifier ensuite.**

## La méthode

1. **Vérifier le fichier.**

   ```bash
   docker compose config
   ```

   - Détecte les erreurs de **YAML**.
   - Détecte les erreurs d'**indentation**.
   - Détecte les **variables manquantes**.

2. **Trouver le service en panne.**

   ```bash
   docker compose ps -a
   ```

   - **`Restarting`** : le service plante en boucle.
   - **`Exited (0)`** : arrêt normal.
   - **`Exited (autre code)`** : erreur.
   - **`-a`** : montre aussi les services arrêtés.

3. **Lire les logs du service.**

   ```bash
   docker compose logs <service>
   ```

   - Lire **tout**, pas seulement la fin.
   - La cause est souvent **plus haut** que l'erreur.

4. **Regarder dans le conteneur.**

   ```bash
   docker compose exec <service> sh
   ```

   - **`ls -ln /chemin`** : fichiers et permissions.
   - **`id`** : utilisateur du processus.

5. **Si le service plante, passer par un conteneur temporaire.**

   ```bash
   docker run --rm -v <projet>_<volume>:/d alpine ls -ldn /d
   ```

   - Montre le **propriétaire** des données du volume.

6. **Tester la connexion entre services.**

   ```bash
   docker compose exec <service> nslookup <autre_service>
   ```

   - Un service se joint par son **nom**.
   - Il faut utiliser son **port interne**.

7. **Corriger une seule chose, puis retester.**

## Pannes courantes

### Port déjà utilisé

- **Symptôme :** `port is already allocated`.
- **Cause :** deux services publient le **même port de l'hôte**.

> [!TIP]
> Changer le port **de gauche** dans `ports:`.

### nginx répond 403

- **Symptôme :** `403 Forbidden`.
- **Cause :** le fichier n'a pas le droit **`r`**, ou le dossier n'a pas le droit **`x`**.

> [!TIP]
> **`chmod 755`** sur le dossier.
>
> **`chmod 644`** sur le fichier.

### Page par défaut au lieu de la sienne

- **Symptôme :** nginx affiche "Welcome to nginx".
- **Cause :** **faute de frappe** dans le chemin cible du volume.

> [!WARNING]
> Docker n'affiche **aucune erreur**.

> [!TIP]
> Vérifier avec `docker compose exec <service> ls`.

### Base qui plante sur les permissions

- **Symptôme :** `wrong ownership` ou `Permission denied`.
- **Cause :** **`user:`** forcé dans `compose.yaml`.

> [!TIP]
> Retirer `user:`.
>
> L'image officielle **gère elle-même** son utilisateur.

### Un service ne joint pas un autre

- **Symptôme :** le nom du service ne répond pas.
- **Cause :** les services sont sur des **réseaux différents**.

> [!TIP]
> Les mettre sur le **même réseau**.

### Connexion refusée

- **Symptôme :** l'hôte répond, mais la connexion est refusée.
- **Cause :** **port interne modifié** (exemple : `PGPORT`).

> [!TIP]
> Garder le **port par défaut** de l'image.

### Réseau encore utilisé au `down`

- **Symptôme :** `Resource is still in use`.
- **Cause :** **conteneur orphelin** après le renommage d'un service.

> [!TIP]
> `docker compose down --remove-orphans`

### Variable de base ignorée

- **Symptôme :** `POSTGRES_USER` ne change rien.
- **Cause :** ces variables servent **seulement si le volume est vide**.

> [!TIP]
> `docker compose down -v`

> [!CAUTION]
> Cette commande **efface toutes les données**.
