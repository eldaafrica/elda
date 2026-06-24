import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/lib/i18n";
import { getCountryName } from "@/lib/translation";

type Props = {
  value: string;
  onChange: (code: string) => void;
  required?: boolean;
  disabled?: boolean;
};

export function CountrySelect({ value, onChange, required, disabled }: Props) {
  const { t, locale } = useI18n();
  const { countriesAll, loading, loadAllCountries } = useCountries();

  useEffect(() => {
    loadAllCountries();
  }, []);

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger className={required && !value ? "border-destructive/60" : ""}>
        <SelectValue
          placeholder={loading ? t("common.loading") : t("field.selectCountry")}
        />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {countriesAll.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="font-mono text-xs text-muted-foreground mr-2">{c.code}</span>
            {getCountryName(c, locale) || c.code}
          </SelectItem>
        ))}
        {!loading && countriesAll.length === 0 && (
          <SelectItem value="_none" disabled>
            {t("loading.noCountries" as any) || "Aucun pays disponible"}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
