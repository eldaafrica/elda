import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useLanguages } from "@/hooks/useLanguages";
import { CheckCircle2, AlertCircle, Circle, Edit, Trash2, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EntityType =
  | "recommendation"
  | "mission"
  | "country"
  | "institution"
  | "followup";

type FieldDef = {
  key: string;
  labelKey: string;
  multiline?: boolean;
  rows?: number;
};

export interface EntityDetailSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entityType: EntityType;
  entity: any;
  /** Display title shown in the sheet header */
  title: string;
  /** Key-value metadata pairs shown below the title */
  meta?: { label: string; value: string }[];
  onSave: (lang: string, data: Record<string, string>) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Force a specific language tab open on mount */
  defaultLang?: string;
}

// ─── Field config per entity type ─────────────────────────────────────────────

const ENTITY_FIELDS: Record<EntityType, FieldDef[]> = {
  recommendation: [
    { key: "title",   labelKey: "field.title" },
    { key: "summary", labelKey: "field.summary", multiline: true, rows: 3 },
    { key: "body",    labelKey: "field.body",    multiline: true, rows: 6 },
  ],
  mission: [
    { key: "summary", labelKey: "field.summary", multiline: true, rows: 5 },
  ],
  country:     [{ key: "_value", labelKey: "field.name" }],
  institution: [{ key: "_value", labelKey: "field.name" }],
  followup:    [{ key: "_value", labelKey: "field.note", multiline: true, rows: 5 }],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise any entity's translations to Record<lang, Record<fieldKey, string>> */
function normalise(entity: any, type: EntityType): Record<string, Record<string, string>> {
  if (!entity?.translations) return {};
  const out: Record<string, Record<string, string>> = {};

  if (type === "recommendation" || type === "mission") {
    for (const [lang, obj] of Object.entries(entity.translations as Record<string, any>)) {
      out[lang] = { ...(obj ?? {}) };
    }
  } else {
    for (const [lang, val] of Object.entries(entity.translations as Record<string, string>)) {
      out[lang] = { _value: val ?? "" };
    }
  }
  return out;
}

type LangStatus = "complete" | "partial" | "missing";

function langStatus(fields: FieldDef[], trans: Record<string, string> | undefined): LangStatus {
  if (!trans) return "missing";
  const filled = fields.filter(f => (trans[f.key] ?? "").trim().length > 0).length;
  if (filled === 0) return "missing";
  if (filled < fields.length) return "partial";
  return "complete";
}

function StatusIcon({ status }: { status: LangStatus }) {
  if (status === "complete") return <CheckCircle2 className="h-3 w-3 text-green-500" />;
  if (status === "partial")  return <AlertCircle  className="h-3 w-3 text-amber-500" />;
  return <Circle className="h-3 w-3 opacity-30" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EntityDetailSheet({
  open,
  onOpenChange,
  entityType,
  entity,
  title,
  meta = [],
  onSave,
  onEdit,
  onDelete,
  defaultLang,
}: EntityDetailSheetProps) {
  const { t } = useI18n();
  const { languages } = useLanguages();

  const fields      = ENTITY_FIELDS[entityType];
  const sourceLang  = entity?.sourceLang ?? "fr";
  const allTrans    = normalise(entity, entityType);

  const [activeLang,  setActiveLang]  = useState<string>(defaultLang ?? sourceLang);
  const [form,        setForm]        = useState<Record<string, string>>({});
  const [saving,      setSaving]      = useState(false);
  const [savedMsg,    setSavedMsg]    = useState(false);
  // Overlay: tracks translations saved in this session for instant status icon refresh
  const [localTrans,  setLocalTrans]  = useState<Record<string, Record<string, string>>>({});

  // Merge server translations with local overlay
  const effectiveTrans = { ...allTrans, ...localTrans };

  // Reset form when lang changes (prefer local overlay, fall back to server data)
  useEffect(() => {
    const existing = effectiveTrans[activeLang] ?? {};
    const init: Record<string, string> = {};
    for (const f of fields) init[f.key] = existing[f.key] ?? "";
    setForm(init);
    setSavedMsg(false);
  }, [activeLang, entity]);

  useEffect(() => {
    setActiveLang(defaultLang ?? sourceLang);
    setLocalTrans({});
  }, [entity?.id, defaultLang]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(activeLang, form);
      // Update local overlay so status icons refresh immediately
      setLocalTrans(prev => ({ ...prev, [activeLang]: { ...form } }));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const isSource   = activeLang === sourceLang;
  const sourceTrans = effectiveTrans[sourceLang];
  const activeName  = languages.find(l => l.code === activeLang)?.nameFr ?? activeLang.toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideCloseButton
        className="flex flex-col w-full sm:max-w-2xl p-0 gap-0 overflow-hidden"
      >
        {/* Accessibility */}
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetDescription className="sr-only">{entityType} details and translations</SheetDescription>

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0 bg-background">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {t(`dash.nav.${entityType === "followup" ? "followups" : entityType === "recommendation" ? "recommendations" : entityType === "institution" ? "institutions" : entityType === "country" ? "country" : "missions"}` as any)}
            </p>
            <h2 className="text-base font-semibold leading-tight truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-8 px-3 text-xs">
                <Edit className="h-3.5 w-3.5" />
                {t("common.edit")}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </div>

        {/* ── Metadata ── */}
        {meta.length > 0 && (
          <div className="shrink-0 border-b bg-muted/20 px-6 py-3">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {meta.map(m => (
                <div key={m.label} className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-medium text-foreground">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Source reference panel (visible when editing a non-source lang) */}
          {!isSource && sourceTrans && Object.values(sourceTrans).some(v => v?.trim()) && (
            <div className="mx-6 mt-5 rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {t("form.translate.source")} — {sourceLang.toUpperCase()}
              </p>
              {fields.map(f =>
                sourceTrans[f.key]?.trim() ? (
                  <div key={f.key} className="mb-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                      {t(f.labelKey as any)}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/80 line-clamp-4">
                      {sourceTrans[f.key]}
                    </p>
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Language tabs */}
          <div className="px-6 mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
              {t("form.translate.title")}
            </p>

            {languages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("form.translate.noLangs")}</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-6">
                {languages.map(lang => {
                  const status   = langStatus(fields, effectiveTrans[lang.code]);
                  const isActive = lang.code === activeLang;
                  const isSrc    = lang.code === sourceLang;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLang(lang.code)}
                      className={[
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background hover:bg-accent border-border text-foreground",
                      ].join(" ")}
                    >
                      <StatusIcon status={isSrc ? "complete" : status} />
                      <span>{lang.code.toUpperCase()}</span>
                      {isSrc && (
                        <span className={[
                          "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                          isActive ? "bg-white/20" : "bg-muted text-muted-foreground",
                        ].join(" ")}>
                          src
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Translation form ── */}
            <div className="space-y-4 pb-8">
              <p className="text-sm font-semibold">
                {isSource
                  ? `${activeName} — ${t("form.translate.source")}`
                  : activeName
                }
              </p>

              {fields.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t(f.labelKey as any)}
                  </Label>
                  {f.multiline ? (
                    <Textarea
                      value={form[f.key] ?? ""}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      rows={f.rows ?? 3}
                      className="resize-none"
                      placeholder={`${t(f.labelKey as any)} en ${activeName}…`}
                    />
                  ) : (
                    <Input
                      value={form[f.key] ?? ""}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={`${t(f.labelKey as any)} en ${activeName}…`}
                    />
                  )}
                </div>
              ))}

              {/* Save row */}
              <div className="flex items-center justify-between pt-2">
                <div className="h-6">
                  {savedMsg && (
                    <span className="text-xs text-green-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("form.translate.saved")}
                    </span>
                  )}
                </div>
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving
                    ? t("common.saving")
                    : `${t("common.save")} — ${activeName}`
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
