import { NextResponse } from "next/server";
import { getRoute } from "@/lib/mockData";
import { routeToGpx } from "@/lib/gpx";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "gpx").toLowerCase();
  const route = getRoute(params.id);
  if (!route) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (format !== "gpx") {
    // KML/FIT deferred to iteration 6.
    return NextResponse.json({ error: "format_not_implemented", format }, { status: 501 });
  }

  const xml = routeToGpx(route);
  return new NextResponse(xml, {
    headers: {
      "content-type": "application/gpx+xml",
      "content-disposition": `attachment; filename="${route.id}.gpx"`,
    },
  });
}
