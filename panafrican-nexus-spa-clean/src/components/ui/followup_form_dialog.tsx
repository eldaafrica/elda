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
import { userService } from "@/services/userService";
import type { User } from "@/types/user";

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

  const [users, setUsers] = useState<User[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultSourceLang = languages.find(l => l.code === "fr") ? "fr" : (languages[0]?.code ?? "fr");
  const defaultAuthor = user?.name ?? user?.email ?? "";

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

  const watchedSourceLang = form.watch("sourceLang");

  // Load users for author select
  useEffect(() => {
    userService.findAll().then(setUsers).catch(() => {});
  }, []);

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
      <DialogContent className="w-full max-w-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {initial ? t("form.followup.update") : t("form.followup.create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="mt-2 space-y-4">

          {/* RECOMMENDATION */}
          <div className="space-y-1.5">
            <Label>
              {t("field.recommendation" as any)}
              <span className="ml-1 text-xs text-destructive">*</span>
            </Label>
            <Controller
              control={form.control}
              name="recommendationId"
              rules={{ required: true }}
              render={({ field }) => {
                const selectedReco = recommendations.find(r => r.id === field.value);
                const triggerLabel = selectedReco
                  ? `${selectedReco.code} — ${getTranslation(selectedReco, locale)?.title ?? selectedReco.code}`
                  : undefined;
                return (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!!recommendationId && !!initial}
                  >
                    <SelectTrigger className={`w-full ${!field.value ? "border-destructive/60" : ""}`}>
                      <SelectValue placeholder="Sélectionner une recommandation">
                        {triggerLabel}
                      </SelectValue>
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
                );
              }}
            />
          </div>

          {/* DATE + STATUS — 2 colonnes sur md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fuDate">{t("field.date")}</Label>
              <Input
                id="fuDate"
                type="date"
                className="w-full"
                {...form.register("date", { required: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("field.implStatus")}</Label>
              <Controller
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
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
          </div>

          {/* AUTEUR — select depuis la table users */}
          <div className="space-y-1.5">
            <Label>{t("field.author")}</Label>
            <Controller
              control={form.control}
              name="author"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("field.author")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.name ?? u.email}>
                        <span className="font-medium">{u.name}</span>
                        {u.email && (
                          <span className="ml-2 text-xs text-muted-foreground">{u.email}</span>
                        )}
                      </SelectItem>
                    ))}
                    {users.length === 0 && (
                      <SelectItem value={defaultAuthor || "_none"} disabled={!defaultAuthor}>
                        {defaultAuthor || t("common.loading")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* SOURCE LANGUAGE + NOTE */}
          <div className="space-y-1.5">
            <Label>{t("field.sourceLang")}</Label>
            <Controller
              control={form.control}
              name="sourceLang"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
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

          <div className="space-y-1.5">
            <Label htmlFor="fuNote">
              {t("field.note")}
              {watchedSourceLang && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({langLabel(watchedSourceLang)})
                </span>
              )}
            </Label>
            <Textarea id="fuNote" rows={4} className="w-full resize-none" {...form.register("note")} />
          </div>

          {/* ERROR */}
          {submitError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
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
