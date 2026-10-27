Thème : [[Manifests]]

# Manifests Deployment

Un Deployment, c'est ce qui dit à Kubernetes : "garde-moi toujours 3 copies de mon appli qui tournent".
Si un pod meurt, il en relance un. Si tu changes l'image, il remplace les pods un par un.

1. Écrire `deployment.yaml` :
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: <app>
     namespace: <ns>
   spec:
     replicas: 3
     strategy:
       type: RollingUpdate
       rollingUpdate:
         maxSurge: 1
         maxUnavailable: 0
     selector:
       matchLabels:
         app: <app>
     template:
       metadata:
         labels:
           app: <app>
       spec:
         securityContext:
           runAsNonRoot: true
           runAsUser: 10001
           fsGroup: 10001
           seccompProfile:
             type: RuntimeDefault
         topologySpreadConstraints:
           - maxSkew: 1
             topologyKey: kubernetes.io/hostname
             whenUnsatisfiable: ScheduleAnyway
             labelSelector:
               matchLabels:
                 app: <app>
         containers:
           - name: <app>
             image: <image>:<tag précis>
             ports:
               - containerPort: 8080
             resources:
               requests:
                 cpu: 50m
                 memory: 64Mi
               limits:
                 memory: 128Mi
             securityContext:
               allowPrivilegeEscalation: false
               readOnlyRootFilesystem: true
               capabilities:
                 drop: ["ALL"]
             startupProbe:
               httpGet:
                 path: /healthz
                 port: 8080
               periodSeconds: 5
               failureThreshold: 30
             readinessProbe:
               httpGet:
                 path: /healthz
                 port: 8080
               periodSeconds: 10
             livenessProbe:
               httpGet:
                 path: /healthz
                 port: 8080
               periodSeconds: 10
               failureThreshold: 3
   ```

2. Ce que fait chaque bloc :

   **La mise à jour**
   - `replicas: 3` : le nombre de copies de ton appli. Une qui tombe, il en reste deux pour répondre.
   - `maxSurge: 1` : pendant une mise à jour, Kubernetes peut créer 1 pod en plus avant d'enlever un ancien.
   - `maxUnavailable: 0` : il n'enlève jamais un ancien pod avant que le nouveau soit prêt. Résultat : zéro coupure.

   **Le lien entre le Deployment et ses pods**
   - `selector.matchLabels` et `template.metadata.labels` : c'est l'étiquette qui relie le Deployment à ses pods. Les deux doivent être **identiques**, sinon Kubernetes refuse le fichier.

   **La sécurité du pod**
   - `runAsNonRoot` et `runAsUser: 10001` : l'appli tourne avec un utilisateur normal, pas root. Si quelqu'un la pirate, il n'a pas les pleins pouvoirs.
   - `fsGroup: 10001` : les volumes montés appartiennent à ce groupe, donc l'appli peut écrire dedans même sans être root.
   - `seccompProfile: RuntimeDefault` : bloque les appels système dangereux dont une appli normale n'a jamais besoin.

   **La répartition sur les machines**
   - `topologySpreadConstraints` : essaie de mettre les pods sur des nœuds différents. Si un nœud tombe, tu ne perds pas toutes tes copies d'un coup.
   - `whenUnsatisfiable: ScheduleAnyway` : si ce n'est pas possible (pas assez de nœuds), il les place quand même au lieu de bloquer.

   **L'image**
   - `image` : toujours un tag précis comme `1.4.2`, jamais `latest`. Avec `latest`, tu ne sais pas quelle version tourne vraiment.

   **Les ressources**
   - `requests` : ce que Kubernetes **réserve** pour le pod. Il s'en sert pour choisir sur quel nœud le placer.
   - `limits.memory` : le maximum de RAM. Au-delà, le pod est tué (erreur `OOMKilled`).
   - Pas de `limits.cpu` : volontaire. Une limite CPU ralentit l'appli même quand la machine a du CPU libre.
   - `50m` = 5 % d'un cœur. `64Mi` = 64 Mo.

   **La sécurité du conteneur**
   - `allowPrivilegeEscalation: false` : l'appli ne peut pas devenir root en cours de route.
   - `readOnlyRootFilesystem: true` : personne ne peut modifier les fichiers du conteneur. Si l'appli doit écrire dans `/tmp`, monte un volume `emptyDir` dessus.
   - `capabilities.drop: ALL` : retire tous les droits spéciaux Linux (ouvrir le port 80, changer l'heure...). Une appli web n'en a pas besoin.

   **Les sondes (probes)**
   - `startupProbe` : "est-ce que l'appli a fini de démarrer ?". Ici, elle a 30 × 5 s = 2 min 30 pour démarrer. Les deux autres sondes attendent qu'elle réponde.
   - `readinessProbe` : "est-ce qu'elle peut recevoir du trafic ?". Si non, le Service arrête de lui envoyer des requêtes, sans la tuer.
   - `livenessProbe` : "est-ce qu'elle est plantée ?". Après 3 échecs d'affilée, Kubernetes redémarre le conteneur.
   - Pas d'URL `/healthz` dans ton appli : remplace `httpGet` par `tcpSocket: { port: 8080 }`, qui vérifie juste que le port répond.

3. Appliquer et suivre le déploiement :
   ```bash
   kubectl apply -f deployment.yaml
   kubectl rollout status deploy/<app> -n <ns>
   ```
   `rollout status` attend que tous les pods soient prêts, et te dit si ça coince.

4. Régler les ressources avec la vraie consommation :
   ```bash
   kubectl top pods -n <ns>
   ```
   Mets les `requests` un peu au-dessus de la conso normale, et la limite mémoire à environ 2 fois.
