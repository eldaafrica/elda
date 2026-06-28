import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";
import { publicService } from "@/services/recommendationService";
import { useLanguages } from "@/hooks/useLanguages";
import { Trash2, Check, Save } from "lucide-react";
import { siteParamService, type SiteParams } from "@/services/siteParamService";

type Stats = {
  totalRecommendations: number;
  implementedRecommendations: number;
  totalMissions: number;
  totalCountries: number;
};

function SettingsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    publicService.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <DashboardLayout
      title={t("dash.nav.settings")}
      subtitle="Paramètres du workspace, politique de publication et données de référence."
    >
      <div className="mb-4">
        <LanguageCard />
      </div>
      <div className="mb-4">
        <AboutCard />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Organisation"
          description="Profil public, logo et informations de contact visibles sur le portail."
        >
          <Field
            label="Nom de l'organisation"
            value="Electoral Database Africa"
          />
          <Field label="Acronyme" value="ELDA Africa" />
          <Field label="Email de contact public" value="elda.africa@gmail.com" />
        </Card>

        <Card
          title="Politique de publication"
          description="Paramètres appliqués lors de l'approbation de contenu pour le portail public."
        >
          <Field
            label="Visibilité par défaut"
            value="Brouillon (BROUILLON)"
          />
          <Field
            label="Approbation admin requise"
            value="Oui"
          />
          <Field label="Téléchargements publics" value="Non activé" />
        </Card>

        <Card
          title="Données de référence"
          description="Gérez les pays, thèmes, statuts et catégories d'institutions."
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <ReferenceRow
              label="Pays"
              count={stats?.totalCountries}
              href="/dashboard/pays"
            />
            <ReferenceRow
              label="Missions"
              count={stats?.totalMissions}
              href="/dashboard/missions"
            />
            <ReferenceRow
              label="Recommandations"
              count={stats?.totalRecommendations}
              href="/dashboard/recommendations"
            />
            <li className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
              <span>9 thèmes · 6 statuts · 5 catégories d'institutions</span>
            </li>
          </ul>
        </Card>

        <Card
          title="Exports & API"
          description="Flux de données ouvertes et endpoints API en lecture seule."
        >
          <Field label="Endpoint public" value="/api/public/recommendations" />
          <Field label="Stats public" value="/api/public/stats" />
          <Field label="Version du schéma" value="v1.0" />
          <div className="mt-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Documentation Swagger</span>{" "}
            disponible sur{" "}
            <code className="text-xs bg-muted px-1 rounded">/api/swagger-ui.html</code>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="font-display text-lg">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function LanguageCard() {
  const { t } = useI18n();
  const { languages, create, remove } = useLanguages();
  const [code, setCode] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nameEn.trim() || !nameFr.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await create({ code: code.trim().toLowerCase(), nameEn: nameEn.trim(), nameFr: nameFr.trim() });
      setCode("");
      setNameEn("");
      setNameFr("");
    } catch {
      setError("Erreur lors de l'ajout de la langue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="font-display text-lg">{t("settings.languages.title")}</div>
      <div className="mt-1 text-xs text-muted-foreground">{t("settings.languages.description")}</div>

      <div className="mt-4 space-y-2">
        {languages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("settings.languages.empty")}</p>
        )}
        {languages.map((lang) => (
          <div
            key={lang.code}
            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <span className="font-mono text-xs uppercase text-muted-foreground mr-3">{lang.code}</span>
            <span className="flex-1">{lang.nameFr} / {lang.nameEn}</span>
            <button
              onClick={() => remove(lang.code)}
              className="ml-3 text-red-500 hover:text-red-700"
              title={t("settings.languages.remove")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("settings.languages.code")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder={t("settings.languages.nameEn")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          placeholder={t("settings.languages.nameFr")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "…" : t("settings.languages.add")}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ReferenceRow({
  label,
  count,
  href,
}: {
  label: string;
  count?: number;
  href: string;
}) {
  return (
    <li className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <Link
        to={href}
        className="flex items-center gap-1.5 text-primary hover:underline text-xs font-medium"
      >
        {count !== undefined ? count : "—"} enregistrements →
      </Link>
    </li>
  );
}

const ABOUT_GROUPS: { title: string; fields: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    title: "En-tête",
    fields: [
      { key: "about.title", label: "Titre de la page" },
      { key: "about.lede", label: "Introduction (lede)", multiline: true },
    ],
  },
  {
    title: "Objectif",
    fields: [
      { key: "about.purpose.title", label: "Titre" },
      { key: "about.purpose.body", label: "Corps du texte", multiline: true },
    ],
  },
  {
    title: "Gouvernance",
    fields: [
      { key: "about.governance.title", label: "Titre" },
      { key: "about.governance.body", label: "Corps du texte", multiline: true },
    ],
  },
  {
    title: "Principes clés",
    fields: [
      { key: "about.principles.title", label: "Titre de section" },
      { key: "about.principles.1", label: "Principe 1" },
      { key: "about.principles.2", label: "Principe 2" },
      { key: "about.principles.3", label: "Principe 3" },
      { key: "about.principles.4", label: "Principe 4" },
    ],
  },
];

function AboutCard() {
  const [params, setParams] = useState<SiteParams>({});
  const [dirty, setDirty] = useState<SiteParams>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    siteParamService.getAll().then((data) => {
      setParams(data);
      setDirty(data);
    }).catch(() => {});
  }, []);

  const handleChange = (key: string, lang: string, value: string) => {
    setDirty((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [lang]: value },
    }));
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await siteParamService.upsert(key, dirty[key] ?? {});
      setParams((prev) => ({ ...prev, [key]: dirty[key] ?? {} }));
      setSaved(key);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="font-display text-lg">Page « À propos »</div>
      <div className="mt-1 text-xs text-muted-foreground">
        Contenu affiché sur la page publique /about. Les modifications sont actives immédiatement après sauvegarde.
      </div>

      <div className="mt-6 space-y-8">
        {ABOUT_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 border-b border-border pb-2 text-sm font-semibold">
              {group.title}
            </h3>
            <div className="space-y-5">
              {group.fields.map((field) => (
                <div key={field.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {field.label}
                    </span>
                    <button
                      onClick={() => handleSave(field.key)}
                      disabled={saving === field.key}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {saved === field.key ? (
                        <><Check className="h-3 w-3" /> Sauvegardé</>
                      ) : saving === field.key ? (
                        "…"
                      ) : (
                        <><Save className="h-3 w-3" /> Sauvegarder</>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(["fr", "en"] as const).map((lang) => (
                      <div key={lang} className="space-y-1">
                        <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          {lang}
                        </span>
                        {field.multiline ? (
                          <textarea
                            rows={3}
                            value={dirty[field.key]?.[lang] ?? ""}
                            onChange={(e) => handleChange(field.key, lang, e.target.value)}
                            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                          />
                        ) : (
                          <input
                            type="text"
                            value={dirty[field.key]?.[lang] ?? ""}
                            onChange={(e) => handleChange(field.key, lang, e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
