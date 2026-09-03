# Stockage Compte

Le conteneur administratif de tout le reste. Fiche rattachée à [[Stockage]].

## En un coup d'oeil

| Terme | Définition en une phrase |
|---|---|
| Storage account | L'unité de facturation, de réseau et de nommage qui héberge les quatre services de stockage |
| GPv2 | Le compte standard polyvalent, celui à choisir par défaut |
| Premium | Un compte sur SSD, spécialisé par usage, à faible latence |
| FileStorage | Le type de compte obligatoire pour un partage de fichiers Premium |
| HNS | Hierarchical namespace, l'option qui donne de vrais dossiers au Blob Storage |

## Le nom

Global à tout Azure, en minuscules, 3 à 24 caractères, chiffres et lettres
seulement. C'est lui qui fabrique l'URL publique :

```
https://<compte>.blob.core.windows.net/<container>/<blob>
```

## Les quatre services

Ils partagent le même compte, chacun avec son propre point de terminaison.

| Service | Sert à quoi | Suffixe |
|---|---|---|
| Blob | Objets non structurés, sauvegardes, images | `.blob` |
| File | Partages SMB ou NFS montables | `.file` |
| Queue | Messages courts entre composants | `.queue` |
| Table | Clé-valeur NoSQL simple | `.table` |

## Standard ou Premium

**Standard GPv2** tourne sur disque magnétique, accepte les quatre services et
couvre la grande majorité des besoins. C'est le choix par défaut.

**Premium** tourne sur SSD, avec une latence faible et constante, mais se décline
en trois variantes qui ne font chacune qu'une chose :

| Variante Premium | Pour quoi | Type de compte |
|---|---|---|
| Block blobs | Beaucoup de petites transactions rapides | BlockBlobStorage |
| Page blobs | Disques de VM, base de données, I/O aléatoires | Compte Premium page blobs |
| File shares | Partage de fichiers exigeant | FileStorage |

Le réflexe d'examen : **disque de VM ou base de données SQL sur VM, donc page
blobs Premium**. Les disques Azure sont techniquement des page blobs.

## La conversion qui n'existe pas

On ne convertit pas un compte Standard en compte Premium. Il n'y a ni bouton, ni
ticket support, ni commande CLI pour ça. On crée un nouveau compte Premium et on
recopie les données, avec AzCopy par exemple.

Ce qui est possible en revanche : passer un GPv1 en GPv2, qui est bien une mise à
niveau en place.

## Hierarchical namespace et NFSv3

Par défaut, Blob Storage est plat : les slashs dans les noms de blobs ne sont
qu'une convention d'affichage, pas de vrais dossiers.

Activer le **hierarchical namespace** transforme le compte en Azure Data Lake
Storage Gen2 : vrais répertoires, renommage atomique, ACL POSIX. Combiné au
**support NFSv3**, il permet à une VM Linux de monter un conteneur comme un
partage NFS et de travailler avec les appels système habituels, sans passer par
l'API REST Blob.

Les deux options se décident à la création du compte, pas après.
