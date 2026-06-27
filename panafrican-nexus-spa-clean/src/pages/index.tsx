import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { PublicLayout } from "@/components/public-layout";
import { themeList } from "@/lib/mock-data";
import { StatusBadge, ThemeChip } from "@/components/badges";
import { ArrowRight, Search, Globe2, FileCheck2, Map, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { publicService } from "@/services/recommendationService";
import type { Recommendation } from "@/types";
import type { Country } from "@/types/country";
import { getTranslation, getCountryName } from "@/lib/translation";

type Stats = {
  totalRecommendations: number;
  implementedRecommendations: number;
  totalMissions: number;
  totalCountries: number;
};

// Theme data keeps enum key for lookup
type ThemeEntry = { theme: string; themeKey: string; count: number };
type RegionEntry = { region: string; key: string; count: number };

function HomePage() {
  const { t, locale } = useI18n();

  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<Recommendation[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countByCountry, setCountByCountry] = useState<Record<string, number>>({});
  const [themeData, setThemeData] = useState<ThemeEntry[]>([]);
  const [regionData, setRegionData] = useState<RegionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCountries, setShowAllCountries] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, featuredRes, countriesRes] = await Promise.all([
          publicService.getStats(),
          publicService.listPublished({ page: 0, size: 3, sort: "lastUpdate,desc" }),
          publicService.getCountries(),
        ]);

        setStats(statsRes);
        // Supports Spring Page (content[]) and custom (data[])
        const featuredItems = (featuredRes as any).content ?? (featuredRes as any).data ?? [];
        setFeatured(featuredItems);
        setCountries(countriesRes);

        // Build theme chart from all published
        const allRes = await publicService.listPublished({ page: 0, size: 500 });
        const all: Recommendation[] = (allRes as any).content ?? (allRes as any).data ?? [];

        // Count recommendations per country
        const perCountry: Record<string, number> = {};
        for (const r of all) {
          if (r.codeCountry) perCountry[r.codeCountry] = (perCountry[r.codeCountry] ?? 0) + 1;
        }
        setCountByCountry(perCountry);

        const byTheme: ThemeEntry[] = themeList.map((th) => ({
          theme: t(`theme.${th}` as any).split(" ")[0],
          themeKey: th,
          count: all.filter((r) => r.theme === th).length,
        }));
        setThemeData(byTheme);

        // Region chart from countries + recommendations
        const byRegion: RegionEntry[] = countriesRes.reduce(
          (acc: RegionEntry[], c: Country) => {
            if (!c.region) return acc;
            const count = all.filter((r) => r.codeCountry === c.code).length;
            const existing = acc.find((x) => x.key === c.region);
            if (existing) {
              existing.count += count;
            } else {
              acc.push({ key: c.region, region: t(`region.${c.region}` as any), count });
            }
            return acc;
          },
          [],
        );
        setRegionData(byRegion);
      } catch (e) {
        console.error("Erreur chargement page d'accueil", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]); // re-load on locale change to re-translate chart labels

  const statCards = [
    { label: t("home.stats.recos"), value: stats?.totalRecommendations ?? "—", icon: FileCheck2 },
    { label: t("home.stats.missions"), value: stats?.totalMissions ?? "—", icon: Map },
    { label: t("home.stats.countries"), value: stats?.totalCountries ?? "—", icon: Globe2 },
    { label: t("home.stats.implemented"), value: stats?.implementedRecommendations ?? "—", icon: BarChart3 },
  ];

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-[oklch(0.28_0.05_140)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.08]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28 grid gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-7 text-primary-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-ochre/20 px-3 py-1 text-xs uppercase tracking-widest text-ochre">
              <span className="h-1.5 w-1.5 rounded-full bg-ochre" />
              {t("home.eyebrow")}
            </div>
            <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              {t("home.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">{t("home.lede")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 rounded-md bg-ochre px-5 py-2.5 text-sm font-semibold text-ochre-foreground hover:brightness-110 transition"
              >
                {t("home.cta.explore")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 transition"
              >
                {t("home.cta.about")}
              </Link>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 backdrop-blur p-5 shadow-2xl">
              <Link
                to="/recommendations"
                className="flex items-center gap-2 rounded-md bg-background px-3 py-2 text-foreground hover:bg-accent transition"
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm text-muted-foreground">
                  {t("recos.search")}
                </span>
              </Link>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {statCards.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg bg-primary-foreground/10 p-4 text-primary-foreground"
                  >
                    <s.icon className="h-4 w-4 text-ochre" />
                    <div className="mt-2 font-display text-3xl">{s.value}</div>
                    <div className="text-xs text-primary-foreground/70 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED RECOMMENDATIONS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-ochre">
              {t("home.featured.title")}
            </div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              {t("home.featured.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("home.featured.lede")}</p>
          </div>
          <Link
            to="/recommendations"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {t("home.cta.explore")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((r) => (
              <Link
                key={r.id}
                to={`/recommendations/${r.id}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:border-ochre/60 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {r.code}
                  </span>
                  <StatusBadge status={r.statut} />
                </div>
                <h3 className="mt-4 font-display text-xl leading-snug text-foreground group-hover:text-primary">
                  {getTranslation(r, locale)?.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                  {getTranslation(r, locale)?.summary}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <ThemeChip theme={r.theme} />
                </div>
              </Link>
            ))}
            {featured.length === 0 && (
              <div className="md:col-span-3 py-12 text-center text-muted-foreground text-sm">
                {t("recos.empty")}
              </div>
            )}
          </div>
        )}
      </section>

      {/* BROWSE BY THEME */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16">
          <div className="text-xs uppercase tracking-widest text-ochre">{t("home.themes.title")}</div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">{t("home.themes.title")}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("home.themes.lede")}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {themeList.map((th) => {
              const entry = themeData.find((d) => d.themeKey === th);
              return (
                <Link
                  key={th}
                  to={`/recommendations?theme=${th}`}
                  className="group flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:border-primary transition-colors"
                >
                  <div>
                    <div className="font-medium text-foreground">{t(`theme.${th}` as any)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {entry?.count ?? 0} {t("recos.results")}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* REGIONAL COVERAGE */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-widest text-ochre">{t("home.map.title")}</div>
            <h2 className="mt-2 font-display text-3xl">{t("home.map.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("home.map.lede")}</p>
            <ul className="mt-6 space-y-2">
              {(showAllCountries ? countries : countries.slice(0, 8)).map((c) => {
                const recoCount = countByCountry[c.code] ?? 0;
                return (
                  <li key={c.code}>
                    <Link
                      to={`/recommendations?country=${c.code}`}
                      className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 hover:border-ochre/60 hover:bg-accent transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-6">{c.code}</span>
                        <span className="text-sm">{getCountryName(c, locale)}</span>
                      </span>
                      <span className="flex items-center gap-3 shrink-0">
                        {recoCount > 0 && (
                          <span className="rounded-full bg-ochre/10 px-2 py-0.5 text-[11px] font-medium text-ochre">
                            {recoCount} {t("recos.results")}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {t(`region.${c.region}` as any)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {countries.length > 10 && (
              <button
                onClick={() => setShowAllCountries((v) => !v)}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                {showAllCountries ? t("home.map.showLess") : `${t("home.map.showAll")} (${countries.length})`}
              </button>
            )}
          </div>

          <div className="md:col-span-7 rounded-xl border border-border bg-card p-6">
            <div className="text-sm font-medium text-foreground">{t("home.chart.byRegion")}</div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="key"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8" }}
                    tickFormatter={(v: string) => v.charAt(0) + v.slice(1).toLowerCase()}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 12,
                      padding: "6px 10px",
                    }}
                    cursor={{ fill: "#f8fafc" }}
                    labelFormatter={(key) => {
                      const entry = regionData.find(r => r.key === key);
                      return entry?.region ?? key;
                    }}
                    formatter={(value) => [value ?? 0, t("recos.results")]}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default HomePage;
