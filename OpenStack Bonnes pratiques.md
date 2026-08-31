# OpenStack Bonnes pratiques

Ce qui est attendu en entreprise. Voir [[OpenStack]] pour le reste.

**Jamais de création à la main.** Horizon sert à regarder. Tout est décrit en
code versionné. Le test : si je détruis tout, est-ce que je reconstruis en une
commande ?

**Du bétail, pas des animaux de compagnie.** Une instance qui dysfonctionne se
détruit et se recrée. Pas de SSH pour bricoler.

**Une image préconstruite** avec Packer : agent de supervision, certificats,
durcissement déjà dedans. Démarrage en secondes, instances identiques.

**Un projet par équipe et par environnement**, avec ses quotas. Rôle `member`
pour les utilisateurs, `admin` réservé aux exploitants.

**Jamais son mot de passe personnel dans un script.** Il ouvre tous les projets
et survit au départ de son propriétaire.

```bash
openstack application credential create ci-terraform \
  --role member --expiration 2026-12-31T00:00:00
```

**Security groups minimalistes.** Jamais `0.0.0.0/0` sur le port 22. Autoriser
par groupe source, pas par plage d'adresses : `--remote-group web` sur le
groupe `bdd` reste vrai quand les adresses changent. Accès admin par bastion.

**Le disque de la flavor est éphémère**, il meurt avec l'instance. Les données
vont sur un volume Cinder. Un snapshot n'est pas une sauvegarde, il vit dans le
même stockage que l'original.

**Répartir les copies d'un même service.** Trois sur le même serveur physique
tombent ensemble.

```bash
openstack server group create --policy anti-affinity web-cluster
```

**Nommer et étiqueter** : `env-role-numero`, plus propriétaire et date
d'expiration en métadonnées.
