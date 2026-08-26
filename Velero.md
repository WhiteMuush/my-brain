# Velero

Sauvegarde et restauration de ressources Kubernetes. Il écrit ses backups dans
un stockage compatible S3, ici [[MinIO]] installé dans le cluster.

Deux morceaux distincts : une **CLI** sur ma machine, et un **serveur** dans le
cluster. Installer la CLI ne suffit pas.

## Installer la CLI

```bash
V=v1.18.2
curl -sSLO https://github.com/vmware-tanzu/velero/releases/download/$V/velero-$V-linux-amd64.tar.gz
curl -sSLO https://github.com/vmware-tanzu/velero/releases/download/$V/CHECKSUM
grep velero-$V-linux-amd64.tar.gz CHECKSUM | sha256sum -c -
tar -xzf velero-$V-linux-amd64.tar.gz
install -m 755 velero-$V-linux-amd64/velero ~/.local/bin/velero
velero version --client-only
```

## Installer le serveur

Le bucket et l'access key doivent déjà exister côté MinIO.

```bash
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.14.2 \
  --bucket velero \
  --secret-file ./.credentials-velero \
  --use-volume-snapshots=false \
  --use-node-agent=false \
  --backup-location-config region=minio,s3ForcePathStyle="true",s3Url=http://minio.minio.svc:9000
```

Vérification qui conditionne tout le reste, la colonne `PHASE` doit afficher
`Available` :

```bash
velero backup-location get
```

## Sauvegarder et restaurer

```bash
velero backup create nginx-backup --include-namespaces velero-lab --wait

kubectl delete namespace velero-lab
kubectl get all -n velero-lab

velero restore create --from-backup nginx-backup --wait
kubectl get all -n velero-lab
```

## Points à comprendre

**La version du plugin suit celle de Velero.** Le tableau de compatibilité du
dépôt `velero-plugin-for-aws` donne v1.14.x pour Velero v1.18.x. Un mauvais
plugin donne un serveur qui démarre mais ne sauvegarde rien.

**Le `s3Url` dépend de mon namespace.** La doc officielle installe MinIO dans le
namespace `velero` et écrit `minio.velero.svc`. Chez moi MinIO vit dans le
namespace `minio`, donc c'est `minio.minio.svc`. Le format est
`<service>.<namespace>.svc`.

**`--use-volume-snapshots=false`** parce que Kind n'a pas de fournisseur de
snapshots. On sauvegarde les objets Kubernetes, pas le contenu des volumes.

**`--include-namespaces` plutôt que `--selector`.** Le sélecteur ne prend que
les objets portant le label, sans le namespace lui-même. Après un
`kubectl delete ns`, la restauration n'aurait plus où recréer les objets.

## Pièges rencontrés

`velero backup create` affiche un succès dès que la **demande** est enregistrée.
Le vrai statut se lit avec `--wait`, ou après coup :

```bash
velero backup get
velero backup describe nginx-backup
```

Statut `FailedValidation` : ce n'est pas le backup qui échoue, c'est le
BackupStorageLocation qui est `Unavailable`. Le message exact est ici :

```bash
kubectl get backupstoragelocation default -n velero -o jsonpath='{.status.message}'
kubectl logs -n velero deploy/velero --tail=50 | grep -i error
```

`InvalidAccessKeyId` veut dire que la clé n'existe pas côté serveur, pas qu'elle
est mal recopiée. Un 403 prouve au passage que le réseau et le DNS fonctionnent.

Modifier `.credentials-velero` ne suffit pas : Velero lit le Secret
`cloud-credentials` du cluster, et le SDK ne le relit qu'au démarrage.

```bash
kubectl create secret generic cloud-credentials -n velero \
  --from-file=cloud=.credentials-velero \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl rollout restart deploy/velero -n velero
```

Le reste, en vrac :

- Un `kubectl port-forward` reste attaché au cluster actif au moment de son
  lancement. Après avoir recréé un cluster, le relancer, sinon on travaille
  dans l'ancien sans s'en rendre compte
- `velero backup describe --details` échoue avec `no such host` : c'est la CLI
  qui tente de résoudre un nom DNS interne au cluster depuis ma machine. Le
  backup lui-même est intact

## Raccourcis du projet

```bash
make velero     # installe le serveur
make check      # etat du backup-location
make backup     # sauvegarde le namespace
make drop       # supprime le namespace
make restore    # restaure depuis le backup
```

- [[Kubernetes]] | [[MinIO]] | [[Azure]]
