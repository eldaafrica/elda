import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";
import { Institution, InstitutionCreateRequest } from "@/types";
import { getInstitutionName } from "@/lib/translation";

import { Building2, Plus, Edit, Trash2, MoreHorizontal, Search, Globe } from "lucide-react";
import { EntityDetailSheet } from "@/components/ui/entity-detail-sheet";
import { institutionService } from "@/services/institutionService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import { InstitutionCreateDialog } from "@/components/ui/institution_create_dialog";
import { InstitutionFormDialog } from "@/components/ui/institution_form_dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useInstitutions } from "@/hooks/useInstitutions";
import { countryName, categoryList } from "@/lib/mock-data";

export default function InstitutionsPage() {
  const { t, locale } = useI18n();

  const [country, setCountry] = useState("");
  const [category, setCategory] = useState<Institution["category"] | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const size = 20;

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Institution | null>(null);
  const [translateTarget, setTranslateTarget] = useState<Institution | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { institutions, loading, create, update, remove, pageInfo } = useInstitutions({
    page,
    size,
    country: country || undefined,
    category: category === "ALL" ? undefined : category,
  });

  const openCreate = () => setCreateOpen(true);

  const openEdit = (i: Institution) => setEditTarget(i);

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const handleCreate = async (data: InstitutionCreateRequest) => {
    try {
      setLoadingAction(true);
      await create(data);
      setCreateOpen(false);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdate = async (data: InstitutionCreateRequest) => {
    try {
      setLoadingAction(true);
      if (!editTarget) return;
      await update(editTarget.id, data);
      setEditTarget(null);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <DashboardLayout
        title={t("dash.nav.institutions")}
        subtitle={t("dash.subtitle.institutions", { n: pageInfo?.totalElements ?? 0 })}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            {t("dash.actions.newInstitution")}
          </Button>
        }
      >
        {/* FILTERS */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search.institution")}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v as Institution["category"] | "ALL");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder={t("filter.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filter.allCategories")}</SelectItem>
              {categoryList.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`category.${cat}` as any)}
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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {institutions.map((i) => (
              <div key={i.id} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-medium">{getInstitutionName(i, locale)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t(`category.${i.category}` as any)} · {countryName(i.country, locale)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(i)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateTarget(i)}>
                        <Globe className="h-4 w-4 mr-2" />
                        {t("common.translate")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(i.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && institutions.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">{t("empty.institutions")}</div>
        )}

        {/* PAGINATION */}
        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
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

      <InstitutionCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={loadingAction}
      />

      {editTarget && (
        <InstitutionFormDialog
          open={true}
          onOpenChange={(v) => !v && setEditTarget(null)}
          initial={editTarget!}
          onSubmit={handleUpdate}
          loading={loadingAction}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("dash.institutions.deleteTitle")}
        description={t("dash.institutions.deleteBody")}
        onConfirm={() => { handleDelete(deleteId!); setDeleteId(null); }}
      />

      {translateTarget && (
        <EntityDetailSheet
          open={true}
          onOpenChange={(v) => !v && setTranslateTarget(null)}
          entityType="institution"
          entity={translateTarget}
          title={getInstitutionName(translateTarget, locale)}
          meta={[
            { label: t("field.category"), value: t(`category.${translateTarget.category}` as any) },
            { label: t("field.country"),  value: translateTarget.country ?? "—" },
          ]}
          onEdit={() => { openEdit(translateTarget); setTranslateTarget(null); }}
          onDelete={() => { setDeleteId(translateTarget.id); setTranslateTarget(null); }}
          onSave={async (lang, data) => {
            await institutionService.addTranslation(translateTarget.id, lang, data._value ?? "");
          }}
        />
      )}
    </>
  );
}
