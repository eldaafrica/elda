"""
Import des rapports électoraux de l'Union Africaine → ELDA Africa
Ordre d'insertion : Country → Institution → Mission → Recommendation

Usage:
    source .venv/bin/activate
    python import_au.py --scrape --limit 5      # Scraper (test)
    python import_au.py --scrape                 # Scraper tout
    python import_au.py --import --dry-run       # Simuler l'import
    python import_au.py --scrape --import        # Tout d'un coup
"""

import sys
import json
import re
import time
import argparse
import logging
import io
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup

# ═════════════════════════════════════════════════════════════════════════════
# CONFIG
# ═════════════════════════════════════════════════════════════════════════════

AU_BASE_URL    = "https://au.int"
AU_REPORTS_URL = "https://au.int/fr/election-reports"
OUTPUT_FILE    = Path(__file__).parent / "scraped_data.json"

# URLs API — sélectionnées via --local ou --prod
API_LOCAL = "http://localhost:5600/api"
API_PROD  = "https://api.elda.africa/api"

# ADMIN_EMAIL    = "admin@eisa.org"
# ADMIN_PASSWORD = "admin1234"
ADMIN_EMAIL    = "admin@elda-africa.org"
ADMIN_PASSWORD = "1555228b48fc918a522148f10fc27bfa"

# Valeur par défaut (sera surchargée par les args)
ELDA_API_URL   = API_LOCAL

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

HTTP = requests.Session()
HTTP.headers.update({"User-Agent": "Mozilla/5.0 (ELDA-Africa-Importer/2.0)"})


# ═════════════════════════════════════════════════════════════════════════════
# MODÈLES — miroir exact des entités Java
# ═════════════════════════════════════════════════════════════════════════════

# ── Country ──────────────────────────────────────────────────────────────────
# Entity champs : code (PK), region, sourceLang, translations: Map<String,String>

@dataclass
class CountryPayload:
    code: str           # ISO 3166-1 alpha-2, ex: "MG"
    region: str         # OUEST | EST | NORD | SUD | CENTRE
    sourceLang: str = "fr"
    translations: dict = field(default_factory=dict)
    # {"fr": "Madagascar", "en": "Madagascar"}

    def to_json(self) -> dict:
        return asdict(self)


# ── Institution ───────────────────────────────────────────────────────────────
# Entity champs : id (UUID), name, sourceLang, translations: Map<String,String>,
#                 country, category, createdAt

@dataclass
class InstitutionPayload:
    name: str           # nom principal dans sourceLang
    category: str       # COMMISSION_ELECTORALE | PARLEMENT | POUVOIR_JUDICIAIRE |
                        # GOUVERNEMENT | SOCIETE_CIVILE
    sourceLang: str = "fr"
    country: Optional[str] = None   # ISO code, nullable
    translations: dict = field(default_factory=dict)
    # {"fr": "Mission d'Observation…", "en": "Electoral Observation Mission…"}

    def to_json(self) -> dict:
        d = asdict(self)
        return {k: v for k, v in d.items() if v is not None}


# ── Mission ───────────────────────────────────────────────────────────────────
# Entity champs : id (UUID), code, type, country, cycle, startDate, endDate,
#                 leadObserver, institutionId, sourceLang,
#                 translations: Map<String, MissionTranslation{summary}>

@dataclass
class MissionPayload:
    code: str           # unique, ex: "MIS-2024-0001"
    type: str           # OBSERVATION | ASSISTANCE | REVUE_TECHNIQUE
    country: Optional[str] = None       # ISO code
    startDate: Optional[str] = None     # YYYY-MM-DD
    endDate: Optional[str] = None       # YYYY-MM-DD
    cycle: Optional[str] = None
    leadObserver: Optional[str] = None
    institutionId: Optional[str] = None # UUID de l'institution
    sourceLang: str = "fr"
    translations: dict = field(default_factory=dict)
    # {"fr": {"summary": "…"}}   ← MissionTranslation n'a que summary

    def to_json(self) -> dict:
        d = asdict(self)
        return {k: v for k, v in d.items() if v is not None}


# ── Recommendation ────────────────────────────────────────────────────────────
# Entity champs : id (UUID), code, sourceLang,
#                 translations: Map<String, RecommendationTranslation{title,summary,body}>,
#                 codeCountry, missionId, institutionId,
#                 theme, statut, priorite, visibilite,
#                 issuedDate, lastUpdate, sources

@dataclass
class RecommendationPayload:
    code: str           # unique, ex: "REC-0001-001"
    theme: str          # JURIDIQUE | ADMINISTRATION | ELECTEURS | CAMPAGNE |
                        # MEDIAS | RESULTATS | INCLUSION | SECURITE | CIVISME
    statut: str = "INCONNU"     # NOUVEAU | EN_COURS | PARTIEL | IMPLEMENTE |
                                # NON_IMPLEMENTE | INCONNU
    priorite: str = "MOYENNE"   # HAUTE | MOYENNE | BASSE
    visibilite: str = "BROUILLON"   # PUBLIC | INTERNE | BROUILLON
    sourceLang: str = "fr"
    codeCountry: Optional[str] = None   # ISO code
    missionId: Optional[str] = None     # UUID mission
    institutionId: Optional[str] = None # UUID institution
    issuedDate: Optional[str] = None    # YYYY-MM-DD
    translations: dict = field(default_factory=dict)
    # {"fr": {"title": "…", "summary": "…", "body": "…"}}

    def to_json(self) -> dict:
        d = asdict(self)
        return {k: v for k, v in d.items() if v is not None}


# ═════════════════════════════════════════════════════════════════════════════
# MAPPINGS PAYS
# ═════════════════════════════════════════════════════════════════════════════

COUNTRY_CODES: dict[str, str] = {
    # NORD
    "maroc": "MA", "morocco": "MA",
    "algérie": "DZ", "algerie": "DZ", "algeria": "DZ",
    "tunisie": "TN", "tunisia": "TN",
    "libye": "LY", "libya": "LY",
    "égypte": "EG", "egypte": "EG", "egypt": "EG",
    "mauritanie": "MR", "mauritania": "MR",
    "soudan": "SD", "sudan": "SD",
    # OUEST
    "sénégal": "SN", "senegal": "SN",
    "mali": "ML",
    "guinée": "GN", "guinee": "GN", "guinea": "GN",
    "guinée-bissau": "GW", "guinea-bissau": "GW",
    "sierra leone": "SL",
    "liberia": "LR", "libéria": "LR",
    "côte d'ivoire": "CI", "cote d'ivoire": "CI", "ivory coast": "CI",
    "ghana": "GH",
    "togo": "TG",
    "bénin": "BJ", "benin": "BJ",
    "niger": "NE",
    "burkina faso": "BF",
    "nigeria": "NG", "nigéria": "NG",
    "gambie": "GM", "gambia": "GM",
    "cap-vert": "CV", "cape verde": "CV",
    # CENTRE
    "cameroun": "CM", "cameroon": "CM",
    "centrafrique": "CF", "central african republic": "CF",
    "congo": "CG", "congo brazzaville": "CG",
    "rdc": "CD", "rd congo": "CD", "congo kinshasa": "CD",
    "république démocratique du congo": "CD",
    "democratic republic of the congo": "CD", "drc": "CD",
    "gabon": "GA",
    "guinée équatoriale": "GQ", "equatorial guinea": "GQ",
    "burundi": "BI",
    "rwanda": "RW",
    "tchad": "TD", "chad": "TD",
    # EST
    "éthiopie": "ET", "ethiopie": "ET", "ethiopia": "ET",
    "somalie": "SO", "somalia": "SO",
    "djibouti": "DJ",
    "kenya": "KE",
    "ouganda": "UG", "uganda": "UG",
    "tanzanie": "TZ", "tanzania": "TZ",
    "érythrée": "ER", "eritrea": "ER",
    "soudan du sud": "SS", "south sudan": "SS",
    "seychelles": "SC",
    "comores": "KM", "comoros": "KM",
    "maurice": "MU", "mauritius": "MU",
    "madagascar": "MG",
    # SUD
    "afrique du sud": "ZA", "south africa": "ZA",
    "mozambique": "MZ",
    "zimbabwe": "ZW",
    "zambie": "ZM", "zambia": "ZM",
    "malawi": "MW",
    "botswana": "BW",
    "namibie": "NA", "namibia": "NA",
    "lesotho": "LS",
    "eswatini": "SZ", "swaziland": "SZ",
    "angola": "AO",
}

REGION_BY_CODE: dict[str, str] = {
    "MA":"NORD","DZ":"NORD","TN":"NORD","LY":"NORD","EG":"NORD","MR":"NORD","SD":"NORD",
    "SN":"OUEST","ML":"OUEST","GN":"OUEST","GW":"OUEST","SL":"OUEST","LR":"OUEST",
    "CI":"OUEST","GH":"OUEST","TG":"OUEST","BJ":"OUEST","NE":"OUEST","BF":"OUEST",
    "NG":"OUEST","GM":"OUEST","CV":"OUEST",
    "CM":"CENTRE","CF":"CENTRE","CG":"CENTRE","CD":"CENTRE","GA":"CENTRE",
    "GQ":"CENTRE","BI":"CENTRE","RW":"CENTRE","TD":"CENTRE",
    "ET":"EST","SO":"EST","DJ":"EST","KE":"EST","UG":"EST","TZ":"EST",
    "ER":"EST","SS":"EST","SC":"EST","KM":"EST","MU":"EST","MG":"EST",
    "ZA":"SUD","MZ":"SUD","ZW":"SUD","ZM":"SUD","MW":"SUD","BW":"SUD",
    "NA":"SUD","LS":"SUD","SZ":"SUD","AO":"SUD",
}

COUNTRY_NAMES_FR: dict[str, str] = {
    "MA":"Maroc","DZ":"Algérie","TN":"Tunisie","LY":"Libye","EG":"Égypte",
    "MR":"Mauritanie","SD":"Soudan",
    "SN":"Sénégal","ML":"Mali","GN":"Guinée","GW":"Guinée-Bissau",
    "SL":"Sierra Leone","LR":"Liberia","CI":"Côte d'Ivoire","GH":"Ghana",
    "TG":"Togo","BJ":"Bénin","NE":"Niger","BF":"Burkina Faso","NG":"Nigeria",
    "GM":"Gambie","CV":"Cap-Vert",
    "CM":"Cameroun","CF":"Centrafrique","CG":"Congo","CD":"RD Congo",
    "GA":"Gabon","GQ":"Guinée Équatoriale","BI":"Burundi","RW":"Rwanda","TD":"Tchad",
    "ET":"Éthiopie","SO":"Somalie","DJ":"Djibouti","KE":"Kenya","UG":"Ouganda",
    "TZ":"Tanzanie","ER":"Érythrée","SS":"Soudan du Sud","SC":"Seychelles",
    "KM":"Comores","MU":"Maurice","MG":"Madagascar",
    "ZA":"Afrique du Sud","MZ":"Mozambique","ZW":"Zimbabwe","ZM":"Zambie",
    "MW":"Malawi","BW":"Botswana","NA":"Namibie","LS":"Lesotho","SZ":"Eswatini",
    "AO":"Angola",
}

COUNTRY_NAMES_EN: dict[str, str] = {
    "MA":"Morocco","DZ":"Algeria","TN":"Tunisia","LY":"Libya","EG":"Egypt",
    "MR":"Mauritania","SD":"Sudan",
    "SN":"Senegal","ML":"Mali","GN":"Guinea","GW":"Guinea-Bissau",
    "SL":"Sierra Leone","LR":"Liberia","CI":"Ivory Coast","GH":"Ghana",
    "TG":"Togo","BJ":"Benin","NE":"Niger","BF":"Burkina Faso","NG":"Nigeria",
    "GM":"Gambia","CV":"Cape Verde",
    "CM":"Cameroon","CF":"Central African Republic","CG":"Republic of Congo",
    "CD":"DR Congo","GA":"Gabon","GQ":"Equatorial Guinea","BI":"Burundi",
    "RW":"Rwanda","TD":"Chad",
    "ET":"Ethiopia","SO":"Somalia","DJ":"Djibouti","KE":"Kenya","UG":"Uganda",
    "TZ":"Tanzania","ER":"Eritrea","SS":"South Sudan","SC":"Seychelles",
    "KM":"Comoros","MU":"Mauritius","MG":"Madagascar",
    "ZA":"South Africa","MZ":"Mozambique","ZW":"Zimbabwe","ZM":"Zambia",
    "MW":"Malawi","BW":"Botswana","NA":"Namibia","LS":"Lesotho","SZ":"Eswatini",
    "AO":"Angola",
}

# Mots-clés pour classifier le thème d'une recommandation
THEME_KEYWORDS: dict[str, list[str]] = {
    "JURIDIQUE":      ["loi", "constitution", "code électoral", "juridique", "légal",
                       "législat", "cadre légal", "electoral law", "legal"],
    "ADMINISTRATION": ["commission", "ceni", "cei", "cne", "organe", "gestion",
                       "logistique", "fichier électoral", "liste électorale",
                       "administration", "bureau"],
    "ELECTEURS":      ["électeurs", "inscription", "enrôlement", "cartes",
                       "biométrique", "voters", "registration"],
    "CAMPAGNE":       ["campagne", "candidats", "financement", "partis",
                       "campaign", "candidates"],
    "MEDIAS":         ["médias", "presse", "radio", "télévision", "réseaux sociaux",
                       "information", "media"],
    "RESULTATS":      ["résultats", "dépouillement", "compilation", "proclamation",
                       "contentieux", "results", "tabulation"],
    "INCLUSION":      ["femmes", "jeunes", "genre", "handicap", "inclusion",
                       "minorities", "women", "youth"],
    "SECURITE":       ["sécurité", "violence", "intimidation", "forces de l'ordre",
                       "security"],
    "CIVISME":        ["civisme", "éducation civique", "culture démocratique",
                       "civic", "voter education"],
}


# ═════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def resolve_country(name: str) -> Optional[str]:
    """Nom de pays (FR/EN) → code ISO.

    Priorité : correspondance exacte → correspondance partielle (plus longue d'abord,
    pour éviter que "niger" matche "nigeria" ou "guinée" matche "guinée-bissau").
    """
    key = name.lower().strip()
    if not key:
        return None
    # 1. Exact match
    if key in COUNTRY_CODES:
        return COUNTRY_CODES[key]
    # 2. Substring match — trier par longueur décroissante pour éviter les faux positifs
    for country_name, code in sorted(COUNTRY_CODES.items(), key=lambda x: len(x[0]), reverse=True):
        if country_name in key or key in country_name:
            return code
    return None


def extract_country_from_title(title: str) -> str:
    """Extrait le nom de pays depuis un titre de rapport AU.

    Exemples observés :
      "Rapport … – Législatives, Madagascar"
      "Rapport … – Législatives 29 Avril 2024, Togo"
      "AUEOM Election Report: Republic of South Africa"
    """
    # Pattern 1 : dernier segment après virgule (ex: ", Madagascar")
    m = re.search(r',\s*([^,\d][^,]{2,50})$', title.strip())
    if m:
        candidate = re.sub(r'\d+', '', m.group(1)).strip(" -–")
        if candidate and len(candidate) >= 3:
            return candidate

    # Pattern 2 : après ":" en fin de titre (ex: ": Republic of South Africa")
    m = re.search(r':\s*(.{3,60})$', title.strip())
    if m:
        return m.group(1).strip()

    # Pattern 3 : pays connu dans le titre (plus long match en premier)
    title_lower = title.lower()
    for name in sorted(COUNTRY_CODES.keys(), key=len, reverse=True):
        if name in title_lower:
            return name.title()

    return ""


def detect_theme(text: str) -> str:
    """Déduit le thème d'une recommandation par mots-clés."""
    text_lower = text.lower()
    for theme, keywords in THEME_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return theme
    return "ADMINISTRATION"


def detect_mission_type(title: str) -> str:
    """Déduit le type de mission depuis le titre."""
    t = title.lower()
    if any(w in t for w in ["assistance", "appui technique"]):
        return "ASSISTANCE"
    if any(w in t for w in ["revue", "review", "technique"]):
        return "REVUE_TECHNIQUE"
    return "OBSERVATION"


def parse_iso_date(raw: str) -> Optional[str]:
    """Extrait YYYY-MM-DD depuis une chaîne."""
    if not raw:
        return None
    # Déjà en ISO (depuis l'attribut content du site AU)
    m = re.match(r'(\d{4}-\d{2}-\d{2})', raw)
    if m:
        return m.group(1)
    return None


# ═════════════════════════════════════════════════════════════════════════════
# SCRAPING
# ═════════════════════════════════════════════════════════════════════════════

def scrape_listing_page(url: str) -> tuple[list[dict], Optional[str]]:
    """Scrape une page de listing. Retourne (items, url_page_suivante)."""
    log.info(f"Page: {url}")
    resp = HTTP.get(url, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")

    items = []
    # Structure réelle : <li class="views-row …">
    for row in soup.select("li.views-row"):
        link = row.select_one(".views-field-field-short-title a")
        if not link:
            continue

        title = link.get_text(strip=True)
        href  = link.get("href", "")
        if not href or not title:
            continue

        url_detail = href if href.startswith("http") else AU_BASE_URL + href

        # Date : attribut ISO dans content="2024-07-10T03:00:00+03:00"
        date_el  = row.select_one(".date-display-single")
        pub_date = ""
        if date_el:
            raw = date_el.get("content", date_el.get_text(strip=True))
            pub_date = raw[:10]  # YYYY-MM-DD

        country_raw  = extract_country_from_title(title)
        country_code = resolve_country(country_raw) if country_raw else None

        items.append({
            "title":        title,
            "url":          url_detail,
            "pub_date":     pub_date,
            "country_raw":  country_raw,
            "country_code": country_code,  # peut être affiné après scrape du full_title
        })

    # Pagination : <li class="pager-next"><a href="?page=N">
    next_url  = None
    next_link = soup.select_one(".pager-next a")
    if next_link:
        href = next_link.get("href", "")
        next_url = href if href.startswith("http") else AU_BASE_URL + href

    return items, next_url


def scrape_report_detail(url: str) -> dict:
    """Scrape la page de détail d'un rapport. Retourne {title, pdf_url, mission_type}."""
    try:
        resp = HTTP.get(url, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        title_el = soup.find("h1")
        title    = title_el.get_text(strip=True) if title_el else ""

        # Lien PDF
        pdf_url = None
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if ".pdf" in href.lower():
                pdf_url = href if href.startswith("http") else AU_BASE_URL + href
                break

        # Extraire le pays depuis le full_title (plus complet que le titre de listing)
        country_raw_full  = extract_country_from_title(title)
        country_code_full = resolve_country(country_raw_full) if country_raw_full else None

        return {
            "full_title":        title,
            "pdf_url":           pdf_url,
            "mission_type":      detect_mission_type(title),
            "country_raw_full":  country_raw_full,
            "country_code_full": country_code_full,
        }
    except Exception as e:
        log.warning(f"  Détail ignoré ({url}): {e}")
        return {}


def extract_recommendations_from_pdf(pdf_url: str) -> list[str]:
    """Télécharge un PDF et retourne la liste des textes de recommandations."""
    try:
        import pdfplumber
    except ImportError:
        log.warning("pdfplumber non installé — pip install pdfplumber")
        return []

    try:
        log.info(f"  PDF: {pdf_url}")
        resp = HTTP.get(pdf_url, timeout=60)
        resp.raise_for_status()

        with pdfplumber.open(io.BytesIO(resp.content)) as pdf:
            full_text = "\n".join(p.extract_text() or "" for p in pdf.pages)

        recs = parse_recommendations_text(full_text)
        log.info(f"  → {len(recs)} recommandations extraites")
        return recs
    except Exception as e:
        log.warning(f"  PDF non traité: {e}")
        return []


def parse_recommendations_text(text: str) -> list[str]:
    """Extrait les recommandations d'un texte de rapport PDF."""
    # Cherche la section RECOMMANDATIONS
    section_pattern = re.compile(
        r"(?:RECOMMANDATIONS?|RECOMMENDATIONS?)\s*\n(.*?)(?=\n[A-Z]{4,}|\Z)",
        re.DOTALL | re.IGNORECASE,
    )
    sections = section_pattern.findall(text)

    recs = []
    if sections:
        for section in sections:
            # Sépare les items numérotés (1. 2. ou • ou -)
            parts = re.split(r"\n\s*(?:\d+[\.\)]|[•\-])\s+", section)
            for part in parts:
                part = part.strip()
                if len(part) > 40:
                    recs.append(part)
    else:
        # Fallback : lignes contenant "recommand" ou verbes prescriptifs
        for m in re.finditer(
            r"(?:^|\n)\s*(?:\d+[\.\)]|[•\-])\s+(.{30,400})",
            text,
            re.MULTILINE,
        ):
            item = m.group(1).strip()
            if len(item) > 30:
                recs.append(item)

    return recs[:50]


def scrape_all(limit: Optional[int] = None) -> list[dict]:
    """Scrape toutes les pages du site AU et retourne les données brutes."""
    all_items = []
    url  = AU_REPORTS_URL
    page = 1

    while url:
        page_items, next_url = scrape_listing_page(url)
        log.info(f"  Page {page}: {len(page_items)} rapports")

        for item in page_items:
            if limit and len(all_items) >= limit:
                break

            log.info(f"  Détail: {item['title'][:70]}")
            detail = scrape_report_detail(item["url"])
            item.update(detail)

            # Fallback : si country_code absent du titre de listing, utiliser le full_title
            if not item.get("country_code") and item.get("country_code_full"):
                item["country_code"] = item["country_code_full"]
                item["country_raw"]  = item["country_raw_full"]

            # Recommandations depuis le PDF
            if item.get("pdf_url"):
                item["rec_texts"] = extract_recommendations_from_pdf(item["pdf_url"])
            else:
                item["rec_texts"] = []

            all_items.append(item)
            time.sleep(1)

        if limit and len(all_items) >= limit:
            break

        url = next_url
        page += 1
        if url:
            time.sleep(2)

    log.info(f"Scraping terminé : {len(all_items)} rapports")
    return all_items


# ═════════════════════════════════════════════════════════════════════════════
# IMPORT API  (ordre : Country → Institution → Mission → Recommendation)
# ═════════════════════════════════════════════════════════════════════════════

def authenticate() -> str:
    log.info("Authentification…")
    resp = requests.post(
        f"{ELDA_API_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    resp.raise_for_status()
    token = resp.json()["accessToken"]
    log.info("Authentifié")
    return token


def api_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ── 1. Country ────────────────────────────────────────────────────────────────

def import_country(token: str, code: str, dry_run: bool = False) -> bool:
    """Insère un pays s'il n'existe pas. Retourne True si présent/créé."""
    # Vérifier existence
    r = requests.get(f"{ELDA_API_URL}/countries/{code}", headers=api_headers(token))
    if r.status_code == 200:
        return True

    payload = CountryPayload(
        code        = code,
        region      = REGION_BY_CODE.get(code, "OUEST"),
        sourceLang  = "fr",
        translations= {
            "fr": COUNTRY_NAMES_FR.get(code, code),
            "en": COUNTRY_NAMES_EN.get(code, code),
        },
    )

    if dry_run:
        log.info(f"  [DRY] Country: {code} – {COUNTRY_NAMES_FR.get(code)}")
        return True

    r = requests.post(f"{ELDA_API_URL}/countries", json=payload.to_json(), headers=api_headers(token))
    if r.status_code in (200, 201):
        log.info(f"  ✓ Country {code}")
        return True
    log.warning(f"  ✗ Country {code}: {r.status_code} {r.text[:120]}")
    return False


# ── 2. Institution ────────────────────────────────────────────────────────────

def import_institution(token: str, dry_run: bool = False) -> Optional[str]:
    """Crée l'institution AUEOM (si absente). Retourne son UUID."""
    # Chercher si elle existe déjà
    r = requests.get(f"{ELDA_API_URL}/institutions", headers=api_headers(token))
    if r.status_code == 200:
        institutions = r.json() if isinstance(r.json(), list) else r.json().get("content", [])
        for inst in institutions:
            name = inst.get("name", "")
            if "AUEOM" in name or "Union Africaine" in name or "African Union" in name:
                log.info(f"  Institution AUEOM déjà présente (id: {inst.get('id')})")
                return inst.get("id")

    payload = InstitutionPayload(
        name        = "Mission d'Observation Electorale de l'Union Africaine (AUEOM)",
        category    = "COMMISSION_ELECTORALE",
        sourceLang  = "fr",
        country     = None,
        translations= {
            "fr": "Mission d'Observation Electorale de l'Union Africaine",
            "en": "African Union Electoral Observation Mission",
        },
    )

    if dry_run:
        log.info("  [DRY] Institution: AUEOM")
        return "dry-institution-id"

    r = requests.post(f"{ELDA_API_URL}/institutions", json=payload.to_json(), headers=api_headers(token))
    if r.status_code in (200, 201):
        inst_id = r.json().get("id")
        log.info(f"  ✓ Institution AUEOM créée (id: {inst_id})")
        return inst_id
    log.warning(f"  ✗ Institution: {r.status_code} {r.text[:120]}")
    return None


# ── 3. Mission ────────────────────────────────────────────────────────────────

def import_mission(
    token: str,
    report: dict,
    idx: int,
    institution_id: Optional[str],
    dry_run: bool = False,
) -> Optional[str]:
    """Crée une mission. Retourne son UUID."""
    title        = report.get("full_title") or report.get("title", "")
    country_code = report.get("country_code")
    mission_type = report.get("mission_type", "OBSERVATION")
    start_date   = parse_iso_date(report.get("pub_date", ""))
    year         = start_date[:4] if start_date else "0000"

    code = f"MIS-{year}-{idx:04d}"

    payload = MissionPayload(
        code          = code,
        type          = mission_type,
        country       = country_code,
        startDate     = start_date,
        institutionId = institution_id,
        sourceLang    = "fr",
        translations  = {
            "fr": {"summary": title},
        },
    )

    if dry_run:
        log.info(f"  [DRY] Mission: {code} | {country_code} | {title[:60]}")
        return f"dry-mission-{idx}"

    r = requests.post(f"{ELDA_API_URL}/missions", json=payload.to_json(), headers=api_headers(token))
    if r.status_code in (200, 201):
        mission_id = r.json().get("id")
        log.info(f"  ✓ Mission {code} (id: {mission_id})")
        return mission_id
    log.warning(f"  ✗ Mission {code}: {r.status_code} {r.text[:150]}")
    return None


# ── 4. Recommendation ────────────────────────────────────────────────────────

def import_recommendation(
    token: str,
    text: str,
    mission_idx: int,
    rec_idx: int,
    country_code: Optional[str],
    mission_id: Optional[str],
    institution_id: Optional[str],
    issued_date: Optional[str],
    dry_run: bool = False,
) -> bool:
    """Crée une recommandation."""
    if not text or len(text) < 20:
        return False

    # title = premiers 200 chars (tronqué au dernier espace)
    if len(text) > 200:
        title = text[:200].rsplit(" ", 1)[0] + "…"
    else:
        title = text

    # summary = premiers 500 chars
    summary = text[:500]

    code  = f"REC-{mission_idx:04d}-{rec_idx:03d}"
    theme = detect_theme(text)

    payload = RecommendationPayload(
        code          = code,
        theme         = theme,
        statut        = "INCONNU",
        priorite      = "MOYENNE",
        visibilite    = "BROUILLON",
        sourceLang    = "fr",
        codeCountry   = country_code,
        missionId     = mission_id,
        institutionId = institution_id,
        issuedDate    = issued_date,
        translations  = {
            "fr": {
                "title":   title,
                "summary": summary,
                "body":    text,
            }
        },
    )

    if dry_run:
        log.info(f"    [DRY] Reco {code} [{theme}]: {title[:60]}")
        return True

    r = requests.post(
        f"{ELDA_API_URL}/recommendations",
        json=payload.to_json(),
        headers=api_headers(token),
    )
    if r.status_code in (200, 201):
        log.info(f"    ✓ Reco {code}")
        return True
    log.warning(f"    ✗ Reco {code}: {r.status_code} {r.text[:120]}")
    return False


# ═════════════════════════════════════════════════════════════════════════════
# ORCHESTRATION
# ═════════════════════════════════════════════════════════════════════════════

def run_import(data: list[dict], dry_run: bool = False):
    """Importe dans l'ordre : Country → Institution → Mission → Recommendation."""
    token = authenticate()

    # ── 1. Countries ─────────────────────────────────────────────────────────
    log.info("\n=== 1/4 COUNTRIES ===")
    seen_countries: set[str] = set()
    for report in data:
        code = report.get("country_code")
        if code and code not in seen_countries:
            import_country(token, code, dry_run)
            seen_countries.add(code)
            time.sleep(0.3)

    # ── 2. Institution (AUEOM — une seule) ───────────────────────────────────
    log.info("\n=== 2/4 INSTITUTION ===")
    institution_id = import_institution(token, dry_run)

    # ── 3. Missions + 4. Recommendations ─────────────────────────────────────
    log.info("\n=== 3/4 MISSIONS  |  4/4 RECOMMENDATIONS ===")
    total_missions = 0
    total_recs     = 0

    for i, report in enumerate(data, start=1):
        log.info(f"\n[{i}/{len(data)}] {report.get('title', '')[:70]}")

        # Mission
        mission_id = import_mission(token, report, i, institution_id, dry_run)
        if mission_id:
            total_missions += 1

        # Recommendations de cette mission
        issued_date = parse_iso_date(report.get("pub_date", ""))
        for j, text in enumerate(report.get("rec_texts", []), start=1):
            ok = import_recommendation(
                token         = token,
                text          = text,
                mission_idx   = i,
                rec_idx       = j,
                country_code  = report.get("country_code"),
                mission_id    = mission_id,
                institution_id= institution_id,
                issued_date   = issued_date,
                dry_run       = dry_run,
            )
            if ok:
                total_recs += 1
            time.sleep(0.2)

        time.sleep(0.5)

    # ── Résumé ────────────────────────────────────────────────────────────────
    log.info(f"\n{'='*50}")
    log.info(f"{'[DRY-RUN] ' if dry_run else ''}Import terminé")
    log.info(f"  Pays         : {len(seen_countries)}")
    log.info(f"  Institutions : 1 (AUEOM)")
    log.info(f"  Missions     : {total_missions}")
    log.info(f"  Recommandations : {total_recs}")
    log.info(f"{'='*50}")


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Import AU election reports -> ELDA Africa")
    parser.add_argument("--scrape",    action="store_true", help="Scraper le site AU")
    parser.add_argument("--import",    action="store_true", dest="do_import", help="Importer vers l'API")
    parser.add_argument("--limit",     type=int, default=None, help="Limiter a N rapports")
    parser.add_argument("--dry-run",   action="store_true", help="Simuler sans appeler l'API")
    parser.add_argument("--local",     action="store_true", help="Utiliser l'API locale (localhost:5600)")
    parser.add_argument("--prod",      action="store_true", help="Utiliser l'API de production")
    args = parser.parse_args()

    global ELDA_API_URL
    if args.prod:
        ELDA_API_URL = API_PROD
        log.info(f"API cible : {ELDA_API_URL} (production)")
    else:
        ELDA_API_URL = API_LOCAL
        log.info(f"API cible : {ELDA_API_URL} (local)")

    if not args.scrape and not args.do_import:
        parser.print_help()
        sys.exit(1)

    if args.scrape:
        log.info("=== SCRAPING ===")
        data = scrape_all(limit=args.limit)
        OUTPUT_FILE.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        log.info(f"Sauvegardé dans {OUTPUT_FILE}")

    if args.do_import:
        log.info("=== IMPORT ===")
        if not OUTPUT_FILE.exists():
            log.error(f"{OUTPUT_FILE} introuvable — lancez d'abord --scrape")
            sys.exit(1)
        data = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
        log.info(f"{len(data)} rapports à importer")
        run_import(data, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
