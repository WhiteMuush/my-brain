# Kubernetes PVC

Le stockage persistant sur [[Kubernetes]]. Note écrite pendant le labo AKS avec
Azure Files en NFS, mais le trio StorageClass, PersistentVolume et
PersistentVolumeClaim est le même partout, y compris sur KIND.

## Réflexes

```bash
kubectl get sc                          # quelles classes existent, laquelle est par défaut
kubectl get pvc -n <ns>                 # Pending ou Bound
kubectl get pv                          # les volumes réels, hors namespace
kubectl describe pvc <nom> -n <ns>      # les Events disent pourquoi ça coince
kubectl exec deploy/<nom> -- df -h -T /data/db
```

`describe pvc` avant toute autre hypothèse. Un PVC qui reste en `Pending` a
presque toujours sa cause écrite en clair dans ses `Events`.

## Le trio

**Le PVC est une demande** : une taille, un mode d'accès, une classe. Il vit
dans un namespace, comme un pod.

**Le PV est le volume réel**, l'objet qui représente le disque ou le partage
côté infrastructure. Il est cluster-scoped, donc invisible avec un `-n`.

**La StorageClass est la recette** qui fabrique le PV à la demande. Elle nomme
un provisioner, par exemple `file.csi.azure.com` ou `disk.csi.azure.com`, et
les paramètres que ce driver attend.

En provisionnement **statique**, c'est toi qui crées le PV, avant le PVC, et le
PVC vient s'y lier. En **dynamique**, tu ne crées que le PVC : l'arrivée du PVC
déclenche la StorageClass, qui crée le PV. C'est le mode utilisé dès qu'il y a
un driver CSI en face.

## Points à comprendre

**Un PVC `Pending` n'est presque jamais un problème de Kubernetes.** C'est le
provisioner qui n'arrive pas à créer le volume : réseau, DNS, droits, quota. Le
message est dans les Events du PVC, pas dans les logs du pod.

**`ReadWriteOnce` veut dire un nœud, pas un pod.** Plusieurs pods du même nœud
peuvent partager un volume RWO. C'est le passage sur un second nœud qui est
interdit. Pour un vrai partage entre nœuds il faut `ReadWriteMany`, que seul un
partage réseau fournit : Azure Files sait le faire, un Azure Disk non.

**La `reclaimPolicy` par défaut d'une classe dynamique est `Delete`.** Supprimer
le PVC détruit le volume et les données avec. `Retain` garde le PV après la
suppression du PVC, dans l'état `Released`, à récupérer à la main. À choisir
consciemment sur tout ce qui contient une base de données.

**Agrandir un volume demande `allowVolumeExpansion: true` sur la classe**, et
ne marche que dans un sens. Il n'existe aucun moyen de réduire un PVC.

**Supprimer un pod ne touche pas au PVC.** C'est exactement ce que prouve la
manipulation du labo : on écrit une donnée, on supprime le pod, le nouveau pod
remonte le même volume et retrouve la donnée. Le PVC survit au Deployment
lui-même.

**Un processus non-root ne peut pas écrire dans un volume qui ne lui appartient
pas.** D'où `securityContext.fsGroup` dans le Deployment MongoDB : le kubelet
applique ce groupe au contenu du volume au montage. Deuxième cause de pod qui
redémarre en boucle sur un stockage réseau, juste après le DNS.

## Côté [[Azure]]

**Azure Files en NFS impose le tier Premium.** Compte de type `FileStorage`,
réplication `Premium_LRS`, NFS v3 activé. Le tier Standard ne propose que SMB.
Le minimum facturé d'un partage Premium est de 100 Gio : demander 10 Go dans un
PVC de test ne coûte pas moins cher, la taille est arrondie.

**Un partage NFS n'a pas d'endpoint public.** Il faut un private endpoint sur
le subnet des nœuds, plus la zone DNS privée
`privatelink.file.core.windows.net`, sans quoi le nom du compte résout vers une
adresse publique qui refuse la connexion. Le PVC reste alors en `Pending`, et
c'est le réseau qu'il faut regarder, pas le manifest.

**Le driver CSI est déjà là sur AKS**, rien à installer :

```bash
kubectl get pods -n kube-system -l app=csi-azurefile-node
```

**Fichier ou bloc, la vraie différence.** Azure Files est un partage réseau,
donc `ReadWriteMany` possible et volume détachable de tout nœud. Azure Disk est
un disque bloc attaché à une VM, donc plus rapide, mais lié à un seul nœud à la
fois. Pour une base de données mono-instance, le disque est le choix naturel en
production ; le partage NFS a l'avantage de survivre au nœud.

## Squelette de manifest

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: azurefile-csi-nfs
  resources:
    requests:
      storage: 100Gi
```

Le nom de la classe doit exister avant le PVC. S'il est absent du cluster, le
PVC attend indéfiniment sans erreur explicite ailleurs que dans ses Events.

## Voir aussi

[[Kubernetes]] pour les réflexes généraux, [[Azure]] pour le compte de
stockage, [[Velero]] pour la sauvegarde des objets, qui est un sujet distinct :
Velero sauvegarde les définitions, pas le contenu des volumes.
