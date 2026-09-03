# Stockage Réseau

D'où le compte accepte d'être joint. Fiche rattachée à [[Stockage]].

## En un coup d'oeil

| Terme | Définition en une phrase |
|---|---|
| Endpoint public | L'URL par défaut du compte, joignable depuis internet |
| Pare-feu du compte | Une liste blanche d'IP publiques et de sous-réseaux autorisés |
| Service endpoint | Une extension de l'identité du sous-réseau jusqu'au service, en gardant l'endpoint public |
| Private endpoint | Une adresse IP privée dans le VNet, qui remplace l'accès public |
| Domaine personnalisé | Un CNAME du type `www.contoso.com` vers l'endpoint blob |

## Pare-feu et service endpoints

Dans le panneau `Firewalls and virtual networks`, on passe le compte de
`Enabled from all networks` à `Enabled from selected virtual networks and IP
addresses`, puis on ajoute :

- un ou plusieurs **sous-réseaux** du VNet, ce qui active le service endpoint
  `Microsoft.Storage` sur eux ;
- des **plages d'IP publiques** de confiance.

Le trafic continue de passer par l'endpoint public du compte, mais tout ce qui
n'est pas listé est refusé. C'est la réponse quand un scénario demande de
restreindre par sous-réseau et par IP **sans changer l'architecture d'adressage**.

## Private endpoint

Une carte réseau dans le VNet, avec une IP privée, plus une entrée DNS privée qui
fait pointer `<compte>.blob.core.windows.net` vers cette IP.

Le trafic ne sort plus sur internet. C'est plus fort qu'un service endpoint, mais
cela demande de gérer du DNS privé et de l'adressage, donc un changement
d'architecture plus lourd.

## Domaine personnalisé et HTTPS

On peut faire pointer `www.contoso.com` vers l'endpoint blob avec un simple
CNAME. En HTTP, cela suffit.

En HTTPS, non. Le certificat servi par le compte est émis pour
`*.core.windows.net`, pas pour le domaine du client : le navigateur voit une
incohérence de nom et rejette la connexion. Un CNAME ne provisionne aucun
certificat.

La solution consiste à mettre un service capable de porter le certificat devant
le stockage, typiquement Azure Front Door ou Azure CDN.
