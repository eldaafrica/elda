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

import { useInstitutions } from "@/hooks/useInstitutions";
import { Mission, MissionCreateRequest, MissionType } from "@/types/mission";
import { useUsers } from "@/hooks/useUsers";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/lib/i18n";
import { getCountryName } from "@/lib/translation";
import { missionTypeList } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: MissionCreateRequest) => Promise<void>;
  initial: Mission;
  loading?: boolean;
};

export function MissionFormDialog({ open, onOpenChange, onSubmit, initial, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<MissionCreateRequest>({
    defaultValues: {
      code: "",
      type: "OBSERVATION",
      country: "",
      cycle: "",
      startDate: "",
      endDate: "",
      leadObserver: "",
      institutionId: "",
      sourceLang: "fr",
      translations: { fr: { summary: "" }, en: { summary: "" } },
    },
  });

  const { institutionsAll, loading: loadingInstitution, loadAllInstitutions } = useInstitutions();
  const { users } = useUsers();
  const { countriesAll, loading: loadingCountries, loadAllCountries } = useCountries();

  const safeUsers = users ?? [];
  const safeInstitutions = Array.isArray(institutionsAll) ? institutionsAll : [];
  const safeCountry = Array.isArray(countriesAll) ? countriesAll : [];

  useEffect(() => {
    if (open) {
      loadAllCountries();
      loadAllInstitutions();
    }
  }, [open, loadAllCountries, loadAllInstitutions]);

  useEffect(() => {
    form.reset({
      code: initial.code ?? "",
      type: initial.type ?? "OBSERVATION",
      country: initial.country ?? "",
      cycle: initial.cycle ?? "",
      startDate: initial.startDate ?? "",
      endDate: initial.endDate ?? "",
      leadObserver: initial.leadObserver ?? "",
      institutionId: initial.institutionId ?? "",
      sourceLang: "fr",
      translations: {
        fr: { summary: initial.translations?.fr?.summary ?? "" },
        en: { summary: initial.translations?.en?.summary ?? "" },
      },
    });
  }, [initial, form]);

  const submit = async (data: MissionCreateRequest) => {
    const cleanTranslations = Object.fromEntries(
      Object.entries(data.translations).filter(([, tr]) => tr.summary && tr.summary.trim())
    );
    await onSubmit({ ...data, translations: cleanTranslations });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("form.mission.update")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4 mt-2">
          {/* CODE */}
          <div className="space-y-2">
            <Label htmlFor="mCode">{t("field.code")}</Label>
            <Input id="mCode" {...form.register("code", { required: true })} />
          </div>

          {/* TYPE */}
          <div className="space-y-2">
            <Label>{t("field.type")}</Label>
            <Select
              value={form.watch("type") ?? "OBSERVATION"}
              onValueChange={(v) => form.setValue("type", v as MissionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("field.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {missionTypeList.map((mt) => (
                  <SelectItem key={mt} value={mt}>
                    {t(`missionType.${mt}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* COUNTRY + CYCLE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("field.country")}</Label>
              <Select
                value={form.watch("country") || ""}
                onValueChange={(value) => form.setValue("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("field.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  {loadingCountries ? (
                    <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>
                  ) : safeCountry.length > 0 ? (
                    safeCountry.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {getCountryName(c, "fr")}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>{t("loading.noCountries")}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mCycle">{t("field.cycle")}</Label>
              <Input id="mCycle" {...form.register("cycle", { required: true })} />
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("field.startDate")}</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("field.endDate")}</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
            </div>
          </div>

          {/* LEAD OBSERVER */}
          <div className="space-y-2">
            <Label>{t("field.leadObserver")}</Label>
            <Select
              value={form.watch("leadObserver") || ""}
              onValueChange={(v) => form.setValue("leadObserver", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("field.selectUser")} />
              </SelectTrigger>
              <SelectContent>
                {safeUsers.map((u) => (
                  <SelectItem key={u.id} value={u.name}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* INSTITUTION */}
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

          {/* RÉSUMÉ (FRANÇAIS) */}
          <div className="space-y-2">
            <Label htmlFor="sumFr">
              {t("field.summaryFr")}
              <span className="ml-1 text-xs text-destructive">*</span>
            </Label>
            <Textarea
              id="sumFr"
              rows={4}
              {...form.register("translations.fr.summary" as any, { required: true })}
            />
          </div>

          {/* TRADUCTIONS */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-semibold">{t("form.translations")}</p>
            <div className="space-y-2">
              <Label htmlFor="sumEn">{t("field.summaryEn")}</Label>
              <Textarea
                id="sumEn"
                rows={4}
                {...form.register("translations.en.summary" as any)}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <DialogFooter>
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
