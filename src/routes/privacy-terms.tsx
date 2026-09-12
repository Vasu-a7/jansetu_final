import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/privacy-terms")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Terms of Service — JanSetu Jharkhand" },
      {
        name: "description",
        content: "JanSetu Privacy Policy, Data Protection standards, Terms of Service, Moderation Rules, and Accessibility Statement.",
      },
    ],
  }),
  component: PrivacyTermsPage,
});

function PrivacyTermsPage() {
  return (
    <>
      <AppHeader title="Privacy & Terms" />
      <main id="main" className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8 pb-28">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider mb-2">
            <Lock className="size-3.5" /> Transparency & Legal Protection
          </div>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Privacy Policy & Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last Updated: May 2025 • Compliant with Indian Digital Personal Data Protection Act (DPDP) and WCAG 2.2 AA standards.
          </p>
        </header>

        <div className="space-y-6 text-sm text-foreground leading-7">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> 1. Data Minimization & Privacy Protection
            </h2>
            <p className="text-muted-foreground">
              JanSetu collects only necessary data required to process community grievance reports. We do not sell or monetize personal user data. Users can choose to report issues with <strong>Public</strong>, <strong>Confidential</strong>, or <strong>Anonymous</strong> privacy options.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Eye className="size-5 text-indigo-600" /> 2. Community Moderation & Anti-Harassment Rules
            </h2>
            <p className="text-muted-foreground">
              JanSetu maintains zero tolerance for hate speech, doxxing, harassment, false accusations, or partisan political campaigning. Reports flagged for false claims undergo human moderation before public display.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-emerald-600" /> 3. Data Export & Account Deletion Rights
            </h2>
            <p className="text-muted-foreground">
              Citizens maintain full ownership of their data. You may request a complete export of your reported issues or delete your account at any time directly through the Profile settings.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-amber-500" /> 4. Accessibility Statement (WCAG 2.2 AA)
            </h2>
            <p className="text-muted-foreground">
              JanSetu is designed to be accessible to all citizens, including individuals with low digital literacy or visual/auditory impairments. We support high-contrast mode, text size adjustments, screen reader keyboard navigation, and Text-to-Speech narration.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

