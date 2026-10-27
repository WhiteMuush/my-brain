Thème : [[Helm]]

# Helm Velero

Sauvegarde des objets du cluster vers un stockage S3 (MinIO, Ceph, OpenStack Swift en mode S3...).

1. Créer un bucket `velero` et une clé d'accès sur le stockage S3.
2. Créer le secret des identifiants, hors du dépôt :
   ```bash
   cat > credentials-velero <<'EOF'
   [default]
   aws_access_key_id = <clé>
   aws_secret_access_key = <secret>
   EOF
   kubectl create namespace velero
   kubectl create secret generic velero-credentials -n velero --from-file=cloud=credentials-velero
   rm credentials-velero
   ```
3. Écrire `helm/velero/values.yaml` (plugin AWS, qui parle à tout stockage S3) :
   ```yaml
   initContainers:
     - name: velero-plugin-for-aws
       image: velero/velero-plugin-for-aws:<version>
       volumeMounts:
         - mountPath: /target
           name: plugins

   credentials:
     useSecret: true
     existingSecret: velero-credentials

   configuration:
     backupStorageLocation:
       - name: default
         provider: aws
         bucket: velero
         default: true
         config:
           region: <région ou minio>
           s3ForcePathStyle: "true"
           s3Url: <url du stockage S3>
     volumeSnapshotLocation: []
     # Sauvegarde aussi le contenu des volumes, sans snapshot du cloud
     defaultVolumesToFsBackup: true

   deployNodeAgent: true
   ```
4. Installer :
   ```bash
   helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
   helm repo update
   helm upgrade --install velero vmware-tanzu/velero \
     --version <version> \
     --namespace velero \
     --values helm/velero/values.yaml --wait
   ```
5. Installer la CLI `velero` (archive sur https://github.com/vmware-tanzu/velero/releases), puis vérifier que le stockage est joignable :
   ```bash
   velero backup-location get          # Available attendu
   ```
6. Sauvegarder et restaurer :
   ```bash
   velero backup create <nom> --include-namespaces <ns> --wait
   velero backup describe <nom> --details
   velero restore create --from-backup <nom> --wait
   ```
7. Planifier une sauvegarde quotidienne gardée 7 jours :
   ```yaml
   apiVersion: velero.io/v1
   kind: Schedule
   metadata:
     name: daily
     namespace: velero
   spec:
     schedule: "30 2 * * *"
     template:
       includedNamespaces:
         - <ns>
       defaultVolumesToFsBackup: true
       ttl: 168h
   ```
