#!/bin/bash
# À exécuter en root sur le VPS LWS — Ubuntu/Debian
set -e

echo "=== 1. Mise à jour du système ==="
apt-get update && apt-get upgrade -y

echo "=== 2. Dépendances curl/gnupg ==="
apt-get install -y ca-certificates curl gnupg lsb-release git ufw

echo "=== 3. Installation de Docker (officiel) ==="
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker

echo "=== 4. Pare-feu ==="
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
docker --version
docker compose version
echo ""
echo "✓ VPS prêt pour le déploiement."
echo "→ Prochaine étape : bash /opt/elda-africa/scripts/02-init-ssl.sh"
