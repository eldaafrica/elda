import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { recommendationService, missionService, countryService } from "@/services";
import type { Recommendation, Mission } from "@/types";
import type { Country } from "@/types/country";
import { getTranslation } from "@/lib/translation";
import { StatusBadge, VisibilityBadge } from "@/components/badges";
import { FileText, CheckCircle2, Clock, Map, Plus, Download, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { downloadCSV } from "@/lib/export";

/* ─── Palette ─────────────────────────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  NOUVEAU: "#fef3c7",
  EN_COURS: "#f59e0b",
  PARTIEL: "#f97316",
  IMPLEMENTE: "#22c55e",
  NON_IMPLEMENTE: "#ef4444",
  INCONNU: "#94a3b8",
};

const THEME_COLORS: Record<string, string> = {
  JURIDIQUE: "#3b82f6",
  ADMINISTRATION: "#06b6d4",
  ELECTEURS: "#22c55e",
  CAMPAGNE: "#84cc16",
  MEDIAS: "#eab308",
  RESULTATS: "#f97316",
  INCLUSION: "#a855f7",
  SECURITE: "#ef4444",
  CIVISME: "#14b8a6",
};

const REGION_COLORS: Record<string, string> = {
  OUEST: "#f59e0b",
  EST: "#f97316",
  SUD: "#3b82f6",
  NORD: "#22c55e",
  CENTRE: "#a855f7",
};

/* ─── Shared tooltip style ────────────────────────────────────────────────── */
const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
};

/* ─── Custom Legend for PieChart ──────────────────────────────────────────── */
function StatusLegend({ payload }: { payload?: any[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry: any) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export default function OverviewPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Load ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      try {
        const [recRes, missionRes, countryRes] = await Promise.all([
          recommendationService.list({ size: 1000 }),
          missionService.list({ size: 1000 }),
          countryService.findAllCountry(),
        ]);
        setRecommendations(recRes?.content ?? []);
        setMissions(missionRes?.content ?? []);
        setCountries(countryRes ?? []);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const safeRecommendations = recommendations ?? [];
  const safeMissions = missions ?? [];

  /* ─── KPIs ─────────────────────────────────────────────────────────────── */
  const total = safeRecommendations.length;

  const published = useMemo(
    () => safeRecommendations.filter((r) => r.visibilite === "PUBLIC").length,
    [safeRecommendations],
  );

  const pending = useMemo(
    () =>
      safeRecommendations.filter(
        (r) => r.visibilite === "BROUILLON" || r.visibilite === "INTERNE",
      ).length,
    [safeRecommendations],
  );

  const activeMissions = safeMissions.length;

  /* ─── Chart data ────────────────────────────────────────────────────────── */
  const byStatus = useMemo(() => {
    const statuses = [
      "NOUVEAU",
      "EN_COURS",
      "PARTIEL",
      "IMPLEMENTE",
      "NON_IMPLEMENTE",
      "INCONNU",
    ] as const;
    return statuses
      .map((s) => ({
        name: t(`statut.${s}` as never),
        key: s,
        value: s === "INCONNU"
          ? safeRecommendations.filter((r) => !r.statut || r.statut === "INCONNU").length
          : safeRecommendations.filter((r) => r.statut === s).length,
      }))
      .filter((d) => d.value > 0);
  }, [safeRecommendations, t]);

  const byTheme = useMemo(() => {
    const themes = [
      "JURIDIQUE",
      "ADMINISTRATION",
      "ELECTEURS",
      "CAMPAGNE",
      "MEDIAS",
      "RESULTATS",
      "INCLUSION",
      "SECURITE",
      "CIVISME",
    ] as const;
    return themes.map((th) => ({
      theme: t(`theme.${th}` as never).split(" ")[0],
      themeKey: th,
      count: safeRecommendations.filter((r) => r.theme === th).length,
    }));
  }, [safeRecommendations, t]);

  const trend = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    safeRecommendations.forEach((r) => {
      const date = r.issuedDate ?? r.lastUpdate;
      if (!date) return;
      const key = date.substring(0, 7); // "2024-03"
      monthCounts[key] = (monthCounts[key] ?? 0) + 1;
    });
    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, count]) => ({
        month: month.substring(2).replace("-", "/"), // "24/03"
        count,
      }));
  }, [safeRecommendations]);

  const byRegion = useMemo(() => {
    const regionMap: Record<string, { key: string; label: string; count: number }> = {};
    safeRecommendations.forEach((r) => {
      if (!r.codeCountry) return;
      const country = countries.find((c) => c.code === r.codeCountry);
      if (!country?.region) return;
      const key = country.region;
      if (!regionMap[key]) {
        regionMap[key] = { key, label: t(`region.${key}` as never), count: 0 };
      }
      regionMap[key].count += 1;
    });
    return Object.values(regionMap).sort((a, b) => b.count - a.count);
  }, [safeRecommendations, countries, t]);

  /* ─── Loading ───────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <DashboardLayout title={t("common.loading")} subtitle="">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border bg-card" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          {[5, 7, 6, 6].map((span, i) => (
            <div
              key={i}
              className={`lg:col-span-${span} h-72 animate-pulse rounded-xl border bg-card`}
            />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  /* ─── UI ────────────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout
      title={`${t("dash.welcome")}, ${user?.name ?? user?.email ?? ""}!`}
      subtitle={t("dash.nav.overview")}
      actions={
        <>
          <button
            onClick={() => downloadCSV(safeRecommendations, locale)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" />
            {t("dash.export.csv")}
          </button>

          <Link
            to="/dashboard/recommendations"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("dash.actions.new")}
          </Link>
        </>
      }
    >
      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("dash.kpi.total")} value={total} icon={FileText} accent="ochre" />
        <KpiCard label={t("dash.kpi.published")} value={published} icon={CheckCircle2} accent="primary" />
        <KpiCard label={t("dash.kpi.pending")} value={pending} icon={Clock} accent="terracotta" />
        <KpiCard label={t("dash.kpi.missions")} value={activeMissions} icon={Map} accent="sand" />
      </div>

      {/* ── Charts row 1 ─────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        {/* Par statut */}
        <div className="lg:col-span-5 rounded-xl border bg-card p-5">
          <div className="text-sm font-medium text-foreground">{t("dash.charts.bystatus")}</div>
          <div className="mt-2 h-64">
            {byStatus.length === 0 ? (
              <EmptyChart label={t("dash.noData")} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {byStatus.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? "#e2e8f0"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: any, name: any) => [value, name]}
                  />
                  <Legend content={<StatusLegend />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Par thème */}
        <div className="lg:col-span-7 rounded-xl border bg-card p-5">
          <div className="text-sm font-medium text-foreground">{t("dash.charts.byTheme")}</div>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTheme} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="theme"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(value) => [value ?? 0, t("recos.results")]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {byTheme.map((entry) => (
                    <Cell
                      key={entry.themeKey}
                      fill={THEME_COLORS[entry.themeKey] ?? "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Charts row 2 ─────────────────────────────────────────────────── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Tendance */}
        <div className="lg:col-span-6 rounded-xl border bg-card p-5">
          <div className="text-sm font-medium text-foreground">{t("dash.charts.trend")}</div>
          <div className="mt-2 h-56">
            {trend.length === 0 ? (
              <EmptyChart label={t("dash.noData")} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [value ?? 0, t("recos.results")]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#f59e0b", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Par région */}
        <div className="lg:col-span-6 rounded-xl border bg-card p-5">
          <div className="text-sm font-medium text-foreground">{t("dash.charts.byRegion")}</div>
          <div className="mt-2 h-56">
            {byRegion.length === 0 ? (
              <EmptyChart label={t("dash.noData")} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byRegion} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="key"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8" }}
                    tickFormatter={(v: string) => v.charAt(0) + v.slice(1).toLowerCase()}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value) => [value ?? 0, t("recos.results")]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {byRegion.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={REGION_COLORS[entry.key] ?? "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent recommendations ───────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-medium">{t("dash.recent")}</h2>
          <Link
            to="/dashboard/recommendations"
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            {t("common.viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <ul className="divide-y">
          {safeRecommendations.slice(0, 6).map((r) => {
            const m = safeMissions.find((mm) => mm.id === r.missionId);
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 px-5 py-3 text-sm"
              >
                <span className="font-mono text-xs w-32 text-muted-foreground">{r.code}</span>
                <span className="flex-1 truncate">
                  {getTranslation(r, locale)?.title ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">{m?.country ?? "-"}</span>
                <StatusBadge status={r.statut} />
                <VisibilityBadge visibilite={r.visibilite} />
              </li>
            );
          })}
          {safeRecommendations.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
              {t("recos.empty")}
            </li>
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
}

/* ─── KPI Card ────────────────────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "ochre" | "terracotta" | "sand";
}) {
  const map: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    ochre: "bg-yellow-100 text-yellow-700",
    terracotta: "bg-red-100 text-red-600",
    sand: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`p-2 rounded-lg ${map[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

/* ─── Empty chart placeholder ─────────────────────────────────────────────── */
function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
