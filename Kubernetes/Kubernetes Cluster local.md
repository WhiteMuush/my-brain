Thème : [[Kubernetes]]

# Kubernetes Cluster local

1. Installer Kind (version sur https://github.com/kubernetes-sigs/kind/releases) :
   ```bash
   curl -Lo ./kind https://kind.sigs.k8s.io/dl/<version>/kind-linux-amd64
   sudo install -m 0755 kind /usr/local/bin/kind
   ```
2. Écrire `kind-config.yaml` :
   ```yaml
   kind: Cluster
   apiVersion: kind.x-k8s.io/v1alpha4
   name: lab
   nodes:
     - role: control-plane
       extraPortMappings:
         # localhost:8080 vers le nodePort 30080 du Service
         - containerPort: 30080
           hostPort: 8080
           protocol: TCP
     - role: worker
     - role: worker
   ```
3. Créer le cluster :
   ```bash
   kind create cluster --config kind-config.yaml
   kubectl get nodes
   ```
4. Charger une image construite en local, sans registry :
   ```bash
   kind load docker-image <image>:<tag> --name lab
   ```
5. Exposer une app : Service en `NodePort` sur le port `30080`, puis http://localhost:8080.
   Un Service `LoadBalancer` reste en `<pending>` sur Kind, faute de cloud derrière.
6. Arrêter et relancer sans tout perdre :
   ```bash
   docker stop lab-control-plane lab-worker lab-worker2
   docker start lab-control-plane lab-worker lab-worker2
   kubectl wait --for=condition=Ready node --all --timeout=90s
   ```
7. Supprimer :
   ```bash
   kind delete cluster --name lab
   ```
