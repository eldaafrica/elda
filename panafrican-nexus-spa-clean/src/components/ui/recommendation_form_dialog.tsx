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
import { useEffect } from "react";
import {
  Priorite,
  Recommendation,
  RecommendationCreateRequest,
  Theme,
  Visibilite,
} from "@/types/recommendation";
import { useInstitutions } from "@/hooks/useInstitutions";
import { useMissions } from "@/hooks/useMissions";
import { priList, themeList, visibiliteList } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { CountrySelect } from "@/components/ui/country-select";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: RecommendationCreateRequest) => Promise<void>;
  initial: Recommendation;
  loading?: boolean;
};

export function RecommendationFormDialog({ open, onOpenChange, onSubmit, initial, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<RecommendationCreateRequest>({
    defaultValues: {
      code: initial.code ?? "",
      sourceLang: "fr",
      translations: {
        fr: {
          title: initial.translations?.fr?.title ?? "",
          summary: initial.translations?.fr?.summary ?? "",
          body: initial.translations?.fr?.body ?? "",
        },
        en: {
          title: initial.translations?.en?.title ?? "",
          summary: initial.translations?.en?.summary ?? "",
          body: initial.translations?.en?.body ?? "",
        },
      },
      missionId: initial.missionId ?? "",
      institutionId: initial.institutionId ?? "",
      codeCountry: initial.codeCountry ?? "",
      theme: initial.theme ?? "JURIDIQUE",
      priorite: initial.priorite ?? "MOYENNE",
      visibilite: initial.visibilite ?? "BROUILLON",
    },
  });

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
    form.reset({
      code: initial.code ?? "",
      sourceLang: "fr",
      translations: {
        fr: {
          title: initial.translations?.fr?.title ?? "",
          summary: initial.translations?.fr?.summary ?? "",
          body: initial.translations?.fr?.body ?? "",
        },
        en: {
          title: initial.translations?.en?.title ?? "",
          summary: initial.translations?.en?.summary ?? "",
          body: initial.translations?.en?.body ?? "",
        },
      },
      missionId: initial.missionId ?? "",
      institutionId: initial.institutionId ?? "",
      codeCountry: initial.codeCountry ?? "",
      theme: initial.theme ?? "JURIDIQUE",
      priorite: initial.priorite ?? "MOYENNE",
      visibilite: initial.visibilite ?? "BROUILLON",
    });
  }, [initial, form]);

  const submit = async (data: RecommendationCreateRequest) => {
    const cleanTranslations = Object.fromEntries(
      Object.entries(data.translations).filter(([, tr]) =>
        (tr.title && tr.title.trim()) ||
        (tr.summary && tr.summary.trim()) ||
        (tr.body && tr.body.trim())
      )
    );
    await onSubmit({ ...data, translations: cleanTranslations });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("form.reco.update")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="mt-2 space-y-5">
          {/* CODE */}
          <div className="space-y-2">
            <Label htmlFor="code">{t("field.code")}</Label>
            <Input id="code" {...form.register("code")} placeholder="REC-001" />
          </div>

          {/* CONTENU EN FRANÇAIS */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>
                {t("field.titleFr")}
                <span className="ml-1 text-xs text-destructive">*</span>
              </Label>
              <Input {...form.register("translations.fr.title" as any, { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>
                {t("field.summaryFr")}
                <span className="ml-1 text-xs text-destructive">*</span>
              </Label>
              <Textarea rows={3} {...form.register("translations.fr.summary" as any, { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>
                {t("field.bodyFr")}
                <span className="ml-1 text-xs text-destructive">*</span>
              </Label>
              <Textarea rows={6} {...form.register("translations.fr.body" as any, { required: true })} />
            </div>
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

          {/* ACTIONS */}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={loading} type="submit">
              {loading ? t("common.saving") : t("common.update")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
