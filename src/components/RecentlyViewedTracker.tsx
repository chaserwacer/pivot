"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/recentlyViewed";

export function RecentlyViewedTracker({ routeId, title }: { routeId: string; title: string }) {
  useEffect(() => {
    recordView({ id: routeId, title });
  }, [routeId, title]);
  return null;
}
