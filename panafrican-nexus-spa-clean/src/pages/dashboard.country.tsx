import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";
import { getCountryName } from "@/lib/translation";

import { useState, useEffect } from "react";
import { Search, Download, Plus, Edit, Trash2, MoreHorizontal, Globe } from "lucide-react";
import { EntityDetailSheet } from "@/components/ui/entity-detail-sheet";

import { useCountries } from "@/hooks/useCountries";
import { countryService } from "@/services/countryService";
import { Country, Region } from "@/types/country";
import { CountryCreateDialog } from "@/components/ui/country_create_dialog";
import { CountryFormDialog } from "@/components/ui/country-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
} from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import {
  AlertDialogDescription,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const REGIONS: Region[] = ["OUEST", "EST", "SUD", "NORD", "CENTRE"];

function DashCountryPage() {
  const { t, locale } = useI18n();

  const [q, setQ] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [page, setPage] = useState(0);
  const size = 15;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Country | null>(null);
  const [translateTarget, setTranslateTarget] = useState<Country | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const params = {
    region: region || undefined,
    page,
    size,
    search: q || undefined,
  };

  const { countries, pageInfo, loading, reload } = useCountries(params);

  const safeCountries = countries ?? [];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [q]);

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleEdit = (c: Country) => {
    setEditTarget(c);
  };

  const openDeleteDialog = (code: string) => {
    setSelectedCode(code);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCode) return;
    try {
      setLoadingAction(true);
      await countryService.delete(selectedCode);
      setPage(0);
      await reload();
    } finally {
      setLoadingAction(false);
      setDeleteOpen(false);
      setSelectedCode(null);
    }
  };

  const onCreateSubmit = async (data: any) => {
    setLoadingAction(true);
    await countryService.create(data);
    await reload();
    setCreateOpen(false);
    setLoadingAction(false);
  };

  const onUpdateSubmit = async (data: any) => {
    if (!editTarget) return;
    setLoadingAction(true);
    await countryService.update(editTarget.code, data);
    await reload();
    setEditTarget(null);
    setLoadingAction(false);
  };

  return (
    <DashboardLayout
      title={t("dash.nav.country")}
      subtitle={t("dash.subtitle.countries", { n: pageInfo?.totalElements ?? 0 })}
      actions={
        <>
          <button className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent">
            <Download className="h-4 w-4" />
            {t("dash.actions.export")}
          </button>

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t("dash.actions.country.new")}
          </button>
        </>
      }
    >
      <div className="rounded-xl border bg-card">
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.country")}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value as Region | "");
              setPage(0);
            }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-sm"
          >
            <option value="">{t("filter.allRegions")}</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {t(`region.${r}` as any)}
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
                <th className="px-4 py-3 font-medium">{t("dash.table.country")}</th>
                <th className="px-4 py-3 font-medium">{t("dash.table.region")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("dash.table.actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    {t("common.loading")}
                  </td>
                </tr>
              )}

              {!loading && safeCountries.map((c) => (
                <tr key={c.code} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono text-xs uppercase text-muted-foreground">
                    {c.code}
                  </td>

                  <td className="px-4 py-3 font-medium">{getCountryName(c, locale)}</td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {c.region ? t(`region.${c.region}` as any) : c.region}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(c)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTranslateTarget(c)}>
                          <Globe className="h-4 w-4 mr-2" />
                          {t("common.translate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(c.code)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && safeCountries.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {t("empty.countries")}
            </div>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">
                {t("common.page")} {page + 1} {t("common.of")} {pageInfo.totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(p + 1, pageInfo.totalPages - 1))}
                className={page + 1 >= pageInfo.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* FORM — CREATE */}
      <CountryCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={onCreateSubmit}
        loading={loadingAction}
      />

      {/* FORM — EDIT */}
      {editTarget && (
        <CountryFormDialog
          open={true}
          onOpenChange={(v) => !v && setEditTarget(null)}
          initial={editTarget}
          onSubmit={onUpdateSubmit}
          loading={loadingAction}
        />
      )}

      {translateTarget && (
        <EntityDetailSheet
          open={true}
          onOpenChange={(v) => !v && setTranslateTarget(null)}
          entityType="country"
          entity={translateTarget}
          title={`${translateTarget.code} — ${getCountryName(translateTarget, locale)}`}
          meta={[
            { label: t("field.region"), value: translateTarget.region ? t(`region.${translateTarget.region}` as any) : "—" },
          ]}
          onEdit={() => { handleEdit(translateTarget); setTranslateTarget(null); }}
          onDelete={() => { openDeleteDialog(translateTarget.code); setTranslateTarget(null); }}
          onSave={async (lang, data) => {
            await countryService.addTranslation(translateTarget.code, lang, data._value ?? "");
          }}
        />
      )}

      {/* DELETE CONFIRM */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dash.countries.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dash.countries.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={loadingAction}
            >
              {loadingAction ? t("common.saving") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

export default DashCountryPage;
