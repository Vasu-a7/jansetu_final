import { createFileRoute } from "@tanstack/react-router";
import { GovDashboardView } from "@/views/GovDashboardView";

export const Route = createFileRoute("/gov-dashboard")({
  head: () => ({
    meta: [
      { title: "Government & Department Dashboard — JanSetu" },
      {
        name: "description",
        content: "Government accountability, deduplicated Master Issues, SLA tracking, and resolution verification dashboard for Jharkhand.",
      },
    ],
  }),
  component: GovDashboardView,
});
