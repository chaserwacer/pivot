/**
 * Tiny translation registry. We pick a locale per session from the
 * `Accept-Language` header (server) or `navigator.language` (client), fall
 * back to English, and never block on a network fetch. Iteration 8 adds a
 * proper ICU runtime with pluralization and a translator pipeline.
 */

export type Locale = "en" | "es";

type Bundle = Record<string, string>;

const BUNDLES: Record<Locale, Bundle> = {
  en: {
    "home.greeting": "Good morning",
    "home.plan_with_ai": "Plan with AI",
    "home.plan_subtitle": "Built around your trip, weather and fitness.",
    "home.trip_planner": "Trip planner",
    "home.trip_subtitle": "Multi-day itinerary around your stay.",
    "home.for_you": "For you today",
    "home.popular": "Popular nearby",
    "common.see_all": "See all",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.share": "Share",
  },
  es: {
    "home.greeting": "Buenos días",
    "home.plan_with_ai": "Planifica con IA",
    "home.plan_subtitle": "A medida de tu viaje, el clima y tu estado físico.",
    "home.trip_planner": "Planificador de viaje",
    "home.trip_subtitle": "Itinerario de varios días alrededor de tu estancia.",
    "home.for_you": "Para ti hoy",
    "home.popular": "Populares cerca",
    "common.see_all": "Ver todo",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.share": "Compartir",
  },
};

export function detectLocale(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return "en";
  const tag = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  if (tag.startsWith("es")) return "es";
  return "en";
}

export function t(locale: Locale, key: string): string {
  return BUNDLES[locale]?.[key] ?? BUNDLES.en[key] ?? key;
}
