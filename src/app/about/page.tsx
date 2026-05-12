export default function AboutPage() {
  return (
    <article className="prose mx-auto max-w-prose px-5 pt-6 prose-headings:tracking-tight">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">About Pivot</h1>
      <p className="mt-3 text-sm text-ink-700">
        Pivot helps you plan, discover and share outdoor routes — hike, bike, run, ski, climb —
        with AI suggestions tuned to weather, conditions, and your trip.
      </p>

      <h2 className="mt-6 text-base font-semibold">What's powering it</h2>
      <ul className="mt-2 space-y-1 text-sm text-ink-700">
        <li>Map data &copy; OpenStreetMap contributors, rendered with MapLibre.</li>
        <li>AI suggestions by Claude (Anthropic), with prompt-cached system prompts.</li>
        <li>Trail data from the Pivot community + curated partner imports.</li>
      </ul>

      <h2 className="mt-6 text-base font-semibold">Safety</h2>
      <p className="mt-2 text-sm text-ink-700">
        Pivot is a planning tool, not a guarantee. Conditions change fast — check current
        forecasts, file a trip plan with a friend, and turn back when something feels off.
      </p>

      <h2 className="mt-6 text-base font-semibold">Contact</h2>
      <p className="mt-2 text-sm text-ink-700">hello@pivot.example</p>
    </article>
  );
}
