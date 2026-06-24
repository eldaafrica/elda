import type { Recommendation } from "@/types/recommendation";
import { getTranslation } from "./translation";

export function downloadCSV(data: Recommendation[], locale: string = "en") {
  if (data.length === 0) return;

  const headers =
    locale === "fr"
      ? ["Code", "Titre", "Thème", "Statut", "Priorité", "Pays", "Date émission", "Dernière mise à jour", "Visibilité"]
      : ["Code", "Title", "Theme", "Status", "Priority", "Country", "Issued Date", "Last Update", "Visibility"];

  const rows = data.map((r) => {
    const t = getTranslation(r, locale);
    const tFr = getTranslation(r, "fr");
    const tEn = getTranslation(r, "en");
    const title = locale === "fr"
      ? (tFr?.title ?? tEn?.title ?? "")
      : (tEn?.title ?? tFr?.title ?? "");
    return [
      r.code,
      title,
      r.theme,
      r.statut,
      r.priorite,
      r.codeCountry,
      r.issuedDate ?? "",
      r.lastUpdate ?? "",
      r.visibilite ?? "",
    ];
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const bom = "﻿";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `elda_recommendations_${new Date().toISOString().substring(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
