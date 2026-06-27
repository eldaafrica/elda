# Cahier de Déploiement — ELDA Africa

> Version 1.0 · Juin 2026 · Production

---

## 01. Architecture déployée

Quatre conteneurs Docker orchestrés par Docker Compose sur un VPS LWS.
Nginx est le seul point d'entrée public.

```
Internet
    │ :80 (→ HTTPS) / :443
    ▼
┌─────────────────────────────────────────────────────┐
│  nginx:1.27-alpine + Vite build                     │
│  elda.africa / www  → static files (React SPA)      │
│  api.elda.africa    → proxy_pass http://backend:5600 │
│  http://            → 301 https://                   │
└──────────────────────────┬──────────────────────────┘
                           │ :5600 (interne Docker)
                           ▼
┌─────────────────────────────────────────────────────┐
│  backend — eclipse-temurin:17-jre-alpine            │
│  nexus-backend v0.0.1 (Spring Boot 3.3)             │
└──────────────────────────┬──────────────────────────┘
                           │ :5432 (interne Docker)
                           ▼
┌─────────────────────────────────────────────────────┐
│  db — postgres:16-alpine                            │
│  Base : eisa_nexus · Volume : pgdata (persistant)   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  certbot — renouvellement SSL automatique (12h)     │
│  Volumes : certbot_certs, certbot_www               │
└─────────────────────────────────────────────────────┘
```

---

## 02. Serveur VPS

| Champ      | Valeur                        |
|------------|-------------------------------|
| Hébergeur  | LWS (France)                  |
| Hostname   | vps121743                     |
| IP         | 213.156.135.36                |
| OS         | Debian GNU/Linux 12 bookworm  |
| RAM / CPU  | 8 Go / 4 vCores               |
| Disque     | 147 Go                        |

### Connexion SSH

```bash
ssh -i ~/.ssh/elda root@213.156.135.36
```

### Répertoire du projet

```
/opt/elda-africa/
├── backend_eisa/                 # Sources Spring Boot
├── panafrican-nexus-spa-clean/   # Sources React/Vite
├── nginx/
│   ├── Dockerfile                # Build multi-stage Node → nginx
│   ├── conf.d/default.conf       # Config nginx active
│   └── elda-https.conf           # Template HTTPS (référence)
├── scripts/
│   ├── 01-vps-setup.sh
│   ├── 02-init-ssl.sh
│   └── 03-deploy.sh
├── docker-compose.yml
└── .env                          # Secrets — NE PAS versionner
```

### Pare-feu (UFW)

| Port | Usage                          |
|------|--------------------------------|
| 22   | SSH                            |
| 80   | HTTP → redirection HTTPS       |
| 443  | HTTPS (frontend + API)         |

---

## 03. DNS Namecheap

Domaine **elda.africa** — Advanced DNS :

| Type     | Host  | Value           | TTL       |
|----------|-------|-----------------|-----------|
| A Record | `@`   | 213.156.135.36  | Automatic |
| A Record | `www` | 213.156.135.36  | Automatic |
| A Record | `api` | 213.156.135.36  | Automatic |

### Vérification

```bash
dig +short elda.africa @8.8.8.8
dig +short www.elda.africa @8.8.8.8
dig +short api.elda.africa @8.8.8.8
# Les trois doivent retourner : 213.156.135.36
```

---

## 04. Services Docker

| Service   | Image                            | Port exposé       | Volumes                                    |
|-----------|----------------------------------|-------------------|--------------------------------------------|
| `nginx`   | Custom (nginx:1.27-alpine)       | 80, 443 → hôte    | `./nginx/conf.d`, `certbot_certs`, `certbot_www` |
| `backend` | Custom (eclipse-temurin:17-jre)  | 5600 (interne)    | —                                          |
| `db`      | postgres:16-alpine               | 5432 (interne)    | `pgdata`                                   |
| `certbot` | certbot/certbot:latest           | —                 | `certbot_certs`, `certbot_www`             |

### Volumes nommés

| Volume          | Contenu                   | Importance              |
|-----------------|---------------------------|-------------------------|
| `pgdata`        | Données PostgreSQL         | ⚠ Critique — sauvegarder |
| `certbot_certs` | Certificats Let's Encrypt  | Critique                |
| `certbot_www`   | Challenge ACME webroot     | Technique               |

---

## 05. Variables d'environnement

Fichier `/opt/elda-africa/.env` sur le VPS — **ne jamais versionner**.

| Variable                      | Usage                                          |
|-------------------------------|------------------------------------------------|
| `SPRING_DATASOURCE_USERNAME`  | Utilisateur PostgreSQL (Spring Boot + container db) |
| `SPRING_DATASOURCE_PASSWORD`  | Mot de passe PostgreSQL ⚠                     |
| `JWT_SECRET`                  | Clé de signature JWT (hex 64 chars) ⚠         |
| `ADMIN_EMAIL`                 | Email du compte admin initial                  |
| `ADMIN_PASSWORD`              | Mot de passe admin initial ⚠                  |

Variables injectées directement dans `docker-compose.yml` :

| Variable                  | Valeur en production                              |
|---------------------------|---------------------------------------------------|
| `SPRING_DATASOURCE_URL`   | `jdbc:postgresql://db:5432/eisa_nexus`            |
| `CORS_ORIGINS`            | `https://elda.africa,https://www.elda.africa`     |
| `VITE_API_BASE_URL`       | `https://api.elda.africa/api` (build-arg Vite)    |

---

## 06. SSL / Let's Encrypt

| Champ       | Valeur                                              |
|-------------|-----------------------------------------------------|
| Domaines    | elda.africa · www.elda.africa · api.elda.africa     |
| Fournisseur | Let's Encrypt (webroot)                             |
| Email       | elda.africa@gmail.com                               |
| Expiration  | 22 septembre 2026                                   |
| Renouvellement | Automatique toutes les 12h via container certbot |

### Renouvellement manuel

```bash
cd /opt/elda-africa
docker compose run --rm --entrypoint certbot certbot renew --force-renewal
docker compose exec nginx nginx -s reload
```

---

## 07. Procédure de mise à jour

> Règle générale : **1. rsync depuis le Mac → 2. build sur le VPS → 3. restart du service concerné**

---

### Cas 1 — Frontend modifié (React / Vite)

**Mac — terminal local :**
```bash
rsync -av --progress \
  --exclude='backend_eisa/target' \
  --exclude='panafrican-nexus-spa-clean/node_modules' \
  --exclude='panafrican-nexus-spa-clean/dist' \
  --exclude='.env' \
  -e "ssh -i ~/.ssh/elda" \
  /Users/user/Tuwindi/eisa/ \
  root@213.156.135.36:/opt/elda-africa/
```

**VPS — terminal SSH :**
```bash
cd /opt/elda-africa
docker compose build nginx
docker compose up -d --no-deps nginx
```

---

### Cas 2 — Backend modifié (Spring Boot / Java)

**Mac** — même rsync que ci-dessus.

**VPS :**
```bash
cd /opt/elda-africa
docker compose build backend
docker compose up -d --no-deps backend
```

---

### Cas 3 — Frontend ET backend modifiés

**Mac** — même rsync.

**VPS :**
```bash
cd /opt/elda-africa
docker compose build nginx backend
docker compose up -d --no-deps nginx backend
```

---

### Cas 4 — Config nginx seulement (`nginx/conf.d/default.conf`)

Pas de rebuild nécessaire. Après le rsync :

**VPS :**
```bash
cd /opt/elda-africa
docker compose exec nginx nginx -s reload
```

---

### Cas 5 — Modification du `.env` (secrets, variables d'environnement)

Le `.env` est exclu du rsync — il faut l'éditer directement sur le VPS :

**VPS :**
```bash
nano /opt/elda-africa/.env
# Modifier les valeurs → Ctrl+O pour sauvegarder → Ctrl+X pour quitter

# Redémarrer le backend pour prendre en compte les nouvelles variables
cd /opt/elda-africa
docker compose up -d --no-deps backend
```

---

### Commande tout-en-un (cas le plus fréquent)

Depuis le Mac, en **deux commandes** sans ouvrir de session SSH séparée :

```bash
# 1. Transfert Mac → VPS
rsync -av --progress \
  --exclude='backend_eisa/target' \
  --exclude='panafrican-nexus-spa-clean/node_modules' \
  --exclude='panafrican-nexus-spa-clean/dist' \
  --exclude='.env' \
  -e "ssh -i ~/.ssh/elda" \
  /Users/user/Tuwindi/eisa/ \
  root@213.156.135.36:/opt/elda-africa/

# 2. Build + restart sur le VPS (sans ouvrir de session SSH)
ssh -i ~/.ssh/elda root@213.156.135.36 \
  "cd /opt/elda-africa && bash scripts/03-deploy.sh"
```

---

### Vérification après chaque déploiement

```bash
# Statut des containers
docker compose ps

# Logs en temps réel (30 dernières secondes)
docker compose logs -f --since=1m

# Test depuis l'extérieur
curl -sI https://elda.africa | grep HTTP
curl -sI https://api.elda.africa/api/public/stats | grep HTTP
```

---

## 08. Maintenance

### Logs

```bash
docker compose logs -f              # Tous les services
docker compose logs -f nginx        # Nginx seulement
docker compose logs -f backend      # Backend seulement
docker compose logs -f db           # PostgreSQL
```

### Redémarrage

```bash
docker compose restart nginx
docker compose restart backend
docker compose down && docker compose up -d   # Tout arrêter et relancer
```

### Sauvegarde base de données

```bash
mkdir -p /opt/backups

# Export
docker compose exec db pg_dump -U eisa_nexus eisa_nexus \
  > /opt/backups/eisa_$(date +%Y%m%d_%H%M).sql

# Restauration
docker compose exec -T db psql -U eisa_nexus eisa_nexus \
  < /opt/backups/eisa_20260624.sql
```

### Espace disque

```bash
docker system df          # Espace Docker
docker image prune -f     # Nettoyer images inutilisées
df -h /                   # Disque global
```

---

## 09. Référence rapide

| Action                  | Commande                                                                 |
|-------------------------|--------------------------------------------------------------------------|
| Connexion VPS           | `ssh -i ~/.ssh/elda root@213.156.135.36`                                 |
| Statut services         | `cd /opt/elda-africa && docker compose ps`                               |
| Logs backend            | `docker compose logs -f backend`                                         |
| Logs nginx              | `docker compose logs -f nginx`                                           |
| Redémarrer nginx        | `docker compose restart nginx`                                           |
| Reload config nginx     | `docker compose exec nginx nginx -s reload`                              |
| Rebuild + deploy front  | `docker compose build nginx && docker compose up -d --no-deps nginx`     |
| Rebuild + deploy back   | `docker compose build backend && docker compose up -d --no-deps backend` |
| Backup BDD              | `docker compose exec db pg_dump -U eisa_nexus eisa_nexus > backup.sql`  |
| Renouveler SSL          | `docker compose run --rm --entrypoint certbot certbot renew`             |
| Vérifier DNS            | `dig +short elda.africa @8.8.8.8`                                        |
| Espace Docker           | `docker system df`                                                       |

### URLs de production

| Service    | URL                                                    |
|------------|--------------------------------------------------------|
| Frontend   | https://elda.africa                                    |
| Frontend   | https://www.elda.africa                                |
| API REST   | https://api.elda.africa/api                            |
| Swagger UI | https://api.elda.africa/api/swagger-ui.html            |

---

## 10. Import des données — Union Africaine

Importation des rapports d'observation électorale depuis `https://au.int/fr/election-reports`
vers la base de données ELDA Africa.

### Localisation du script

```
scripts/import/
├── import_au.py        # Script principal
├── requirements.txt    # Dépendances Python
├── scraped_data.json   # Données scrapées (généré automatiquement, ne pas versionner)
└── .venv/              # Environnement virtuel Python (ne pas versionner)
```

### Installation (première fois)

```bash
cd scripts/import

# Créer l'environnement virtuel
python3 -m venv .venv
source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### Ordre d'insertion en base

Le script insère les entités dans cet ordre pour respecter les dépendances :

```
1. Country      — pays ISO (code, region, translations)
2. Institution  — AUEOM (une seule, créée une fois)
3. Mission      — un rapport = une mission
4. Recommendation — extraites du PDF de chaque rapport
```

### Commandes

```bash
source .venv/bin/activate

# ── Scraping ──────────────────────────────────────────────────────
# Scraper tous les rapports (sauvegarde dans scraped_data.json)
python import_au.py --scrape

# Scraper seulement N rapports (test)
python import_au.py --scrape --limit 5

# ── Import en base locale ─────────────────────────────────────────
# Simulation (aucun appel API réel)
python import_au.py --import --local --dry-run

# Import réel → API locale (localhost:5600)
python import_au.py --import --local

# ── Import en production ──────────────────────────────────────────
# Simulation production
python import_au.py --import --prod --dry-run

# Import réel → https://api.elda.africa/api
python import_au.py --import --prod

# ── Tout d'un coup (scraping + import prod) ───────────────────────
python import_au.py --scrape --import --prod
```

### Résultat du premier import (juin 2026)

| Entité          | Quantité importée |
|-----------------|-------------------|
| Pays            | 23                |
| Institutions    | 1 (AUEOM)         |
| Missions        | 76                |
| Recommandations | ~180              |

Source : 76 rapports d'observation électorale (2017–2024), toutes langues confondues.

### Détection automatique des thèmes

Le script classifie chaque recommandation selon des mots-clés :

| Thème           | Mots-clés déclencheurs                               |
|-----------------|------------------------------------------------------|
| `JURIDIQUE`     | loi, constitution, code électoral, cadre légal       |
| `ADMINISTRATION`| commission, CENI, gestion, liste électorale          |
| `ELECTEURS`     | inscription, enrôlement, biométrique, voters         |
| `CAMPAGNE`      | campagne, candidats, financement, partis             |
| `MEDIAS`        | médias, presse, radio, réseaux sociaux               |
| `RESULTATS`     | résultats, dépouillement, compilation, contentieux   |
| `INCLUSION`     | femmes, jeunes, genre, handicap, inclusion           |
| `SECURITE`      | sécurité, violence, intimidation                     |
| `CIVISME`       | civisme, éducation civique, culture démocratique     |

### Relancer un import partiel

Le fichier `scraped_data.json` permet de relancer l'import sans rescraper le site AU :

```bash
# Rescraper uniquement
python import_au.py --scrape

# Réimporter depuis le JSON existant (sans rescraper)
python import_au.py --import --prod
```

### Vérifier les données après import

```bash
# Nombre de pays en base
curl -s https://api.elda.africa/api/countries | python3 -m json.tool | grep -c '"code"'

# Nombre de missions
curl -s https://api.elda.africa/api/missions | python3 -m json.tool

# Nombre de recommandations
curl -s https://api.elda.africa/api/recommendations | python3 -m json.tool
```

### Avertissements

- `scraped_data.json` contient des données publiques, pas de secrets — mais ne pas le versionner car il peut être volumineux.
- `.venv/` ne doit jamais être versionné (déjà dans `.gitignore`).
- 5 rapports sur 76 ont un `country_code` non résolu (titres tronqués ou pays non reconnu) — les missions correspondantes sont créées sans pays associé.
- Les textes de recommandations sont extraits automatiquement des PDFs : la qualité dépend du format du PDF (certains rapports en colonnes peuvent avoir un texte mal ordonné).
