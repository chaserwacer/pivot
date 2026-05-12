import { NextResponse } from "next/server";
import { mockWeather } from "@/lib/mockData";

export async function GET() {
  // Iteration 3 swaps in OpenWeather + NWS alerts, with geohash-bucketed cache.
  return NextResponse.json({ weather: mockWeather });
}
