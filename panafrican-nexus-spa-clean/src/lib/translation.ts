export function getTranslation<T extends object>(
  entity: { sourceLang?: string; translations?: Record<string, T> },
  locale: string
): T | undefined {
  if (!entity.translations) return undefined;
  return entity.translations[locale] ?? entity.translations[entity.sourceLang ?? "fr"];
}

export function getCountryName(
  country: { code: string; sourceLang?: string; translations?: Record<string, string> },
  locale: string
): string {
  if (!country.translations) return country.code;
  return (
    country.translations[locale] ??
    country.translations[country.sourceLang ?? "fr"] ??
    country.code
  );
}

export function getInstitutionName(
  institution: { name?: string; sourceLang?: string; translations?: Record<string, string> },
  locale: string
): string {
  const t = institution.translations;
  if (t && Object.keys(t).length > 0) {
    return t[locale] ?? t[institution.sourceLang ?? "fr"] ?? institution.name ?? "";
  }
  return institution.name ?? "";
}
