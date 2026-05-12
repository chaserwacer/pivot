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
        <div className="mx-auto flex min-h-screen max-w-screen-md flex-col md:max-w-screen-lg">
          <TopBar />
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
        <SwRegister />
      </body>
    </html>
  );
}
