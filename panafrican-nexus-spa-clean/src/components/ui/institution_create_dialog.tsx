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
import { CountrySelect } from "@/components/ui/country-select";

import { InstitutionCreateRequest, Category } from "@/types/institution";
import { useForm, Controller } from "react-hook-form";
import { useI18n } from "@/lib/i18n";
import { categoryList } from "@/lib/mock-data";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: InstitutionCreateRequest) => Promise<void>;
  loading?: boolean;
};

export function InstitutionCreateDialog({ open, onOpenChange, onSubmit, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<InstitutionCreateRequest>({
    defaultValues: {
      sourceLang: "fr",
      translations: { fr: "" },
      country: "",
      category: "GOUVERNEMENT",
    },
  });

  const submit = async (data: InstitutionCreateRequest) => {
    await onSubmit({
      ...data,
      sourceLang: "fr",
      translations: { fr: (data.translations.fr ?? "").trim() },
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("form.institution.create")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4 mt-2">
          {/* NOM (FRANÇAIS) */}
          <div className="space-y-2">
            <Label htmlFor="createInstNameFr">
              {t("field.nameFr")}
              <span className="ml-1 text-xs text-destructive">*</span>
            </Label>
            <Input
              id="createInstNameFr"
              {...form.register("translations.fr" as any, { required: true })}
              placeholder="Ex: Commission Électorale Nationale"
            />
          </div>

          {/* CODE PAYS */}
          <div className="space-y-2">
            <Label>
              {t("field.country")}
              <span className="ml-1 text-xs text-destructive">*</span>
            </Label>
            <Controller
              control={form.control}
              name="country"
              rules={{ required: true }}
              render={({ field }) => (
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  required
                />
              )}
            />
          </div>

          {/* CATÉGORIE */}
          <div className="space-y-2">
            <Label>
              {t("field.category")}
              <span className="ml-1 text-xs text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("category") ?? "GOUVERNEMENT"}
              onValueChange={(value) => form.setValue("category", value as Category)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("field.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categoryList.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`category.${cat}` as any)}
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
