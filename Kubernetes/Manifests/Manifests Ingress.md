Thème : [[Manifests]]

# Manifests Ingress

Prérequis : Traefik et cert-manager installés avec Helm.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: <app>
  namespace: <ns>
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - <domaine>
      secretName: <app>-tls
  rules:
    - host: <domaine>
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: <app>
                port:
                  number: 80
```

Vérifier :
```bash
kubectl get ingress -n <ns>
kubectl get certificate -n <ns>          # READY doit passer à True
curl -I https://<domaine>
```
