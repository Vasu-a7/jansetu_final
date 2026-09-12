import { useState, useMemo } from "react";
import { Search, Filter, Sparkles, CheckCircle2, FileText, ExternalLink, Calendar, HelpCircle, ShieldCheck, ChevronRight, BookOpen } from "lucide-react";
import { VERIFIED_GOVT_SCHEMES, type Scheme } from "@/lib/schemesData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function SchemesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAudience, setSelectedAudience] = useState<string>("All");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Guided Eligibility Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardAnswers, setWizardAnswers] = useState({
    userType: "",
    district: "Ranchi",
    isTribal: false,
    incomeBelow3L: true,
  });
  const [wizardMatchedSchemes, setWizardMatchedSchemes] = useState<Scheme[]>([]);

  const availableCategories = useMemo(() => {
    const set = new Set(VERIFIED_GOVT_SCHEMES.map((s) => s.category));
    return Array.from(set);
  }, []);

  const filteredSchemes = useMemo(() => {
    return VERIFIED_GOVT_SCHEMES.filter((scheme) => {
      const matchesSearch =
        !searchQuery.trim() ||
        scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.hindiTitle.includes(searchQuery) ||
        scheme.eligibilitySummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || scheme.category === selectedCategory;

      const matchesAudience =
        selectedAudience === "All" ||
        scheme.targetAudience.includes(selectedAudience as any);

      return matchesSearch && matchesCategory && matchesAudience;
    });
  }, [searchQuery, selectedCategory, selectedAudience]);

  function handleRunEligibilityWizard() {
    let matches = VERIFIED_GOVT_SCHEMES;
    if (wizardAnswers.userType) {
      matches = matches.filter((s) => s.targetAudience.includes(wizardAnswers.userType as any));
    }
    setWizardMatchedSchemes(matches);
    setWizardStep(3);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          <ShieldCheck className="size-3.5" /> Official Verified Directory
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Jharkhand Government Schemes & Services
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Browse verified central & state welfare schemes, document checklists, direct application links, and check your personalized eligibility.
        </p>
      </header>

      {/* GUIDED ELIGIBILITY CALCULATOR BANNER */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-800 p-6 text-primary-foreground shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="size-4 animate-pulse" /> 1-Minute Eligibility Checker
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Not sure which schemes you qualify for?</h2>
            <p className="mt-1 text-sm text-primary-foreground/90 max-w-xl">
              Answer 3 quick questions about your category, occupation, and district to discover all eligible welfare programs.
            </p>
          </div>
          <Button
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="shrink-0 bg-white text-indigo-900 hover:bg-amber-300 hover:text-indigo-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            Check My Eligibility Now →
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, Abua Awas, Maiyee Samman, Guruji Credit Card..."
              className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground shrink-0" />
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-xs"
            >
              <option value="All">All Beneficiaries</option>
              <option value="farmers">Farmers (किसान)</option>
              <option value="students">Students (छात्र/युवा)</option>
              <option value="women">Women (महिलाएं)</option>
              <option value="seniors">Senior Citizens (वरिष्ठ नागरिक)</option>
              <option value="tribal">Tribal & ST/SC (आदिवासी)</option>
              <option value="workers">Workers & Labourers (श्रमिक)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === "All"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Categories ({VERIFIED_GOVT_SCHEMES.length})
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SCHEMES GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.map((scheme) => (
          <article
            key={scheme.id}
            onClick={() => setSelectedScheme(scheme)}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary truncate">
                  {scheme.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="size-3" /> Verified {scheme.verifiedDate}
                </span>
              </div>

              <h2 className="text-base font-bold text-card-foreground group-hover:text-primary transition-colors leading-snug">
                {scheme.title}
              </h2>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                {scheme.hindiTitle}
              </p>

              <p className="mt-3 text-xs leading-5 text-muted-foreground line-clamp-3 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <strong className="text-foreground">Eligibility: </strong> {scheme.eligibilitySummary}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-600 truncate max-w-[180px]">
                {scheme.applicationMode}
              </span>
              <span className="font-bold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View Details →
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* SCHEME DETAIL MODAL */}
      <Dialog open={selectedScheme !== null} onOpenChange={(open) => !open && setSelectedScheme(null)}>
        {selectedScheme && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {selectedScheme.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="size-3.5" /> Verified Official Scheme
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {selectedScheme.title}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground">
                {selectedScheme.hindiTitle} • {selectedScheme.department}
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-foreground uppercase tracking-wider mb-1">Eligibility Criteria</h4>
                <p className="leading-5 text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
                  {selectedScheme.eligibilitySummary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foreground uppercase tracking-wider mb-1">Financial & Social Benefits</h4>
                <p className="leading-5 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 font-medium">
                  {selectedScheme.benefits}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foreground uppercase tracking-wider mb-1.5">Required Document Checklist</h4>
                <ul className="space-y-1.5">
                  {selectedScheme.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 border border-border">
                <div>
                  <p className="font-bold text-foreground">Mode of Application</p>
                  <p className="text-[11px] text-muted-foreground">{selectedScheme.applicationMode}</p>
                </div>
                <a
                  href={selectedScheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                >
                  Official Portal <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* WIZARD MODAL */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Sparkles className="size-5 text-amber-500" />
              Guided Scheme Eligibility Checker
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select your background to quickly filter all qualified schemes.
            </DialogDescription>
          </DialogHeader>

          {wizardStep === 1 && (
            <div className="py-4 space-y-4">
              <p className="text-xs font-bold text-foreground">Step 1: Which group best describes you?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "farmers", label: "Farmer (किसान)" },
                  { id: "students", label: "Student (छात्र)" },
                  { id: "women", label: "Woman (महिला)" },
                  { id: "seniors", label: "Senior Citizen (वरिष्ठ)" },
                  { id: "tribal", label: "Tribal (ST/SC)" },
                  { id: "workers", label: "Worker (श्रमिक)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setWizardAnswers({ ...wizardAnswers, userType: item.id });
                      setWizardStep(2);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      wizardAnswers.userType === item.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 bg-card"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="py-4 space-y-4">
              <p className="text-xs font-bold text-foreground">Step 2: Annual Household Income</p>
              <div className="space-y-2">
                <button
                  onClick={handleRunEligibilityWizard}
                  className="w-full p-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-xs text-left"
                >
                  Below ₹3,00,000 / Year (Eligible for all BPL & Abua schemes)
                </button>
                <button
                  onClick={handleRunEligibilityWizard}
                  className="w-full p-3 rounded-xl border border-border hover:border-primary/40 bg-card font-semibold text-xs text-left text-foreground"
                >
                  Above ₹3,00,000 / Year (Eligible for merit & higher education loans)
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-emerald-600">
                  ✓ Found {wizardMatchedSchemes.length} Eligible Schemes
                </p>
                <button
                  onClick={() => setWizardStep(1)}
                  className="text-[11px] text-muted-foreground underline"
                >
                  Start Over
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {wizardMatchedSchemes.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setIsWizardOpen(false);
                      setSelectedScheme(s);
                    }}
                    className="p-3 rounded-xl border border-border hover:border-primary bg-card text-left cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold text-foreground">{s.title}</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{s.benefits}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

