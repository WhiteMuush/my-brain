1. Créer un cluster kind : 
kind create cluster --name velero-lab
2. Vérifier :
kubectl cluster-info
kubectl get nodes

3. Créer un namespace : 
kubectl create ns minio
4. vérifier :
kubectl get ns minio

5. Ignorer les fichiers sensibles, AVANT tout git add, dans .gitignore :
.env
credentials-velero
.idea/

6. Créer le .env, avec les noms de clés attendus par le chart :
rootUser=rootuser
rootPassword=motdepasse

7. Créer le Secret depuis le .env (aucune valeur en argument, donc rien dans l'historique du shell :
kubectl create secret generic minio-root-credentials -n minio --from-env-file=.env

8. Vérifier :
kubectl describe secret minio-root-credentials -n minio

9. Écrire minio/values.yaml, sans aucun identifiant :
existingSecret: minio-root-credentials
mode: standalone
replicas: 1
persistence:
  enabled: true
  size: 5Gi
resources:
  requests:
    memory: 512Mi
    
10. Ajouter le dépôt Helm :
helm repo add minio https://charts.min.io/

11. Installer, en épinglant la version du chart pour rester reproductible :
helm install minio minio/minio -n minio -f minio/values.yaml --version 5.4.0

12. Vérifier :
kubectl get pods,pvc,svc -n minio
helm get values minio -n minio

13. Ouvrir la console dans le navigateur :
kubectl port-forward svc/minio-console -n minio 9001:9001
puis http://localhost:9001, connexion avec les valeurs du .env

Fait jusqu'à l'étape 12. Reste : la console, le bucket velero, l'access key.

À retenir :
- le .gitignore ne protège pas un fichier déjà passé par git add, il faut git restore --staged .env
- le brief propose persistence.enabled=false : ça monte un emptyDir, dont la durée de vie est celle du POD. Un conteneur qui redémarre garde les données, un pod supprimé ou recréé les perd
- choix retenu : persistence.enabled=true, donc un PVC. Le stockage survit au pod, ce qui est le minimum pour un dépôt de sauvegardes. Kind fournit la StorageClass standard (rancher.io/local-path)
- un PVC survit à helm uninstall. Pour repartir propre : kubectl delete pvc -n minio --all
- helm install refuse un nom déjà pris (cannot re-use a name that is still in use). Pour modifier une release existante c'est helm upgrade
- la taille d'un PVC ne peut qu'augmenter. Passer de 500Gi à 5Gi par helm upgrade est refusé, il faut désinstaller et supprimer le PVC
- sans --version, helm prend la dernière version du catalogue. La doc n'est plus reproductible six mois plus tard
- local-path écrit dans le système de fichiers du nœud Kind : les données survivent au pod, pas à kind delete cluster
- console MinIO sur le port 9001, API S3 sur le port 9000
- un Secret Kubernetes est encodé en base64, pas chiffré
- existingSecret évite d'écrire le mot de passe dans values.yaml et dans les values Helm


- [[Velero]]
