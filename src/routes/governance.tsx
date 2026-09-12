import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { GovernanceView } from "@/views/GovernanceView";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "About JanSetu Governance & Neutrality — JanSetu Jharkhand" },
      {
        name: "description",
        content: "Learn about JanSetu's platform governance, political neutrality, data verification standards, and official government escalation portals.",
      },
    ],
  }),
  component: GovernancePage,
});

function GovernancePage() {
  return (
    <>
      <AppHeader title="About Governance" />
      <main id="main" className="pb-24">
        <GovernanceView />
      </main>
    </>
  );
}

