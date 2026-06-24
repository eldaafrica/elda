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
import { InviteUserRequest, Role, User } from "@/types/user";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/lib/i18n";
import { getCountryName } from "@/lib/translation";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initial?: User | null;
  loading?: boolean;
};

export function UserFormDialog({ open, onOpenChange, onSubmit, initial, loading }: Props) {
  const { t } = useI18n();

  const form = useForm<InviteUserRequest>({
    defaultValues: {
      name: "",
      email: "",
      country: "",
      countryCode: "",
      tempPassword: "",
      roles: ["LECTEUR"],
    },
  });

  const { countriesAll, loading: loadingCountries, loadAllCountries } = useCountries();

  useEffect(() => {
    if (open) loadAllCountries();
  }, [open, loadAllCountries]);

  useEffect(() => {
    if (initial) {
      form.reset({
        name: initial.name,
        email: initial.email,
        country: initial.country,
        countryCode: initial.countryCode,
        roles: initial.roles ?? ["LECTEUR"],
        tempPassword: "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        country: "",
        countryCode: "",
        tempPassword: "",
        roles: ["LECTEUR"],
      });
    }
  }, [initial, form]);

  const submit = async (data: InviteUserRequest) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const roleValue = form.watch("roles")?.[0] ?? "LECTEUR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? t("form.user.update") : t("form.user.create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4 mt-2">
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("field.name")}</Label>
            <Input id="name" {...form.register("name", { required: true })} />
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("field.email")}</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email", { required: true })}
              disabled={!!initial}
            />
          </div>

          {/* COUNTRY + CODE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("field.country")}</Label>
              <Select
                value={form.watch("country") || ""}
                onValueChange={(value) => {
                  const selected = countriesAll.find(
                    (c) => getCountryName(c, "fr") === value || c.code === value
                  );
                  form.setValue("country", value);
                  form.setValue("countryCode", selected?.code ?? "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("field.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  {loadingCountries ? (
                    <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>
                  ) : (
                    countriesAll.map((c) => {
                      const label = getCountryName(c, "fr");
                      return (
                        <SelectItem key={c.code} value={label}>
                          {label}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">{t("field.countryCode")}</Label>
              <Input id="countryCode" {...form.register("countryCode")} disabled />
            </div>
          </div>

          {/* PASSWORD (invite only) */}
          {!initial && (
            <div className="space-y-2">
              <Label htmlFor="tempPassword">{t("field.password")}</Label>
              <Input
                id="tempPassword"
                type="password"
                {...form.register("tempPassword", { required: !initial })}
              />
            </div>
          )}

          {/* ROLE */}
          <div className="space-y-2">
            <Label>{t("field.role")}</Label>
            <Select
              value={roleValue}
              onValueChange={(value) => form.setValue("roles", [value as Role])}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("field.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">{t("role.ADMIN")}</SelectItem>
                <SelectItem value="EDITEUR">{t("role.EDITEUR")}</SelectItem>
                <SelectItem value="LECTEUR">{t("role.LECTEUR")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ACTIONS */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={loading} type="submit">
              {loading
                ? t("common.saving")
                : initial
                ? t("common.update")
                : t("user.action.invite")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
