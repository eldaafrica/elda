import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "en" | "fr";

type Dict = Record<string, string>;

const en: Dict = {
  // Brand
  "brand.name": "ELDA Africa",
  "brand.tagline": "Electoral Database Africa",
  "brand.full": "Electoral Database Africa",

  // Status (badge labels)
  "status.new": "New",
  "status.in_progress": "In progress",
  "status.partial": "Partially implemented",
  "status.implemented": "Implemented",
  "status.not_implemented": "Not implemented",
  "status.unknown": "Unknown",

  // Nav
  "nav.home": "Home",
  "nav.recommendations": "Recommendations",
  "nav.missions": "Missions",
  "nav.countries": "Countries",
  "nav.insights": "Insights",
  "nav.login": "Sign in",
  "nav.about": "About",
  "nav.signin": "Staff sign in",
  "nav.dashboard": "Open dashboard",

  // Home
  "home.eyebrow": "Pan-African electoral knowledge platform",
  "home.title": "A living record of electoral recommendations across Africa.",
  "home.lede":
    "ELDA AFRICA documents, tracks and shares the recommendations issued by electoral observation and assistance missions on the continent — to inform reform, accountability and democratic learning.",
  "home.cta.explore": "Explore recommendations",
  "home.cta.about": "About this database",
  "home.stats.recos": "Published recommendations",
  "home.stats.missions": "Documented missions",
  "home.stats.countries": "African countries",
  "home.stats.implemented": "Fully implemented",
  "home.featured.title": "Featured recommendations",
  "home.featured.lede": "A selection of recent records published by ELDA AFRICA editors.",
  "home.themes.title": "Browse by theme",
  "home.themes.lede":
    "Recommendations are organised across the core dimensions of electoral integrity.",
  "home.map.title": "Continental coverage",
  "home.map.lede":
    "Distribution of published records across African countries and electoral cycles.",

  // Recommendations (public)
  "recos.title": "Recommendations",
  "recos.lede":
    "Search and filter the public catalogue of electoral recommendations published by ELDA AFRICA.",
  "recos.search": "Search recommendations, missions, institutions…",
  "recos.filter.country": "Country",
  "recos.filter.theme": "Theme",
  "recos.filter.status": "Status",
  "recos.filter.cycle": "Electoral cycle",
  "recos.filter.all": "All",
  "recos.results": "results",
  "recos.empty": "No recommendation matches your filters.",
  "recos.reset": "Reset filters",
  "recos.deleteConfirm": "Delete this recommendation?",
  "recos.deleteTitle": "Delete recommendation",
  "recos.deleteBody": "This action cannot be undone.",

  // Detail
  "detail.back": "Back to recommendations",
  "detail.mission": "Source mission",
  "detail.institution": "Addressed to",
  "detail.theme": "Theme",
  "detail.status": "Implementation status",
  "detail.priority": "Priority",
  "detail.issued": "Issued",
  "detail.lastUpdate": "Last update",
  "detail.followups": "Follow-up history",
  "detail.evidence": "Source documents & evidence",
  "detail.share": "Share",

  // Missions (public)
  "missions.title": "Observation & assistance missions",
  "missions.lede":
    "The continental footprint of the ELDA AFRICA's electoral missions, with their main recommendations.",

  // About
  "about.title": "About the database",
  "about.lede":
    "The ELDA AFRICA electoral recommendations database is an institutional platform that identifies, classifies and tracks recommendations issued as part of election observation and assistance activities across Africa.",

  // Priority
  "priority.high": "HIGH",
  "priority.medium": "MEDIUM",
  "priority.low": "LOW",

  // Themes
  "theme.legal": "Legal framework",
  "theme.admin": "Electoral administration",
  "theme.voter": "Voter registration",
  "theme.campaign": "Campaign & finance",
  "theme.media": "Media & information",
  "theme.results": "Results & disputes",
  "theme.inclusion": "Inclusion & gender",
  "theme.security": "Security & integrity",
  "theme.civic": "Civic & voter education",

  // Footer
  "footer.tagline":
    "Strengthening democratic processes in Africa through evidence, dialogue and institutional learning.",
  "footer.contact": "Contact",
  "footer.resources": "Resources",
  "footer.legal": "Legal",
  "footer.terms": "Terms of use",
  "footer.privacy": "Privacy",
  "footer.openData": "Open data policy",
  "footer.copy": "© {year} ELDA Africa. All rights reserved.",

  // Dashboard - nav
  "dash.title": "ELDA Africa workspace",
  "dash.nav.overview": "Overview",
  "dash.nav.recommendations": "Recommendations",
  "dash.nav.missions": "Missions",
  "dash.nav.country": "Countries",
  "dash.nav.followups": "Follow-ups",
  "dash.nav.institutions": "Institutions",
  "dash.nav.publications": "Publications",
  "dash.nav.users": "Users",
  "dash.nav.settings": "Settings",

  "dash.welcome": "Welcome back",
  "dash.kpi.total": "Total recommendations",
  "dash.kpi.published": "Published",
  "dash.kpi.pending": "Pending review",
  "dash.kpi.missions": "Active missions",

  "dash.charts.bystatus": "By implementation status",
  "dash.charts.byTheme": "By theme",
  "dash.charts.trend": "New recommendations over time",
  "dash.recent": "Recent activity",

  // Dashboard - actions
  "dash.actions.new": "New recommendation",
  "dash.actions.country.new": "Add country",
  "dash.actions.export": "Export",
  "dash.actions.newMission": "New mission",
  "dash.actions.newInstitution": "New institution",
  "dash.actions.newFollowup": "New follow-up",

  // Dashboard - table headers
  "dash.table.code": "Code",
  "dash.table.title": "Title",
  "dash.table.country": "Country",
  "dash.table.theme": "Theme",
  "dash.table.status": "Status",
  "dash.table.priority": "Priority",
  "dash.table.visibility": "Visibility",
  "dash.table.updated": "Updated",
  "dash.table.actions": "Actions",
  "dash.table.publication": "Publication",
  "dash.table.member": "Member",
  "dash.table.email": "Email",
  "dash.table.role": "Role",
  "dash.table.region": "Region",

  // Dashboard - visibility
  "dash.vis.public": "PUBLIC",
  "dash.vis.internal": "INTERNAL",
  "dash.vis.draft": "DRAFT",
  "dash.vis.publish": "Publish",
  "dash.vis.setInternal": "Set as Internal",
  "dash.vis.setDraft": "Set as Draft",

  // Dashboard - roles
  "dash.role.admin": "Administrator",
  "dash.role.editor": "Editor",
  "dash.role.viewer": "Internal viewer",

  // Dashboard - Users
  "dash.users.title": "Team & access",
  "dash.users.lede": "Manage workspace members and their roles.",
  "dash.users.invite": "Invite member",
  "dash.users.deleteConfirm": "Delete this user?",
  "dash.users.deleteTitle": "Delete user",
  "dash.users.deleteBody": "This action cannot be undone.",

  // Dashboard - Countries
  "dash.countries.deleteConfirm": "Delete this country?",
  "dash.countries.deleteTitle": "Delete country",
  "dash.countries.deleteBody": "This action cannot be undone.",

  // Dashboard - Institutions
  "dash.institutions.deleteConfirm": "Delete this institution?",
  "dash.institutions.deleteTitle": "Delete institution",
  "dash.institutions.deleteBody": "This action cannot be undone.",

  // Dashboard - Missions
  "dash.missions.lede": "All observation and assistance missions captured in the database.",
  "dash.missions.deleteConfirm": "Delete this mission?",
  "dash.missions.deleteTitle": "Delete mission",
  "dash.missions.deleteBody": "This action cannot be undone.",

  // Dashboard - Followups
  "dash.followups.lede": "Latest dated updates against tracked recommendations.",
  "dash.followups.deleteConfirm": "Delete this follow-up?",
  "dash.followups.deleteTitle": "Delete follow-up",
  "dash.followups.deleteBody": "This action cannot be undone.",
  "dash.followups.firstCta": "Create the first follow-up",

  // Dashboard - Publications
  "dash.publications.lede": "Control what is visible on the public portal.",

  // Common UI
  "common.loading": "Loading…",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.create": "Create",
  "common.update": "Update",
  "common.saving": "Saving…",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.previous": "Previous",
  "common.next": "Next",
  "common.page": "Page",
  "common.of": "of",
  "common.more": "More",
  "common.prev": "Prev",

  // User status
  "user.status.active": "Active",
  "user.status.disabled": "Disabled",
  "user.action.enable": "Enable",
  "user.action.disable": "Disable",
  "user.action.invite": "Invite",
  "user.action.update": "Update",

  // Actions (publish)
  "action.publish": "Publish",
  "action.unpublish": "Unpublish",
  "action.firstFollowup": "Create the first follow-up",

  // Filters
  "filter.all": "All",
  "filter.allRoles": "All roles",
  "filter.allThemes": "All themes",
  "filter.allStatuses": "All statuses",
  "filter.allRegions": "All regions",
  "filter.allTypes": "All types",
  "filter.allCategories": "All categories",
  "filter.allRecos": "All recommendations",
  "filter.byReco": "Filter by recommendation",

  // Search placeholders
  "search.user": "Search user…",
  "search.country": "Search country…",
  "search.mission": "Search by code or cycle…",
  "search.institution": "Filter by country code (ML, SN…)",

  // Empty states
  "empty.users": "No users found.",
  "empty.countries": "No countries found.",
  "empty.institutions": "No institutions found.",
  "empty.missions": "No missions found.",
  "empty.followups": "No follow-ups found.",

  // Loading states
  "loading.users": "Loading users…",
  "loading.generic": "Loading…",
  "loading.noCountries": "No countries",
  "loading.noMissions": "No missions",
  "loading.noInstitutions": "No institutions",

  // Regions
  "region.OUEST": "West Africa",
  "region.EST": "East Africa",
  "region.SUD": "Southern Africa",
  "region.NORD": "North Africa",
  "region.CENTRE": "Central Africa",

  // Institution categories
  "category.COMMISSION_ELECTORALE": "Electoral commission",
  "category.PARLEMENT": "Parliament",
  "category.POUVOIR_JUDICIAIRE": "Judiciary",
  "category.GOUVERNEMENT": "Government",
  "category.SOCIETE_CIVILE": "Civil society",

  // Mission types
  "missionType.OBSERVATION": "Observation",
  "missionType.ASSISTANCE": "Assistance",
  "missionType.REVUE_TECHNIQUE": "Technical review",

  // Theme labels (for dropdowns)
  "theme.JURIDIQUE": "Legal framework",
  "theme.ADMINISTRATION": "Electoral administration",
  "theme.ELECTEURS": "Voter registration",
  "theme.CAMPAGNE": "Campaign & finance",
  "theme.MEDIAS": "Media & information",
  "theme.RESULTATS": "Results & disputes",
  "theme.INCLUSION": "Inclusion & gender",
  "theme.SECURITE": "Security & integrity",
  "theme.CIVISME": "Civic education",

  // Status labels (for dropdowns)
  "statut.NOUVEAU": "New",
  "statut.EN_COURS": "In progress",
  "statut.PARTIEL": "Partially implemented",
  "statut.IMPLEMENTE": "Implemented",
  "statut.NON_IMPLEMENTE": "Not implemented",
  "statut.INCONNU": "Unknown",

  // Priority labels
  "priorite.HAUTE": "High",
  "priorite.MOYENNE": "Medium",
  "priorite.BASSE": "Low",

  // Visibility labels
  "visibilite.PUBLIC": "Public",
  "visibilite.INTERNE": "Internal",
  "visibilite.BROUILLON": "Draft",

  // Role labels (for dropdowns)
  "role.ADMIN": "Administrator",
  "role.EDITEUR": "Editor",
  "role.LECTEUR": "Viewer",

  // Form titles
  "form.reco.create": "Create recommendation",
  "form.reco.update": "Update recommendation",
  "form.user.create": "Invite user",
  "form.user.update": "Update user",
  "form.country.create": "Add country",
  "form.country.update": "Update country",
  "form.institution.create": "Add institution",
  "form.institution.update": "Update institution",
  "form.mission.create": "Create mission",
  "form.mission.update": "Update mission",
  "form.followup.create": "New follow-up",
  "form.followup.update": "Edit follow-up",
  "form.followup.recoRequired": "Please select a recommendation.",

  // Form fields
  "field.code": "Code",
  "field.name": "Name",
  "field.email": "Email",
  "field.country": "Country",
  "field.countryCode": "Country code",
  "field.password": "Temporary password",
  "field.role": "Role",
  "field.region": "Region",
  "field.category": "Category",
  "field.type": "Type",
  "field.cycle": "Cycle",
  "field.startDate": "Start date",
  "field.endDate": "End date",
  "field.leadObserver": "Lead observer",
  "field.recommendation": "Recommendation",
  "field.institution": "Institution",
  "field.mission": "Mission",
  "field.theme": "Theme",
  "field.priority": "Priority",
  "field.visibility": "Visibility",
  "field.sourceLang": "Source language",
  "form.addTranslation": "Add translation",
  "form.translations": "Translations",
  "field.nameFr": "Name (French)",
  "field.nameEn": "Name (English)",
  "field.titleEn": "Title (English)",
  "field.titleFr": "Title (French)",
  "field.summaryEn": "Summary (English)",
  "field.summaryFr": "Summary (French)",
  "field.bodyEn": "Body (English)",
  "field.bodyFr": "Body (French)",
  "field.noteEn": "Note (English)",
  "field.noteFr": "Note (French)",
  "field.author": "Author",
  "field.date": "Date",
  "field.implStatus": "Implementation status",
  "field.selectCountry": "Select country",
  "field.selectMission": "Select mission",
  "field.selectInstitution": "Select institution",
  "field.selectStatus": "Select a status",
  "field.selectCategory": "Select category",
  "field.selectRegion": "Select a region",
  "field.selectRole": "Select role",
  "field.selectUser": "Select user",
  "field.selectType": "Select type",

  // Subtitles
  "dash.subtitle.recos": "{n} records",
  "dash.subtitle.countries": "{n} countries",
  "dash.subtitle.missions": "{n} missions",
  "dash.subtitle.institutions": "{n} institutions",
  "dash.subtitle.followups": "{n} follow-up(s)",
  "dash.subtitle.publications": "{n} publications",

  // Auth / Login
  "auth.title": "Welcome back",
  "auth.subtitle": "Sign in to access your workspace.",
  "auth.login": "Sign in",
  "auth.loggingIn": "Signing in…",
  "auth.password": "Password",
  "auth.forgotPwd": "Forgot password?",
  "auth.forgotPwdInfo": "Password reset coming soon.",
  "auth.loginSuccess": "Login successful",
  "auth.loginError": "Incorrect email or password.",
  "auth.sessionExpired": "Your session has expired. Please sign in again.",
  "auth.sessionExpiredBanner": "Your session has expired. Please sign in again to continue.",
  "auth.terms": "By continuing, you accept our terms of use.",
  "auth.logout": "Sign out",

  // Detail page
  "detail.notFound": "Recommendation not found",
  "detail.noFollowups": "No follow-up on record.",
  "detail.body": "Recommendation",
  "detail.openSource": "Open",
  "detail.country": "Country",

  // Missions public
  "missions.empty": "No missions found.",
  "missions.leadObserver": "Lead observer",
  "missions.viewRecos": "View recommendations",
  "missions.total": "{n} missions documented",

  // Home
  "home.chart.byRegion": "Recommendations per region",

  // About
  "about.purpose.title": "Purpose",
  "about.purpose.body": "This platform brings together, within a single environment, all recommendations issued by ELDA AFRICA's electoral observation and assistance missions, together with their follow-up history, the institutions concerned, and supporting source documents.",
  "about.governance.title": "Governance",
  "about.governance.body": "ELDA AFRICA retains full authority over content management, publication and user administration. The public portal only reflects elements explicitly approved for publication.",
  "about.principles.title": "Key principles",
  "about.principles.1": "Structured documentation of recommendations across the continent",
  "about.principles.2": "Cross-country comparability and thematic analysis",
  "about.principles.3": "Transparent follow-up of implementation over time",
  "about.principles.4": "Controlled publication under ELDA AFRICA's authority",

  // Dashboard extras
  "common.viewAll": "View all",
  "dash.charts.byRegion": "Recommendations by region",
  "dash.export.csv": "Export CSV",
  "dash.export.json": "Export JSON",
  "dash.noData": "No data available",

  // Translation action
  "common.translate": "Translate",
  "field.title": "Title",
  "field.summary": "Summary",
  "field.body": "Content",
  "field.note": "Note",
  "form.translate.title": "Add / edit translation",
  "form.translate.selectLang": "Select a language",
  "form.translate.existing": "Existing translations",
  "form.translate.noLangs": "No languages configured. Add languages in Settings.",
  "form.translate.source": "Source (original)",
  "form.translate.saved": "Translation saved.",

  // Settings - languages
  "settings.languages.title": "Supported languages",
  "settings.languages.description": "Languages available for translation across all entities.",
  "settings.languages.add": "Add a language",
  "settings.languages.code": "ISO code (e.g. pt, ar, sw)",
  "settings.languages.nameEn": "Name in English",
  "settings.languages.nameFr": "Name in French",
  "settings.languages.empty": "No additional languages yet.",
  "settings.languages.remove": "Remove",
};

const fr: Dict = {
  // Brand
  "brand.name": "ELDA Africa",
  "brand.tagline": "Base de données électorale africaine",
  "brand.full": "Electoral Database Africa",

  // Status (badge labels)
  "status.new": "NOUVEAU",
  "status.in_progress": "EN COURS",
  "status.partial": "PARTIEL",
  "status.implemented": "IMPLEMENTE",
  "status.not_implemented": "NON_IMPLEMENTE",
  "status.unknown": "INCONNU",

  // Nav
  "nav.home": "Accueil",
  "nav.recommendations": "Recommandations",
  "nav.missions": "Missions",
  "nav.countries": "Pays",
  "nav.insights": "Analyses",
  "nav.about": "À propos",
  "nav.login": "Connexion",
  "nav.signin": "Connexion équipe",
  "nav.dashboard": "Ouvrir le tableau de bord",

  // Home
  "home.eyebrow": "Plateforme panafricaine de connaissance électorale",
  "home.title": "Un registre vivant des recommandations électorales en Afrique.",
  "home.lede":
    "L'Union Africaine documente, suit et diffuse les recommandations issues des missions d'observation et d'assistance électorales sur le continent — pour soutenir la réforme, la redevabilité et l'apprentissage démocratique.",
  "home.cta.explore": "Explorer les recommandations",
  "home.cta.about": "À propos de la base",
  "home.stats.recos": "Recommandations publiées",
  "home.stats.missions": "Missions documentées",
  "home.stats.countries": "Pays africains",
  "home.stats.implemented": "Entièrement mises en œuvre",
  "home.featured.title": "Recommandations en vedette",
  "home.featured.lede": "Une sélection de fiches récentes publiées par les éditeurs de l'Union Africaine.",
  "home.themes.title": "Parcourir par thème",
  "home.themes.lede":
    "Les recommandations sont organisées selon les dimensions fondamentales de l'intégrité électorale.",
  "home.map.title": "Couverture continentale",
  "home.map.lede":
    "Distribution des fiches publiées à travers les pays africains et les cycles électoraux.",

  // Recommendations (public)
  "recos.title": "Recommandations",
  "recos.lede":
    "Recherchez et filtrez le catalogue public des recommandations électorales publiées par l'Union Africaine.",
  "recos.search": "Rechercher recommandations, missions, institutions…",
  "recos.filter.country": "Pays",
  "recos.filter.theme": "Thème",
  "recos.filter.status": "Statut",
  "recos.filter.cycle": "Cycle électoral",
  "recos.filter.all": "Tous",
  "recos.results": "résultats",
  "recos.empty": "Aucune recommandation ne correspond à vos filtres.",
  "recos.reset": "Réinitialiser les filtres",
  "recos.deleteConfirm": "Supprimer cette recommandation ?",
  "recos.deleteTitle": "Supprimer la recommandation",
  "recos.deleteBody": "Cette action est irréversible.",

  // Detail
  "detail.back": "Retour aux recommandations",
  "detail.mission": "Mission source",
  "detail.institution": "Adressée à",
  "detail.theme": "Thème",
  "detail.status": "Statut de mise en œuvre",
  "detail.priority": "Priorité",
  "detail.issued": "Émise le",
  "detail.lastUpdate": "Dernière mise à jour",
  "detail.followups": "Historique de suivi",
  "detail.evidence": "Documents sources & preuves",
  "detail.share": "Partager",

  // Missions (public)
  "missions.title": "Missions d'observation & d'assistance",
  "missions.lede":
    "L'empreinte continentale des missions électorales de l'Union Africaine, avec leurs principales recommandations.",

  // About
  "about.title": "À propos de la base de données",
  "about.lede":
    "La base de données des recommandations électorales de l'Union Africaine est une plateforme institutionnelle qui identifie, classe et suit les recommandations émises dans le cadre des activités d'observation et d'assistance électorales en Afrique.",

  // Priority
  "priority.high": "HAUTE",
  "priority.medium": "MOYENNE",
  "priority.low": "FAIBLE",

  // Themes
  "theme.legal": "Cadre juridique",
  "theme.admin": "Administration électorale",
  "theme.voter": "Inscription des électeurs",
  "theme.campaign": "Campagne & financement",
  "theme.media": "Médias & information",
  "theme.results": "Résultats & contentieux",
  "theme.inclusion": "Inclusion & genre",
  "theme.security": "Sécurité & intégrité",
  "theme.civic": "Éducation civique",

  // Footer
  "footer.tagline":
    "Renforcer les processus démocratiques en Afrique par l'evidence, le dialogue et l'apprentissage institutionnel.",
  "footer.contact": "Contact",
  "footer.resources": "Ressources",
  "footer.legal": "Mentions légales",
  "footer.terms": "Conditions d'utilisation",
  "footer.privacy": "Confidentialité",
  "footer.openData": "Politique de données ouvertes",
  "footer.copy": "© {year} ELDA Africa. Tous droits réservés.",

  // Dashboard - nav
  "dash.title": "Espace de travail ELDA Africa",
  "dash.nav.overview": "Vue d'ensemble",
  "dash.nav.recommendations": "Recommandations",
  "dash.nav.missions": "Missions",
  "dash.nav.country": "Pays",
  "dash.nav.followups": "Suivis",
  "dash.nav.institutions": "Institutions",
  "dash.nav.publications": "Publications",
  "dash.nav.users": "Utilisateurs",
  "dash.nav.settings": "Paramètres",

  "dash.welcome": "Bienvenue",
  "dash.kpi.total": "Total recommandations",
  "dash.kpi.published": "Publiées",
  "dash.kpi.pending": "En attente de révision",
  "dash.kpi.missions": "Missions actives",

  "dash.charts.bystatus": "Par statut de mise en œuvre",
  "dash.charts.byTheme": "Par thème",
  "dash.charts.trend": "Nouvelles recommandations dans le temps",
  "dash.recent": "Activité récente",

  // Dashboard - actions
  "dash.actions.new": "Nouvelle recommandation",
  "dash.actions.country.new": "Ajouter un pays",
  "dash.actions.export": "Exporter",
  "dash.actions.newMission": "Nouvelle mission",
  "dash.actions.newInstitution": "Nouvelle institution",
  "dash.actions.newFollowup": "Nouveau suivi",

  // Dashboard - table headers
  "dash.table.code": "Code",
  "dash.table.title": "Titre",
  "dash.table.country": "Pays",
  "dash.table.theme": "Thème",
  "dash.table.status": "Statut",
  "dash.table.priority": "Priorité",
  "dash.table.visibility": "Visibilité",
  "dash.table.updated": "Mise à jour",
  "dash.table.actions": "Actions",
  "dash.table.publication": "Publication",
  "dash.table.member": "Membre",
  "dash.table.email": "Email",
  "dash.table.role": "Rôle",
  "dash.table.region": "Région",

  // Dashboard - visibility
  "dash.vis.public": "PUBLIC",
  "dash.vis.internal": "INTERNE",
  "dash.vis.draft": "BROUILLON",
  "dash.vis.publish": "Publier",
  "dash.vis.setInternal": "Passer en interne",
  "dash.vis.setDraft": "Repasser en brouillon",

  // Dashboard - roles
  "dash.role.admin": "Administrateur",
  "dash.role.editor": "Éditeur",
  "dash.role.viewer": "Lecteur interne",

  // Dashboard - Users
  "dash.users.title": "Équipe & accès",
  "dash.users.lede": "Gérer les membres de l'espace de travail et leurs rôles.",
  "dash.users.invite": "Inviter un membre",
  "dash.users.deleteConfirm": "Supprimer cet utilisateur ?",
  "dash.users.deleteTitle": "Supprimer l'utilisateur",
  "dash.users.deleteBody": "Cette action est irréversible.",

  // Dashboard - Countries
  "dash.countries.deleteConfirm": "Supprimer ce pays ?",
  "dash.countries.deleteTitle": "Supprimer le pays",
  "dash.countries.deleteBody": "Cette action est irréversible.",

  // Dashboard - Institutions
  "dash.institutions.deleteConfirm": "Supprimer cette institution ?",
  "dash.institutions.deleteTitle": "Supprimer l'institution",
  "dash.institutions.deleteBody": "Cette action est irréversible.",

  // Dashboard - Missions
  "dash.missions.lede": "Toutes les missions d'observation et d'assistance dans la base.",
  "dash.missions.deleteConfirm": "Supprimer cette mission ?",
  "dash.missions.deleteTitle": "Supprimer la mission",
  "dash.missions.deleteBody": "Cette action est irréversible.",

  // Dashboard - Followups
  "dash.followups.lede": "Dernières mises à jour datées sur les recommandations suivies.",
  "dash.followups.deleteConfirm": "Supprimer ce suivi ?",
  "dash.followups.deleteTitle": "Supprimer le suivi",
  "dash.followups.deleteBody": "Cette action est irréversible.",
  "dash.followups.firstCta": "Créer le premier suivi",

  // Dashboard - Publications
  "dash.publications.lede": "Contrôler ce qui est visible sur le portail public.",

  // Common UI
  "common.loading": "Chargement…",
  "common.cancel": "Annuler",
  "common.save": "Enregistrer",
  "common.create": "Créer",
  "common.update": "Mettre à jour",
  "common.saving": "Enregistrement…",
  "common.edit": "Modifier",
  "common.delete": "Supprimer",
  "common.previous": "Précédent",
  "common.next": "Suivant",
  "common.page": "Page",
  "common.of": "sur",
  "common.more": "Plus",
  "common.prev": "Préc.",

  // User status
  "user.status.active": "Actif",
  "user.status.disabled": "Désactivé",
  "user.action.enable": "Activer",
  "user.action.disable": "Désactiver",
  "user.action.invite": "Inviter",
  "user.action.update": "Mettre à jour",

  // Actions (publish)
  "action.publish": "Publier",
  "action.unpublish": "Dépublier",
  "action.firstFollowup": "Créer le premier suivi",

  // Filters
  "filter.all": "Tous",
  "filter.allRoles": "Tous les rôles",
  "filter.allThemes": "Tous les thèmes",
  "filter.allStatuses": "Tous les statuts",
  "filter.allRegions": "Toutes les régions",
  "filter.allTypes": "Tous les types",
  "filter.allCategories": "Toutes les catégories",
  "filter.allRecos": "Toutes les recommandations",
  "filter.byReco": "Filtrer par recommandation",

  // Search placeholders
  "search.user": "Rechercher un utilisateur…",
  "search.country": "Rechercher un pays…",
  "search.mission": "Rechercher par code ou cycle…",
  "search.institution": "Filtrer par code pays (ML, SN…)",

  // Empty states
  "empty.users": "Aucun utilisateur trouvé.",
  "empty.countries": "Aucun pays trouvé.",
  "empty.institutions": "Aucune institution trouvée.",
  "empty.missions": "Aucune mission trouvée.",
  "empty.followups": "Aucun suivi trouvé.",

  // Loading states
  "loading.users": "Chargement des utilisateurs…",
  "loading.generic": "Chargement…",
  "loading.noCountries": "Aucun pays",
  "loading.noMissions": "Aucune mission",
  "loading.noInstitutions": "Aucune institution",

  // Regions
  "region.OUEST": "Afrique de l'Ouest",
  "region.EST": "Afrique de l'Est",
  "region.SUD": "Afrique australe",
  "region.NORD": "Afrique du Nord",
  "region.CENTRE": "Afrique centrale",

  // Institution categories
  "category.COMMISSION_ELECTORALE": "Commission électorale",
  "category.PARLEMENT": "Parlement",
  "category.POUVOIR_JUDICIAIRE": "Pouvoir judiciaire",
  "category.GOUVERNEMENT": "Gouvernement",
  "category.SOCIETE_CIVILE": "Société civile",

  // Mission types
  "missionType.OBSERVATION": "Observation",
  "missionType.ASSISTANCE": "Assistance",
  "missionType.REVUE_TECHNIQUE": "Revue technique",

  // Theme labels (for dropdowns)
  "theme.JURIDIQUE": "Cadre juridique",
  "theme.ADMINISTRATION": "Administration électorale",
  "theme.ELECTEURS": "Inscription des électeurs",
  "theme.CAMPAGNE": "Campagne & financement",
  "theme.MEDIAS": "Médias & information",
  "theme.RESULTATS": "Résultats & contentieux",
  "theme.INCLUSION": "Inclusion & genre",
  "theme.SECURITE": "Sécurité & intégrité",
  "theme.CIVISME": "Éducation civique",

  // Status labels (for dropdowns)
  "statut.NOUVEAU": "Nouveau",
  "statut.EN_COURS": "En cours",
  "statut.PARTIEL": "Partiellement implémenté",
  "statut.IMPLEMENTE": "Implémenté",
  "statut.NON_IMPLEMENTE": "Non implémenté",
  "statut.INCONNU": "Inconnu",

  // Priority labels
  "priorite.HAUTE": "Haute",
  "priorite.MOYENNE": "Moyenne",
  "priorite.BASSE": "Basse",

  // Visibility labels
  "visibilite.PUBLIC": "Public",
  "visibilite.INTERNE": "Interne",
  "visibilite.BROUILLON": "Brouillon",

  // Role labels (for dropdowns)
  "role.ADMIN": "Administrateur",
  "role.EDITEUR": "Éditeur",
  "role.LECTEUR": "Lecteur",

  // Form titles
  "form.reco.create": "Créer une recommandation",
  "form.reco.update": "Modifier la recommandation",
  "form.user.create": "Inviter un utilisateur",
  "form.user.update": "Modifier l'utilisateur",
  "form.country.create": "Ajouter un pays",
  "form.country.update": "Modifier le pays",
  "form.institution.create": "Ajouter une institution",
  "form.institution.update": "Modifier l'institution",
  "form.mission.create": "Créer une mission",
  "form.mission.update": "Modifier la mission",
  "form.followup.create": "Nouveau suivi",
  "form.followup.update": "Modifier le suivi",
  "form.followup.recoRequired": "Veuillez sélectionner une recommandation.",

  // Form fields
  "field.code": "Code",
  "field.name": "Nom",
  "field.email": "Email",
  "field.country": "Pays",
  "field.countryCode": "Code pays",
  "field.password": "Mot de passe temporaire",
  "field.role": "Rôle",
  "field.region": "Région",
  "field.category": "Catégorie",
  "field.type": "Type",
  "field.cycle": "Cycle",
  "field.startDate": "Date de début",
  "field.endDate": "Date de fin",
  "field.leadObserver": "Observateur principal",
  "field.recommendation": "Recommandation",
  "field.institution": "Institution",
  "field.mission": "Mission",
  "field.theme": "Thème",
  "field.priority": "Priorité",
  "field.visibility": "Visibilité",
  "field.sourceLang": "Langue source",
  "form.addTranslation": "Ajouter une traduction",
  "form.translations": "Traductions",
  "field.nameFr": "Nom (Français)",
  "field.nameEn": "Nom (Anglais)",
  "field.titleEn": "Titre (Anglais)",
  "field.titleFr": "Titre (Français)",
  "field.summaryEn": "Résumé (Anglais)",
  "field.summaryFr": "Résumé (Français)",
  "field.bodyEn": "Contenu (Anglais)",
  "field.bodyFr": "Contenu (Français)",
  "field.noteEn": "Note (Anglais)",
  "field.noteFr": "Note (Français)",
  "field.author": "Auteur",
  "field.date": "Date",
  "field.implStatus": "Statut d'implémentation",
  "field.selectCountry": "Sélectionner un pays",
  "field.selectMission": "Sélectionner une mission",
  "field.selectInstitution": "Sélectionner une institution",
  "field.selectStatus": "Sélectionner un statut",
  "field.selectCategory": "Sélectionner une catégorie",
  "field.selectRegion": "Sélectionner une région",
  "field.selectRole": "Sélectionner un rôle",
  "field.selectUser": "Sélectionner un utilisateur",
  "field.selectType": "Sélectionner un type",

  // Subtitles
  "dash.subtitle.recos": "{n} entrées",
  "dash.subtitle.countries": "{n} pays",
  "dash.subtitle.missions": "{n} missions",
  "dash.subtitle.institutions": "{n} institutions",
  "dash.subtitle.followups": "{n} suivi(s)",
  "dash.subtitle.publications": "{n} publications",

  // Auth / Login
  "auth.title": "Bon retour",
  "auth.subtitle": "Connectez-vous pour accéder à votre espace.",
  "auth.login": "Se connecter",
  "auth.loggingIn": "Connexion…",
  "auth.password": "Mot de passe",
  "auth.forgotPwd": "Mot de passe oublié ?",
  "auth.forgotPwdInfo": "Réinitialisation bientôt disponible.",
  "auth.loginSuccess": "Connexion réussie",
  "auth.loginError": "Email ou mot de passe incorrect.",
  "auth.sessionExpired": "Votre session a expiré. Veuillez vous reconnecter.",
  "auth.sessionExpiredBanner": "Votre session a expiré. Reconnectez-vous pour continuer.",
  "auth.terms": "En continuant, vous acceptez nos conditions d'utilisation.",
  "auth.logout": "Déconnexion",

  // Detail page
  "detail.notFound": "Recommandation introuvable",
  "detail.noFollowups": "Aucun suivi enregistré.",
  "detail.body": "Recommandation",
  "detail.openSource": "Ouvrir",
  "detail.country": "Pays",

  // Missions public
  "missions.empty": "Aucune mission trouvée.",
  "missions.leadObserver": "Observateur principal",
  "missions.viewRecos": "Voir les recommandations",
  "missions.total": "{n} missions documentées",

  // Home
  "home.chart.byRegion": "Recommandations par région",

  // About
  "about.purpose.title": "Objectif",
  "about.purpose.body": "Cette plateforme rassemble dans un environnement unique l'ensemble des recommandations issues des missions d'observation et d'assistance électorales de l'Union Africaine, accompagnées de leur historique de suivi, des institutions concernées et des sources documentaires.",
  "about.governance.title": "Gouvernance",
  "about.governance.body": "L'Union Africaine conserve la pleine autorité sur la gestion des contenus, la publication et l'administration des utilisateurs. Le portail public ne reflète que les éléments explicitement approuvés pour publication.",
  "about.principles.title": "Principes clés",
  "about.principles.1": "Documentation structurée des recommandations sur le continent",
  "about.principles.2": "Comparabilité entre pays et analyse thématique",
  "about.principles.3": "Suivi transparent de la mise en œuvre dans le temps",
  "about.principles.4": "Publication contrôlée sous l'autorité de l'Union Africaine",

  // Dashboard extras
  "common.viewAll": "Voir tout",
  "dash.charts.byRegion": "Recommandations par région",
  "dash.export.csv": "Exporter CSV",
  "dash.export.json": "Exporter JSON",
  "dash.noData": "Aucune donnée disponible",

  // Action traduction
  "common.translate": "Traduire",
  "field.title": "Titre",
  "field.summary": "Résumé",
  "field.body": "Contenu",
  "field.note": "Note",
  "form.translate.title": "Ajouter / modifier une traduction",
  "form.translate.selectLang": "Sélectionner une langue",
  "form.translate.existing": "Traductions existantes",
  "form.translate.noLangs": "Aucune langue configurée. Ajoutez des langues dans Paramètres.",
  "form.translate.source": "Source (original)",
  "form.translate.saved": "Traduction enregistrée.",

  // Paramètres - langues
  "settings.languages.title": "Langues prises en charge",
  "settings.languages.description": "Langues disponibles pour la traduction de toutes les entités.",
  "settings.languages.add": "Ajouter une langue",
  "settings.languages.code": "Code ISO (ex : pt, ar, sw)",
  "settings.languages.nameEn": "Nom en anglais",
  "settings.languages.nameFr": "Nom en français",
  "settings.languages.empty": "Aucune langue supplémentaire.",
  "settings.languages.remove": "Retirer",
};

const dicts: Record<Locale, Dict> = { en, fr };

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof en, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("eisa-locale") : null;
    if (stored === "en" || stored === "fr") setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("eisa-locale", l);
  };

  const t: Ctx["t"] = (key, vars) => {
    const raw = dicts[locale][key as string] ?? (en as Dict)[key as string] ?? (key as string);
    if (!vars) return raw;
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
      raw,
    );
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
