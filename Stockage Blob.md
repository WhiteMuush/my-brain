# Stockage Blob

Le stockage d'objets. Fiche rattachée à [[Stockage]].

## En un coup d'oeil

| Terme | Définition en une phrase |
|---|---|
| Conteneur | Le dossier de premier niveau qui regroupe des blobs |
| Block blob | Le blob normal, pour fichiers et objets |
| Append blob | Un blob où l'on ne peut qu'ajouter à la fin, fait pour les logs |
| Page blob | Un blob à accès aléatoire, utilisé par les disques de VM |
| Niveau d'accès | Le compromis entre coût de stockage et coût de lecture |
| Réhydratation | L'opération, longue et payante, qui sort un blob de l'Archive |
| Lifecycle policy | Une règle qui déplace ou supprime les blobs selon leur âge |
| Object replication | La copie asynchrone de blobs d'un compte vers un autre |

## Les trois types de blob

| Type | Écriture | Cas d'usage typique |
|---|---|---|
| Block | Découpé en blocs, réécriture complète | Fichiers, images, sauvegardes |
| Append | Ajout en fin de fichier uniquement | Journaux d'application |
| Page | Écriture aléatoire par pages de 512 octets | Disques de VM, fichiers de base de données |

**Le type se fige à la création.** Un block blob ne devient jamais un page blob :
il faut supprimer et recréer avec le bon type.

## Niveaux d'accès

| Niveau | Coût de stockage | Coût d'accès | Durée minimale |
|---|---|---|---|
| Hot | élevé | faible | aucune |
| Cool | moyen | moyen | 30 jours |
| Cold | bas | élevé | 90 jours |
| Archive | très bas | très élevé | 180 jours |

Un blob en `Archive` n'est **pas lisible directement**. Il faut le réhydrater, ce
qui prend des heures selon la priorité choisie, et se facture.

Deux pièges de facturation :

1. **Sortir un blob avant sa durée minimale** coûte une pénalité de suppression
   anticipée, proportionnelle aux jours restants.
2. **Descendre vers un niveau plus froid est facturé comme une écriture complète**
   dans le nouveau niveau, sur un compte GPv2. D'où le pic ponctuel sur la facture
   au moment où l'on archive un gros jeu de données. L'économie arrive après, pas
   pendant.

## Lifecycle management

Une politique est une liste de règles, chacune bâtie sur un `If` et un `Then` :

```
Si le blob n'a pas été modifié depuis 30 jours    alors passer en Cool
Si le blob n'a pas été modifié depuis 90 jours    alors passer en Archive
Si le blob n'a pas été modifié depuis 1095 jours  alors supprimer le blob
```

Un `Then` ne fait qu'**une seule action**. Trois comportements demandent donc
trois règles, il n'y a pas d'enchaînement automatique.

## Accès anonyme

Trois niveaux possibles sur un conteneur :

| Niveau | Effet |
|---|---|
| Private | Rien n'est accessible sans authentification, c'est le défaut |
| Blob | Un blob est lisible par URL directe, mais la liste des blobs reste cachée |
| Container | Un blob est lisible **et** la liste des blobs est énumérable |

**Le compte a le dernier mot.** Le réglage `Allow Blob Anonymous Access` du
compte de stockage écrase celui des conteneurs. S'il est désactivé, un conteneur
réglé sur `Blob` renverra quand même un accès refusé. C'est la cause numéro un
quand l'accès anonyme ne fonctionne pas.

## Object replication

Copie asynchrone de blobs d'un conteneur source vers un conteneur destination,
éventuellement dans une autre région ou une autre souscription.

Deux points à retenir :

- **Le versioning doit être activé sur les deux comptes**, source et destination.
  Sans lui, la configuration échoue.
- **Les snapshots ne sont pas répliqués.** Ce n'est pas un bug, c'est une limite
  documentée de la fonctionnalité.

## Migrer de gros volumes

| Outil | Quand l'utiliser |
|---|---|
| Storage Explorer | Interface graphique, petits volumes ponctuels |
| AzCopy | Ligne de commande, scriptable, tant que la bande passante suit |
| Azure Data Box | Dizaines de To et bande passante insuffisante, Microsoft envoie un boîtier physique |

Le réflexe d'examen : **beaucoup de To plus une liaison internet contrainte, donc
Data Box**. La variante Data Box Disk couvre les volumes les plus modestes.
