import { ShieldCheck, Scale, FileText, ExternalLink, CheckCircle2, Lock, Eye, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GovernanceView() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* HERO */}
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider mb-3">
          <ShieldCheck className="size-4" /> About JanSetu Platform Governance
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Connecting Citizens and Administration.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground leading-7">
          JanSetu (जनसेतु) is an independent civic technology platform built for Jharkhand, India. We empower citizens, university researchers, and local administrative departments to discover, report, verify, and resolve community infrastructure issues.
        </p>
      </header>

      {/* CORE GOVERNANCE PRINCIPLES */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
            <Scale className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">100% Political Neutrality</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-5">
            JanSetu is strictly non-partisan. We facilitate civic grievance tracking and academic research without promoting any political party or campaign.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center mb-3">
            <CheckCircle2 className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Verified Information</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-5">
            Every government scheme, emergency helpline number, and municipal contact listed on JanSetu is verified against official government portals.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 grid place-items-center mb-3">
            <Lock className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Data Privacy & Safety</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-5">
            We enforce strict privacy controls. Confidential and anonymous grievance options protect citizens from harassment or exposure of personal data.
          </p>
        </div>
      </div>

      {/* NON-GOVERNMENTAL DISCLAIMER */}
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="size-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Important Public Notice</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-6">
              JanSetu is a civic technology facilitation platform designed to enhance community transparency. <strong>JanSetu is NOT a replacement for official government statutory grievance redressal bodies.</strong> For formal legal filings, statutory appeals, or law enforcement actions, citizens are encouraged to utilize official statutory portals listed below.
            </p>
          </div>
        </div>
      </div>

      {/* OFFICIAL ESCALATION & GOVERNMENT PORTALS */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Official Government Grievance Portals</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              name: "Jharkhand CM Jansamvad (181)",
              url: "https://cm.jharkhand.gov.in",
              desc: "Official State Public Grievance Redressal Portal",
            },
            {
              name: "CPGRAMS National Portal",
              url: "https://pgportal.gov.in",
              desc: "Central Public Grievance Redress and Monitoring System",
            },
            {
              name: "RTI Online Jharkhand",
              url: "https://rtionline.jharkhand.gov.in",
              desc: "Right to Information Applications & Appeals",
            },
            {
              name: "Jharkhand Lokayukta Portal",
              url: "https://lokayukta.jharkhand.gov.in",
              desc: "Statutory Anti-Corruption Administrative Authority",
            },
          ].map((portal, i) => (
            <a
              key={i}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-foreground">{portal.name}</p>
                <p className="text-[11px] text-muted-foreground">{portal.desc}</p>
              </div>
              <ExternalLink className="size-4 text-primary shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* POLICIES & ACCESSIBILITY STATEMENT LINKS */}
      <div className="pt-6 border-t border-border flex items-center justify-between flex-wrap gap-4 text-xs font-semibold">
        <Link to="/privacy-terms" className="text-primary hover:underline">
          Read Privacy Policy & Terms of Service →
        </Link>
        <span className="text-muted-foreground">WCAG 2.2 AA Compliant Platform</span>
      </div>
    </section>
  );
}

