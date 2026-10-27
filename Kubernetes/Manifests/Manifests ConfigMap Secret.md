Thème : [[Manifests]]

# Manifests ConfigMap Secret

1. Créer la ConfigMap (réglages non sensibles) :
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: <app>-config
     namespace: <ns>
   data:
     LOG_LEVEL: info
     DB_HOST: postgres
   ```
2. Créer le Secret en ligne de commande, jamais en YAML commité :
   ```bash
   kubectl create secret generic <app>-secret -n <ns> \
     --from-literal=DB_PASSWORD='<secret>'
   kubectl create secret generic <app>-secret -n <ns> --from-env-file=.env
   ```
3. Les injecter en variables d'environnement :
   ```yaml
   containers:
     - name: <app>
       envFrom:
         - configMapRef:
             name: <app>-config
         - secretRef:
             name: <app>-secret
   ```
4. Ou les monter en fichiers :
   ```yaml
   containers:
     - name: <app>
       volumeMounts:
         - name: config
           mountPath: /etc/<app>
           readOnly: true
   volumes:
     - name: config
       configMap:
         name: <app>-config
   ```
5. Relire un secret :
   ```bash
   kubectl get secret <app>-secret -n <ns> -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
   ```
6. Après un changement, redémarrer les pods (les variables ne se rechargent pas seules) :
   ```bash
   kubectl rollout restart deploy/<app> -n <ns>
   ```

Un Secret est seulement encodé en base64, pas chiffré.
