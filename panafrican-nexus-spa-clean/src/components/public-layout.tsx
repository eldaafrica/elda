import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-lg font-bold ">
        AU
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-ochre ring-2 ring-background" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-display text-lg font-semibold text-foreground">ELDA AFRICA</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Recommendations Database
        </span>
      </div>
    </Link>
  );
}

function LangSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card text-xs">
      <Globe className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "px-2.5 py-1 rounded-full font-medium transition-colors",
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("fr")}
        className={cn(
          "px-2.5 py-1 rounded-full font-medium transition-colors",
          locale === "fr"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        FR
      </button>
    </div>
  );
}

export function PublicHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/" , label: t("nav.home") },
    { to: "/recommendations" , label: t("nav.recommendations") },
    { to: "/missions" , label: t("nav.missions") },
    { to: "/about" , label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <BrandMark />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LangSwitch />
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("nav.login")}
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border mt-2">
              <LangSwitch />
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium"
              >
                {t("nav.dashboard")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ochre text-ochre-foreground font-display font-bold">
              E
            </div>
            <div className="font-display text-xl">ELDA AFRICA</div>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/80">{t("footer.tagline")}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-foreground/60">
            {t("footer.resources")}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/recommendations" className="hover:text-ochre">
                {t("nav.recommendations")}
              </Link>
            </li>
            <li>
              <Link to="/missions" className="hover:text-ochre">
                {t("nav.missions")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-ochre">
                {t("nav.about")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-foreground/60">
            {t("footer.legal")}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="hover:text-ochre cursor-pointer">{t("footer.terms")}</li>
            <li className="hover:text-ochre cursor-pointer">{t("footer.privacy")}</li>
            <li className="hover:text-ochre cursor-pointer">{t("footer.openData")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 text-xs text-primary-foreground/60">
          {t("footer.copy", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
