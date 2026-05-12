import RouteBuilder from "./RouteBuilder";

export default function NewRoutePage({ searchParams }: { searchParams: { ai?: string } }) {
  const aiMode = searchParams.ai === "1";
  return <RouteBuilder aiMode={aiMode} />;
}
