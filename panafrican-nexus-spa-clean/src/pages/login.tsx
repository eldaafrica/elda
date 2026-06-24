import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { tokenStorage } from "@/services/tokenStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";

// ─── Validation ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

type LoginValues = z.infer<typeof loginSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { t } = useI18n();

  // Page de destination après login : état de navigation (ProtectedRoute) ou /dashboard
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
  const isExpired = searchParams.get("expired") === "1";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Déjà connecté → rediriger directement
  useEffect(() => {
    if (user && tokenStorage.getAccess()) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Afficher une notification si la session a expiré
  useEffect(() => {
    if (isExpired) {
      toast.warning(
        t("auth.sessionExpired") || "Votre session a expiré. Veuillez vous reconnecter.",
        { duration: 5000 },
      );
    }
  }, [isExpired, t]);

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      await login(values);
      toast.success(t("auth.loginSuccess") || "Connexion réussie");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          t("auth.loginError") ||
          "Email ou mot de passe incorrect",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">

      {/* LEFT — Formulaire */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">

          {/* Retour vers le portail public */}
          <div className="mb-10">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              ← {t("detail.back") || "Retour"}
            </Link>
          </div>

          {/* Bannière session expirée */}
          {isExpired && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {t("auth.sessionExpiredBanner") ||
                  "Votre session a expiré. Veuillez vous reconnecter pour continuer."}
              </span>
            </div>
          )}

          {/* Titre */}
          <header className="mb-8 space-y-2">
            <h1 className="text-3xl font-semibold sm:text-4xl">
              {t("auth.title") || "Bon retour"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.subtitle") || "Connectez-vous pour accéder à votre espace."}
            </p>
          </header>

          {/* Formulaire */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("field.email") || "Email"}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemple.com"
                        autoComplete="email"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("auth.password") || "Mot de passe"}</FormLabel>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(
                            t("auth.forgotPwdInfo") ||
                              "Réinitialisation mot de passe bientôt disponible",
                          )
                        }
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t("auth.forgotPwd") || "Mot de passe oublié ?"}
                      </button>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="h-11 w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.loggingIn") || "Connexion…"}
                  </>
                ) : (
                  t("auth.login") || "Se connecter"
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {t("auth.terms") || "En continuant, vous acceptez nos conditions d'utilisation."}
          </p>
        </div>
      </section>

      {/* RIGHT — Visuel */}
      <aside className="relative hidden lg:block overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-[oklch(0.28_0.05_140)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-primary-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ochre text-ochre-foreground font-display font-bold text-2xl shadow-lg">
            AU
          </div>
          <h2 className="mt-6 font-display text-3xl text-center">{t("brand.name")}</h2>
          <p className="mt-3 text-sm text-primary-foreground/70 text-center max-w-sm">
            {t("brand.full")}
          </p>
        </div>
      </aside>
    </main>
  );
}
