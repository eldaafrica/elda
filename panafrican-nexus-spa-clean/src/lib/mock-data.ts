import {
  Priorite,
  Statut,
  Theme,
  Visibilite,
} from "@/types/recommendation";

// ================= TYPES =================

export type Country = {
  code: string;
  name: {
    en: string;
    fr: string;
  };
  region: "Ouest" | "Est" | "Sud" | "Nord" | "Centre";
};

export type MissionType =
  | "OBSERVATION"
  | "ASSISTANCE"
  | "REVUE_TECHNIQUE";

export type Category =
  | "COMMISSION_ELECTORALE"
  | "PARLEMENT"
  | "POUVOIR_JUDICIAIRE"
  | "GOUVERNEMENT"
  | "SOCIETE_CIVILE";

// ================= ENUM LISTS =================

export const themeList: Theme[] = [
  "JURIDIQUE",
  "ADMINISTRATION",
  "ELECTEURS",
  "CAMPAGNE",
  "MEDIAS",
  "RESULTATS",
  "INCLUSION",
  "SECURITE",
  "CIVISME",
];

export const statusList: Statut[] = [
  "NOUVEAU",
  "EN_COURS",
  "PARTIEL",
  "IMPLEMENTE",
  "NON_IMPLEMENTE",
  "INCONNU",
];

export const visibiliteList: Visibilite[] = [
  "PUBLIC",
  "INTERNE",
  "BROUILLON",
];

export const priList: Priorite[] = [
  "HAUTE",
  "MOYENNE",
  "BASSE",
];

export const missionTypeList: MissionType[] = [
  "OBSERVATION",
  "ASSISTANCE",
  "REVUE_TECHNIQUE",
];

export const categoryList: Category[] = [
  "COMMISSION_ELECTORALE",
  "PARLEMENT",
  "POUVOIR_JUDICIAIRE",
  "GOUVERNEMENT",
  "SOCIETE_CIVILE",
];

// ================= LABELS =================

export const themeLabels: Record<
  Theme,
  { fr: string; en: string }
> = {
  JURIDIQUE: {
    fr: "Juridique",
    en: "Legal",
  },

  ADMINISTRATION: {
    fr: "Administration",
    en: "Administration",
  },

  ELECTEURS: {
    fr: "Électeurs",
    en: "Voters",
  },

  CAMPAGNE: {
    fr: "Campagne",
    en: "Campaign",
  },

  MEDIAS: {
    fr: "Médias",
    en: "Media",
  },

  RESULTATS: {
    fr: "Résultats",
    en: "Results",
  },

  INCLUSION: {
    fr: "Inclusion",
    en: "Inclusion",
  },

  SECURITE: {
    fr: "Sécurité",
    en: "Security",
  },

  CIVISME: {
    fr: "Civisme",
    en: "Civics",
  },
};

export const statusLabels: Record<
  Statut,
  { fr: string; en: string }
> = {
  NOUVEAU: {
    fr: "Nouveau",
    en: "New",
  },

  EN_COURS: {
    fr: "En cours",
    en: "In progress",
  },

  PARTIEL: {
    fr: "Partiel",
    en: "Partial",
  },

  IMPLEMENTE: {
    fr: "Implémenté",
    en: "Implemented",
  },

  NON_IMPLEMENTE: {
    fr: "Non implémenté",
    en: "Not implemented",
  },

  INCONNU: {
    fr: "Inconnu",
    en: "Unknown",
  },
};

export const prioriteLabels: Record<
  Priorite,
  { fr: string; en: string }
> = {
  HAUTE: {
    fr: "Haute",
    en: "High",
  },

  MOYENNE: {
    fr: "Moyenne",
    en: "Medium",
  },

  BASSE: {
    fr: "Basse",
    en: "Low",
  },
};

export const visibiliteLabels: Record<
  Visibilite,
  { fr: string; en: string }
> = {
  PUBLIC: {
    fr: "Public",
    en: "Public",
  },

  INTERNE: {
    fr: "Interne",
    en: "Internal",
  },

  BROUILLON: {
    fr: "Brouillon",
    en: "Draft",
  },
};

export const missionTypeLabels: Record<
  MissionType,
  { fr: string; en: string }
> = {
  OBSERVATION: {
    fr: "Observation",
    en: "Observation",
  },

  ASSISTANCE: {
    fr: "Assistance",
    en: "Assistance",
  },

  REVUE_TECHNIQUE: {
    fr: "Revue technique",
    en: "Technical review",
  },
};

export const categoryLabels: Record<
  Category,
  { fr: string; en: string }
> = {
  COMMISSION_ELECTORALE: {
    fr: "Commission électorale",
    en: "Electoral commission",
  },

  PARLEMENT: {
    fr: "Parlement",
    en: "Parliament",
  },

  POUVOIR_JUDICIAIRE: {
    fr: "Pouvoir judiciaire",
    en: "Judiciary",
  },

  GOUVERNEMENT: {
    fr: "Gouvernement",
    en: "Government",
  },

  SOCIETE_CIVILE: {
    fr: "Société civile",
    en: "Civil society",
  },
};

// ================= HELPERS =================

export function countryName(
  code: string,
  locale: "en" | "fr"
) {
  const c = countries.find((x) => x.code === code);
  return c ? c.name[locale] : code;
}

export function missionById(id: string) {
  return missions.find((m) => m.id === id);
}

export function institutionById(id: string) {
  return institutions.find((i) => i.id === id);
}

export function recommendationById(id: string) {
  return recommendations.find((r) => r.id === id);
}

export function publicRecommendations() {
  return recommendations.filter(
    (r) => r.visibility === "PUBLIC"
  );
}

export const countries: Country[] = [
  // ================= NORTH AFRICA =================
  { code: "DZ", name: { en: "Algeria", fr: "Algérie" }, region: "Nord" },
  { code: "EG", name: { en: "Egypt", fr: "Égypte" }, region: "Nord" },
  { code: "LY", name: { en: "Libya", fr: "Libye" }, region: "Nord" },
  { code: "MA", name: { en: "Morocco", fr: "Maroc" }, region: "Nord" },
  { code: "SD", name: { en: "Sudan", fr: "Soudan" }, region: "Nord" },
  { code: "TN", name: { en: "Tunisia", fr: "Tunisie" }, region: "Nord" },

  // ================= WEST AFRICA =================
  { code: "BJ", name: { en: "Benin", fr: "Bénin" }, region: "Ouest" },
  { code: "BF", name: { en: "Burkina Faso", fr: "Burkina Faso" }, region: "Ouest" },
  { code: "CV", name: { en: "Cape Verde", fr: "Cap-Vert" }, region: "Ouest" },
  { code: "CI", name: { en: "Côte d'Ivoire", fr: "Côte d'Ivoire" }, region: "Ouest" },
  { code: "GM", name: { en: "Gambia", fr: "Gambie" }, region: "Ouest" },
  { code: "GH", name: { en: "Ghana", fr: "Ghana" }, region: "Ouest" },
  { code: "GN", name: { en: "Guinea", fr: "Guinée" }, region: "Ouest" },
  { code: "GW", name: { en: "Guinea-Bissau", fr: "Guinée-Bissau" }, region: "Ouest" },
  { code: "LR", name: { en: "Liberia", fr: "Libéria" }, region: "Ouest" },
  { code: "ML", name: { en: "Mali", fr: "Mali" }, region: "Ouest" },
  { code: "MR", name: { en: "Mauritania", fr: "Mauritanie" }, region: "Ouest" },
  { code: "NE", name: { en: "Niger", fr: "Niger" }, region: "Ouest" },
  { code: "NG", name: { en: "Nigeria", fr: "Nigéria" }, region: "Ouest" },
  { code: "SN", name: { en: "Senegal", fr: "Sénégal" }, region: "Ouest" },
  { code: "SL", name: { en: "Sierra Leone", fr: "Sierra Leone" }, region: "Ouest" },
  { code: "TG", name: { en: "Togo", fr: "Togo" }, region: "Ouest" },

  // ================= EAST AFRICA =================
  { code: "BI", name: { en: "Burundi", fr: "Burundi" }, region: "Est" },
  { code: "KM", name: { en: "Comoros", fr: "Comores" }, region: "Est" },
  { code: "DJ", name: { en: "Djibouti", fr: "Djibouti" }, region: "Est" },
  { code: "ER", name: { en: "Eritrea", fr: "Érythrée" }, region: "Est" },
  { code: "ET", name: { en: "Ethiopia", fr: "Éthiopie" }, region: "Est" },
  { code: "KE", name: { en: "Kenya", fr: "Kenya" }, region: "Est" },
  { code: "MG", name: { en: "Madagascar", fr: "Madagascar" }, region: "Est" },
  { code: "MW", name: { en: "Malawi", fr: "Malawi" }, region: "Est" },
  { code: "MU", name: { en: "Mauritius", fr: "Maurice" }, region: "Est" },
  { code: "MZ", name: { en: "Mozambique", fr: "Mozambique" }, region: "Est" },
  { code: "RW", name: { en: "Rwanda", fr: "Rwanda" }, region: "Est" },
  { code: "SC", name: { en: "Seychelles", fr: "Seychelles" }, region: "Est" },
  { code: "SO", name: { en: "Somalia", fr: "Somalie" }, region: "Est" },
  { code: "SS", name: { en: "South Sudan", fr: "Soudan du Sud" }, region: "Est" },
  { code: "TZ", name: { en: "Tanzania", fr: "Tanzanie" }, region: "Est" },
  { code: "UG", name: { en: "Uganda", fr: "Ouganda" }, region: "Est" },
  { code: "ZW", name: { en: "Zimbabwe", fr: "Zimbabwe" }, region: "Est" },

  // ================= CENTRAL AFRICA =================
  { code: "AO", name: { en: "Angola", fr: "Angola" }, region: "Centre" },
  { code: "CM", name: { en: "Cameroon", fr: "Cameroun" }, region: "Centre" },
  {
    code: "CF",
    name: { en: "Central African Republic", fr: "République centrafricaine" },
    region: "Centre",
  },
  { code: "TD", name: { en: "Chad", fr: "Tchad" }, region: "Centre" },
  {
    code: "CG",
    name: { en: "Republic of the Congo", fr: "République du Congo" },
    region: "Centre",
  },
  { code: "CD", name: { en: "DR Congo", fr: "RD Congo" }, region: "Centre" },
  { code: "GQ", name: { en: "Equatorial Guinea", fr: "Guinée équatoriale" }, region: "Centre" },
  { code: "GA", name: { en: "Gabon", fr: "Gabon" }, region: "Centre" },

  // ================= SOUTHERN AFRICA =================
  { code: "BW", name: { en: "Botswana", fr: "Botswana" }, region: "Sud" },
  { code: "LS", name: { en: "Lesotho", fr: "Lesotho" }, region: "Sud" },
  { code: "NA", name: { en: "Namibia", fr: "Namibie" }, region: "Sud" },
  { code: "ZA", name: { en: "South Africa", fr: "Afrique du Sud" }, region: "Sud" },
  { code: "SZ", name: { en: "Eswatini", fr: "Eswatini" }, region: "Sud" },
];

export type Mission = {
  id: string;
  code: string;
  type: "Observation" | "Assistance" | "Technical review";
  country: string; // country code
  cycle: string; // e.g. "Presidential 2023"
  startDate: string;
  endDate: string;
  leadObserver: string;
  summary: { en: string; fr: string };
};

export const missions: Mission[] = [];

export type Institution = {
  id: string;
  name: string;
  country: string;
  category: "EMB" | "Parliament" | "Judiciary" | "Government" | "Civil society";
};

export const institutions: Institution[] = [
  {
    id: "i-1",
    name: "Independent Electoral and Boundaries Commission",
    country: "KE",
    category: "EMB",
  },
  { id: "i-2", name: "Independent National Electoral Commission", country: "NG", category: "EMB" },
  { id: "i-3", name: "Direction Générale des Élections", country: "SN", category: "EMB" },
  { id: "i-4", name: "Electoral Commission of South Africa (IEC)", country: "ZA", category: "EMB" },
  { id: "i-5", name: "Electoral Commission of Ghana", country: "GH", category: "EMB" },
  {
    id: "i-6",
    name: "Instance Supérieure Indépendante pour les Élections",
    country: "TN",
    category: "EMB",
  },
  { id: "i-7", name: "Comissão Nacional de Eleições", country: "MZ", category: "EMB" },
  {
    id: "i-8",
    name: "Commission Électorale Nationale Indépendante",
    country: "MG",
    category: "EMB",
  },
  { id: "i-9", name: "Parliament of Kenya", country: "KE", category: "Parliament" },
  { id: "i-10", name: "Federal Ministry of Justice", country: "NG", category: "Government" },
];

export type FollowUp = {
  id: string;
  recommendationId: string;
  date: string;
  status: Statut;
  note: { en: string; fr: string };
  author: string;
};

export type Recommendation = {
  id: string;
  code: string;
  title: { en: string; fr: string };
  summary: { en: string; fr: string };
  body: { en: string; fr: string };
  missionId: string;
  institutionId: string;
  theme: Theme;
  status: Statut;
  priority: Priorite;
  visibility: Visibilite;
  issuedDate: string;
  lastUpdate: string;
  followUps: FollowUp[];
  sources: { label: string; url?: string; pageRef?: string }[];
};

export const recommendations: Recommendation[] = [];
