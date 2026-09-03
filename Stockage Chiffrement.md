# Stockage Chiffrement

Le chiffrement des données au repos et en transit. Fiche rattachée à [[Stockage]].

## En un coup d'oeil

| Terme | Définition en une phrase |
|---|---|
| SSE | Storage Service Encryption, le chiffrement au repos, toujours actif et non désactivable |
| PMK | Platform-managed key, la clé gérée par Microsoft, celle utilisée par défaut |
| CMK | Customer-managed key, une clé que le client détient dans Azure Key Vault |
| Infrastructure encryption | Une seconde couche de chiffrement, avec un autre algorithme et une autre clé |
| Secure transfer required | Le réglage qui refuse toute connexion HTTP non chiffrée |

## Au repos

**SSE est toujours activé**, en AES 256, sur tous les comptes, et ne peut pas
être désactivé. La seule question est de savoir qui détient la clé.

| Modèle | Qui détient la clé | Ce que ça apporte |
|---|---|---|
| PMK | Microsoft | Rien à gérer, c'est le défaut |
| CMK | Le client, dans Azure Key Vault | Pouvoir désactiver, auditer et faire tourner la clé |

Contrainte à connaître pour les CMK : **le coffre et le compte de stockage
doivent être dans la même région**, mais peuvent appartenir à des souscriptions
différentes.

**Infrastructure encryption** ajoute un deuxième tour de chiffrement, au niveau
de l'infrastructure, avec un algorithme et une clé distincts du premier. C'est la
réponse dès qu'un scénario demande deux couches indépendantes. Elle se décide à
la création du compte.

## En transit

Deux réglages à cocher ensemble :

1. **Secure transfer required**, qui rejette tout ce qui n'est pas HTTPS.
2. **Version minimale de TLS**, à porter à 1.2 pour écarter TLS 1.0 et 1.1.

Le chiffrement au repos est déjà couvert par SSE, il n'y a rien à activer de ce
côté.
