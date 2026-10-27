Thème : [[Manifests]]

# Manifests Service

Interne au cluster (cas par défaut) :
```yaml
apiVersion: v1
kind: Service
metadata:
  name: <app>
  namespace: <ns>
spec:
  type: ClusterIP
  selector:
    app: <app>
  ports:
    - port: 80
      targetPort: 8080
```

Accès depuis la machine, sur Kind :
```yaml
spec:
  type: NodePort
  selector:
    app: <app>
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080
```

Sur un vrai cloud, `type: LoadBalancer` crée une IP publique. Pour du HTTP, préférer un ClusterIP derrière un Ingress.

Vérifier que le Service trouve bien les pods :
```bash
kubectl get endpointslices -n <ns> -l kubernetes.io/service-name=<app>
```
Liste vide : le `selector` ne correspond pas aux labels des pods.
