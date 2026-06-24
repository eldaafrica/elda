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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import type { FollowUp, FollowUpCreateRequest } from "@/services/followUpService";
import { useI18n } from "@/lib/i18n";
import { useLanguages } from "@/hooks/useLanguages";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useAuth } from "@/context/AuthContext";
import { getTranslation } from "@/lib/translation";
import { statusList } from "@/lib/mock-data";

type FormValues = {
  recommendationId: string;
  date: string;
  statut: string;
  sourceLang: string;
  note: string;
  author: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: FollowUpCreateRequest) => Promise<void>;
  initial?: FollowUp | null;
  recommendationId?: string;
  loading?: boolean;
};

export function FollowUpFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
  recommendationId,
  loading,
}: Props) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { languages } = useLanguages();
  const { recommendations } = useRecommendations({ size: 200 });

  const defaultAuthor = user?.name ?? user?.email ?? "";
  const defaultSourceLang = languages.find(l => l.code === "fr") ? "fr" : (languages[0]?.code ?? "fr");

  const form = useForm<FormValues>({
    defaultValues: {
      recommendationId: recommendationId ?? "",
      date: new Date().toISOString().slice(0, 10),
      statut: "NOUVEAU",
      sourceLang: defaultSourceLang,
      note: "",
      author: defaultAuthor,
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const watchedSourceLang = form.watch("sourceLang");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const sl = initial.sourceLang ?? "fr";
      form.reset({
        recommendationId: initial.recommendationId,
        date: initial.date?.slice(0, 10) ?? "",
        statut: initial.statut ?? "NOUVEAU",
        sourceLang: sl,
        note: initial.translations?.[sl] ?? "",
        author: initial.author ?? defaultAuthor,
      });
    } else {
      form.reset({
        recommendationId: recommendationId ?? "",
        date: new Date().toISOString().slice(0, 10),
        statut: "NOUVEAU",
        sourceLang: defaultSourceLang,
        note: "",
        author: defaultAuthor,
      });
    }
    setSubmitError(null);
  }, [open, initial, recommendationId]);

  const langLabel = (code: string) => {
    const lang = languages.find(l => l.code === code);
    if (!lang) return code.toUpperCase();
    return locale === "fr" ? lang.nameFr : lang.nameEn;
  };

  const submit = async (data: FormValues) => {
    setSubmitError(null);
    if (!data.recommendationId) {
      setSubmitError(t("form.followup.recoRequired" as any) || "Veuillez sélectionner une recommandation.");
      return;
    }
    const payload: FollowUpCreateRequest = {
      recommendationId: data.recommendationId,
      date: data.date,
      statut: data.statut as any,
      sourceLang: data.sourceLang,
      translations: data.note.trim() ? { [data.sourceLang]: data.note } : {},
      author: data.author.trim() || undefined,
    };
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? err?.message ?? "Erreur inconnue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? t("form.followup.update") : t("form.followup.create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="mt-2 space-y-4">

          {/* RECOMMENDATION */}
          <div className="space-y-2">
            <Label>
              {t("field.recommendation" as any)}
              <span className="ml-1 text-xs text-destructive">*</span>
            </Label>
            <Controller
              control={form.control}
              name="recommendationId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!!recommendationId && !!initial}
                >
                  <SelectTrigger className={!field.value ? "border-destructive/60" : ""}>
                    <SelectValue placeholder={t("field.selectMission" as any) || "Sélectionner une recommandation"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {recommendations.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        <span className="font-mono text-xs text-muted-foreground mr-2">{r.code}</span>
                        {getTranslation(r, locale)?.title ?? r.code}
                      </SelectItem>
                    ))}
                    {recommendations.length === 0 && (
                      <SelectItem value="_none" disabled>
                        {t("common.loading")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* DATE */}
          <div className="space-y-2">
            <Label htmlFor="fuDate">{t("field.date")}</Label>
            <Input id="fuDate" type="date" {...form.register("date", { required: true })} />
          </div>

          {/* STATUS */}
          <div className="space-y-2">
            <Label>{t("field.implStatus")}</Label>
            <Controller
              control={form.control}
              name="statut"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("field.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusList.map(s => (
                      <SelectItem key={s} value={s}>
                        {t(`statut.${s}` as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* SOURCE LANGUAGE */}
          <div className="space-y-2">
            <Label>{t("field.sourceLang")}</Label>
            <Controller
              control={form.control}
              name="sourceLang"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {locale === "fr" ? lang.nameFr : lang.nameEn}
                        <span className="ml-2 text-xs text-muted-foreground">({lang.code})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* NOTE */}
          <div className="space-y-2">
            <Label htmlFor="fuNote">
              {t("field.note")}
              {watchedSourceLang && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({langLabel(watchedSourceLang)})
                </span>
              )}
            </Label>
            <Textarea id="fuNote" rows={4} {...form.register("note")} />
          </div>

          {/* AUTHOR */}
          <div className="space-y-2">
            <Label htmlFor="fuAuthor">{t("field.author")}</Label>
            <Input
              id="fuAuthor"
              {...form.register("author")}
              placeholder={defaultAuthor || t("field.author")}
            />
            {defaultAuthor && (
              <p className="text-xs text-muted-foreground">
                {t("common.default" as any) || "Connecté en tant que"} : {defaultAuthor}
              </p>
            )}
          </div>

          {/* ERROR */}
          {submitError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("common.saving")
                : initial
                ? t("common.update")
                : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
