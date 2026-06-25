#!/bin/bash
# Redéploiement après mise à jour du code (frontend ou backend)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "=== 1. Récupération des dernières modifications ==="
git pull

echo "=== 2. Reconstruction des images ==="
docker compose build nginx backend

echo "=== 3. Redémarrage sans interruption ==="
docker compose up -d --no-deps nginx backend

echo ""
echo "✓ Déploiement terminé."
docker compose ps
