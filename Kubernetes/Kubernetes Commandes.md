Thème : [[Kubernetes]]

# Kubernetes Commandes

```bash
# Installer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Contexte : toujours vérifier avant une commande destructrice
kubectl config get-contexts
kubectl config current-context
kubectl config use-context <contexte>
kubectl config set-context --current --namespace=<ns>

# Lire
kubectl get nodes
kubectl get all -n <ns>
kubectl get pods -A -o wide
kubectl describe pod <pod> -n <ns>              # les Events disent pourquoi ça coince
kubectl get events -n <ns> --sort-by=.lastTimestamp
kubectl top pods -n <ns>                        # nécessite metrics-server

# Logs et accès
kubectl logs -n <ns> deploy/<nom> -f
kubectl logs -n <ns> <pod> --previous           # logs du conteneur qui a planté
kubectl exec -it -n <ns> deploy/<nom> -- sh
kubectl port-forward -n <ns> svc/<service> 8080:80

# Appliquer
kubectl apply -f <fichier ou dossier>
kubectl diff -f <fichier>                       # voir avant d'appliquer
kubectl delete -f <fichier>

# Déploiements
kubectl rollout status deploy/<nom> -n <ns>
kubectl rollout restart deploy/<nom> -n <ns>
kubectl rollout undo deploy/<nom> -n <ns>
kubectl scale deploy/<nom> -n <ns> --replicas=3
kubectl wait --for=condition=Available deploy/<nom> -n <ns> --timeout=120s

# Générer un YAML de départ sans rien créer
kubectl create deployment <nom> --image=<image>:<tag> --dry-run=client -o yaml
```
