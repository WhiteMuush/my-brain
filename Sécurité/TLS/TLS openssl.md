Thème : [[TLS]]

# TLS openssl

## Certificat d'un site : sujet, émetteur, dates

```bash
openssl s_client -connect <site>:443 -servername <site> </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

## Lire un certificat local

```bash
openssl x509 -in cert.pem -noout -text
```

## Date d'expiration, et alerte si moins de 30 jours

```bash
openssl x509 -in cert.pem -noout -enddate
openssl x509 -in cert.pem -noout -checkend 2592000
```

## Vérifier la chaîne

```bash
openssl verify -CAfile ca.pem -untrusted intermediate.pem cert.pem
```

## Vérifier que la clé correspond au certificat (deux sommes identiques)

```bash
openssl x509 -in cert.pem -noout -pubkey | sha256sum
openssl pkey -in key.pem -pubout | sha256sum
```

## Créer une clé et une demande de certificat (CSR)

```bash
openssl req -new -newkey rsa:4096 -nodes -keyout key.pem -out req.csr \
  -subj "/CN=<domaine>" -addext "subjectAltName=DNS:<domaine>"
```

## Certificat auto-signé pour un test

```bash
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
  -keyout key.pem -out cert.pem \
  -subj "/CN=<domaine>" -addext "subjectAltName=DNS:<domaine>"
```
