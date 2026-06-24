import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard,
  FileText,
  Map,
  Activity,
  Building2,
  Eye,
  Users,
  Settings,
  Globe,
  ArrowLeft,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

function LangSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full bg-sidebar-accent text-xs">
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "px-2.5 py-1 rounded-full font-medium",
          locale === "en"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70",
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("fr")}
        className={cn(
          "px-2.5 py-1 rounded-full font-medium",
          locale === "fr"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70",
        )}
      >
        FR
      </button>
    </div>
  );
}

export function DashboardLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const location = useLocation();
  const { user, logout } = useAuth();

  const items = [
    {
      to: "/dashboard",
      icon: LayoutDashboard,
      label: t("dash.nav.overview"),
      exact: true,
    },
    {
      to: "/dashboard/recommendations",
      icon: FileText,
      label: t("dash.nav.recommendations"),
    },
    { to: "/dashboard/missions", icon: Map, label: t("dash.nav.missions") },
    { to: "/dashboard/followups", icon: Activity, label: t("dash.nav.followups") },
    { to: "/dashboard/institutions", icon: Building2, label: t("dash.nav.institutions") },
    { to: "/dashboard/pays", icon: Building2, label: t("dash.nav.country")},
    { to: "/dashboard/publications", icon: Eye, label: t("dash.nav.publications") },
    { to: "/dashboard/users", icon: Users, label: t("dash.nav.users") },
    { to: "/dashboard/settings", icon: Settings, label: t("dash.nav.settings") },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ochre text-ochre-foreground font-display font-bold">
              E
            </div>
            <div className="leading-tight">
              <div className="font-display text-base">ELDA Africa</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                {t("dash.title")}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-ochre" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ochre text-ochre-foreground text-sm font-semibold">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "US"}
            </div>
            <div className="font-medium text-sidebar-foreground">{user?.name || user?.email}</div>

            <div className="text-sidebar-foreground/60">{user?.roles?.join(", ") || "USER"}</div>
          </div>
          <div className="flex items-center justify-between">
            <LangSwitch />
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] text-sidebar-foreground/70 hover:text-ochre"
            >
              <ArrowLeft className="h-3 w-3" /> Public
            </Link>
            <button onClick={logout} className="text-[11px] text-red-500 hover:text-red-600">
              {t("auth.logout") || "Déconnexion"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card/60 px-4 md:px-8">
          <div className="md:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-bold">
              AU
            </div>
            <span className="font-display">ELDA AFRICA</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            {t("dash.title")}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input
                placeholder="Search…"
                className="w-56 bg-transparent outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-accent">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-terracotta ring-2 ring-card" />
            </button>
          </div>
        </header>

        <div className="px-4 md:px-8 pt-6 pb-4 border-b border-border bg-gradient-to-b from-card/40 to-transparent">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 px-4 md:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
