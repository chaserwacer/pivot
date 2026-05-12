"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistance, formatDuration } from "@/lib/units";

type Phase = "idle" | "running" | "paused" | "done";

export default function RecordPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds
  const [distance, setDistance] = useState(0); // metres (stand-in)
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "running") {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      // Stand-in: assume 1.4 m/s average pace until iteration 6 wires the
      // background geolocation plugin and we sample real positions.
      setDistance((d) => d + 1.4);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase]);

  function start() {
    setElapsed(0);
    setDistance(0);
    setPhase("running");
  }
  function pause() {
    setPhase("paused");
  }
  function resume() {
    setPhase("running");
  }
  function stop() {
    setPhase("done");
  }
  function discard() {
    setPhase("idle");
    setElapsed(0);
    setDistance(0);
    setPushed(null);
  }

  async function pushToStrava() {
    setPushing(true);
    try {
      const res = await fetch("/api/strava/activities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Pivot recording",
          activity: "hike",
          elapsed_s: elapsed,
          distance_m: Math.round(distance),
        }),
      });
      const json = await res.json();
      setPushed(json.queued ? "Uploaded to Strava." : "Strava not connected.");
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="px-5 pt-4 md:pt-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Record</h1>
      <p className="mt-1 text-sm text-ink-500">
        Track an activity. Background tracking lands in iteration 6.
      </p>

      <section className="mt-6 rounded-2xl bg-white p-6 text-center shadow-card">
        <p className="font-mono text-5xl tabular-nums tracking-tight">{formatDuration(elapsed)}</p>
        <p className="mt-2 text-sm text-ink-500">{formatDistance(distance)}</p>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {phase === "idle" && (
          <button
            onClick={start}
            className="col-span-2 rounded-2xl bg-accent py-4 text-white shadow-card transition active:scale-[0.99]"
          >
            Start
          </button>
        )}
        {phase === "running" && (
          <>
            <button onClick={pause} className="rounded-2xl border border-ink-100 bg-white py-4 shadow-card">
              Pause
            </button>
            <button onClick={stop} className="rounded-2xl bg-red-500 py-4 text-white shadow-card">
              Stop
            </button>
          </>
        )}
        {phase === "paused" && (
          <>
            <button onClick={resume} className="rounded-2xl bg-accent py-4 text-white shadow-card">
              Resume
            </button>
            <button onClick={stop} className="rounded-2xl bg-red-500 py-4 text-white shadow-card">
              Stop
            </button>
          </>
        )}
        {phase === "done" && (
          <>
            <button
              onClick={pushToStrava}
              disabled={pushing}
              className="rounded-2xl bg-accent py-4 text-white shadow-card disabled:opacity-60"
            >
              {pushing ? "Uploading…" : "Push to Strava"}
            </button>
            <button onClick={discard} className="rounded-2xl border border-ink-100 bg-white py-4 shadow-card">
              Discard
            </button>
          </>
        )}
      </div>

      {pushed && (
        <p className="mt-4 rounded-2xl bg-white p-3 text-center text-sm text-ink-700 shadow-card">{pushed}</p>
      )}
    </div>
  );
}
