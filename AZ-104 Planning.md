# AZ-104 Planning

Planning de révision de [[AZ-104]]. Objectif : **passer l'examen entre le 3 et
le 5 novembre 2026**, avant le début du stage le 9 novembre.

Budget : 6 à 10 heures par semaine, sur 5 semaines.

## À faire cette semaine

- [ ] Réserver la date d'examen sur Microsoft Learn (une date fixée fait avancer)
- [ ] Demander un aménagement pour dyslexie (temps supplémentaire) via la page
      [Request accommodations](https://learn.microsoft.com/credentials/certifications/request-accommodations).
      La validation prend du temps, donc à lancer tout de suite
- [ ] Faire l'[exam sandbox](https://aka.ms/examdemo) pour connaître l'interface
- [ ] Faire une première fois le [practice assessment gratuit](https://learn.microsoft.com/credentials/certifications/exams/az-104/practice/assessment?assessment-type=practice&assessmentId=21)
      pour mesurer le point de départ

## Les 5 semaines

| Semaine | Dates | Domaine | Note à écrire |
|---|---|---|---|
| 1 | 29 sept au 5 oct | Identités et gouvernance | Identités |
| 2 | 6 au 12 oct | Réseau virtuel | Réseau |
| 3 | 13 au 19 oct | Calcul : ARM, Bicep, VM, VMSS | Calcul |
| 4 | 20 au 26 oct | Calcul : conteneurs, App Service, puis Supervision et Sauvegarde | Supervision |
| 5 | 27 oct au 2 nov | Examens blancs, points faibles, relecture Stockage | |

Le réseau passe avant le calcul : une VM vit dans un VNet, donc NSG, peering et
load balancer se comprennent mieux avant de déployer des VM.

## Une semaine type

1. **Théorie, 2 h** : les modules Microsoft Learn du domaine.
2. **Labs, 3 à 4 h** : les [labs officiels AZ-104](https://microsoftlearning.github.io/AZ-104-MicrosoftAzureAdministrator/)
   du domaine. Supprimer le resource group à la fin de chaque lab.
3. **Fiche Obsidian, 1 h** : une note par domaine, sur le modèle de [[Stockage]].
4. **Quiz, 1 h** : practice assessment filtré sur le domaine, noter chaque erreur.

## Contenu par domaine

**Identités et gouvernance (20 à 25 %)**

- Entra ID : utilisateurs, groupes, licences, invités externes, SSPR
- RBAC : rôles intégrés, portée, lecture des attributions
- Gouvernance : Azure Policy, verrous, tags, management groups, budgets, Advisor

**Réseau virtuel (15 à 20 %)**

- VNet, sous-réseaux, peering, IP publiques, routes UDR
- NSG, ASG, règles effectives, Bastion
- Service endpoints contre private endpoints
- Azure DNS, load balancer interne et public

**Calcul (20 à 25 %)**

- Lire et modifier un template ARM ou un fichier [[Bicep]], exporter, convertir
- VM : tailles, disques, chiffrement at host, déplacement, zones et availability sets, VMSS
- Conteneurs : ACR, Container Instances, Container Apps, mise à l'échelle
- App Service : plan, scaling, TLS, domaine personnalisé, sauvegarde, réseau, slots

**Supervision et sauvegarde (10 à 15 %)**

- Azure Monitor : métriques, logs, requêtes KQL, alertes, action groups, Insights
- Network Watcher et Connection monitor
- Recovery Services vault contre Backup vault, politiques, restauration
- Site Recovery et bascule vers une région secondaire

## Semaine 5 : règle de décision

- Refaire le practice assessment plusieurs fois
- Viser **80 % ou plus** de façon régulière avant de se présenter (repère
  personnel, le vrai seuil est 700 sur 1000)
- Si un domaine reste sous 70 %, y consacrer les deux derniers jours

## Suivi

| Date | Score practice assessment | Domaine le plus faible |
|---|---|---|
| | | |

Source du programme : [study guide AZ-104](https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-104),
version du 17 avril 2026.
