	# MinIO

Serveur de stockage objet qui parle le protocole S3. Ici il sert de dépôt de
sauvegardes pour Velero. Deux ports : 9000 pour l'API S3, 9001 pour la
console web.

## Refaire l'installation

**1. Cluster Kind** (le fichier porte le nom et le mapping de ports)

```bash
kind create cluster --config kind-config.yaml
```

**2. Namespace**

```bash
kubectl create ns minio
```

**3. Ignorer les secrets AVANT tout git add**, dans `.gitignore`

```
.env
.credentials-velero
```

**4. Le `.env`**, avec les noms de clés attendus par le chart

```ini
rootUser=rootuser
rootPassword=motdepasse
```

**5. Le Secret**, créé depuis ce fichier. Aucune valeur en argument, donc rien
dans l'historique du shell.

```bash
kubectl create secret generic minio-root-credentials -n minio --from-env-file=.env
```

**6. `minio/values.yaml`**, sans aucun identifiant

```yaml
existingSecret: minio-root-credentials
mode: standalone
replicas: 1
persistence:
  enabled: true
  size: 5Gi
resources:
  requests:
    memory: 512Mi
```

**7. Installer**, version épinglée pour rester reproductible

```bash
helm repo add minio https://charts.min.io/
helm install minio minio/minio -n minio -f minio/values.yaml --version 5.4.0
```

**8. Vérifier**

```bash
kubectl get pods,pvc,svc -n minio
```

**9. Ouvrir la console** sur http://127.0.0.1:9001, avec les valeurs du `.env`

```bash
kubectl port-forward svc/minio-console -n minio 9001:9001
```

**10. Dans la console** : créer le bucket `velero`, puis une access key.
Reporter les deux valeurs dans `.credentials-velero`, au format profil AWS.

```ini
[default]
aws_access_key_id = ...
aws_secret_access_key = ...
```

## Pourquoi ces choix

**`existingSecret`** : le mot de passe reste hors du `values.yaml` et hors des
values Helm. Sans lui, `helm get values minio` le ressort en clair.

**`persistence.enabled=true`** : le brief propose `false`, ce qui monte un
emptyDir dont la durée de vie est celle du pod. Un dépôt de sauvegardes sur
stockage éphémère se contredit lui-même. Avec un PVC, les données survivent au
pod, mais pas à `kind delete cluster`.

**`--version`** : sans elle, Helm prend la dernière version du catalogue, et la
doc n'est plus reproductible six mois plus tard.

## Pièges rencontrés

Le `.gitignore` ne protège pas un fichier déjà passé par `git add`. Pour l'en
sortir sans perdre le fichier :

```bash
git restore --staged .env
git check-ignore -v .env
```

Un PVC survit à `helm uninstall`. Pour repartir vraiment propre :

```bash
helm uninstall minio -n minio
kubectl delete pvc -n minio --all
```

Le reste, en vrac :

- La taille d'un PVC ne peut qu'augmenter, jamais diminuer
- `helm install` refuse un nom déjà pris. Pour modifier une release existante,
  c'est `helm upgrade`
- Un Secret Kubernetes est encodé en base64, pas chiffré

## Raccourcis du projet

```bash
make minio      # installe MinIO
make console    # port-forward vers la console
```
