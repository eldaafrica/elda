import { useI18n } from "@/lib/i18n";
// import type { Status, Priority, Visibility, Theme } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Priorite, Statut, Theme, Visibilite } from "@/types";

const statusStyles: Record<Statut, string> = {
  NOUVEAU: "bg-accent text-accent-foreground border-accent",
  EN_COURS: "bg-ochre/15 text-ochre border-ochre/30",
  PARTIEL: "bg-terracotta/10 text-terracotta border-terracotta/30",
  IMPLEMENTE: "bg-primary/10 text-primary border-primary/25",
  NON_IMPLEMENTE: "bg-destructive/10 text-destructive border-destructive/30",
  INCONNU: "bg-muted text-muted-foreground border-border",
};

export function normalizeStatut(value?: string): Statut {
  if (!value) return "INCONNU";

  const cleaned = value.replace("status.", "").trim();

  if (
    cleaned === "NOUVEAU" ||
    cleaned === "EN_COURS" ||
    cleaned === "PARTIEL" ||
    cleaned === "IMPLEMENTE" ||
    cleaned === "NON_IMPLEMENTE"
  ) {
    return cleaned;
  }

  return "INCONNU";
}

// ===================== VISIBILITE =====================

export function normalizeVisibilite(value?: string): Visibilite {
  if (!value) return "BROUILLON";

  const cleaned = value.replace("visibilite.", "").replace("visibility.", "").trim().toUpperCase();

  if (cleaned === "PUBLIC" || cleaned === "INTERNE" || cleaned === "BROUILLON") {
    return cleaned as Visibilite;
  }

  return "BROUILLON";
}

// ===================== PRIORITE =====================

export function normalizePriorite(value?: string): Priorite {
  if (!value) return "BASSE";

  const cleaned = value.replace("priorite.", "").trim().toUpperCase();

  if (cleaned === "HAUTE" || cleaned === "MOYENNE" || cleaned === "BASSE") {
    return cleaned as Priorite;
  }

  return "BASSE";
}

const statusKeyMap: Record<Statut, string> = {
  NOUVEAU: "status.new",
  EN_COURS: "status.in_progress",
  PARTIEL: "status.partial",
  IMPLEMENTE: "status.implemented",
  NON_IMPLEMENTE: "status.not_implemented",
  INCONNU: "status.unknown",
};

export function StatusBadge({
  status,
  className,
}: {
  status?: Statut | string;
  className?: string;
}) {
  const { t } = useI18n();

  const normalized = normalizeStatut(status);

  const labelMap: Record<Statut, string> = {
    NOUVEAU: "status.new",
    EN_COURS: "status.in_progress",
    PARTIEL: "status.partial",
    IMPLEMENTE: "status.implemented",
    NON_IMPLEMENTE: "status.not_implemented",
    INCONNU: "status.unknown",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[normalized],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(labelMap[normalized])}
    </span>
  );
}

// const priorityStyles: Record<Priorite, string> = {
//   HAUTE: "bg-terracotta text-terracotta-foreground",
//   MOYENNE: "bg-ochre text-ochre-foreground",
//   BASSE: "bg-muted text-muted-foreground",
// };

// export function PriorityBadge({ priority }: { priority: Priorite }) {
//   const { t } = useI18n();
//   return (
//     <span
//       className={cn(
//         "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
//         priorityStyles[priority],
//       )}
//     >
//       {t(`priority.${priority}` as never)}
//     </span>
//   );
// }
const visibilityStyles: Record<Visibilite, string> = {
  PUBLIC: "bg-primary text-primary-foreground",
  INTERNE: "bg-secondary text-secondary-foreground",
  BROUILLON: "bg-muted text-muted-foreground",
};

const visibilityKeyMap: Record<Visibilite, string> = {
  PUBLIC: "dash.vis.public",
  INTERNE: "dash.vis.internal",
  BROUILLON: "dash.vis.draft",
};

export function VisibilityBadge({
  visibilite,
  className,
}: {
  visibilite?: Visibilite | string;
  className?: string;
}) {
  const { t } = useI18n();

  const normalized = normalizeVisibilite(visibilite);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium",
        visibilityStyles[normalized],
        className,
      )}
    >
      {t(visibilityKeyMap[normalized])}
    </span>
  );
}

const priorityStyles: Record<Priorite, string> = {
  HAUTE: "bg-terracotta text-terracotta-foreground",
  MOYENNE: "bg-ochre text-ochre-foreground",
  BASSE: "bg-muted text-muted-foreground",
};

const priorityKeyMap: Record<Priorite, string> = {
  HAUTE: "priority.high",
  MOYENNE: "priority.medium",
  BASSE: "priority.low",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority?: Priorite | string;
  className?: string;
}) {
  const { t } = useI18n();

  const normalized = normalizePriorite(priority);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        priorityStyles[normalized],
        className,
      )}
    >
      {t(priorityKeyMap[normalized])}
    </span>
  );
}
// const visibilityStyles: Record<Visibilite, string> = {
//   PUBLIC: "bg-primary text-primary-foreground",
//   INTERNE: "bg-secondary text-secondary-foreground",
//   BROUILLON: "bg-muted text-muted-foreground",
// };

// export function VisibilityBadge({ visibilite }: { visibilite: Visibilite }) {
//   const { t } = useI18n();
//   return (
//     <span
//       className={cn(
//         "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium",
//         visibilityStyles[visibilite],
//       )}
//     >
//       {t(`dash.vis.${visibilite}` as never)}
//     </span>
//   );
// }

export function ThemeChip({ theme }: { theme: Theme }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
      {t(`theme.${theme}` as never)}
    </span>
  );
}
