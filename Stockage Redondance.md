# Stockage Redondance

Combien de copies, et où. Fiche rattachée à [[Stockage]].

C'est le choix qu'on ne peut pas complètement défaire après coup, donc celui à
poser en premier.

## En un coup d'oeil

| Sigle | Copies | Portée | Résiste à |
|---|---|---|---|
| LRS | 3 | Un seul datacenter | Une panne disque ou serveur |
| ZRS | 3 | Trois zones d'une région | La perte d'une zone |
| GRS | 6 | Deux régions appairées | La perte d'une région |
| GZRS | 6 | Zones plus seconde région | Les deux à la fois |

## Le préfixe RA-

`RA-GRS` et `RA-GZRS` ajoutent la **lecture sur la copie secondaire**, à tout
moment, sans avoir besoin d'un basculement.

Sans le `RA-`, la copie distante existe bel et bien, mais reste inaccessible tant
que Microsoft n'a pas basculé la région.

Le réflexe d'examen : dès qu'un scénario parle de **lire depuis la région
secondaire pour du reporting**, ou de lecture sans failover, la réponse est
`RA-GRS` ou `RA-GZRS`.

## Ce qui se change et ce qui ne se change pas

Le passage de LRS à ZRS n'est pas un simple bouton. Selon les cas il demande une
migration prise en charge par Microsoft, ou la recréation du compte suivie d'une
copie.

Ajouter ou retirer le volet géographique (LRS vers GRS par exemple) est en
revanche un changement de configuration classique.
