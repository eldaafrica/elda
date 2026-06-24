import { useEffect, useState } from "react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";

import { VisibilityBadge, StatusBadge } from "@/components/badges";
import { Eye, EyeOff, Search } from "lucide-react";

import { useRecommendations } from "@/hooks/useRecommendations";
import type { Recommendation, Visibilite } from "@/types/recommendation";
import { countryName } from "@/lib/mock-data";
import { getTranslation } from "@/lib/translation";

function PublicationsPage() {
  const { t, locale } = useI18n();

  const {
    recommendations,
    loading,
    publish,
    unpublish,
    updateFilters,
    setPage,
    pageInfo,
  } = useRecommendations();

  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<Visibilite | "">("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    updateFilters({
      q: q || undefined,
      visibilite: visibility || undefined,
    });
  }, [q, visibility]);

  const handleTogglePublication = async (r: Recommendation) => {
    try {
      setActionLoadingId(r.id);
      if (r.visibilite === "PUBLIC") {
        await unpublish(r.id);
      } else {
        await publish(r.id);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentPage = pageInfo?.number ?? 0;
  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? recommendations.length;

  return (
    <DashboardLayout
      title={t("dash.nav.publications")}
      subtitle={t("dash.subtitle.publications", { n: totalElements })}
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("recos.search")}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibilite | "")}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("filter.all")}</option>
            <option value="PUBLIC">{t("visibilite.PUBLIC")}</option>
            <option value="INTERNE">{t("visibilite.INTERNE")}</option>
            <option value="BROUILLON">{t("visibilite.BROUILLON")}</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">{t("dash.table.code")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.title")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.country")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.status")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.publication")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("dash.table.actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    {t("common.loading")}
                  </td>
                </tr>
              )}

              {!loading && recommendations.map((r) => {
                const isPublic = r.visibilite === "PUBLIC";
                const isLoading = actionLoadingId === r.id;

                return (
                  <tr key={r.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3 font-mono text-[11px] uppercase text-muted-foreground">
                      {r.code}
                    </td>

                    <td className="px-4 py-3 max-w-md">
                      <div className="font-medium truncate">
                        {getTranslation(r, locale)?.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {getTranslation(r, locale)?.summary}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {countryName(r.codeCountry ?? "N/A", locale)}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={r.statut ?? "INCONNU"} />
                    </td>

                    <td className="px-4 py-3">
                      <VisibilityBadge visibilite={r.visibilite ?? "BROUILLON"} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleTogglePublication(r)}
                        disabled={isLoading}
                        className={
                          "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium disabled:opacity-50 " +
                          (isPublic
                            ? "border border-border bg-background text-foreground hover:bg-accent"
                            : "bg-primary text-primary-foreground hover:bg-primary/90")
                        }
                      >
                        {isPublic ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            {t("action.unpublish")}
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            {t("action.publish")}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && recommendations.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">{t("recos.empty")}</div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-border p-4">
            <button
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50 hover:bg-accent"
            >
              {t("common.previous")}
            </button>

            <span className="text-sm text-muted-foreground">
              {t("common.page")} {currentPage + 1} {t("common.of")} {totalPages}
            </span>

            <button
              disabled={currentPage + 1 >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50 hover:bg-accent"
            >
              {t("common.next")}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PublicationsPage;
