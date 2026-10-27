Thème : [[Helm]]

# Helm cert-manager

1. Voir la dernière version :
   ```bash
   helm show chart oci://quay.io/jetstack/charts/cert-manager | grep '^version'
   ```
2. Écrire `helm/cert-manager/values.yaml` :
   ```yaml
   crds:
     enabled: true
     # Garder les CRDs et les certificats si la release est désinstallée
     keep: true

   resources:
     requests:
       cpu: 10m
       memory: 64Mi
     limits:
       memory: 256Mi
   ```
3. Installer :
   ```bash
   helm upgrade --install cert-manager oci://quay.io/jetstack/charts/cert-manager \
     --version <version> \
     --namespace cert-manager --create-namespace \
     --values helm/cert-manager/values.yaml --wait
   ```
4. Créer l'émetteur Let's Encrypt :
   ```yaml
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: letsencrypt
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: <email>
       privateKeySecretRef:
         name: letsencrypt-account
       solvers:
         - http01:
             ingress:
               ingressClassName: traefik
   ```
   Pour un test sans domaine public, un émetteur auto-signé :
   ```yaml
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: selfsigned
   spec:
     selfSigned: {}
   ```
5. Demander un certificat : ajouter `cert-manager.io/cluster-issuer: letsencrypt` sur l'Ingress.
6. Vérifier :
   ```bash
   kubectl get clusterissuer
   kubectl get certificate -A
   kubectl describe certificate <nom> -n <ns>
   ```
