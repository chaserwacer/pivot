import { NextResponse } from "next/server";

/** Stand-in user for the MVP scaffold. Iteration 3 wires Auth.js sessions. */
export async function GET() {
  return NextResponse.json({
    user: {
      id: "demo",
      display_name: "Sam",
      units: "imperial",
      home: { lat: 39.1911, lng: -106.8175 },
    },
  });
}
