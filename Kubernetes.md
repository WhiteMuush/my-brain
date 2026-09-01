# Kubernetes

Le point d'entrée du thème. Deux labos : un cluster KIND local avec [[MinIO]],
et un cluster AKS managé sur [[Azure]].

## Réflexes

```bash
kubectl config current-context          # dans quel cluster je travaille
kubectl get nodes
kubectl get all -n <namespace>
kubectl logs -n <ns> deploy/<nom>
kubectl wait --for=condition=Available deployment/<nom> -n <ns> --timeout=120s
```

Vérifier le contexte avant toute commande destructrice. Un `port-forward` reste
attaché au cluster actif au moment de son lancement, pas au contexte courant.

## Points à comprendre

**AKS, c'est du Kubernetes managé.** Même API, mêmes objets, mêmes YAML. Azure
fournit le control plane, c'est tout. Un manifest écrit pour KIND s'applique tel
quel.

**La différence visible, c'est le `Service`.** Sur KIND, un `type: LoadBalancer`
reste en `<pending>`, faute de cloud provider derrière : on passe par NodePort
ou `port-forward`. Sur AKS, Azure provisionne un vrai load balancer et une IP
publique.

**Un manifest sans `namespace:` atterrit dans `default`.** Et une sauvegarde
[[Velero]] ciblant un autre namespace revient vide, sans erreur.

**Un namespace ne se crée pas tout seul.** Le mettre en premier document du
manifest, séparé par `---`, ou `kubectl create namespace` avant.

## Épingler l'image

```yaml
image: nginx:1.27-alpine
```

Jamais `latest` quand on teste une restauration : [[Velero]] sauvegarde la
définition de l'objet, donc le tag. Avec `latest`, le restore peut redéployer
une autre version que celle sauvegardée, et la démonstration perd son sens.

## Voir aussi

[[Kubernetes PVC]] pour le stockage persistant : le trio StorageClass,
PersistentVolume et PersistentVolumeClaim, et le cas Azure Files en NFS.
