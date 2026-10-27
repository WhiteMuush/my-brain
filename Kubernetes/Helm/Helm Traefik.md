Thème : [[Helm]]

# Helm Traefik

Contrôleur d'Ingress. Remplace ingress-nginx, arrêté par Kubernetes en mars 2026.

1. Voir la dernière version :
   ```bash
   helm show chart oci://ghcr.io/traefik/helm/traefik | grep '^version'
   ```
2. Écrire `helm/traefik/values.yaml` :
   ```yaml
   deployment:
     replicas: 1

   resources:
     requests:
       cpu: 50m
       memory: 64Mi
     limits:
       memory: 256Mi

   ingressClass:
     enabled: true
     isDefaultClass: true

   ports:
     web:
       http:
         redirections:
           entryPoint:
             to: websecure
             scheme: https
             permanent: true

   ingressRoute:
     dashboard:
       # Seulement sur l'entrée interne, accessible par port-forward
       enabled: true
   ```
3. Installer :
   ```bash
   helm upgrade --install traefik oci://ghcr.io/traefik/helm/traefik \
     --version <version> \
     --namespace traefik --create-namespace \
     --values helm/traefik/values.yaml --wait
   ```
4. Vérifier :
   ```bash
   kubectl get pods,svc -n traefik
   kubectl get ingressclass
   ```
5. Ouvrir le dashboard :
   ```bash
   kubectl port-forward -n traefik deploy/traefik 9000:8080
   ```
   Puis http://localhost:9000/dashboard/
