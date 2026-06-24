import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";
import { getTranslation } from "@/lib/translation";
import { StatusBadge, normalizeStatut } from "@/components/badges";
import { useFollowUps } from "@/hooks/useFollowUps";
import { useRecommendations } from "@/hooks/useRecommendations";
import { FollowUpFormDialog } from "@/components/ui/followup_form_dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Globe } from "lucide-react";
import type { FollowUp, FollowUpCreateRequest } from "@/services/followUpService";
import { followUpService } from "@/services/followUpService";
import { EntityDetailSheet } from "@/components/ui/entity-detail-sheet";
import { useAuth } from "@/context/AuthContext";

function FollowupsPage() {
  const { t, locale } = useI18n();
  const { hasRole } = useAuth();
  const canEdit = hasRole("ADMIN") || hasRole("EDITEUR");

  const [selectedRecoId, setSelectedRecoId] = useState<string | undefined>(undefined);
  const { followUps, loading, error, create, update, remove } = useFollowUps(selectedRecoId);
  const { recommendations } = useRecommendations({ size: 200 });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FollowUp | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [translateTarget, setTranslateTarget] = useState<FollowUp | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (f: FollowUp) => {
    setEditing(f);
    setOpen(true);
  };

  const handleSubmit = async (data: FollowUpCreateRequest) => {
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, data);
      } else {
        await create(data);
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const recoTitle = (id: string) => {
    const r = recommendations.find((r) => r.id === id);
    if (!r) return id;
    return getTranslation(r, locale)?.title ?? id;
  };

  return (
    <>
      <DashboardLayout
        title={t("dash.nav.followups")}
        subtitle={t("dash.subtitle.followups", { n: followUps.length })}
        actions={
          canEdit ? (
            <Button onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" />
              {t("dash.actions.newFollowup")}
            </Button>
          ) : undefined
        }
      >
        {/* FILTER */}
        <div className="mb-4 flex items-center gap-3">
          <Select
            value={selectedRecoId ?? "ALL"}
            onValueChange={(v) => setSelectedRecoId(v === "ALL" ? undefined : v)}
          >
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder={t("filter.byReco")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filter.allRecos")}</SelectItem>
              {recommendations.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  <span className="font-mono text-xs text-muted-foreground mr-2">{r.code}</span>
                  {getTranslation(r, locale)?.title ?? r.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* LIST */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading && (
            <div className="p-6 text-sm text-muted-foreground">{t("common.loading")}</div>
          )}

          {error && (
            <div className="p-6 text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && followUps.length > 0 && (
            <ul className="divide-y divide-border">
              {followUps.map((f) => (
                <li key={f.id} className="px-5 py-4 hover:bg-accent/40">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{f.date}</span>
                        <StatusBadge status={normalizeStatut(f.statut)} />
                        {f.author && (
                          <span className="text-xs text-muted-foreground">— {f.author}</span>
                        )}
                      </div>

                      {!selectedRecoId && (
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {recoTitle(f.recommendationId)}
                        </p>
                      )}

                      {f.translations?.[locale] && (
                        <p className="mt-1 text-sm text-foreground/80">
                          {f.translations[locale]}
                        </p>
                      )}
                    </div>

                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(f)}>
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTranslateTarget(f)}>
                            <Globe className="mr-2 h-3.5 w-3.5" />
                            {t("common.translate")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(f.id)}
                            className="text-red-500"
                          >
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && followUps.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {t("empty.followups")}
              {canEdit && (
                <>
                  {" "}
                  <button onClick={openCreate} className="text-primary hover:underline">
                    {t("dash.followups.firstCta")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>

      <FollowUpFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        initial={editing}
        recommendationId={selectedRecoId}
        loading={saving}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("dash.followups.deleteTitle")}
        description={t("dash.followups.deleteBody")}
        onConfirm={() => { handleDelete(deleteId!); setDeleteId(null); }}
      />

      {translateTarget && (
        <EntityDetailSheet
          open={true}
          onOpenChange={(v) => !v && setTranslateTarget(null)}
          entityType="followup"
          entity={translateTarget}
          title={`${t("dash.nav.followups")} — ${translateTarget.date ?? "—"}`}
          meta={[
            { label: t("dash.table.status"), value: translateTarget.statut ? t(`statut.${translateTarget.statut}` as any) : "—" },
            ...(translateTarget.author ? [{ label: t("field.author"), value: translateTarget.author }] : []),
          ]}
          onEdit={() => { openEdit(translateTarget); setTranslateTarget(null); }}
          onDelete={() => { setDeleteId(translateTarget.id); setTranslateTarget(null); }}
          onSave={async (lang, data) => {
            await followUpService.addTranslation(translateTarget.id, lang, data._value ?? "");
          }}
        />
      )}
    </>
  );
}

export default FollowupsPage;
