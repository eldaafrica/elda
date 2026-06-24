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
import { CountryCreateRequest, Region } from "@/types/country";
import { useI18n } from "@/lib/i18n";

const REGIONS: Region[] = ["OUEST", "EST", "SUD", "NORD", "CENTRE"];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: CountryCreateRequest) => Promise<void>;
  loading?: boolean;
};

export function CountryCreateDialog({ open, onOpenChange, onSubmit, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<CountryCreateRequest>({
    defaultValues: {
      code: "",
      region: "CENTRE",
      sourceLang: "fr",
      translations: { fr: "" },
    },
  });

  const submit = async (data: CountryCreateRequest) => {
    await onSubmit({
      ...data,
      sourceLang: "fr",
      translations: { fr: data.translations.fr },
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("form.country.create")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4 mt-2">
          {/* CODE ISO */}
          <div className="space-y-2">
            <Label htmlFor="code">{t("field.code")}</Label>
            <Input
              id="code"
              placeholder="Ex: ML"
              maxLength={2}
              {...form.register("code", { required: true, maxLength: 2 })}
            />
          </div>

          {/* NOM FRANCAIS */}
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
