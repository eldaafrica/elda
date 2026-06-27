import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicLayout } from "@/components/public-layout";
import { useI18n } from "@/lib/i18n";
import { StatusBadge, ThemeChip, PriorityBadge } from "@/components/badges";
import { ArrowLeft, Calendar, FileText, Share2, Building2, Map } from "lucide-react";
import { recommendationService, publicService } from "@/services/recommendationService";
import { getTranslation, getCountryName } from "@/lib/translation";
import { followUpService, type FollowUp } from "@/services/followUpService";
import { missionService } from "@/services/missionService";
import { institutionService } from "@/services/institutionService";
import type { Recommendation, Mission } from "@/types";
import type { Country } from "@/types/country";

type Institution = { id: string; name: string; category?: string; country?: string };

function RecommendationDetailPage() {
  const { t, locale } = useI18n();
  const { recoId } = useParams<{ recoId: string }>();

  const [reco, setReco] = useState<Recommendation | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!recoId) return;

    async function load() {
      try {
        setLoading(true);
        const r = await recommendationService.getById(recoId!);
        setReco(r);

        const [missionRes, followUpsRes] = await Promise.allSettled([
          r.missionId ? missionService.getById(r.missionId) : Promise.resolve(null),
          followUpService.findByRecommendation(r.id),
        ]);

        if (missionRes.status === "fulfilled") setMission(missionRes.value);
        if (followUpsRes.status === "fulfilled") setFollowUps(followUpsRes.value);

        if (r.institutionId) {
          try {
            const inst = await institutionService.getById(r.institutionId);
            setInstitution(inst as Institution);
          } catch {
            // institution optional
          }
        }

        if (r.codeCountry) {
          try {
            const allCountries = await publicService.getCountries();
            const found = allCountries.find((c: Country) => c.code === r.codeCountry);
            if (found) setCountry(found);
          } catch {
            // country optional
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [recoId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl px-4 py-20 space-y-4">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !reco) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl">{t("detail.notFound")}</h1>
          <Link
            to="/recommendations"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  return (
    <PublicLayout>
      <article>
        {/* Hero */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl px-4 md:px-6 py-12">
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("detail.back")}
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {reco.code}
              </span>
              <span className="text-muted-foreground">·</span>
              <ThemeChip theme={reco.theme} />
              <StatusBadge status={reco.statut} />
              <PriorityBadge priority={reco.priorite} />
            </div>

            <h1 className="mt-4 font-display text-3xl md:text-5xl leading-tight text-balance">
              {getTranslation(reco, locale)?.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
              {getTranslation(reco, locale)?.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {reco.issuedDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("detail.issued")}: {reco.issuedDate}
                </span>
              )}
              {reco.lastUpdate && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{t("detail.lastUpdate")}: {reco.lastUpdate}</span>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 md:px-6 py-12 grid gap-10 md:grid-cols-12">
          {/* Body */}
          <div className="md:col-span-8 space-y-10">
            {/* Full text */}
            {getTranslation(reco, locale)?.body && (
              <section>
                <h2 className="font-display text-2xl">{t("detail.body")}</h2>
                <p className="mt-4 text-foreground/85 leading-relaxed whitespace-pre-line">
                  {getTranslation(reco, locale)?.body}
                </p>
              </section>
            )}

            {/* Follow-up timeline */}
            <section>
              <h2 className="font-display text-2xl">{t("detail.followups")}</h2>
              {followUps.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">{t("detail.noFollowups")}</p>
              ) : (
                <ol className="mt-6 relative border-l-2 border-border pl-6 space-y-6">
                  {[...followUps]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((f) => (
                      <li key={f.id} className="relative">
                        <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-ochre bg-background" />
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{f.date}</span>
                          <StatusBadge status={f.statut} />
                        </div>
                        {f.translations?.[locale] && (
                          <p className="mt-2 text-sm text-foreground/85">
                            {f.translations[locale]}
                          </p>
                        )}
                        {f.author && (
                          <div className="mt-1 text-xs text-muted-foreground">— {f.author}</div>
                        )}
                      </li>
                    ))}
                </ol>
              )}
            </section>

            {/* Sources */}
            {reco.sources && reco.sources.length > 0 && (
              <section>
                <h2 className="font-display text-2xl">{t("detail.evidence")}</h2>
                <ul className="mt-4 space-y-2">
                  {reco.sources.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm"
                    >
                      <FileText className="h-4 w-4 text-ochre shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{s.label}</div>
                        {s.pageRef && (
                          <div className="text-xs text-muted-foreground">{s.pageRef}</div>
                        )}
                      </div>
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline shrink-0"
                        >
                          {t("detail.openSource")}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-4">
            {/* Mission */}
            {mission && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t("detail.mission")}
                </div>
                <Link to="/missions" className="mt-2 block">
                  <div className="font-display text-lg">{mission.cycle}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Map className="h-3.5 w-3.5" />
                    {mission.country} · {mission.code}
                  </div>
                  {mission.type && (
                    <span className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {t(`missionType.${mission.type}` as any)}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {/* Institution */}
            {institution && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t("detail.institution")}
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-ochre shrink-0" />
                  <div>
                    <div className="font-medium leading-snug">{institution.name}</div>
                    {institution.category && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t(`category.${institution.category}` as any)}
                        {institution.country ? ` · ${institution.country}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <MetaRow label={t("detail.theme")} value={t(`theme.${reco.theme}` as any)} />
              <MetaRow label={t("detail.status")} value={t(`statut.${reco.statut}` as any)} />
              <MetaRow label={t("detail.priority")} value={t(`priorite.${reco.priorite}` as any)} />
              {reco.codeCountry && (
                <MetaRow
                  label={t("detail.country")}
                  value={
                    country
                      ? `${getCountryName(country, locale)} (${reco.codeCountry})`
                      : reco.codeCountry
                  }
                />
              )}
            </div>

            <button
              onClick={handleShare}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Share2 className="h-4 w-4" />
              {t("detail.share")}
            </button>
          </aside>
        </div>
      </article>
    </PublicLayout>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default RecommendationDetailPage;
