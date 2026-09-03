# Stockage QCM Corrigé

Corrigé du QCM `az104-QCM-Part1.docx`, 35 questions sur le domaine [[Stockage]]
de [[AZ-104]]. Une ligne par question : la réponse, puis ce qu'il faut retenir.

## Module 1, comptes de stockage

**Q1 : B.** Les disques de VM sont des page blobs. Un SQL Server exigeant en I/O
demande donc du Premium page blobs. Voir [[Stockage Compte]].

**Q2 : A.** Standard et Premium ne se convertissent pas l'un en l'autre. On crée
un nouveau compte et on recopie. Seul GPv1 vers GPv2 est une vraie mise à niveau
en place.

**Q3 : B.** Le préfixe `RA-` est ce qui autorise la lecture du secondaire sans
basculement. `RA-GZRS` ajoute la protection zonale. Voir [[Stockage Redondance]].

**Q4 : C.** `Secure transfer required` plus version minimale de TLS à 1.2. Le
chiffrement au repos est déjà couvert par SSE, qui ne se désactive pas. Voir
[[Stockage Chiffrement]].

**Q5 : C.** Hierarchical namespace plus NFSv3 : le conteneur se monte alors comme
un partage NFS, avec les appels système Linux habituels.

**Q6 : B.** Entra ID et RBAC à la place des clés partagées, avec le réglage
`Default to Microsoft Entra authorization` sur le compte. Voir [[Stockage Accès]].

**Q7 : D.** Un CNAME ne provisionne aucun certificat. Celui du compte est émis
pour `*.core.windows.net`, pas pour le domaine du client. Voir
[[Stockage Réseau]].

**Q8 : B.** Service endpoints via `Firewalls and virtual networks` : on liste le
sous-réseau et les IP publiques de confiance, sans toucher à l'adressage. Un
private endpoint serait un changement d'architecture plus lourd.

## Module 2, Blob Storage

**Q9 : A.** Niveau `Blob` : le blob est lisible par URL, la liste des blobs reste
cachée. Le niveau `Container` rendrait la liste énumérable. Voir [[Stockage Blob]].

**Q10 : B.** Le réglage `Allow Blob Anonymous Access` du compte écrase celui du
conteneur. C'est la cause numéro un de ce symptôme.

**Q11 : D.** Archive : 180 jours de séjour minimum sous peine de pénalité, et une
réhydratation qui prend des heures.

**Q12 : A.** Trois règles distinctes. Un `Then` ne porte qu'une action, il n'y a
pas d'enchaînement automatique.

**Q13 : D.** Comportement attendu et documenté : l'object replication ne réplique
pas les snapshots.

**Q14 : D.** Le versioning doit être activé sur les deux comptes, sinon la
configuration échoue.

**Q15 : D.** Append blob, fait exactement pour l'ajout continu en fin de fichier.

**Q16 : C.** Le type de blob est figé à la création. Il faut supprimer et
recréer.

**Q17 : C.** Azure Data Box Disk : gros volume et bande passante contrainte, le
transport physique bat le réseau.

**Q18 : B.** Descendre vers un niveau plus froid est facturé comme une écriture
complète dans ce niveau, sur un compte GPv2. Le pic est ponctuel, l'économie
arrive ensuite.

## Module 3, sécurité

**Q19 : B.** SAS de service, portée sur le conteneur, lecture seule, expiration à
48 heures.

**Q20 : D.** Toujours créer et distribuer un SAS en HTTPS, sinon le jeton est
interceptable.

**Q21 : C.** Entra ID et RBAC : identité individuelle, rôles fins, audit, pas de
secret statique.

**Q22 : A.** CMK dans Azure Key Vault. Même région obligatoire, souscriptions
différentes autorisées.

**Q23 : D.** Storage Insights pour l'historique de performance et de capacité,
Microsoft Defender for Storage pour l'analyse antimalware et la détection de
menaces.

**Q24 : D.** Confier les clés à Azure Key Vault et activer une rotation
automatique, par exemple tous les 90 jours.

**Q25 : B.** Décalage d'horloge d'environ 15 minutes. On met l'heure de début 15
minutes dans le passé, ou on l'omet.

**Q26 : A.** Quand le risque de l'opération dépasse le confort du SAS, un service
intermédiaire qui valide, authentifie et journalise avant d'écrire est préférable.

**Q27 : C.** Infrastructure encryption : deux couches, deux algorithmes, deux
clés.

## Module 4, Azure Files

**Q28 : C.** Azure Files : partage SMB ou NFS, monté sur plusieurs VM, sémantique
de système de fichiers identique à l'existant. Voir [[Azure Files]].

**Q29 : C.** Premium sur un compte FileStorage, facturé en capacité provisionnée.

**Q30 : B.** Le port 445 sortant est bloqué par le pare-feu ou le fournisseur
d'accès. Première cause de ce symptôme.

**Q31 : A.** Snapshots de partage, pris systématiquement avant chaque
déploiement, pour disposer d'un point de retour propre.

**Q32 : A.** Soft delete avec une rétention de 1 à 365 jours. La récupération au
dixième jour tient dans la fenêtre de 14 jours, mais tout devient définitif après.

**Q33 : C.** Un sync group avec un cloud endpoint et un server endpoint par
succursale, plus le cloud tiering pour ne garder localement que le récent.

**Q34 : A.** Un server endpoint doit être sur un volume NTFS, et jamais le volume
système. Le cloud tiering n'y est pas supporté non plus.

**Q35 : A.** Authentification basée sur l'identité en SMB, via AD DS, Entra
Domain Services ou Entra Kerberos.

## Répartition des réponses

| Lettre | Nombre |
|---|---|
| A | 9 |
| B | 9 |
| C | 9 |
| D | 8 |

Répartition quasi uniforme, donc aucun biais de lettre à exploiter en cas de
doute.
