"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[pivot] route error:", error);
  }, [error]);

  return (
    <div className="px-5 pt-10 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Off the trail.</h1>
      <p className="mt-2 text-sm text-ink-500">
        Something went wrong on this page. The issue has been logged.
      </p>
      {error.digest && <p className="mt-1 text-[11px] text-ink-300">id: {error.digest}</p>}
      <button
        onClick={reset}
        className="mt-6 rounded-2xl bg-accent px-4 py-2 text-sm text-white shadow-card"
      >
        Try again
      </button>
    </div>
  );
}
