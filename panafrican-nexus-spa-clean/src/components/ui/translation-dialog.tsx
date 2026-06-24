import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useLanguages } from "@/hooks/useLanguages";

// ── Field definitions per entity type ────────────────────────────────────────

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

const ENTITY_FIELDS: Record<EntityType, FieldDef[]> = {
  recommendation: [
    { key: "title", labelKey: "field.title" },
    { key: "summary", labelKey: "field.summary", multiline: true, rows: 3 },
    { key: "body", labelKey: "field.body", multiline: true, rows: 5 },
  ],
  mission: [
    { key: "summary", labelKey: "field.summary", multiline: true, rows: 4 },
  ],
  country: [{ key: "_value", labelKey: "field.name" }],
  institution: [{ key: "_value", labelKey: "field.name" }],
  followup: [
    { key: "_value", labelKey: "field.note", multiline: true, rows: 4 },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getExistingValues(
  translations: Record<string, any>,
  lang: string
): Record<string, string> {
  const existing = translations[lang];
  if (!existing) return {};
  if (typeof existing === "string") return { _value: existing };
  return Object.fromEntries(
    Object.entries(existing).map(([k, v]) => [k, String(v ?? "")])
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entityType: EntityType;
  sourceLang: string;
  /** Current translations map from the entity (Record<lang, string | object>). */
  currentTranslations: Record<string, any>;
  /** Called with (lang, flat key→value map). Parent maps this to the right service call. */
  onSave: (lang: string, data: Record<string, string>) => Promise<void>;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TranslationDialog({
  open,
  onOpenChange,
  entityType,
  sourceLang,
  currentTranslations,
  onSave,
}: Props) {
  const { t, locale } = useI18n();
  const { languages, loading: loadingLangs } = useLanguages();

  const fields = ENTITY_FIELDS[entityType];

  const [selectedLang, setSelectedLang] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Pre-fill form when language changes
  useEffect(() => {
    if (selectedLang) {
      setValues(getExistingValues(currentTranslations, selectedLang));
    } else {
      setValues({});
    }
  }, [selectedLang, currentTranslations]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedLang("");
      setValues({});
    }
  }, [open]);

  const translatedLangs = Object.keys(currentTranslations).filter(
    (l) => {
      const v = currentTranslations[l];
      if (!v) return false;
      if (typeof v === "string") return v.trim() !== "";
      return Object.values(v).some((x) => x && String(x).trim() !== "");
    }
  );

  const handleSave = async () => {
    if (!selectedLang) return;
    setSaving(true);
    try {
      await onSave(selectedLang, values);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const langLabel = (code: string) => {
    const lang = languages.find((l) => l.code === code);
    if (!lang) return code.toUpperCase();
    return locale === "fr" ? lang.nameFr : lang.nameEn;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("form.translate.title")}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Existing translations badges */}
          {translatedLangs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {t("form.translate.existing")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {translatedLangs.map((l) => (
                  <Badge
                    key={l}
                    variant={l === sourceLang ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedLang(l)}
                  >
                    {langLabel(l).toUpperCase()}
                    {l === sourceLang && (
                      <span className="ml-1 opacity-60">
                        {t("form.translate.source")}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Language selector */}
          <div className="space-y-2">
            <Label>{t("form.translate.selectLang")}</Label>
            {loadingLangs ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : languages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("form.translate.noLangs")}</p>
            ) : (
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.translate.selectLang")} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {locale === "fr" ? lang.nameFr : lang.nameEn}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({lang.code})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Fields for selected language */}
          {selectedLang && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              {fields.map((field) =>
                field.multiline ? (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{t(field.labelKey as any)}</Label>
                    <Textarea
                      rows={field.rows ?? 3}
                      value={values[field.key] ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{t(field.labelKey as any)}</Label>
                    <Input
                      value={values[field.key] ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!selectedLang || saving}
            onClick={handleSave}
          >
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
