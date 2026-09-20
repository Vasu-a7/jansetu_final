import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  LogOut,
  ShieldCheck,
  Bell,
  Globe,
  Eye,
  Lock,
  HelpCircle,
  Check,
  LogIn,
  FileText,
  UserCheck,
  Building2,
  Tag,
  MapPin,
  Flame,
  Award,
  Zap,
  Crown,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import avatar from "@/assets/avatar.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — JanSetu (Connecting Citizens and Administration)" },
      {
        name: "description",
        content: "Manage your JanSetu profile, track reported community issues, and configure preferences.",
      },
      { property: "og:title", content: "Profile — JanSetu (Connecting Citizens and Administration)" },
      {
        property: "og:description",
        content: "Manage your JanSetu profile, track reported community issues, and configure preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

type SettingKey =
  | "Notification Settings"
  | "Language & Regional Preferences"
  | "Accessibility Options"
  | "Privacy & Data Protection"
  | "Help & Community Guidelines"
  | null;

const settingsList: Array<{ label: SettingKey; icon: any }> = [
  { label: "Notification Settings", icon: Bell },
  { label: "Language & Regional Preferences", icon: Globe },
  { label: "Accessibility Options", icon: Eye },
  { label: "Privacy & Data Protection", icon: Lock },
  { label: "Help & Community Guidelines", icon: HelpCircle },
];

type Challenge = Tables<"challenges">;

function ProfilePage() {
  const { user, profile, role, signOut, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userReports, setUserReports] = useState<Challenge[]>([]);
  const [activeModal, setActiveModal] = useState<SettingKey>(null);
  const [activeTab, setActiveTab] = useState<"issues" | "badges" | "settings">("issues");

  // Dynamic Synced Streak & XP State
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("jansetu_streak_count");
      return stored ? parseInt(stored, 10) : 12;
    } catch {
      return 12;
    }
  });

  const [xpPoints, setXpPoints] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("jansetu_xp_points");
      return stored ? parseInt(stored, 10) : 850;
    } catch {
      return 850;
    }
  });

  const [claimedToday, setClaimedToday] = useState<boolean>(() => {
    try {
      return localStorage.getItem("jansetu_claimed_today") === "true";
    } catch {
      return false;
    }
  });

  // Sync Streak across components & windows
  useEffect(() => {
    function syncStreakState() {
      try {
        const storedStreak = localStorage.getItem("jansetu_streak_count");
        if (storedStreak) setStreakCount(parseInt(storedStreak, 10));

        const storedXp = localStorage.getItem("jansetu_xp_points");
        if (storedXp) setXpPoints(parseInt(storedXp, 10));

        const storedClaimed = localStorage.getItem("jansetu_claimed_today");
        if (storedClaimed === "true") setClaimedToday(true);
      } catch (e) {
        console.error("Streak sync error", e);
      }
    }

    syncStreakState();
    window.addEventListener("jansetu_streak_updated", syncStreakState);
    window.addEventListener("storage", syncStreakState);

    return () => {
      window.removeEventListener("jansetu_streak_updated", syncStreakState);
      window.removeEventListener("storage", syncStreakState);
    };
  }, []);

  function handleProfileClaimXp() {
    if (claimedToday) {
      toast.info("🔥 Today's Civic XP already claimed! Come back tomorrow.");
      return;
    }
    const newStreak = streakCount + 1;
    const newXp = xpPoints + 50;
    setStreakCount(newStreak);
    setXpPoints(newXp);
    setClaimedToday(true);

    try {
      localStorage.setItem("jansetu_streak_count", String(newStreak));
      localStorage.setItem("jansetu_xp_points", String(newXp));
      localStorage.setItem("jansetu_claimed_today", "true");
      window.dispatchEvent(new Event("jansetu_streak_updated"));
    } catch (e) {
      console.error(e);
    }

    toast.success("🔥 Day " + newStreak + " Streak Active! +50 Civic XP added!");
  }

  // Settings State
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const [language, setLanguage] = useState("English");
  const [district, setDistrict] = useState("Ranchi");

  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState("Normal");

  const [anonReports, setAnonReports] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  useEffect(() => {
    async function loadUserReports() {
      if (user?.id) {
        try {
          // Fetch from Reported_data
          const { data: reportedData } = await supabase
            .from("reported_data")
            .select("*")
            .or(`user_id.eq.${user.id},reporter_id.eq.${user.id}`)
            .order("created_at", { ascending: false });

          if (reportedData && reportedData.length > 0) {
            setUserReports(
              reportedData.map((rd: any) => ({
                id: rd.id || "report-" + Date.now(),
                title: rd.title,
                description: rd.description,
                category: rd.category as any,
                status: (rd.status as any) || "open",
                location_text: rd.location_text || rd.location || null,
                latitude: rd.latitude || null,
                longitude: rd.longitude || null,
                media_url: rd.media_url || rd.photo_url || null,
                reporter_id: rd.user_id || rd.reporter_id || user.id,
                created_at: rd.created_at || new Date().toISOString(),
                updated_at: rd.updated_at || new Date().toISOString(),
              }))
            );
            return;
          }
        } catch (err) {
          console.error("Failed to fetch user reports from Supabase:", err);
        }
      }

      // Fallback to local storage challenges
      try {
        const localData = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
        setUserReports(localData);
      } catch (e) {
        setUserReports([]);
      }
    }

    loadUserReports();
  }, [user]);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("Successfully signed out of JanSetu");
    } catch (err) {
      toast.error("Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  }

  function handleSaveSettings() {
    toast.success(`${activeModal} updated successfully!`);
    setActiveModal(null);
  }

  function handleClearCache() {
    try {
      localStorage.removeItem("jansetu_user_challenges");
      toast.success("Local application cache cleared.");
      setUserReports([]);
      setActiveModal(null);
    } catch (e) {
      toast.error("Failed to clear cache");
    }
  }

  const displayName = profile?.full_name || user?.email || "Civic Contributor";
  const userRoleDisplay = role ? role.toUpperCase() : "CITIZEN";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <AppHeader title="Profile" />
      <main id="main" className="mx-auto max-w-lg px-4 sm:px-6 pb-32 pt-6 sm:pt-8 space-y-6">
        
        {/* LOGGED OUT STATE BANNER */}
        {!user && !isLoading && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center shadow-xs">
            <UserCheck className="mx-auto size-10 text-primary mb-2" />
            <h2 className="text-lg font-bold text-foreground">Sign In to Save Your Reports</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Log in or register to link all your civic reports to your Supabase profile and track issue status in real-time.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/auth" search={{ mode: "signin" }} className="flex-1">
                <Button className="w-full text-xs font-semibold">
                  <LogIn className="size-3.5 mr-1.5" /> Sign In
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="flex-1">
                <Button variant="outline" className="w-full text-xs font-semibold">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* LOGGED IN USER PROFILE HEADER */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            {user ? (
              <div className="size-24 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center border-4 border-background shadow-md">
                {initials}
              </div>
            ) : (
              <img
                src={avatar}
                alt="JanSetu Civic Contributor"
                width={512}
                height={512}
                className="size-24 rounded-full object-cover outline-2 outline-primary/20 shadow-md"
              />
            )}
            <span className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
              <ShieldCheck className="size-4" />
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h1>
          
          <div className="mt-1 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
              {userRoleDisplay}
            </span>
            {profile?.organisation && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="size-3" /> {profile.organisation}
              </span>
            )}
          </div>

          <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">
            {user ? user.email : "Active community member working towards local infrastructure and public welfare."}
          </p>

          {/* DYNAMIC 4-METRIC STATS GRID */}
          <div className="mt-5 grid grid-cols-4 gap-2 w-full rounded-2xl border border-border bg-card p-3 shadow-xs text-center">
            <div className="p-1">
              <span className="block text-lg font-black text-amber-500 drop-shadow-xs">{streakCount} 🔥</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Streak
              </span>
            </div>
            <div className="p-1 border-l border-border">
              <span className="block text-lg font-black text-primary">{userReports.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Reports
              </span>
            </div>
            <div className="p-1 border-l border-border">
              <span className="block text-lg font-black text-indigo-600 dark:text-indigo-400">{xpPoints}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                XP
              </span>
            </div>
            <div className="p-1 border-l border-border">
              <span className="block text-lg font-black text-emerald-600">3 🏆</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Badges
              </span>
            </div>
          </div>
        </div>

        {/* GAMIFIED XP LEVEL & DAILY CHECK-IN CARD */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 p-4 text-white border border-indigo-500/30 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 grid place-items-center shadow-xs font-bold shrink-0">
                <Flame className="size-6 fill-current" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  Level 3 Civic Builder
                </p>
                <p className="text-[11px] text-indigo-200">{xpPoints} / 1000 XP to Level 4 Champion</p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleProfileClaimXp}
              className={`text-xs font-extrabold shadow-sm shrink-0 rounded-xl ${
                claimedToday
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110"
              }`}
            >
              {claimedToday ? "Claimed ✓" : "+50 XP Claim"}
            </Button>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/15 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (xpPoints / 1000) * 100)}%` }}
            />
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION TABS */}
        <div className="border-b border-border">
          <div className="flex items-center justify-around text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("issues")}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "issues"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              My Issues ({userReports.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("badges")}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "badges"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Badges (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* TAB 1: MY SUBMITTED ISSUES */}
        {activeTab === "issues" && (
          <div className="space-y-3">
            {userReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                <FileText className="mx-auto size-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-semibold text-foreground">No reports filed yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use the JanSetu AI assistant to file your first civic issue.
                </p>
                <Link to="/report" className="mt-4 inline-block">
                  <Button size="sm" className="gap-1.5 text-xs font-bold">
                    File New Report ✨
                  </Button>
                </Link>
              </div>
            ) : (
              userReports.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-2xs hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-primary inline-flex items-center gap-1">
                      <Tag className="size-3" /> {r.category}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 font-bold capitalize">
                      {r.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                  {r.location_text && (
                    <span className="text-[11px] text-muted-foreground/90 mt-2 flex items-center gap-1 font-medium">
                      <MapPin className="size-3.5 text-primary shrink-0" /> {r.location_text}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: BADGES & MILESTONES */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center shrink-0">
                <Award className="size-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Neighborhood Guard</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Reported 5+ local issues</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs flex items-center gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0">
                <Zap className="size-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Fast AI Reporter</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">AI verified submission</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Field Auditor</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Verified resolution site</p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-3.5 shadow-xs flex items-center gap-3 opacity-60">
              <div className="size-10 rounded-xl bg-muted text-muted-foreground grid place-items-center shrink-0">
                <Crown className="size-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-muted-foreground">Civic Champion</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Unlock at 1000 XP</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS MENU */}
        {activeTab === "settings" && (
          <ul className="space-y-1">
            {settingsList.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setActiveModal(label)}
                  className="flex min-h-12 w-full items-center justify-between border-b border-border py-3.5 text-left hover:bg-muted/40 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <ChevronRight
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>
              </li>
            ))}

            {user ? (
              <li>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={isSigningOut}
                  className="flex min-h-12 w-full items-center justify-between border-b border-border py-3.5 text-left text-destructive hover:bg-destructive/10 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="size-4" />
                    <span className="text-sm font-semibold">
                      {isSigningOut ? "Signing Out..." : "Sign Out"}
                    </span>
                  </div>
                  <ChevronRight className="size-4" strokeWidth={1.75} />
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/auth"
                  className="flex min-h-12 w-full items-center justify-between border-b border-border py-3.5 text-left text-primary hover:bg-primary/10 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <LogIn className="size-4" />
                    <span className="text-sm font-semibold">Sign In / Register</span>
                  </div>
                  <ChevronRight className="size-4" strokeWidth={1.75} />
                </Link>
              </li>
            )}
          </ul>
        )}
      </main>

      {/* Interactive Settings Dialog */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{activeModal}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Customize your preferences and app settings below.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            {/* Notification Settings */}
            {activeModal === "Notification Settings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive real-time alerts for issue updates</p>
                  </div>
                  <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Emergency Alerts</p>
                    <p className="text-xs text-muted-foreground">Urgent civic hazard notifications</p>
                  </div>
                  <Switch checked={emergencyAlerts} onCheckedChange={setEmergencyAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly Email Digest</p>
                    <p className="text-xs text-muted-foreground">Summary of resolved district projects</p>
                  </div>
                  <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
                </div>
              </div>
            )}

            {/* Language & Regional Preferences */}
            {activeModal === "Language & Regional Preferences" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    App Interface Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Primary District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Ranchi">Ranchi</option>
                    <option value="Dhanbad">Dhanbad</option>
                    <option value="Jamshedpur">Jamshedpur</option>
                    <option value="Hazaribagh">Hazaribagh</option>
                    <option value="Koderma">Koderma</option>
                  </select>
                </div>
              </div>
            )}

            {/* Accessibility Options */}
            {activeModal === "Accessibility Options" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">High Contrast Mode</p>
                    <p className="text-xs text-muted-foreground">Enhance visual readability</p>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Text Scaling</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Normal", "Large", "X-Large"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTextSize(size)}
                        className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                          textSize === size
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Data Protection */}
            {activeModal === "Privacy & Data Protection" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Anonymous Reporting</p>
                    <p className="text-xs text-muted-foreground">Hide your identity on submitted issues</p>
                  </div>
                  <Switch checked={anonReports} onCheckedChange={setAnonReports} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Location Services</p>
                    <p className="text-xs text-muted-foreground">Auto-attach GPS coords to reports</p>
                  </div>
                  <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
                </div>

                <div className="pt-2 border-t border-border">
                  <Button variant="destructive" className="w-full text-xs" onClick={handleClearCache}>
                    Clear Local Application Data
                  </Button>
                </div>
              </div>
            )}

            {/* Help & Community Guidelines */}
            {activeModal === "Help & Community Guidelines" && (
              <div className="space-y-3 text-xs leading-5 text-muted-foreground">
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="font-semibold text-foreground mb-1">Community Guidelines</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Report genuine civic concerns with verified locations.</li>
                    <li>Do not upload inappropriate media or personal information.</li>
                    <li>Respect municipal workers and community solvers.</li>
                  </ul>
                </div>
                <p>
                  Toll-free Civic Helpline: <strong className="text-foreground">1800-111-234</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              <Check className="size-4 mr-1" /> Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
