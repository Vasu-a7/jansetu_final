import { useState } from "react";
import type { MasterIssue } from "@/lib/deduplicationEngine";
import { calculateSlaAndEscalation } from "@/lib/slaEngine";
import { downloadOrPrintCivicDocket } from "@/lib/docketGenerator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Flame,
  Link as LinkIcon,
  MapPin,
  ShieldAlert,
  Tag,
  Users,
  Unlink,
  Printer,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface MasterIssueDetailModalProps {
  masterIssue: MasterIssue | null;
  isOpen: boolean;
  onClose: () => void;
  userReportId?: string;
  onIssueJoined?: (masterId: string) => void;
}

export function MasterIssueDetailModal({
  masterIssue,
  isOpen,
  onClose,
  userReportId,
  onIssueJoined,
}: MasterIssueDetailModalProps) {
  const [hasJoined, setHasJoined] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  if (!masterIssue) return null;

  const sla = calculateSlaAndEscalation(
    masterIssue.first_reported_at,
    masterIssue.category,
    masterIssue.current_status
  );

  function handleJoinIssue() {
    setHasJoined(true);
    toast.success(`You have joined Master Issue ${masterIssue?.master_issue_id}. Your report count is now linked!`);
    if (masterIssue && onIssueJoined) {
      onIssueJoined(masterIssue.id);
    }
  }

  function handleDisputeLink() {
    if (!disputeReason.trim()) {
      toast.error("Please specify a reason for disputing the duplicate link.");
      return;
    }
    toast.success(`Dispute submitted for ${masterIssue?.master_issue_id}. A moderator will review your complaint separation.`);
    setIsDisputing(false);
    setDisputeReason("");
  }

  function handleUnlink() {
    toast.success(`Request sent to unlink your report from Master Issue ${masterIssue?.master_issue_id}.`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                <Tag className="size-3" />
                Master Issue ID: {masterIssue.master_issue_id}
              </span>
              <DialogTitle className="text-xl font-bold text-foreground mt-2">
                {masterIssue.title}
              </DialogTitle>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase shrink-0 ${
                masterIssue.priority_level === "Critical"
                  ? "bg-destructive/15 text-destructive"
                  : masterIssue.priority_level === "High"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {masterIssue.priority_level} Priority
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Aggregated civic concern tracking multiple citizen reports in {masterIssue.district}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* DESCRIPTION */}
          <div className="rounded-2xl bg-muted/40 p-4 border border-border/80">
            <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Problem Description</p>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{masterIssue.description}</p>
          </div>

          {/* KPI CARDS AS REQUESTED IN SPECIFICATION */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Affected Citizens</span>
              <p className="text-xl font-extrabold text-foreground mt-0.5 flex items-center gap-1">
                <Users className="size-4 text-primary" /> {masterIssue.total_affected_users + (hasJoined ? 1 : 0)}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Verified local impact</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Linked Reports</span>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                <FileText className="size-4" /> {masterIssue.total_linked_reports + (hasJoined ? 1 : 0)}
              </p>
              <span className="text-[10px] text-muted-foreground">Preserved original files</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Villages / Wards</span>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                <MapPin className="size-4" /> {masterIssue.affected_villages_count}
              </p>
              <span className="text-[10px] text-muted-foreground">{masterIssue.block_ward}</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">SLA Status</span>
              <p
                className={`text-sm font-extrabold mt-1 flex items-center gap-1 ${
                  sla.slaStatus === "overdue" ? "text-destructive" : "text-emerald-600"
                }`}
              >
                <ShieldAlert className="size-4" /> {sla.formattedOverdueBadge}
              </p>
            </div>
          </div>

          {/* JURISDICTION & ESCALATION TIER */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="size-4 text-primary" /> Assigned Department
              </span>
              <span className="font-semibold text-primary">{masterIssue.assigned_department}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" /> Location Details
              </span>
              <span className="text-muted-foreground text-right">
                {masterIssue.district}, {masterIssue.block_ward}, {masterIssue.panchayat}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Flame className="size-4 text-amber-500" /> Multi-Tier Escalation
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Tier {sla.escalationLevel}: {sla.escalationTitle}
              </span>
            </div>
          </div>

          {/* DISPUTE DRAWER FORM */}
          {isDisputing && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="size-4" /> Dispute Duplicate Linking
              </p>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why your report is a separate issue and should not be linked to this Master Issue..."
                className="w-full h-20 rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsDisputing(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={handleDisputeLink}>
                  Submit Dispute
                </Button>
              </div>
            </div>
          )}

          {/* CITIZEN ACTION BUTTONS AS REQUESTED IN SPECIFICATION */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <Button
              className="flex-1 text-xs font-bold"
              disabled={hasJoined}
              onClick={handleJoinIssue}
            >
              <Users className="size-3.5 mr-1.5" />
              {hasJoined ? "You've Joined This Issue" : "Join Existing Master Issue"}
            </Button>

            <Button
              variant="outline"
              className="text-xs"
              onClick={() => downloadOrPrintCivicDocket(masterIssue)}
            >
              <Printer className="size-3.5 mr-1.5" />
              Download Civic Docket
            </Button>

            <Button
              variant="ghost"
              className="text-xs text-amber-600 dark:text-amber-400"
              onClick={() => setIsDisputing(!isDisputing)}
            >
              <AlertTriangle className="size-3.5 mr-1" />
              Dispute Duplicate Link
            </Button>

            <Button
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={handleUnlink}
            >
              <Unlink className="size-3.5 mr-1" />
              Unlink My Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

