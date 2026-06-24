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
import { MissionCreateRequest, MissionType } from "@/types/mission";
import { useUsers } from "@/hooks/useUsers";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/lib/i18n";
import { getCountryName } from "@/lib/translation";
import { missionTypeList } from "@/lib/mock-data";

type FormValues = {
  code: string;
  type: MissionType;
  country: string;
  cycle: string;
  startDate?: string;
  endDate?: string;
  leadObserver?: string;
  institutionId?: string;
  summaryFr?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: MissionCreateRequest) => Promise<void>;
  loading?: boolean;
};

export function MissionCreateDialog({ open, onOpenChange, onSubmit, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<FormValues>({
    defaultValues: {
      code: "",
      type: "OBSERVATION",
      country: "",
      cycle: "",
      startDate: "",
      endDate: "",
      leadObserver: "",
      institutionId: "",
      summaryFr: "",
    },
  });

  const { institutionsAll, loading: loadingInstitution, loadAllInstitutions } = useInstitutions();
  const { users } = useUsers();
  const { countriesAll, loading: loadingCountries, loadAllCountries } = useCountries();

  const safeUsers = users ?? [];
  const safeInstitutions = Array.isArray(institutionsAll) ? institutionsAll : [];
  const safeCountries = Array.isArray(countriesAll) ? countriesAll : [];

  useEffect(() => {
    if (open) {
      loadAllCountries();
      loadAllInstitutions();
      form.reset({
        code: "",
        type: "OBSERVATION",
        country: "",
        cycle: "",
        startDate: "",
        endDate: "",
        leadObserver: "",
        institutionId: "",
        summaryFr: "",
      });
    }
  }, [open, loadAllCountries, loadAllInstitutions]);

  const submit = async (data: FormValues) => {
    const summary = data.summaryFr?.trim() ?? "";
    const translations: Record<string, { summary: string }> = {};
    if (summary) translations["fr"] = { summary };

    const payload: MissionCreateRequest = {
      code: data.code,
      type: data.type,
      country: data.country,
      cycle: data.cycle,
      sourceLang: "fr",
      translations,
      ...(data.startDate ? { startDate: data.startDate } : {}),
      ...(data.endDate ? { endDate: data.endDate } : {}),
      ...(data.leadObserver ? { leadObserver: data.leadObserver } : {}),
      ...(data.institutionId ? { institutionId: data.institutionId } : {}),
    };

    await onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("form.mission.create")}</DialogTitle>
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

          {/* PAYS + CYCLE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("field.country")}</Label>
              <Select
                value={form.watch("country") || ""}
                onValueChange={(v) => form.setValue("country", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("field.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  {loadingCountries ? (
                    <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>
                  ) : safeCountries.length > 0 ? (
                    safeCountries.map((c) => (
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

          {/* OBSERVATEUR PRINCIPAL */}
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
              onValueChange={(v) => form.setValue("institutionId", v)}
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

          {/* RESUME (FRANCAIS) — optionnel */}
          <div className="space-y-2">
            <Label htmlFor="sumFr">{t("field.summaryFr")}</Label>
            <Textarea
              id="sumFr"
              rows={4}
              {...form.register("summaryFr")}
            />
          </div>

          {/* ACTIONS */}
          <DialogFooter>
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
