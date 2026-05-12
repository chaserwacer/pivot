"use client";

import { useState } from "react";

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  async function share() {
    if (typeof navigator === "undefined") return;
    const url = window.location.href;
    if ("share" in navigator) {
      try {
        await (navigator as { share: (d: ShareData) => Promise<void> }).share({
          title,
          text,
          url,
        });
        setStatus("shared");
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      console.warn("[share] clipboard failed:", err);
    }
  }

  const label = status === "copied" ? "Link copied" : status === "shared" ? "Shared" : "Share";
  return (
    <button
      onClick={share}
      className="rounded-full border border-ink-100 bg-white px-3 py-1.5 text-sm"
    >
      {label}
    </button>
  );
}
