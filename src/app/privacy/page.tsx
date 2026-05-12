export default function PrivacyPage() {
  return (
    <article className="prose mx-auto max-w-prose px-5 pt-6 prose-headings:tracking-tight">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Privacy</h1>
      <p className="mt-3 text-sm text-ink-700">
        We collect the minimum needed to plan a route with you and to make AI suggestions
        better over time. We never sell your data.
      </p>

      <h2 className="mt-6 text-base font-semibold">Location</h2>
      <p className="mt-2 text-sm text-ink-700">
        Pivot only reads your location when you actively use the app (e.g. opening the home
        screen, recording an activity). Background tracking is opt-in per session.
      </p>

      <h2 className="mt-6 text-base font-semibold">AI context</h2>
      <p className="mt-2 text-sm text-ink-700">
        When you ask Pivot to suggest a route, we assemble a short context bundle (your
        preferences, the weather near you, recent trail reports) and send it to our AI
        provider on a per-request basis. The bundle is not retained after the response.
      </p>

      <h2 className="mt-6 text-base font-semibold">Strava and other integrations</h2>
      <p className="mt-2 text-sm text-ink-700">
        If you connect Strava (or AllTrails, Gaia), we exchange OAuth tokens and store them
        encrypted at rest. You can disconnect at any time from your profile.
      </p>

      <h2 className="mt-6 text-base font-semibold">Your rights</h2>
      <p className="mt-2 text-sm text-ink-700">
        Email <a className="text-accent" href="mailto:privacy@pivot.example">privacy@pivot.example</a>{" "}
        to request a copy of your data or to delete your account.
      </p>
    </article>
  );
}
