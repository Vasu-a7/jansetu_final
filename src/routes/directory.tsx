import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { EmergencyDirectoryView } from "@/views/EmergencyDirectoryView";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "24x7 Emergency Directory — JanSetu Jharkhand" },
      {
        name: "description",
        content: "Verified Jharkhand Emergency Helplines: Police 112, Women 181, Ambulance 108, Fire 101, Childline 1098, Disaster Control.",
      },
    ],
  }),
  component: DirectoryPage,
});

function DirectoryPage() {
  return (
    <>
      <AppHeader title="Emergency Directory" />
      <main id="main" className="pb-24">
        <EmergencyDirectoryView />
      </main>
    </>
  );
}

