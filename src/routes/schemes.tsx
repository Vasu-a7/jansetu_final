import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { SchemesView } from "@/views/SchemesView";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes & Eligibility — JanSetu Jharkhand" },
      {
        name: "description",
        content: "Discover verified Jharkhand & Central welfare schemes, eligibility rules, document checklists, and application steps.",
      },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  return (
    <>
      <AppHeader title="Government Schemes" />
      <main id="main" className="pb-24">
        <SchemesView />
      </main>
    </>
  );
}

