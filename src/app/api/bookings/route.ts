import { NextResponse } from "next/server";

/**
 * Bookings feed the AI context (see ARCHITECTURE.md §4.1) — "near = hotel
 * coords if any". Iteration 4 ingests real reservations via partner APIs;
 * the MVP scaffold returns one canned trip so the AI route picker has a
 * non-empty location signal.
 */
export async function GET() {
  return NextResponse.json({
    bookings: [
      {
        id: "bk-aspen-meadows",
        vendor: "Pivot stub",
        title: "Aspen Meadows Resort",
        location: { lat: 39.1986, lng: -106.8313 },
        starts_at: "2026-05-12T16:00:00-06:00",
        ends_at: "2026-05-15T11:00:00-06:00",
      },
    ],
  });
}
