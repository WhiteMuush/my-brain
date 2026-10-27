Thème : [[Manifests]]

# Manifests Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <app>
  namespace: <ns>
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: <app>
  template:
    metadata:
      labels:
        app: <app>
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      # Un pod par nœud au maximum, si possible
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: <app>
      containers:
        - name: <app>
          image: <image>:<tag précis, jamais latest>
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              memory: 128Mi
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 5
            failureThreshold: 30
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 10
            failureThreshold: 3
```

- Sans endpoint HTTP, remplacer `httpGet` par `tcpSocket: { port: 8080 }`.
- Avec `readOnlyRootFilesystem`, monter un `emptyDir` sur `/tmp` si l'app écrit.
- Mesurer la vraie consommation avec `kubectl top pods`, puis ajuster `resources`.
