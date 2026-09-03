# Azure Files

Le partage de fichiers managé. Fiche rattachée à [[Stockage]].

Un partage montable comme un lecteur réseau, en SMB ou NFS, accessible en même
temps par plusieurs machines. C'est la réponse type pour un **lift and shift**
d'application qui attend une lettre de lecteur et des API de fichiers Windows,
là où Blob Storage demanderait de réécrire l'application.

## En un coup d'oeil

| Terme | Définition en une phrase |
|---|---|
| Partage SMB | Un partage réseau Windows classique, monté sur une lettre de lecteur |
| FileStorage | Le type de compte obligatoire pour un partage Premium |
| Snapshot | Une copie en lecture seule du partage à un instant donné |
| Soft delete | Une corbeille qui garde un partage supprimé pendant une durée configurée |
| Azure File Sync | La synchronisation d'un serveur Windows local avec un partage Azure |
| Cloud tiering | Le mécanisme qui ne garde localement que les fichiers récemment utilisés |
| Sync group | Le groupe qui relie un partage Azure à un ou plusieurs serveurs |

## Niveaux de service

| Niveau | Type de compte | Facturation |
|---|---|---|
| Transaction optimized, Hot, Cool | GPv2 | À l'usage |
| Premium | FileStorage | Capacité provisionnée, payée d'avance |

Le réflexe d'examen : **latence faible et constante plus capacité provisionnée,
donc Premium sur un compte FileStorage**. Les niveaux standard ne se provisionnent
pas d'avance.

## Le port 445

SMB circule sur le **port 445 sortant**. Beaucoup d'entreprises et de
fournisseurs d'accès le bloquent, à cause de l'historique des vers qui l'ont
exploité.

C'est de très loin la première cause quand un montage échoue depuis un poste sur
site alors que la configuration Azure est correcte. Les contournements : ouvrir
le port, ou passer par un VPN ou ExpressRoute.

## Protéger les données

**Snapshots.** Copie en lecture seule du partage entier à un instant donné,
incrémentale, prise à la demande ou programmée. La pratique utile : en prendre un
juste avant chaque déploiement applicatif, pour disposer d'un point de retour
propre.

**Soft delete.** Une corbeille au niveau du partage. Un partage supprimé passe
dans un état récupérable pendant la durée de rétention configurée, de 1 à 365
jours. Passé ce délai, la suppression devient définitive : ce n'est pas une
sauvegarde, seulement un filet contre l'erreur de manipulation.

## Authentification

| Mode | Ce que ça donne |
|---|---|
| Clé du compte de stockage | Un secret unique, partagé, qui ouvre tout le compte |
| Identité sur SMB | Un accès par utilisateur, avec les permissions NTFS habituelles |

L'identité sur SMB s'appuie sur l'un des trois : **AD DS on-premise**, **Microsoft
Entra Domain Services**, ou **Microsoft Entra Kerberos**. Le bénéfice principal
est l'attribution nominative et l'audit, là où une clé fuitée donne un accès
complet et anonyme.

## Azure File Sync

Garde un serveur de fichiers Windows sur site synchronisé avec un partage Azure.

La topologie est toujours la même : un **sync group** contient un **cloud
endpoint**, qui est le partage Azure, et un ou plusieurs **server endpoints**, un
par serveur de succursale. Chaque site retrouve ainsi la même arborescence en
accès local rapide.

Le **cloud tiering** ne conserve localement que les fichiers récemment utilisés.
Les autres ne laissent qu'un pointeur, et se rapatrient à la demande.

Contraintes sur un server endpoint :

- volume formaté en **NTFS** ;
- **pas le volume système** (`C:\`), et le cloud tiering n'y est de toute façon
  pas supporté.
