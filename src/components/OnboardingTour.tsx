import { useState, useEffect } from "react";
import {
  Sparkles,
  Building2,
  Camera,
  Flame,
  GraduationCap,
  Trophy,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: any;
  gradient: string;
  features: string[];
}

const steps: Step[] = [
  {
    title: "Welcome to JanSetu",
    subtitle: "Connecting Citizens & Administration",
    description:
      "JanSetu is your civic commons platform to report public infrastructure issues, track municipal resolution progress, and build a better community.",
    badge: "Welcome (Step 1 of 5)",
    icon: Building2,
    gradient: "from-indigo-600 via-indigo-700 to-purple-800",
    features: [
      "Direct municipal issue reporting",
      "Real-time resolution status tracking",
      "Community civic participation",
    ],
  },
  {
    title: "AI-Powered Civic Reporting",
    subtitle: "Instant Category & Location Detection",
    description:
      "Snap a photo or describe a pothole, street light, or garbage issue. JanSetu AI automatically formats, categorizes, and dispatches your report.",
    badge: "AI Assistance (Step 2 of 5)",
    icon: Camera,
    gradient: "from-blue-600 via-cyan-600 to-teal-700",
    features: [
      "Automatic photo & geolocation analysis",
      "Smart urgency & severity tags",
      "Instant submission to district officers",
    ],
  },
  {
    title: "Live Feed & Upvoting",
    subtitle: "Amplify Neighborhood Priorities",
    description:
      "Explore issues reported by fellow citizens in your district. Upvote critical problems to elevate their priority for local government teams.",
    badge: "Community Feed (Step 3 of 5)",
    icon: Flame,
    gradient: "from-amber-500 via-orange-600 to-red-600",
    features: [
      "Upvote issues to boost visibility",
      "Audio issue playback & AI summary",
      "Filter by category & district status",
    ],
  },
  {
    title: "University & Govt Desk",
    subtitle: "Academic & Administrative Synergy",
    description:
      "Access university student capstone projects focused on civic research, along with official government department dashboard metrics.",
    badge: "Govt & Campus (Step 4 of 5)",
    icon: GraduationCap,
    gradient: "from-emerald-600 via-teal-600 to-cyan-800",
    features: [
      "Student capstone research solutions",
      "Department resolution transparency",
      "Field verification & audit badges",
    ],
  },
  {
    title: "Civic XP & Daily Streaks",
    subtitle: "Gamified Civic Rewards",
    description:
      "Maintain your daily activity streak, earn Civic XP points, unlock achievement badges, and climb from Citizen Contributor to Level 5 Civic Leader!",
    badge: "Rewards (Step 5 of 5)",
    icon: Trophy,
    gradient: "from-purple-600 via-pink-600 to-rose-700",
    features: [
      "Daily streak counter (+50 XP daily)",
      "Unlockable achievement badges",
      "Personalized civic impact profile",
    ],
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has already completed tour v2
    const completed = localStorage.getItem("jansetu_tour_completed_v2");
    if (completed !== "true") {
      setIsOpen(true);
    }

    // Global event listener to replay tour anytime
    const handleStartTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener("jansetu_start_tour", handleStartTour);
    return () => {
      window.removeEventListener("jansetu_start_tour", handleStartTour);
    };
  }, []);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("jansetu_tour_completed_v2", "true");
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-border shadow-2xl flex flex-col transition-all transform scale-100">
        
        {/* TOP GRADIENT BANNER WITH ICON */}
        <div className={`relative p-6 bg-gradient-to-br ${step.gradient} text-white transition-all duration-500`}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-xs">
              <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
              {step.badge}
            </span>

            {/* MANDATORY SKIP BUTTON */}
            <button
              onClick={handleComplete}
              className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Skip Tour"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 grid place-items-center shrink-0 shadow-inner">
              <IconComponent className="size-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight">{step.title}</h2>
              <p className="text-xs text-white/80 font-medium mt-0.5">{step.subtitle}</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-5 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* CONTENT & FEATURES LIST */}
        <div className="p-5 sm:p-6 space-y-4 flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          <div className="space-y-2 rounded-2xl bg-muted/40 p-3.5 border border-border/50">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-500" /> Key Features
            </p>
            {step.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER & NAVIGATION ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
          {/* STEP INDICATOR DOTS */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-xs font-semibold rounded-xl"
              >
                <ChevronLeft className="size-4 mr-0.5" /> Back
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className={`text-xs font-bold rounded-xl shadow-md ${
                isLastStep
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isLastStep ? (
                <>
                  Get Started & Explore <CheckCircle2 className="size-4 ml-1.5" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="size-4 ml-0.5" />
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}