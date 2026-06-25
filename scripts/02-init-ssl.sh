#!/bin/bash
# Obtention du certificat SSL Let's Encrypt (première fois uniquement)
# Prérequis : DNS Namecheap propagé, .env configuré, Docker installé
set -e

EMAIL="isy@tuwindi.org"
DOMAIN="elda.africa"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
    echo "✗ Fichier .env manquant. Copiez .env.example vers .env et configurez les valeurs."
    exit 1
fi

echo "=== 1. Construction des images ==="
docker compose build

echo "=== 2. Démarrage nginx (mode HTTP initial pour le challenge ACME) ==="
# default.conf sert uniquement le challenge certbot pour l'instant
docker compose up -d nginx

echo "=== 3. Attente que nginx soit prêt ==="
sleep 5

echo "=== 4. Obtention du certificat SSL ==="
docker compose run --rm --entrypoint certbot certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    -d "api.$DOMAIN"

echo "=== 5. Activation de la configuration HTTPS ==="
cp ./nginx/conf.d/elda-https.conf ./nginx/conf.d/default.conf

echo "=== 6. Rechargement de nginx ==="
docker compose exec nginx nginx -s reload

echo "=== 7. Démarrage de tous les services ==="
docker compose up -d

echo ""
echo "✓ Certificat SSL obtenu et HTTPS activé."
echo "  Frontend : https://$DOMAIN"
echo "  API      : https://api.$DOMAIN/api/swagger-ui.html"
