import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { FeedView } from "@/views/FeedView";
import { useState } from "react";
import {
  Award,
  Flame,
  Zap,
  Trophy,
  CheckCircle,
  Sparkles,
  PlusCircle,
  GraduationCap,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowRight,
  Crown,
  Target,
  Check,
  Star,
  Shield,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JanSetu — Connecting Citizens and Administration" },
      {
        name: "description",
        content: "Connecting Citizens and Administration to discover and resolve community issues.",
      },
      { property: "og:title", content: "JanSetu — Connecting Citizens and Administration" },
      {
        property: "og:description",
        content: "Connecting Citizens and Administration to discover and resolve community issues.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const { user, profile, role } = useAuth();

  // Gamified Civic Streak State
  const [streakCount, setStreakCount] = useState(12);
  const [xpPoints, setXpPoints] = useState(850);
  const [claimedToday, setClaimedToday] = useState(false);
  const [streakDays, setStreakDays] = useState([
    { day: "M", label: "Mon", completed: true },
    { day: "T", label: "Tue", completed: true },
    { day: "W", label: "Wed", completed: true },
    { day: "T", label: "Thu", completed: true },
    { day: "F", label: "Fri", completed: true },
    { day: "S", label: "Sat", completed: true },
    { day: "S", label: "Sun", completed: false, isToday: true },
  ]);

  // Daily Check-in XP Handler
  function handleClaimDailyXp(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (claimedToday) {
      toast.info("🔥 Today's Civic XP already claimed! Come back tomorrow for Day 13 streak.");
      return;
    }
    setClaimedToday(true);
    setStreakCount((prev) => prev + 1);
    setXpPoints((prev) => prev + 50);
    setStreakDays((prev) =>
      prev.map((d) => (d.isToday ? { ...d, completed: true } : d))
    );
    toast.success("🔥 Day 13 Active Streak! +50 Civic XP added to your profile.");
  }

  // Live formatted current date
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto max-w-6xl px-3 sm:px-6 pb-28 pt-4 sm:pt-8 lg:px-8 lg:pt-12 space-y-6 sm:space-y-10">
        {/* HERO SECTION */}
        <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-3.5" />
              {currentDateFormatted} • JanSetu Platform
            </div>
            <h1 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl leading-tight">
              Small actions.
              <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                Visible community change.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Welcome back, <strong className="text-foreground">{profile?.full_name || user?.email || "Citizen"}</strong>! Report local infrastructure issues with AI assistant, collaborate with university capstones, or track municipal resolution.
            </p>
          </div>

          {/* Interactive Civic Streak & Gamified Achievements Widget */}
          <div
            onClick={() => setStreakModalOpen(true)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-5 sm:p-6 text-white shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-indigo-500/20 border border-indigo-500/30 cursor-pointer"
          >
            {/* Glowing Ambient Aura */}
            <div className="absolute -right-12 -top-12 size-48 rounded-full bg-amber-500/15 blur-3xl group-hover:bg-amber-500/25 transition-all pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 size-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              {/* Header Badges & Rank */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute size-8 rounded-full bg-amber-500/30 animate-ping" />
                    <div className="size-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 grid place-items-center shadow-lg font-bold">
                      <Flame className="size-5 fill-current text-slate-950 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      Civic Streak Active
                    </span>
                    <p className="text-[10px] text-indigo-200/80 font-medium">Daily Citizen Check-in</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md shadow-xs">
                  <Crown className="size-3.5 text-amber-400" />
                  Top 5% Ranchi
                </span>
              </div>

              {/* Main Counter & XP Badge */}
              <div className="flex items-baseline justify-between gap-2 pt-1">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                      {streakCount}
                    </span>
                    <span className="text-lg font-bold text-amber-300">Days 🔥</span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">
                    Level 3 • <strong className="text-white font-semibold">{xpPoints} XP</strong> Total
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClaimDailyXp}
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-extrabold transition-all shadow-md shrink-0 ${
                    claimedToday
                      ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"
                      : "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/20"
                  }`}
                >
                  <Sparkles className="size-4" />
                  {claimedToday ? "Day Claimed ✓" : "+50 XP Claim"}
                </button>
              </div>

              {/* 7-Day Weekly Interactive Tracker Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-200/90 mb-1.5">
                  <span>Weekly Streak</span>
                  <span>{streakDays.filter((d) => d.completed).length} / 7 Days Done</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {streakDays.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.isToday) handleClaimDailyXp();
                      }}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all ${
                        item.completed
                          ? "bg-amber-400/20 border-amber-400/50 text-amber-300 font-bold"
                          : item.isToday
                          ? "bg-indigo-500/30 border-amber-400 text-white animate-pulse cursor-pointer hover:bg-amber-500/30"
                          : "bg-white/5 border-white/10 text-indigo-300/60"
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase">{item.day}</span>
                      <div className="mt-1 size-5 rounded-full flex items-center justify-center">
                        {item.completed ? (
                          <Flame className="size-3.5 fill-amber-400 text-amber-400" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-white/20" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* XP Progress Bar to Next Level */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-indigo-200">
                  <span>Next Rank: <strong className="text-amber-300 font-bold">Civic Champion 🏆</strong></span>
                  <span>{xpPoints} / 1000 XP</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/15 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.min(100, (xpPoints / 1000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="flex items-center justify-between pt-1 text-xs text-indigo-200/90 font-medium">
                <span className="flex items-center gap-1 text-[11px]">
                  <Target className="size-3.5 text-amber-400" />
                  150 XP to Level 4
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-300 group-hover:text-white transition-colors">
                  Badges & Quests <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE QUICK ACTION HUBS */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/report"
            className="tour-quick-report group flex flex-col justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-all duration-200 hover:bg-primary/10 hover:border-primary/40 hover:shadow-md"
          >
            <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <PlusCircle className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Report Issue ✨
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Use AI assistant to structure civic reports</p>
            </div>
          </Link>

          <Link
            to="/workspace"
            className="tour-quick-workspace group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-md"
          >
            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                University Hub
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Adopt capstones & academic research</p>
            </div>
          </Link>

          <Link
            to="/workspace"
            className="tour-quick-govt group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
          >
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <Landmark className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                Govt Desk
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Official admin status & resolution</p>
            </div>
          </Link>

          <div
            onClick={() => setStreakModalOpen(true)}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-amber-500/40 hover:shadow-md cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors">
                Field Audit XP
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Verify site status & earn XP certificates</p>
            </div>
          </div>
        </section>

        {/* CIVIC IMPACT METRICS DASHBOARD */}
        <section className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Live Civic Impact Metrics
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time resolution updates across municipal districts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Data Synchronized
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reported Issues</p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">148</p>
              <p className="mt-1 text-[11px] font-medium text-emerald-600">+12 this week</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Resolution</p>
              <p className="mt-2 text-3xl font-extrabold text-primary">89%</p>
              <p className="mt-1 text-[11px] font-medium text-primary">Active workflow</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capstones Adopted</p>
              <p className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">34</p>
              <p className="mt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Academic projects</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volunteer Hours</p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">1,250+</p>
              <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">Verified audit XP</p>
            </div>
          </div>
        </section>

        {/* FEED VIEW */}
        <FeedView />
      </main>

      {/* Rich Gamified Streak & Badges Modal */}
      <Dialog open={streakModalOpen} onOpenChange={setStreakModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-foreground">
              <Trophy className="size-6 text-amber-500" />
              Civic XP & Badges Dashboard
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You are currently on a {streakCount}-day streak! Keep reporting, upvoting, and auditing issues to level up.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            {/* User Level Card */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 p-4 border border-indigo-500/30 text-white">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md">
                  <Flame className="size-7 fill-current" />
                </div>
                <div>
                  <p className="text-base font-extrabold flex items-center gap-1.5">
                    {streakCount} Days Active
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Level 3
                    </span>
                  </p>
                  <p className="text-xs text-indigo-200">{xpPoints} Total Civic XP • Top 5% in Ranchi</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-400/40 text-amber-300 hover:bg-amber-400/20 text-xs font-bold"
                onClick={handleClaimDailyXp}
              >
                {claimedToday ? "Claimed ✓" : "Claim +50 XP"}
              </Button>
            </div>

            {/* Daily Quests Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="size-4 text-primary" /> Active Daily Quests
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">File 1 AI-assisted civic report</p>
                      <p className="text-[11px] text-muted-foreground">+100 Civic XP</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                    Completed
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Endorse 2 community complaints</p>
                      <p className="text-[11px] text-muted-foreground">+50 Civic XP</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                    Completed
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Star className="size-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Verify 1 Government Scheme</p>
                      <p className="text-[11px] text-muted-foreground">+50 Civic XP</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[10px]">
                    In Progress
                  </span>
                </div>
              </div>
            </div>

            {/* Unlocked Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="size-4 text-amber-500" /> Unlocked Badges
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
                  <Award className="size-8 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Neighborhood Guard</p>
                    <p className="text-[10px] text-muted-foreground">Reported 5+ issues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
                  <Zap className="size-8 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Fast AI Reporter</p>
                    <p className="text-[10px] text-muted-foreground">AI verified report</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
                  <ShieldCheck className="size-8 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Field Auditor</p>
                    <p className="text-[10px] text-muted-foreground">Verified site status</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3 opacity-60">
                  <Crown className="size-8 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground">Civic Champion</p>
                    <p className="text-[10px] text-muted-foreground">Reach 1000 XP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ranchi District Leaderboard Preview */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="size-4 text-indigo-600" /> Ranchi District Leaderboard
              </h4>
              <div className="space-y-1.5 rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-amber-500/10 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-600">#1</span>
                    <span className="font-bold text-foreground">Ramesh Verma (Morabadi)</span>
                  </div>
                  <span className="font-mono font-bold text-amber-600">1,450 XP 🔥</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/40 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-500">#2</span>
                    <span className="font-semibold text-foreground">Priya Sen (Doranda)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">1,120 XP 🔥</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-primary/10 border border-primary/20 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-primary">#3</span>
                    <span className="text-primary">{profile?.full_name || user?.email || "You (Ranchi)"}</span>
                  </div>
                  <span className="font-mono text-primary">{xpPoints} XP 🔥</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
