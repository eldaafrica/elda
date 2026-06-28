import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";
import { siteParamService, type SiteParams } from "@/services/siteParamService";

function AboutPage() {
  const { t, locale } = useI18n();
  const [params, setParams] = useState<SiteParams>({});

  useEffect(() => {
    siteParamService.getAll().then(setParams).catch(() => {});
  }, []);

  // Dynamic value with locale fallback → fr fallback → i18n key
  const p = (key: string, fallback: string) =>
    params[key]?.[locale] || params[key]?.["fr"] || fallback;

  const principles = [
    p("about.principles.1", t("about.principles.1")),
    p("about.principles.2", t("about.principles.2")),
    p("about.principles.3", t("about.principles.3")),
    p("about.principles.4", t("about.principles.4")),
  ];

  return (
    <PublicLayout>
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-16">
          <div className="text-xs uppercase tracking-widest text-ochre">{t("nav.about")}</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">
            {p("about.title", t("about.title"))}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            {p("about.lede", t("about.lede"))}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-6 py-16 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">
            {p("about.purpose.title", t("about.purpose.title"))}
          </h2>
          <p className="mt-3 text-foreground/85 leading-relaxed">
            {p("about.purpose.body", t("about.purpose.body"))}
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl">
            {p("about.governance.title", t("about.governance.title"))}
          </h2>
          <p className="mt-3 text-foreground/85 leading-relaxed">
            {p("about.governance.body", t("about.governance.body"))}
          </p>
        </div>
      </section>

      {/* Key principles */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-14">
          <h2 className="font-display text-2xl">
            {p("about.principles.title", t("about.principles.title"))}
          </h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {principles.map((principle, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border border-border bg-background p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
                <span className="text-sm text-foreground/85">{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
}

export default AboutPage;
