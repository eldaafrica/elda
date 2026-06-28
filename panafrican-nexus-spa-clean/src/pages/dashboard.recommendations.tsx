import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";
import { downloadCSV } from "@/lib/export";
import { getTranslation, getCountryName } from "@/lib/translation";

import { StatusBadge, VisibilityBadge, PriorityBadge, ThemeChip, normalizeStatut } from "@/components/badges";
import { Plus, Download, Search, MoreHorizontal, Globe, Eye, EyeOff, FileEdit, ExternalLink, X } from "lucide-react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Recommendation, RecommendationCreateRequest, Statut, Theme } from "@/types/recommendation";
import { themeList, statusList } from "@/lib/mock-data";
import { RecommendationCreateDialog } from "@/components/ui/recommendation_create_dialog";
import { RecommendationFormDialog } from "@/components/ui/recommendation_form_dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EntityDetailSheet } from "@/components/ui/entity-detail-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { recommendationService, publicService } from "@/services/recommendationService";
import type { Country } from "@/types/country";
import { Link } from "react-router-dom";

function DashRecosPage() {
  const { t, locale } = useI18n();

  const {
    recommendations,
    loading,
    updateFilters,
    create,
    update,
    remove,
    publish,
    unpublish,
    draft,
    setPage,
    pageInfo,
  } = useRecommendations();

  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<Theme | "">("");
  const [statut, setStatut] = useState<Statut | "">("");
  const [codeCountry, setCodeCountry] = useState("");
  const [allCountries, setAllCountries] = useState<Country[]>([]);

  // Modal state — separated create vs edit
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Recommendation | null>(null);
  const [translateTarget, setTranslateTarget] = useState<Recommendation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<Recommendation | null>(null);

  // Load countries for filter dropdown
  useEffect(() => {
    publicService.getCountries().then(setAllCountries).catch(() => {});
  }, []);

  const countryName = (code: string, _loc?: string) => {
    const found = allCountries.find((c) => c.code === code);
    return found ? getCountryName(found as Country, locale) : code;
  };

  // Sync filters → backend
  useEffect(() => {
    updateFilters({
      q: q || undefined,
      theme: theme || undefined,
      statut: statut || undefined,
      codeCountry: codeCountry || undefined,
      page: 0,
    });
  }, [q, theme, statut, codeCountry]);

  // Handlers
  const openCreate = () => setCreateOpen(true);

  const openEdit = (r: Recommendation) => setEditTarget(r);

  const handleCreate = async (data: RecommendationCreateRequest) => {
    await create(data);
    setCreateOpen(false);
  };

  const handleUpdate = async (data: RecommendationCreateRequest) => {
    if (!editTarget) return;
    await update(editTarget.id, data);
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  // Pagination
  const currentPage = pageInfo?.number ?? 0;
  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? recommendations.length;

  return (
    <DashboardLayout
      title={t("dash.nav.recommendations")}
      subtitle={t("dash.subtitle.recos", { n: totalElements })}
      actions={
        <>
          <button
            onClick={() => downloadCSV(recommendations, locale)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" />
            {t("dash.export.csv")}
          </button>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t("dash.actions.new")}
          </button>
        </>
      }
    >
      <div className="rounded-xl border border-border bg-card">
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          {/* SEARCH */}
          <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("recos.search")}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* THEME FILTER */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme | "")}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          >
            <option value="">{t("filter.allThemes")}</option>
            {themeList.map((th) => (
              <option key={th} value={th}>
                {t(`theme.${th}` as any)}
              </option>
            ))}
          </select>

          {/* STATUS FILTER */}
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value as Statut | "")}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          >
            <option value="">{t("filter.allStatuses")}</option>
            {statusList.map((s) => (
              <option key={s} value={s}>
                {t(`statut.${s}` as any)}
              </option>
            ))}
          </select>

          {/* COUNTRY FILTER */}
          <select
            value={codeCountry}
            onChange={(e) => setCodeCountry(e.target.value)}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          >
            <option value="">{t("filter.allCountries")}</option>
            {allCountries
              .slice()
              .sort((a, b) =>
                getCountryName(a as Country, locale).localeCompare(
                  getCountryName(b as Country, locale)
                )
              )
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {getCountryName(c as Country, locale)} ({c.code})
                </option>
              ))}
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
                <th className="px-4 py-3 font-medium">{t("dash.table.theme")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.status")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.priority")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.visibility")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.updated")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    {t("common.loading")}
                  </td>
                </tr>
              )}

              {!loading && recommendations.map((r) => (
                <tr key={r.id} className="hover:bg-accent/40 cursor-pointer">
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

                  <td className="px-4 py-3 text-muted-foreground">
                    {r.theme ? t(`theme.${r.theme}` as any) : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={r.statut ?? "INCONNU"} />
                  </td>

                  <td className="px-4 py-3">
                    <PriorityBadge priority={r.priorite} />
                  </td>

                  <td className="px-4 py-3">
                    <VisibilityBadge visibilite={r.visibilite!} />
                  </td>

                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.lastUpdate}
                  </td>

                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailTarget(r)}>
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          {t("dash.actions.detail")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEdit(r)}>
                          <FileEdit className="mr-2 h-3.5 w-3.5" />
                          {t("common.edit")}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setTranslateTarget(r)}>
                          <Globe className="mr-2 h-3.5 w-3.5" />
                          {t("common.translate")}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {r.visibilite !== "PUBLIC" && (
                          <DropdownMenuItem onClick={() => publish(r.id)}>
                            <Eye className="mr-2 h-3.5 w-3.5 text-green-600" />
                            {t("dash.vis.publish")}
                          </DropdownMenuItem>
                        )}
                        {r.visibilite !== "INTERNE" && (
                          <DropdownMenuItem onClick={() => unpublish(r.id)}>
                            <EyeOff className="mr-2 h-3.5 w-3.5 text-amber-600" />
                            {t("dash.vis.setInternal")}
                          </DropdownMenuItem>
                        )}
                        {r.visibilite !== "BROUILLON" && (
                          <DropdownMenuItem onClick={() => draft(r.id)}>
                            <FileEdit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            {t("dash.vis.setDraft")}
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeleteId(r.id)}
                          className="text-red-500"
                        >
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && recommendations.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {t("recos.empty")}
          </div>
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

      <RecommendationCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={loading}
      />

      {editTarget && (
        <RecommendationFormDialog
          open={true}
          onOpenChange={(v) => !v && setEditTarget(null)}
          initial={editTarget!}
          onSubmit={handleUpdate}
          loading={loading}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("recos.deleteTitle")}
        description={t("recos.deleteBody")}
        onConfirm={() => { handleDelete(deleteId!); setDeleteId(null); }}
      />

      {translateTarget && (
        <EntityDetailSheet
          open={true}
          onOpenChange={(v) => !v && setTranslateTarget(null)}
          entityType="recommendation"
          entity={translateTarget}
          title={`${translateTarget.code}${getTranslation(translateTarget, locale)?.title ? ` — ${getTranslation(translateTarget, locale)!.title}` : ""}`}
          meta={[
            { label: t("dash.table.country"),    value: countryName(translateTarget.codeCountry ?? "", locale) },
            { label: t("field.theme"),            value: translateTarget.theme ? t(`theme.${translateTarget.theme}` as any) : "—" },
            { label: t("dash.table.status"),      value: t(`statut.${normalizeStatut(translateTarget.statut)}` as any) },
            { label: t("dash.table.priority"),    value: translateTarget.priorite ? t(`priorite.${translateTarget.priorite}` as any) : "—" },
            { label: t("dash.table.visibility"),  value: translateTarget.visibilite ? t(`visibilite.${translateTarget.visibilite}` as any) : "—" },
          ]}
          onEdit={() => { openEdit(translateTarget); setTranslateTarget(null); }}
          onDelete={() => { setDeleteId(translateTarget.id); setTranslateTarget(null); }}
          onSave={async (lang, data) => {
            await recommendationService.addTranslation(translateTarget.id, lang, {
              title: data.title,
              summary: data.summary,
              body: data.body,
            });
          }}
        />
      )}

      {/* DETAIL SHEET */}
      <Sheet open={detailTarget !== null} onOpenChange={(v) => !v && setDetailTarget(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {detailTarget && (
            <div className="flex flex-col gap-6">
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <ThemeChip theme={detailTarget.theme} />
                  <StatusBadge status={detailTarget.statut ?? "INCONNU"} />
                  <PriorityBadge priority={detailTarget.priorite} />
                  <VisibilityBadge visibilite={detailTarget.visibilite!} />
                </div>
                <SheetTitle className="text-xl font-display leading-snug">
                  {getTranslation(detailTarget, locale)?.title ?? detailTarget.code}
                </SheetTitle>
                <p className="text-xs font-mono text-muted-foreground">{detailTarget.code}</p>
              </SheetHeader>

              {getTranslation(detailTarget, locale)?.summary && (
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {getTranslation(detailTarget, locale)?.summary}
                </p>
              )}

              {getTranslation(detailTarget, locale)?.body && (
                <div>
                  <h3 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {t("detail.body")}
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/85">
                    {getTranslation(detailTarget, locale)?.body}
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/30 p-4 divide-y divide-border">
                <SheetMetaRow label={t("dash.table.country")} value={countryName(detailTarget.codeCountry ?? "", locale)} />
                <SheetMetaRow label={t("field.theme")} value={detailTarget.theme ? t(`theme.${detailTarget.theme}` as any) : "—"} />
                <SheetMetaRow label={t("dash.table.status")} value={t(`statut.${normalizeStatut(detailTarget.statut)}` as any)} />
                <SheetMetaRow label={t("dash.table.priority")} value={detailTarget.priorite ? t(`priorite.${detailTarget.priorite}` as any) : "—"} />
                <SheetMetaRow label={t("dash.table.visibility")} value={detailTarget.visibilite ? t(`visibilite.${detailTarget.visibilite}` as any) : "—"} />
                {detailTarget.issuedDate && (
                  <SheetMetaRow label={t("detail.issued")} value={detailTarget.issuedDate} />
                )}
                {detailTarget.lastUpdate && (
                  <SheetMetaRow label={t("detail.lastUpdate")} value={detailTarget.lastUpdate} />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { openEdit(detailTarget); setDetailTarget(null); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <FileEdit className="h-4 w-4" />
                  {t("common.edit")}
                </button>
                <Link
                  to={`/recommendations/${detailTarget.id}`}
                  target="_blank"
                  onClick={() => setDetailTarget(null)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("dash.actions.publicPage")}
                </Link>
                <button
                  onClick={() => { setDeleteId(detailTarget.id); setDetailTarget(null); }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                  {t("common.delete")}
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}

export default DashRecosPage;

function SheetMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
