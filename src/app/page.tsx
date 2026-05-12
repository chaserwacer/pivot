import Link from "next/link";
import { headers } from "next/headers";
import { seedRoutes, mockWeather } from "@/lib/mockData";
import { RouteCard } from "@/components/RouteCard";
import { ContinuePlanning } from "@/components/ContinuePlanning";
import { Onboarding } from "@/components/Onboarding";
import { detectLocale, t } from "@/lib/i18n";

export default function HomePage() {
  const hero = seedRoutes.slice(0, 3);
  const list = seedRoutes.slice(3);
  const locale = detectLocale(headers().get("accept-language"));

  return (
    <div className="px-5 pt-4 md:pt-8">
      <Onboarding />
      <section className="mb-6">
        <p className="text-sm text-ink-500">{t(locale, "home.greeting")}, Sam</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Aspen · {mockWeather.temp_c}°C
        </h1>
        <p className="mt-1 max-w-md text-sm text-ink-500">{mockWeather.summary}</p>
        {mockWeather.alerts.length > 0 && (
          <ul className="mt-3 space-y-2" aria-label="Weather alerts">
            {mockWeather.alerts.map((a, i) => (
              <li
                key={i}
                role="alert"
                className={`rounded-2xl border px-4 py-2 text-sm shadow-card ${
                  a.severity === "warning"
                    ? "border-red-200 bg-red-50 text-red-900"
                    : a.severity === "watch"
                      ? "border-orange-200 bg-orange-50 text-orange-900"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <span className="font-medium uppercase tracking-wide text-[10px]">
                  {a.severity}
                </span>{" "}
                · {a.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mb-8 grid gap-3 md:grid-cols-2">
        <Link
          href="/routes/new?ai=1"
          className="flex items-center justify-between rounded-2xl bg-accent px-5 py-4 text-white shadow-card transition active:scale-[0.99]"
        >
          <div>
            <p className="text-sm font-medium opacity-90">{t(locale, "home.plan_with_ai")}</p>
            <p className="text-xs opacity-75">{t(locale, "home.plan_subtitle")}</p>
          </div>
          <span aria-hidden className="text-xl">→</span>
        </Link>
        <Link
          href="/plan"
          className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white px-5 py-4 text-ink-900 shadow-card transition active:scale-[0.99]"
        >
          <div>
            <p className="text-sm font-medium">{t(locale, "home.trip_planner")}</p>
            <p className="text-xs text-ink-500">{t(locale, "home.trip_subtitle")}</p>
          </div>
          <span aria-hidden className="text-xl">→</span>
        </Link>
      </div>

      <ContinuePlanning />

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">{t(locale, "home.for_you")}</h2>
          <Link href="/routes" className="text-xs text-accent">{t(locale, "common.see_all")}</Link>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory">
          {hero.map((r) => (
            <div key={r.id} className="snap-start">
              <RouteCard route={r} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">{t(locale, "home.popular")}</h2>
        <ul className="flex flex-col gap-2">
          {list.map((r) => (
            <li key={r.id}>
              <RouteCard route={r} variant="row" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
