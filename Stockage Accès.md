# Stockage Accès

Qui a le droit de lire et d'écrire les données. Fiche rattachée à [[Stockage]].

C'est le sujet qui revient le plus souvent, et le lien direct avec la séparation
plan de gestion contre plan de données décrite dans AZ-104.

## En un coup d'oeil

| Terme | Définition en une phrase |
|---|---|
| Clé d'accès | Un secret unique qui donne tous les droits sur tout le compte |
| SAS | Un jeton temporaire qui délègue un sous-ensemble de droits |
| User delegation SAS | Un SAS signé par une identité Entra ID plutôt que par la clé du compte |
| Stored access policy | Une politique côté serveur qui rend un SAS révocable |
| RBAC | L'attribution de rôles à des identités Entra ID |

## Les trois façons d'accéder aux données

**Clés d'accès.** Deux clés par compte, droits complets sur tout, aucune trace de
qui s'en est servi. À faire tourner régulièrement, d'où le fait qu'il y en ait
deux : on bascule les applications sur la seconde pendant qu'on régénère la
première. C'est l'option la moins recommandée. Azure Key Vault sait stocker ces
clés et automatiser leur rotation, par exemple tous les 90 jours.

**SAS.** Un jeton signé, limité dans le temps, en portée et en permissions. Trois
variantes : au niveau du compte, au niveau d'un service (un conteneur, un
partage), et la *user delegation SAS* signée par une identité Entra ID, à
privilégier car elle se révoque en retirant l'identité.

**Entra ID et RBAC.** L'approche propre : identité individuelle, rôle précis,
audit, pas de secret statique. Les rôles utiles portent tous `Data` dans leur nom,
ce qui les distingue des rôles de gestion :

```
Storage Blob Data Reader        lecture des blobs
Storage Blob Data Contributor   lecture et écriture
Storage Blob Data Owner         plus la gestion des ACL
```

Sans l'un de ces rôles, même un `Owner` de la souscription reçoit un `403` en
lisant un blob.

Le compte a un réglage `Default to Microsoft Entra authorization`, et peut même
interdire complètement l'authentification par clé partagée.

## Bonnes pratiques SAS

| Règle | Pourquoi |
|---|---|
| Toujours distribuer un SAS en HTTPS | En HTTP, un intercepteur récupère le jeton et hérite de ses droits |
| Expiration courte | Un jeton volé cesse de nuire tout seul |
| Permissions minimales | Un SAS en lecture seule ne permet pas d'effacer |
| Passer par une stored access policy | C'est le seul moyen de révoquer un SAS déjà distribué sans régénérer la clé |
| Préférer la user delegation SAS | Elle ne repose pas sur la clé du compte |

**Le décalage d'horloge.** Fixer l'heure de début d'un SAS à l'instant présent
provoque des erreurs `not yet valid` intermittentes chez les clients, car les
horloges peuvent diverger d'une quinzaine de minutes. La pratique recommandée :
mettre l'heure de début 15 minutes dans le passé, ou tout simplement l'omettre,
auquel cas le SAS est valide immédiatement.

## Quand ne pas donner de SAS du tout

Si le risque d'une opération dépasse le confort du SAS, on interpose un
**service de niveau intermédiaire** : le client appelle ce service, qui
authentifie, valide, journalise, puis écrit lui-même dans le stockage. Le client
ne reçoit jamais de jeton d'accès direct.

C'est le compromis classique : plus de code à maintenir, mais un point de contrôle
et d'audit unique sur les écritures sensibles.

## Supervision

| Outil | Répond à quel besoin |
|---|---|
| Storage Insights | Rapports historiques de performance, de capacité et de disponibilité |
| Microsoft Defender for Storage | Détection de menaces et analyse antimalware à l'upload |

Les deux sont complémentaires, aucun ne remplace l'autre.
