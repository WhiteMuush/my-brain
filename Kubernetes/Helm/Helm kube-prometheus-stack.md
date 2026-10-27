Thème : [[Helm]]

# Helm kube-prometheus-stack

Prometheus, Alertmanager et Grafana en une release.

1. Ajouter le dépôt :
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update
   helm search repo prometheus-community/kube-prometheus-stack --versions | head -3
   ```
2. Écrire `helm/kube-prometheus-stack/values.yaml` :
   ```yaml
   prometheus:
     prometheusSpec:
       # Lire tous les ServiceMonitor et règles du cluster, pas seulement ceux de la release
       serviceMonitorSelectorNilUsesHelmValues: false
       podMonitorSelectorNilUsesHelmValues: false
       ruleSelectorNilUsesHelmValues: false
       retention: 7d
       storageSpec:
         volumeClaimTemplate:
           spec:
             accessModes: ["ReadWriteOnce"]
             resources:
               requests:
                 storage: 10Gi

   alertmanager:
     alertmanagerSpec:
       storage:
         volumeClaimTemplate:
           spec:
             accessModes: ["ReadWriteOnce"]
             resources:
               requests:
                 storage: 2Gi
   ```
3. Installer :
   ```bash
   helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
     --version <version> \
     --namespace monitoring --create-namespace \
     --values helm/kube-prometheus-stack/values.yaml --wait
   ```
4. Récupérer le mot de passe admin de Grafana :
   ```bash
   kubectl get secret -n monitoring kube-prometheus-stack-grafana \
     -o jsonpath='{.data.admin-password}' | base64 -d; echo
   ```
5. Ouvrir Grafana et Prometheus :
   ```bash
   kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
   kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
   ```
