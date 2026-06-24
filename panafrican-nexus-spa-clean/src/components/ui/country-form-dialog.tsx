import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Country, CountryCreateRequest, Region } from "@/types/country";
import { useI18n } from "@/lib/i18n";

const REGIONS: Region[] = ["OUEST", "EST", "SUD", "NORD", "CENTRE"];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: CountryCreateRequest) => Promise<void>;
  initial: Country;
  loading?: boolean;
};

export function CountryFormDialog({ open, onOpenChange, onSubmit, initial, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<CountryCreateRequest>({
    defaultValues: {
      code: initial.code,
      region: initial.region,
      sourceLang: "fr",
      translations: {
        fr: initial.translations?.fr ?? "",
        en: initial.translations?.en ?? "",
      },
    },
  });

  useEffect(() => {
    form.reset({
      code: initial.code,
      region: initial.region,
      sourceLang: "fr",
      translations: {
        fr: initial.translations?.fr ?? "",
        en: initial.translations?.en ?? "",
      },
    });
  }, [initial, form]);

  const submit = async (data: CountryCreateRequest) => {
    const filtered: CountryCreateRequest = {
      ...data,
      translations: Object.fromEntries(
        Object.entries(data.translations ?? {}).filter(([, v]) => v !== "")
      ),
    };
    await onSubmit(filtered);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("form.country.update")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4 mt-2">
          {/* CODE — disabled, primary key */}
          <div className="space-y-2">
            <Label htmlFor="code">{t("field.code")}</Label>
            <Input
              id="code"
              {...form.register("code")}
              disabled
            />
          </div>

          {/* NAME FR */}
          <div className="space-y-2">
            <Label htmlFor="nameFr">{t("field.nameFr")}</Label>
            <Input
              id="nameFr"
              placeholder="Nom du pays en français"
              {...form.register("translations.fr", { required: true })}
            />
          </div>

          {/* REGION */}
          <div className="space-y-2">
            <Label>{t("field.region")}</Label>
            <Select
              value={form.watch("region")}
              onValueChange={(v) => form.setValue("region", v as Region)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("field.selectRegion")} />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`region.${r}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TRANSLATIONS */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium">{t("form.translations")}</p>
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t("field.nameEn")}</Label>
              <Input
                id="nameEn"
                placeholder="Country name in English"
                {...form.register("translations.en")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={loading} type="submit">
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
