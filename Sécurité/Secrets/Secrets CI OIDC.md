Thème : [[Secrets]]

# Secrets CI OIDC

1. Côté cloud, créer une relation de confiance envers GitLab :
   - émetteur : `https://gitlab.com`
   - audience : celle attendue par le cloud
   - sujet : `project_path:<groupe>/<projet>:ref_type:branch:ref:main`
2. Donner à cette identité le rôle minimum nécessaire.
3. Dans `.gitlab-ci.yml`, demander un jeton OIDC au job :
   ```yaml
   .oidc:
     id_tokens:
       OIDC_TOKEN:
         aud: <audience>
   ```
4. Le job échange ce jeton contre un accès temporaire. Aucun secret n'est stocké dans GitLab.
5. Pour le state Terraform GitLab, le jeton du job suffit :
   ```yaml
   variables:
     TF_HTTP_USERNAME: gitlab-ci-token
     TF_HTTP_PASSWORD: $CI_JOB_TOKEN
     TF_IN_AUTOMATION: "true"
     TF_INPUT: "false"
   ```
6. Si un secret reste obligatoire, le créer en variable CI **masquée** et **protégée** (branches protégées seulement).

Équivalent GitHub Actions :
```yaml
permissions:
  id-token: write
  contents: read
```
