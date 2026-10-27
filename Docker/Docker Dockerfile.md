Thème : [[Docker]]

# Docker Dockerfile

1. Écrire le `Dockerfile` en deux étapes (exemple Go) :
   ```dockerfile
   # syntax=docker/dockerfile:1

   # Build
   FROM golang:<version>-alpine AS builder
   WORKDIR /src
   # Dépendances d'abord : cette couche reste en cache tant que go.mod ne change pas
   COPY go.mod go.sum ./
   RUN go mod download
   COPY . .
   RUN CGO_ENABLED=0 go build -o /out/app .

   # Runtime : seulement le binaire
   FROM alpine:<version> AS runtime
   RUN addgroup -S app && adduser -S -H app -G app
   COPY --from=builder --chown=app:app /out/app /usr/local/bin/app
   USER app
   EXPOSE 8080
   HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
     CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
   ENTRYPOINT ["app"]
   ```
   Pour un binaire statique, `gcr.io/distroless/static-debian12` en runtime : pas de shell, surface minimale (et pas de `HEALTHCHECK` avec wget).
2. Écrire le `.dockerignore` :
   ```
   .git
   .env
   .env.*
   *.pem
   *.key
   .ssh
   **/*.log
   Dockerfile
   *.md
   ```
3. Un secret nécessaire au build passe par un montage, jamais par `ARG` ou `ENV` :
   ```dockerfile
   RUN --mount=type=secret,id=token TOKEN="$(cat /run/secrets/token)" ./fetch-deps.sh
   ```
   ```bash
   docker build --secret id=token,src=./token.txt -t <image>:<tag> .
   ```
4. Construire, puis scanner avant de pousser :
   ```bash
   docker build -t <image>:<tag> .
   trivy image --severity HIGH,CRITICAL --exit-code 1 <image>:<tag>
   ```
5. Vérifier :
   ```bash
   docker run --rm <image>:<tag> id          # ne doit pas être uid=0
   docker images <image>                     # taille
   docker history <image>:<tag>              # aucun secret dans les couches
   ```

Règles : version d'image de base précise (jamais `latest`), `USER` non-root, `HEALTHCHECK`, `.dockerignore` toujours présent.
