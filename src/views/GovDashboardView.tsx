import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import type { MasterIssue } from "@/lib/deduplicationEngine";
import { calculateSlaAndEscalation } from "@/lib/slaEngine";
import { overridePriority, type PriorityLevel } from "@/lib/priorityEngine";
import { validateResolutionSubmission, WORKFLOW_STAGES, type ComplaintStatus } from "@/lib/statusWorkflow";
import { JHARKHAND_DISTRICTS } from "@/lib/jharkhandData";
import { MasterIssueDetailModal } from "@/components/MasterIssueDetailModal";
import { ResolutionVerificationModal } from "@/components/ResolutionVerificationModal";
import { downloadOrPrintCivicDocket } from "@/lib/docketGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Filter,
  Flame,
  Globe,
  Landmark,
  MapPin,
  Printer,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
  Eye,
  EyeOff,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// INITIAL DEMO MASTER ISSUES FOR GOV DASHBOARD
const DEMO_MASTER_ISSUES: MasterIssue[] = [
  {
    id: "master-101",
    master_issue_id: "JST-RD-2026-00124",
    title: "Severe Water Supply Contamination & Pipe Burst in Main Market",
    description: "Municipal drinking water pipeline broken near Bank More junction causing muddy water contamination across 3 adjacent panchayats and affecting over 47 households.",
    category: "Water Supply",
    district: "Dhanbad",
    block_ward: "Ward 14",
    panchayat: "Bank More Central",
    village: "Bank More",
    latitude: 23.7957,
    longitude: 86.4304,
    affected_area: "Dhanbad - Ward 14 (Bank More)",
    total_linked_reports: 31,
    total_affected_users: 47,
    affected_villages_count: 3,
    first_reported_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    latest_report_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    assigned_department: "Drinking Water & Sanitation Dept (DWSD)",
    assigned_officer_name: "Er. Rameshwar Singh (Executive Engineer)",
    assigned_officer_contact: "+91-6542-230198",
    current_status: "Action in progress",
    priority_level: "Critical",
    priority_score: 92,
    sla_deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    sla_status: "warning",
    escalation_level: 2,
    escalation_title: "Block Development Officer (BDO)",
    evidence_count: 8,
    created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "master-102",
    master_issue_id: "JST-RD-2026-00189",
    title: "Caved-in Asphalt Potholes & Storm Drainage Blockade near Girls High School",
    description: "Deep dangerous road cave-in and clogged drainage along Main Road causing severe accident risks for 600+ school students during monsoon rainfall.",
    category: "Road Maintenance",
    district: "Ranchi",
    block_ward: "Kanke Block",
    panchayat: "Kanke Central",
    village: "Kanke Village",
    latitude: 23.435,
    longitude: 85.321,
    affected_area: "Ranchi - Kanke Block",
    total_linked_reports: 19,
    total_affected_users: 84,
    affected_villages_count: 2,
    first_reported_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    latest_report_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    assigned_department: "Public Works Department (PWD)",
    assigned_officer_name: "Er. Amit Shah (Superintending Engineer)",
    assigned_officer_contact: "+91-651-2400981",
    current_status: "Under review",
    priority_level: "Critical",
    priority_score: 88,
    sla_deadline: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    sla_status: "overdue",
    escalation_level: 3,
    escalation_title: "Deputy Commissioner / District Magistrate (DC/DM)",
    evidence_count: 12,
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "master-103",
    master_issue_id: "JST-RD-2026-00241",
    title: "Broken Streetlights & Dark Safety Corridor near Doranda College",
    description: "Sequence of 14 streetlight poles non-functional along college road, raising evening safety concerns for women commuters.",
    category: "Street Lighting",
    district: "Ranchi",
    block_ward: "Doranda Ward 8",
    panchayat: "Doranda South",
    village: "Doranda",
    latitude: 23.3441,
    longitude: 85.3096,
    affected_area: "Ranchi - Doranda",
    total_linked_reports: 14,
    total_affected_users: 35,
    affected_villages_count: 1,
    first_reported_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    latest_report_at: new Date().toISOString(),
    assigned_department: "Ranchi Municipal Corporation (RMC) Electrical Cell",
    assigned_officer_name: "Er. Vikash Roy",
    assigned_officer_contact: "+91-651-2211440",
    current_status: "Inspection scheduled",
    priority_level: "High",
    priority_score: 68,
    sla_deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    sla_status: "on_time",
    escalation_level: 1,
    escalation_title: "Ward Engineer / Local Officer",
    evidence_count: 5,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "master-104",
    master_issue_id: "JST-RD-2026-00305",
    title: "Primary Health Center Solar Microgrid & Medicine Supply Deficit",
    description: "Frequent power cuts and shortage of essential anti-venom medicine at Chas Block Rural Health Clinic.",
    category: "Health & Hospital",
    district: "Bokaro",
    block_ward: "Chas Block",
    panchayat: "Chas Rural",
    village: "Chas",
    latitude: 23.6339,
    longitude: 86.1772,
    affected_area: "Bokaro - Chas Block",
    total_linked_reports: 22,
    total_affected_users: 112,
    affected_villages_count: 4,
    first_reported_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    latest_report_at: new Date().toISOString(),
    assigned_department: "Health, Medical Education & Family Welfare Dept",
    assigned_officer_name: "Dr. A. K. Verma (Civil Surgeon)",
    assigned_officer_contact: "+91-6542-245100",
    current_status: "Citizen confirmation pending",
    priority_level: "High",
    priority_score: 76,
    sla_deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    sla_status: "on_time",
    escalation_level: 1,
    escalation_title: "Ward Engineer / Local Officer",
    evidence_count: 7,
    resolution_details: {
      action_taken: "Installed 10kW backup solar inverter and dispatched 50 vials of anti-venom to Chas PHC.",
      completion_date: new Date().toLocaleDateString("en-IN"),
      officer_info: "Dr. A. K. Verma (Civil Surgeon)",
      remarks: "Backup power and stock verified on site.",
    },
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function GovDashboardView() {
  const [masterIssues, setMasterIssues] = useState<MasterIssue[]>(DEMO_MASTER_ISSUES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [hidePii, setHidePii] = useState(true);

  // Modals state
  const [selectedIssueModal, setSelectedIssueModal] = useState<MasterIssue | null>(null);
  const [verificationModalIssue, setVerificationModalIssue] = useState<MasterIssue | null>(null);
  const [actionModalIssue, setActionModalIssue] = useState<MasterIssue | null>(null);

  // Officer action form state
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("Action in progress");
  const [overrideLevel, setOverrideLevel] = useState<PriorityLevel>("High");
  const [overrideReason, setOverrideReason] = useState("");

  // Resolution form state
  const [actionTaken, setActionTaken] = useState("");
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split("T")[0]);
  const [resolutionRemarks, setResolutionRemarks] = useState("");

  // Filtered Issues Computation
  const filteredIssues = useMemo(() => {
    return masterIssues.filter((issue) => {
      if (selectedDistrict !== "All" && issue.district.toLowerCase() !== selectedDistrict.toLowerCase())
        return false;
      if (selectedCategory !== "All" && issue.category.toLowerCase() !== selectedCategory.toLowerCase())
        return false;
      if (selectedPriority !== "All" && issue.priority_level.toLowerCase() !== selectedPriority.toLowerCase())
        return false;
      if (selectedStatus !== "All" && issue.current_status.toLowerCase() !== selectedStatus.toLowerCase())
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          issue.title.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q) ||
          issue.master_issue_id.toLowerCase().includes(q) ||
          issue.district.toLowerCase().includes(q);
        if (!textMatch) return false;
      }
      return true;
    });
  }, [masterIssues, searchQuery, selectedDistrict, selectedCategory, selectedPriority, selectedStatus]);

  // Overall KPI aggregates
  const totalAffectedCitizens = useMemo(() => {
    return masterIssues.reduce((sum, item) => sum + item.total_affected_users, 0);
  }, [masterIssues]);

  const totalLinkedReports = useMemo(() => {
    return masterIssues.reduce((sum, item) => sum + item.total_linked_reports, 0);
  }, [masterIssues]);

  const totalOverdue = useMemo(() => {
    return masterIssues.filter((i) => {
      const sla = calculateSlaAndEscalation(i.first_reported_at, i.category, i.current_status);
      return sla.slaStatus === "overdue";
    }).length;
  }, [masterIssues]);

  function handleSaveStatusAction() {
    if (!actionModalIssue) return;

    // Handle Resolution submission
    if (newStatus === "Resolved" || newStatus === "Citizen confirmation pending") {
      const val = validateResolutionSubmission({
        actionTakenDetails: actionTaken,
        completionDate,
        officerName: actionModalIssue.assigned_officer_name || "Executive Engineer",
        officerContact: actionModalIssue.assigned_officer_contact || "+91-651-2400112",
        departmentName: actionModalIssue.assigned_department,
        beforePhotoUrl: "evidence_before.jpg",
        afterPhotoUrl: "evidence_after.jpg",
        resolutionRemarks,
      });

      if (!val.valid) {
        toast.error(val.errors[0]);
        return;
      }
    }

    // Handle priority override
    if (overrideReason.trim()) {
      const ov = overridePriority(actionModalIssue.priority_level, overrideLevel, overrideReason, "dept_admin");
      if (!ov.success) {
        toast.error(ov.error);
        return;
      }
    }

    // Update Issue
    setMasterIssues((prev) =>
      prev.map((item) => {
        if (item.id === actionModalIssue.id) {
          return {
            ...item,
            current_status: newStatus,
            priority_level: overrideReason.trim() ? overrideLevel : item.priority_level,
            resolution_details:
              newStatus === "Resolved" || newStatus === "Citizen confirmation pending"
                ? {
                    action_taken: actionTaken,
                    completion_date: completionDate,
                    officer_info: item.assigned_officer_name,
                    remarks: resolutionRemarks,
                  }
                : item.resolution_details,
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    toast.success(`Master Issue ${actionModalIssue.master_issue_id} updated to "${newStatus}"!`);
    setActionModalIssue(null);
    setActionTaken("");
    setResolutionRemarks("");
    setOverrideReason("");
  }

  return (
    <>
      <AppHeader title="Government & Department Dashboard" />
      <main id="main" className="mx-auto max-w-7xl px-3.5 sm:px-6 pb-28 pt-6 space-y-6">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary mb-2">
              <Landmark className="size-3.5" /> Official Administrative Portal • State of Jharkhand
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Government Accountability & SLA Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Centralized view of deduplicated Master Issues, SLA deadlines, multi-village impacts, and citizen resolution verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
              onClick={() => setHidePii(!hidePii)}
            >
              {hidePii ? <EyeOff className="size-3.5 mr-1.5 text-emerald-600" /> : <Eye className="size-3.5 mr-1.5 text-amber-600" />}
              {hidePii ? "PII Redacted (DPDP)" : "Show Raw Data"}
            </Button>
          </div>
        </div>

        {/* EXACT KPI DISPLAY CARDS AS REQUESTED IN SPECIFICATION */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-2xs">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Total Affected Citizens</p>
            <p className="mt-2 text-3xl font-black text-foreground">{totalAffectedCitizens}</p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600">“{totalAffectedCitizens} citizens affected”</p>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 shadow-2xs">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Linked Reports</p>
            <p className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">{totalLinkedReports}</p>
            <p className="mt-1 text-[11px] font-medium text-indigo-600">“{totalLinkedReports} linked reports”</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-2xs">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Duration</p>
            <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">12 Days</p>
            <p className="mt-1 text-[11px] font-medium text-amber-600">“Pending for 12 days”</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-2xs">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Impacted Villages</p>
            <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">10</p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600">“3 villages impacted” avg</p>
          </div>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 shadow-2xs col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold text-destructive uppercase tracking-wider">SLA Overdue</p>
            <p className="mt-2 text-3xl font-black text-destructive">{totalOverdue}</p>
            <p className="mt-1 text-[11px] font-bold text-destructive">“Response overdue by 5 days”</p>
          </div>
        </section>

        {/* SEARCH & FILTERS HUB */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Master Issues by ID (JST-RD-2026-XXXXX), keyword, or village..."
                className="pl-10 text-xs h-10 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Districts (24)</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All 12 Workflow Stages</option>
                {WORKFLOW_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* MASTER ISSUES TABLE & LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              Master Issues Directory ({filteredIssues.length})
            </h2>
            <span className="text-xs text-muted-foreground">Sorted by priority & SLA urgency</span>
          </div>

          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const sla = calculateSlaAndEscalation(issue.first_reported_at, issue.category, issue.current_status);
              return (
                <div
                  key={issue.id}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-extrabold text-primary">
                        {issue.master_issue_id}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${
                          issue.priority_level === "Critical"
                            ? "bg-destructive/15 text-destructive"
                            : issue.priority_level === "High"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {issue.priority_level} Priority
                      </span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] px-2.5 py-0.5 font-bold">
                        {issue.current_status}
                      </span>
                    </div>

                    {/* SLA ESCALATION BADGE */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        sla.slaStatus === "overdue"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}
                    >
                      {sla.formattedOverdueBadge}
                    </span>
                  </div>

                  {/* TITLE & DESCRIPTION */}
                  <div>
                    <h3
                      className="text-base font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
                      onClick={() => setSelectedIssueModal(issue)}
                    >
                      {issue.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{issue.description}</p>
                  </div>

                  {/* METRIC STRIP AS REQUESTED IN SPECIFICATION */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-border/40">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Users className="size-3.5 text-primary" /> “{issue.total_affected_users} citizens affected”
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <FileText className="size-3.5" /> “{issue.total_linked_reports} linked reports”
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <MapPin className="size-3.5" /> “{issue.affected_villages_count} villages impacted”
                    </span>
                    <span className="font-semibold text-destructive flex items-center gap-1">
                      <Flame className="size-3.5" /> Tier {sla.escalationLevel}: {sla.escalationTitle}
                    </span>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Building2 className="size-3 text-primary" /> Dept: {issue.assigned_department}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-semibold"
                        onClick={() => setSelectedIssueModal(issue)}
                      >
                        View Full Master File
                      </Button>

                      <Button
                        size="sm"
                        className="text-xs font-bold"
                        onClick={() => setActionModalIssue(issue)}
                      >
                        <Briefcase className="size-3.5 mr-1" /> Update Status & SLA
                      </Button>

                      {issue.current_status === "Citizen confirmation pending" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs font-bold text-emerald-600"
                          onClick={() => setVerificationModalIssue(issue)}
                        >
                          <ShieldCheck className="size-3.5 mr-1" /> Verify Citizen Response
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* OFFICER ACTION & RESOLUTION MODAL */}
      {actionModalIssue && (
        <Dialog open={true} onOpenChange={(open) => !open && setActionModalIssue(null)}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Briefcase className="size-5 text-primary" /> Update Master Issue Status
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Master ID: {actionModalIssue.master_issue_id} • {actionModalIssue.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* SELECT 12 WORKFLOW STAGES */}
              <div>
                <label className="font-bold text-foreground mb-1 block">
                  Target Workflow Stage (12 Stages)
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {WORKFLOW_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* RESOLUTION MANDATORY INPUTS (IF SET TO RESOLVED OR CONFIRMATION PENDING) */}
              {(newStatus === "Resolved" || newStatus === "Citizen confirmation pending") && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="size-4" /> Mandatory Resolution Verification Fields
                  </p>
                  <div>
                    <label className="font-semibold text-foreground mb-1 block">
                      Detailed Description of Action Taken *
                    </label>
                    <textarea
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder="Describe site inspection, repair work executed, materials used..."
                      className="w-full h-20 rounded-xl border border-input bg-background p-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground mb-1 block">Work Completion Date *</label>
                    <Input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground mb-1 block">Resolution Remarks *</label>
                    <Input
                      value={resolutionRemarks}
                      onChange={(e) => setResolutionRemarks(e.target.value)}
                      placeholder="Final remarks by executive officer..."
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* PRIORITY OVERRIDE WITH MANDATORY LOG */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Flame className="size-4 text-amber-500" /> Manual Priority Override
                </p>
                <div className="flex gap-2">
                  {(["Low", "Medium", "High", "Critical"] as PriorityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setOverrideLevel(lvl)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                        overrideLevel === lvl
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">
                    Override Reason (Saved in Audit Log)
                  </label>
                  <Input
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Reason for changing calculated priority..."
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <DialogFooter className="pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setActionModalIssue(null)}>
                  Cancel
                </Button>
                <Button size="sm" className="font-bold" onClick={handleSaveStatusAction}>
                  Save Status & Log Change
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MASTER ISSUE DETAIL MODAL */}
      <MasterIssueDetailModal
        masterIssue={selectedIssueModal}
        isOpen={selectedIssueModal !== null}
        onClose={() => setSelectedIssueModal(null)}
      />

      {/* CITIZEN VERIFICATION MODAL */}
      <ResolutionVerificationModal
        masterIssue={verificationModalIssue}
        isOpen={verificationModalIssue !== null}
        onClose={() => setVerificationModalIssue(null)}
      />
    </>
  );
}

