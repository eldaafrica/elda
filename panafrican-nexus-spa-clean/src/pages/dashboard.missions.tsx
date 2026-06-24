import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";
import { countryName, missionTypeList } from "@/lib/mock-data";
import { getTranslation } from "@/lib/translation";

import { Plus, Map, Calendar, MoreHorizontal, Search, Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useMissions } from "@/hooks/useMissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MissionCreateDialog } from "@/components/ui/mission_create_dialog";
import { MissionFormDialog } from "@/components/ui/missionForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Mission, MissionCreateRequest, MissionType } from "@/types";
import { EntityDetailSheet } from "@/components/ui/entity-detail-sheet";
import { missionService } from "@/services/missionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function DashMissionsPage() {
  const { t, locale } = useI18n();

  const [type, setType] = useState<MissionType | "ALL">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const size = 9;

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Mission | null>(null);
  const [translateTarget, setTranslateTarget] = useState<Mission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const missionParams = useMemo(() => ({
    page,
    size,
    type: type === "ALL" ? undefined : type,
    search: search.trim() || undefined,
  }), [page, size, type, search]);

  const { missions, loading, create, update, remove, pageInfo } = useMissions(missionParams);

  const openCreate = () => setCreateOpen(true);

  const openEdit = (m: Mission) => setEditTarget(m);

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const handleCreate = async (data: MissionCreateRequest) => {
    await create(data);
    setCreateOpen(false);
  };

  const handleUpdate = async (data: MissionCreateRequest) => {
    if (!editTarget) return;
    await update(editTarget.id, data);
    setEditTarget(null);
  };

  return (
    <>
      <DashboardLayout
        title={t("dash.nav.missions")}
        subtitle={t("dash.subtitle.missions", { n: pageInfo?.totalElements ?? 0 })}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            {t("dash.actions.newMission")}
          </Button>
        }
      >
        {/* FILTERS */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search.mission")}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as MissionType | "ALL");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t("filter.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filter.allTypes")}</SelectItem>
              {missionTypeList.map((mt) => (
                <SelectItem key={mt} value={mt}>
                  {t(`missionType.${mt}` as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-10 text-center text-muted-foreground">{t("common.loading")}</div>
        )}

        {/* GRID */}
        {!loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {missions.map((m) => (
              <article
                key={m.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {m.code}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(m)}>
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateTarget(m)}>
                        <Globe className="mr-2 h-3.5 w-3.5" />
                        {t("common.translate")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(m.id)} className="text-red-500">
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <span className="mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {t(`missionType.${m.type}` as any)}
                </span>

                <h2 className="mt-2 text-lg font-semibold">{m.cycle}</h2>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>
                    <Map className="h-3 w-3 inline mr-1" />
                    {countryName(m.country, locale)}
                  </span>
                  <span>
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {m.startDate} → {m.endDate}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {getTranslation(m, locale)?.summary}
                </p>

                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span>{t("field.leadObserver")}: {m.leadObserver}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && missions.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {t("empty.missions")}
          </div>
        )}

        {/* PAGINATION */}
        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              {t("common.previous")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {t("common.page")} {page + 1} {t("common.of")} {pageInfo.totalPages}
            </div>
            <Button
              variant="outline"
              disabled={page + 1 >= pageInfo.totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, pageInfo.totalPages - 1))}
            >
              {t("common.next")}
            </Button>
          </div>
        )}
      </DashboardLayout>

      <MissionCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      {editTarget && (
        <MissionFormDialog
          open={true}
          onOpenChange={(v) => !v && setEditTarget(null)}
          initial={editTarget!}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("dash.missions.deleteTitle")}
        description={t("dash.missions.deleteBody")}
        onConfirm={() => { handleDelete(deleteId!); setDeleteId(null); }}
      />

      {translateTarget && (
        <EntityDetailSheet
          open={true}
          onOpenChange={(v) => !v && setTranslateTarget(null)}
          entityType="mission"
          entity={translateTarget}
          title={`${translateTarget.code} — ${translateTarget.cycle}`}
          meta={[
            { label: t("field.type"),    value: t(`missionType.${translateTarget.type}` as any) },
            { label: t("field.country"), value: countryName(translateTarget.country, locale) },
            { label: t("field.startDate"), value: translateTarget.startDate ?? "—" },
            { label: t("field.endDate"),   value: translateTarget.endDate ?? "—" },
          ]}
          onEdit={() => { openEdit(translateTarget); setTranslateTarget(null); }}
          onDelete={() => { setDeleteId(translateTarget.id); setTranslateTarget(null); }}
          onSave={async (lang, data) => {
            await missionService.addTranslation(translateTarget.id, lang, { summary: data.summary });
          }}
        />
      )}
    </>
  );
}

export default DashMissionsPage;
