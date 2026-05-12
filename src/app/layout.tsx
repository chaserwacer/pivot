import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { SwRegister } from "@/components/SwRegister";

export const metadata: Metadata = {
  title: "Pivot — outdoor route planning",
  description:
    "Plan, discover, and share hiking, biking, running and ski routes — with AI suggestions tuned to weather, conditions, and your trip.",
  applicationName: "Pivot",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Pivot",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5A4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white focus:shadow-card"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-screen max-w-screen-md flex-col md:max-w-screen-lg">
          <TopBar />
          <main id="main" className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
        <SwRegister />
      </body>
    </html>
  );
}
