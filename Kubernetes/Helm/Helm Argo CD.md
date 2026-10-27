Thème : [[Helm]]

# Helm Argo CD

1. Ajouter le dépôt :
   ```bash
   helm repo add argo https://argoproj.github.io/argo-helm
   helm repo update
   helm search repo argo/argo-cd --versions | head -3
   ```
2. Écrire `helm/argocd/values.yaml` (version légère, une réplique de chaque) :
   ```yaml
   configs:
     params:
       # TLS terminé par l'Ingress, ou accès par port-forward
       server.insecure: true

   dex:
     enabled: false

   redis-ha:
     enabled: false

   controller:
     replicas: 1
   server:
     replicas: 1
   repoServer:
     replicas: 1
   applicationSet:
     replicas: 1
   ```
3. Installer :
   ```bash
   helm upgrade --install argocd argo/argo-cd \
     --version <version> \
     --namespace argocd --create-namespace \
     --values helm/argocd/values.yaml --wait
   ```
4. Récupérer le mot de passe initial (utilisateur `admin`) :
   ```bash
   kubectl get secret -n argocd argocd-initial-admin-secret \
     -o jsonpath='{.data.password}' | base64 -d; echo
   ```
5. Ouvrir l'interface :
   ```bash
   kubectl port-forward -n argocd svc/argocd-server 8080:80
   ```
6. Déclarer l'application racine (App of Apps), qui déploie tout le dossier `apps/` :
   ```yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: root
     namespace: argocd
   spec:
     project: default
     source:
       repoURL: https://<forge>/<groupe>/<projet>.git
       targetRevision: main
       path: manifests/argocd/apps
     destination:
       server: https://kubernetes.default.svc
       namespace: argocd
     syncPolicy:
       automated:
         prune: true
         selfHeal: true
   ```
   ```bash
   kubectl apply -f manifests/argocd/root-app.yaml
   kubectl get applications -n argocd
   ```
