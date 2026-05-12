"use client";

import { useEffect, useState } from "react";

const KEY = "pivot:onboarded";

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setShow(true);
    } catch {
      // No localStorage (private mode, SSR) — skip onboarding.
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setShow(false);
  }

  if (!show) return null;

  const steps = [
    {
      title: "Welcome to Pivot",
      body: "Plan outdoor routes with AI that knows your trip, the weather, and the conditions.",
    },
    {
      title: "Build, find, or generate",
      body: "Sketch your own waypoints, browse popular routes nearby, or ask the AI for ideas.",
    },
    {
      title: "Take it offline",
      body: "Tap Download on any route to keep it on your phone — works in airplane mode.",
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-title"
      className="fixed inset-0 z-40 grid place-items-end bg-black/30 p-4 md:place-items-center"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-card">
        <p id="onb-title" className="text-base font-semibold">{current.title}</p>
        <p className="mt-2 text-sm text-ink-700">{current.body}</p>
        <div className="mt-5 flex items-center justify-between">
          <button onClick={dismiss} className="text-sm text-ink-500">
            Skip
          </button>
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-accent" : "bg-ink-100"}`}
              />
            ))}
          </div>
          <button
            onClick={() => (last ? dismiss() : setStep(step + 1))}
            className="rounded-full bg-accent px-4 py-1.5 text-sm text-white"
          >
            {last ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
