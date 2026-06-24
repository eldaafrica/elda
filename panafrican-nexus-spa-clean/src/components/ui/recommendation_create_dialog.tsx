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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Priorite,
  RecommendationCreateRequest,
  RecommendationTranslation,
  Theme,
  Visibilite,
} from "@/types/recommendation";
import { useInstitutions } from "@/hooks/useInstitutions";
import { useMissions } from "@/hooks/useMissions";
import { priList, themeList, visibiliteList } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { CountrySelect } from "@/components/ui/country-select";

type FormValues = {
  code: string;
  titleFr: string;
  summaryFr: string;
  bodyFr: string;
  codeCountry: string;
  missionId: string;
  institutionId: string;
  theme: Theme;
  priorite: Priorite;
  visibilite: Visibilite;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: RecommendationCreateRequest) => Promise<void>;
  loading?: boolean;
};

const defaultValues: FormValues = {
  code: "",
  titleFr: "",
  summaryFr: "",
  bodyFr: "",
  codeCountry: "",
  missionId: "",
  institutionId: "",
  theme: "JURIDIQUE",
  priorite: "MOYENNE",
  visibilite: "BROUILLON",
};

export function RecommendationCreateDialog({ open, onOpenChange, onSubmit, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<FormValues>({ defaultValues });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { institutionsAll, loading: loadingInstitution, loadAllInstitutions } = useInstitutions();
  const { missionsAll, loading: loadingMissions, loadAllMissions } = useMissions();

  const safeMissions = Array.isArray(missionsAll) ? missionsAll : [];
  const safeInstitutions = Array.isArray(institutionsAll) ? institutionsAll : [];

  useEffect(() => {
    if (open) {
      loadAllMissions();
      loadAllInstitutions();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
  }, [open]);

  const submit = async (data: FormValues) => {
    setSubmitError(null);
    const hasFr =
      data.titleFr.trim() !== "" ||
      data.summaryFr.trim() !== "" ||
      data.bodyFr.trim() !== "";

    const translations: Record<string, RecommendationTranslation> = hasFr
      ? { fr: { title: data.titleFr, summary: data.summaryFr, body: data.bodyFr } }
      : {};

    const payload: RecommendationCreateRequest = {
      code: data.code,
      sourceLang: "fr",
      translations,
      missionId: data.missionId,
      institutionId: data.institutionId,
      codeCountry: data.codeCountry,
      theme: data.theme,
      priorite: data.priorite,
      visibilite: data.visibilite,
    };

    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Erreur inconnue";
      setSubmitError(
        err?.response?.status === 409
          ? `Le code "${data.code}" est déjà utilisé.`
          : msg
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("form.reco.create")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="mt-2 space-y-5">
          {/* CODE */}
          <div className="space-y-2">
            <Label htmlFor="code">{t("field.code")}</Label>
            <Input id="code" {...form.register("code")} placeholder="REC-001" />
          </div>

          {/* TITRE (FR) — required */}
          <div className="space-y-2">
            <Label htmlFor="titleFr">
              {t("field.titleFr")}
              <span className="ml-1 text-xs text-destructive">*</span>
            </Label>
            <Input
              id="titleFr"
              {...form.register("titleFr", { required: true })}
            />
          </div>

          {/* RÉSUMÉ (FR) — optional */}
          <div className="space-y-2">
            <Label htmlFor="summaryFr">{t("field.summaryFr")}</Label>
            <Textarea
              id="summaryFr"
              rows={3}
              {...form.register("summaryFr")}
            />
          </div>

          {/* CONTENU (FR) — optional */}
          <div className="space-y-2">
            <Label htmlFor="bodyFr">{t("field.bodyFr")}</Label>
            <Textarea
              id="bodyFr"
              rows={6}
              {...form.register("bodyFr")}
            />
          </div>

          {/* PAYS */}
          <div className="space-y-2">
            <Label>{t("field.country")}</Label>
            <CountrySelect
              value={form.watch("codeCountry") ?? ""}
              onChange={(v) => form.setValue("codeCountry", v)}
            />
          </div>

          {/* MISSION + INSTITUTION */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("field.mission")}</Label>
              <Select
                value={form.watch("missionId") || ""}
                onValueChange={(value) => form.setValue("missionId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("field.selectMission")} />
                </SelectTrigger>
                <SelectContent>
                  {loadingMissions ? (
                    <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>
                  ) : safeMissions.length > 0 ? (
                    safeMissions.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.code} — {m.cycle}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>{t("loading.noMissions")}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("field.institution")}</Label>
              <Select
                value={form.watch("institutionId") || ""}
                onValueChange={(value) => form.setValue("institutionId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("field.selectInstitution")} />
                </SelectTrigger>
                <SelectContent>
                  {loadingInstitution ? (
                    <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>
                  ) : safeInstitutions.length > 0 ? (
                    safeInstitutions.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>{t("loading.noInstitutions")}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* THEME + PRIORITE + VISIBILITE */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("field.theme")}</Label>
              <Select
                value={form.watch("theme")}
                onValueChange={(v) => form.setValue("theme", v as Theme)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {themeList.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {t(`theme.${theme}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("field.priority")}</Label>
              <Select
                value={form.watch("priorite")}
                onValueChange={(v) => form.setValue("priorite", v as Priorite)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priList.map((p) => (
                    <SelectItem key={p} value={p}>
                      {t(`priorite.${p}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("field.visibility")}</Label>
              <Select
                value={form.watch("visibilite")}
                onValueChange={(v) => form.setValue("visibilite", v as Visibilite)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {visibiliteList.map((v) => (
                    <SelectItem key={v} value={v}>
                      {t(`visibilite.${v}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ERROR */}
          {submitError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}

          {/* ACTIONS */}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={loading} type="submit">
              {loading ? t("common.saving") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
