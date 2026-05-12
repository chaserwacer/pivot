import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Pivot ships as a Capacitor 6 wrap around the Next.js export. To rebuild
 * the native shells:
 *
 *   npm run build && next export -o out
 *   npx cap sync
 *   npx cap open ios     # or: npx cap open android
 *
 * The plan is to expose a `Recording` plugin in iteration 6 for background
 * geolocation; that lives in the `ios/` / `android/` directories created by
 * `cap add`.
 */
const config: CapacitorConfig = {
  appId: "co.pivot.outdoor",
  appName: "Pivot",
  webDir: "out",
  bundledWebRuntime: false,
  ios: {
    contentInset: "automatic",
  },
  android: {
    backgroundColor: "#F4F6F8",
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#0EA5A4",
      launchAutoHide: true,
      launchShowDuration: 600,
    },
  },
};

export default config;
