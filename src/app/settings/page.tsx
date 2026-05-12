"use client";

import { useState } from "react";
import { Chip } from "@/components/Chip";
import { ActivityGlyph } from "@/components/ActivityGlyph";
import type { Activity, AIPreferences } from "@/lib/types";

const allActivities: Activity[] = ["hike", "run", "bike", "ski", "climb"];

const defaultPrefs: AIPreferences = {
  activities: ["hike", "bike"],
  intensity: 3,
  crowd_tolerance: 2,
  surface_pref: ["trail"],
  avoid: [],
  use_strava_fitness: true,
  use_bookings: true,
  use_calendar: false,
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<AIPreferences>(defaultPrefs);

  function toggleActivity(a: Activity) {
    setPrefs((p) => ({
      ...p,
      activities: p.activities.includes(a)
        ? p.activities.filter((x) => x !== a)
        : [...p.activities, a],
    }));
  }

  async function save() {
    await fetch("/api/me/preferences", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(prefs),
    });
  }

  return (
    <div className="px-5 pt-4 md:pt-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI preferences</h1>
      <p className="mt-1 text-sm text-ink-500">
        Tune how Pivot suggests routes. Context is computed per request and not stored.
      </p>

      <Section title="Activities">
        <div className="flex flex-wrap gap-2">
          {allActivities.map((a) => (
            <button key={a} onClick={() => toggleActivity(a)}>
              <Chip active={prefs.activities.includes(a)}>
                <ActivityGlyph activity={a} className="h-3.5 w-3.5" />
                <span className="capitalize">{a}</span>
              </Chip>
            </button>
          ))}
        </div>
      </Section>

      <Slider
        label="Intensity"
        leftLabel="Easy"
        rightLabel="Hardcore"
        value={prefs.intensity}
        onChange={(v) => setPrefs((p) => ({ ...p, intensity: v as AIPreferences["intensity"] }))}
      />

      <Slider
        label="Crowds"
        leftLabel="Prefer quiet"
        rightLabel="Don't mind"
        value={prefs.crowd_tolerance}
        onChange={(v) => setPrefs((p) => ({ ...p, crowd_tolerance: v as AIPreferences["crowd_tolerance"] }))}
      />

      <Section title="Signals">
        <Toggle label="Use my Strava fitness" value={prefs.use_strava_fitness} onChange={(b) => setPrefs((p) => ({ ...p, use_strava_fitness: b }))} />
        <Toggle label="Use my bookings" value={prefs.use_bookings} onChange={(b) => setPrefs((p) => ({ ...p, use_bookings: b }))} />
        <Toggle label="Use my calendar" value={prefs.use_calendar} onChange={(b) => setPrefs((p) => ({ ...p, use_calendar: b }))} />
      </Section>

      <button
        onClick={save}
        className="mt-6 w-full rounded-2xl bg-accent py-3 text-white shadow-card transition active:scale-[0.99]"
      >
        Save preferences
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-card">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 text-sm">
      <span>{label}</span>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-10 rounded-full transition ${value ? "bg-accent" : "bg-ink-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

function Slider({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Section title={label}>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-accent"
      />
      <div className="mt-1 flex justify-between text-xs text-ink-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </Section>
  );
}
