# Stockage

Domaine stockage de [[AZ-104]]. Tout part du **storage account**, qui est
l'unité de facturation, de configuration réseau et de nommage.

## Le compte de stockage

Le nom est global à tout Azure, en minuscules, 3 à 24 caractères, sans tiret.
C'est lui qui fabrique l'URL publique :

```
https://<compte>.blob.core.windows.net/<container>/<blob>
```

Quatre services partagent le même compte, chacun avec son propre point de
terminaison :

| Service | Sert à quoi | Suffixe |
|---|---|---|
| Blob | Objets non structurés, sauvegardes, images | `.blob` |
| File | Partages SMB ou NFS montables | `.file` |
| Queue | Messages courts entre composants | `.queue` |
| Table | Clé-valeur NoSQL simple | `.table` |

## Redondance

C'est le choix qu'on ne peut pas complètement défaire après coup, donc celui à
poser en premier.

| Sigle | Copies | Portée | Résiste à |
|---|---|---|---|
| LRS | 3 | Un seul datacenter | Une panne disque ou serveur |
| ZRS | 3 | Trois zones d'une région | La perte d'une zone |
| GRS | 6 | Deux régions appairées | La perte d'une région |
| GZRS | 6 | Zones + seconde région | Les deux à la fois |

Les variantes `RA-` (`RA-GRS`, `RA-GZRS`) ajoutent la lecture sur la copie
secondaire. Sans elles, la copie distante existe mais reste inaccessible tant que
Microsoft n'a pas basculé la région.

Le passage de LRS à ZRS n'est pas un simple bouton : selon les cas il demande une
migration ou une recréation du compte.

## Niveaux d'accès des blobs

| Niveau | Coût de stockage | Coût d'accès | Durée minimale |
|---|---|---|---|
| Hot | élevé | faible | aucune |
| Cool | moyen | moyen | 30 jours |
| Cold | bas | élevé | 90 jours |
| Archive | très bas | très élevé, réhydratation | 180 jours |

Un blob en `Archive` n'est pas lisible directement. Il faut le réhydrater, ce qui
prend des heures et se facture. Sortir un blob avant la durée minimale coûte la
pénalité correspondant aux jours restants.

Les **lifecycle management policies** automatisent ces transitions selon l'âge du
blob, ce qui évite de les faire à la main.

## Les trois façons d'accéder aux données

C'est le point qui revient le plus souvent, et le lien direct avec la séparation
plan de gestion / plan de données décrite dans [[AZ-104]].

**Clés d'accès.** Deux clés par compte, droits complets sur tout. À faire tourner
régulièrement, d'où le fait qu'il y en ait deux : on bascule sur la seconde
pendant qu'on régénère la première. C'est l'option la moins recommandée.

**SAS (Shared Access Signature).** Un jeton signé, limité dans le temps, en
portée et en permissions. La *user delegation SAS*, signée par une identité Entra
ID plutôt que par la clé du compte, est la variante à privilégier : elle se
révoque en retirant l'identité.

**Entra ID et RBAC.** L'approche propre. Les rôles utiles portent tous `Data`
dans leur nom, ce qui les distingue des rôles de gestion :

```
Storage Blob Data Reader        lecture des blobs
Storage Blob Data Contributor   lecture et écriture
Storage Blob Data Owner         plus la gestion des ACL
```

Sans l'un de ces rôles, même un `Owner` de la souscription reçoit un `403` en
lisant un blob.

## Azure Files

Un partage montable comme un lecteur réseau, en SMB ou NFS.

L'authentification a deux modes : la clé du compte de stockage, ou l'intégration
domaine (Entra Domain Services ou AD DS on-premise) qui permet de conserver les
permissions NTFS habituelles.

**Azure File Sync** garde un serveur de fichiers Windows sur site synchronisé
avec le partage, avec cloud tiering : les fichiers froids ne gardent localement
qu'un pointeur.

## Commandes utiles

```bash
az storage account create -n <compte> -g <rg> -l francecentral \
  --sku Standard_LRS --kind StorageV2

az storage account list -g <rg> -o table
az storage account keys list -n <compte> -g <rg> -o table

# opérations plan de données avec son identité Entra ID
az storage container list --account-name <compte> --auth-mode login -o table
az storage blob upload --account-name <compte> --auth-mode login \
  -c <container> -n <nom> -f ./fichier
```

Le `--auth-mode login` est ce qui force le passage par Entra ID au lieu de la clé
du compte. Sans lui, la CLI cherche une clé et échoue si elle n'y a pas accès.
