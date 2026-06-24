import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/public-layout";
import { useI18n } from "@/lib/i18n";
import { Map, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { publicService } from "@/services/recommendationService";
import type { Mission } from "@/types";
import { getTranslation } from "@/lib/translation";

function MissionsPage() {
  const { t, locale } = useI18n();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const size = 10;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await publicService.getMissions({ page, size });
        const items = res.content ?? [];
        setMissions(items);
        setTotal(res.totalElements ?? 0);
        setTotalPages(res.totalPages ?? 0);
      } catch (e) {
        console.error("Erreur chargement missions", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  const changePage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="text-xs uppercase tracking-widest text-ochre">{t("nav.missions")}</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{t("missions.title")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("missions.lede")}</p>
          {!loading && total > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("missions.total", { n: total })}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : missions.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {t("missions.empty")}
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {missions.map((m) => (
                <article
                  key={m.id}
                  className="group rounded-xl border border-border bg-card p-6 hover:border-ochre/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {m.code}
                    </span>
                    {m.type && (
                      <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {t(`missionType.${m.type}` as any)}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 font-display text-2xl">{m.cycle}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Map className="h-3.5 w-3.5" />
                      {m.country ?? "—"}
                    </span>
                    {(m.startDate || m.endDate) && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {m.startDate}{m.endDate ? ` → ${m.endDate}` : ""}
                      </span>
                    )}
                  </div>

                  {getTranslation(m, locale)?.summary && (
                    <p className="mt-4 text-sm text-foreground/80 line-clamp-3">
                      {getTranslation(m, locale)?.summary}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between text-sm">
                    {m.leadObserver && (
                      <span className="text-muted-foreground text-xs">
                        {t("missions.leadObserver")}:{" "}
                        <span className="text-foreground">{m.leadObserver}</span>
                      </span>
                    )}
                    <Link
                      to={`/recommendations?missionId=${m.id}`}
                      className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {t("missions.viewRecos")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => changePage(Math.max(page - 1, 0))}
                  disabled={page === 0}
                  className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("common.previous")}
                </button>
                <span className="text-sm text-muted-foreground">
                  {t("common.page")} {page + 1} {t("common.of")} {totalPages}
                </span>
                <button
                  onClick={() => changePage(Math.min(page + 1, totalPages - 1))}
                  disabled={page + 1 >= totalPages}
                  className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent disabled:opacity-40"
                >
                  {t("common.next")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}

export default MissionsPage;
