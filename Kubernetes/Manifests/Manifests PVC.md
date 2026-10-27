Thème : [[Manifests]]

# Manifests PVC

1. Voir les classes de stockage disponibles :
   ```bash
   kubectl get storageclass
   ```
2. Créer le PVC :
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: <app>-data
     namespace: <ns>
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: <classe>
     resources:
       requests:
         storage: 10Gi
   ```
3. Le monter dans le Deployment :
   ```yaml
   spec:
     securityContext:
       fsGroup: 10001
     containers:
       - name: <app>
         volumeMounts:
           - name: data
             mountPath: /data
     volumes:
       - name: data
         persistentVolumeClaim:
           claimName: <app>-data
   ```
4. Vérifier :
   ```bash
   kubectl get pvc -n <ns>                  # Bound attendu
   kubectl describe pvc <app>-data -n <ns>  # si Pending, la cause est dans les Events
   kubectl exec -n <ns> deploy/<app> -- df -h /data
   ```

- `ReadWriteOnce` : un seul **nœud** à la fois. `ReadWriteMany` demande un stockage réseau (NFS).
- `reclaimPolicy: Delete` par défaut : supprimer le PVC supprime les données.
- `fsGroup` donne le volume à l'utilisateur non-root du conteneur.
