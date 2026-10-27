Thème : [[Manifests]]

# Manifests Quotas

1. Valeurs par défaut et bornes pour chaque conteneur du namespace :
   ```yaml
   apiVersion: v1
   kind: LimitRange
   metadata:
     name: limits
     namespace: <ns>
   spec:
     limits:
       - type: Container
         default:            # limit si le conteneur n'en déclare pas
           cpu: 200m
           memory: 128Mi
         defaultRequest:     # request si le conteneur n'en déclare pas
           cpu: 50m
           memory: 64Mi
         max:
           cpu: "1"
           memory: 512Mi
         min:
           cpu: 10m
           memory: 32Mi
   ```
2. Plafond total du namespace :
   ```yaml
   apiVersion: v1
   kind: ResourceQuota
   metadata:
     name: quota
     namespace: <ns>
   spec:
     hard:
       requests.cpu: "1"
       requests.memory: 1Gi
       limits.cpu: "3"
       limits.memory: 2Gi
       pods: "12"
   ```
3. Vérifier la consommation :
   ```bash
   kubectl describe resourcequota quota -n <ns>
   kubectl describe limitrange limits -n <ns>
   ```

- Le quota **refuse la création** d'un pod en trop, il ne tue rien qui tourne déjà.
- Prévoir de la marge dans `pods` pour les pods en plus pendant un rolling update.
