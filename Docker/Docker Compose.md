Thème : [[Docker]]

# Docker Compose

1. Écrire `compose.yaml` :
   ```yaml
   name: <projet>

   services:
     api:
       build: .
       image: <image>:${APP_VERSION:-dev}
       restart: unless-stopped
       ports:
         - "127.0.0.1:8080:8080"
       environment:
         DB_HOST: db
         DB_PASSWORD: ${DB_PASSWORD}
       depends_on:
         db:
           condition: service_healthy
       read_only: true
       tmpfs:
         - /tmp
       cap_drop:
         - ALL
       security_opt:
         - no-new-privileges:true
       deploy:
         resources:
           limits:
             cpus: "0.50"
             memory: 256M
       networks:
         - app-net

     db:
       image: postgres:<version>-alpine
       restart: unless-stopped
       environment:
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - db-data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 10s
         timeout: 5s
         retries: 5
       networks:
         - app-net

   volumes:
     db-data:

   networks:
     app-net:
   ```
2. Mettre les secrets dans `.env`, ajouté au `.gitignore`, et commiter un `.env.example` sans valeurs.
3. Commandes :
   ```bash
   docker compose config                # vérifier le fichier et les variables
   docker compose up -d --build
   docker compose ps
   docker compose logs -f api
   docker compose exec api sh
   docker compose down                  # garde les volumes
   docker compose down -v               # supprime aussi les volumes
   ```
4. En développement, reconstruire à chaque modification :
   ```yaml
   services:
     api:
       develop:
         watch:
           - path: .
             action: rebuild
   ```
   ```bash
   docker compose watch
   ```
