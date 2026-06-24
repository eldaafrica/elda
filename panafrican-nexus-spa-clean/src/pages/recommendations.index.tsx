import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PublicLayout } from "@/components/public-layout";
import { useI18n } from "@/lib/i18n";
import { themeList, statusList, countryName } from "@/lib/mock-data";
import { StatusBadge, ThemeChip, PriorityBadge } from "@/components/badges";
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { usePublicRecommendations } from "@/hooks/usePublicRecommendations";
import { publicService } from "@/services/recommendationService";
import type { Theme, Statut } from "@/types";
import type { Country } from "@/types/country";
import { getTranslation, getCountryName } from "@/lib/translation";

function RecommendationsListPage() {
  const { t, locale } = useI18n();
  const [sp, setSp] = useSearchParams();
  const [countries, setCountries] = useState<Country[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // URL params
  const q = sp.get("q") ?? undefined;
  const country = sp.get("country") ?? undefined;
  const theme = (sp.get("theme") as Theme) ?? undefined;
  const statut = (sp.get("statut") as Statut) ?? undefined;
  const missionId = sp.get("missionId") ?? undefined;
  const pageParam = parseInt(sp.get("page") ?? "0", 10);

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSp(next);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(sp);
    if (p === 0) next.delete("page");
    else next.set("page", String(p));
    setSp(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAll = () => setSp({});

  const hasFilters = !!(q || country || theme || statut || missionId);

  // Data — include country in backend filter if supported
  const { recommendations, page: pageData, loading } = usePublicRecommendations({
    q,
    missionId,
    theme,
    statut,
    page: pageParam,
    size: 15,
    sort: "lastUpdate,desc",
  });

  // Client-side country filter (backend /public/recommendations doesn't take a country param)
  const filtered = country
    ? recommendations.filter((r) => r.codeCountry === country)
    : recommendations;

  useEffect(() => {
    publicService.getCountries().then(setCountries).catch(() => {});
  }, []);

  const totalElements = (pageData as any)?.totalElements ?? 0;
  const totalPages = (pageData as any)?.totalPages ?? 0;

  return (
    <PublicLayout>
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="text-xs uppercase tracking-widest text-ochre">{t("nav.recommendations")}</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{t("recos.title")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("recos.lede")}</p>

          {/* Search bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={q ?? ""}
                onChange={(e) => setParam("q", e.target.value || undefined)}
                placeholder={t("recos.search")}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
              />
              {q && (
                <button
                  onClick={() => setParam("q", undefined)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm transition md:hidden ${
                showFilters || hasFilters
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("recos.filter.all")}
              {hasFilters && (
                <span className="ml-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {hasFilters && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent"
              >
                <X className="h-3.5 w-3.5" />
                {t("recos.reset")}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid gap-8 md:grid-cols-12">
        {/* Sidebar filters — visible on desktop, toggle on mobile */}
        <aside className={`md:col-span-3 space-y-6 ${showFilters ? "block" : "hidden md:block"}`}>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
            >
              <X className="h-3 w-3" /> {t("recos.reset")}
            </button>
          )}

          {/* Country filter */}
          <FilterGroup label={t("recos.filter.country")}>
            <FilterChip
              active={!country}
              onClick={() => setParam("country", undefined)}
              label={t("recos.filter.all")}
            />
            {countries.slice(0, 20).map((c) => (
              <FilterChip
                key={c.code}
                active={country === c.code}
                onClick={() => setParam("country", c.code)}
                label={getCountryName(c, locale)}
              />
            ))}
          </FilterGroup>

          {/* Theme filter */}
          <FilterGroup label={t("recos.filter.theme")}>
            <FilterChip
              active={!theme}
              onClick={() => setParam("theme", undefined)}
              label={t("recos.filter.all")}
            />
            {themeList.map((th) => (
              <FilterChip
                key={th}
                active={theme === th}
                onClick={() => setParam("theme", th)}
                label={t(`theme.${th}` as any)}
              />
            ))}
          </FilterGroup>

          {/* Status filter */}
          <FilterGroup label={t("recos.filter.status")}>
            <FilterChip
              active={!statut}
              onClick={() => setParam("statut", undefined)}
              label={t("recos.filter.all")}
            />
            {statusList.map((s) => (
              <FilterChip
                key={s}
                active={statut === s}
                onClick={() => setParam("statut", s)}
                label={t(`statut.${s}` as any)}
              />
            ))}
          </FilterGroup>
        </aside>

        {/* Results */}
        <div className="md:col-span-9">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {country ? filtered.length : totalElements}
              </span>{" "}
              {t("recos.results")}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl border border-border bg-card" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">{t("recos.empty")}</p>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  {t("recos.reset")}
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-4">
              {filtered.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/recommendations/${r.id}`}
                    className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:border-ochre/60 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {r.code}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={r.priorite} />
                        <StatusBadge status={r.statut} />
                      </div>
                    </div>

                    <h3 className="mt-3 font-display text-xl leading-snug group-hover:text-primary">
                      {getTranslation(r, locale)?.title}
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {getTranslation(r, locale)?.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <ThemeChip theme={r.theme} />
                      {r.codeCountry && (
                        <span className="text-xs text-muted-foreground">
                          · {countryName(r.codeCountry, locale)}
                        </span>
                      )}
                      {r.issuedDate && (
                        <span className="text-xs text-muted-foreground">
                          · {r.issuedDate}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* PAGINATION — only when not doing client-side country filter */}
          {!country && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(pageParam - 1)}
                disabled={pageParam === 0}
                className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("common.previous")}
              </button>
              <span className="text-sm text-muted-foreground">
                {t("common.page")} {pageParam + 1} {t("common.of")} {totalPages}
              </span>
              <button
                onClick={() => setPage(pageParam + 1)}
                disabled={pageParam + 1 >= totalPages}
                className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent disabled:opacity-40"
              >
                {t("common.next")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs transition " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-ochre hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

export default RecommendationsListPage;
