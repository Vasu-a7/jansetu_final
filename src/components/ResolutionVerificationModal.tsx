import { useState } from "react";
import type { MasterIssue } from "@/lib/deduplicationEngine";
import { processCitizenVerification } from "@/lib/statusWorkflow";
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
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  FilePlus,
  Scale,
  ShieldCheck,
  Building2,
  Calendar,
  UserCheck,
} from "lucide-react";

interface ResolutionVerificationModalProps {
  masterIssue: MasterIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onVerificationSubmitted?: (newStatus: string) => void;
}

export function ResolutionVerificationModal({
  masterIssue,
  isOpen,
  onClose,
  onVerificationSubmitted,
}: ResolutionVerificationModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<
    | "problem_solved"
    | "partially_solved"
    | "problem_not_solved"
    | "reject_resolution"
    | "reopen_complaint"
    | "add_more_evidence"
    | "file_appeal"
  >("problem_solved");

  const [citizenRemarks, setCitizenRemarks] = useState("");

  if (!masterIssue) return null;

  const resDetails = masterIssue.resolution_details || {
    action_taken: "Department inspection completed and work executed on site.",
    completion_date: new Date().toLocaleDateString("en-IN"),
    officer_info: masterIssue.assigned_officer_name || "District Engineer",
    remarks: "Site verified and restored.",
  };

  function handleSubmitVerification() {
    if (selectedChoice !== "problem_solved" && !citizenRemarks.trim()) {
      toast.error("Please provide remarks explaining your feedback or reopening reason.");
      return;
    }

    const result = processCitizenVerification(masterIssue.current_status as any, {
      response: selectedChoice,
      citizenRemarks: citizenRemarks || "Confirmed by citizen.",
    });

    toast.success(`Verification submitted! Status updated to: ${result.newStatus}`);
    if (onVerificationSubmitted) {
      onVerificationSubmitted(result.newStatus);
    }
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-emerald-600" />
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                2-Step Citizen Resolution Verification
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Government officer has marked this issue work as executed. Please verify the actual site status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* OFFICIAL RESOLUTION SUMMARY CARD */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2 text-xs">
            <p className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Government Officer Work Report
            </p>
            <div>
              <strong className="text-foreground">Action Taken:</strong> {resDetails.action_taken}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> Date: {resDetails.completion_date}
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="size-3.5" /> Officer: {resDetails.officer_info}
              </span>
            </div>
            <div>
              <strong className="text-foreground">Official Remarks:</strong> {resDetails.remarks}
            </div>
          </div>

          {/* VERIFICATION OPTIONS AS REQUESTED IN SPECIFICATION */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Choose Your Verification Response:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChoice("problem_solved")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedChoice === "problem_solved"
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <CheckCircle className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">1. Problem Solved</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Issue completely resolved on site</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChoice("partially_solved")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedChoice === "partially_solved"
                    ? "border-amber-600 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">2. Partially Solved</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Work started but incomplete</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChoice("reject_resolution")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedChoice === "reject_resolution"
                    ? "border-destructive bg-destructive/10 text-destructive font-bold"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <RotateCcw className="size-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">3. Reject & Reopen</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Problem still exists on ground</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChoice("file_appeal")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedChoice === "file_appeal"
                    ? "border-indigo-600 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 font-bold"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <Scale className="size-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">4. File Formal Appeal</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Escalate to DC / State Nodal</p>
                </div>
              </button>
            </div>
          </div>

          {/* CITIZEN REMARKS / REASON INPUT */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Your Remarks / Additional Feedback {selectedChoice !== "problem_solved" && "*"}
            </label>
            <textarea
              value={citizenRemarks}
              onChange={(e) => setCitizenRemarks(e.target.value)}
              placeholder="Provide specific feedback or ground observations..."
              className="w-full h-20 rounded-xl border border-input bg-card p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleSubmitVerification} className="text-xs font-bold">
              Submit Citizen Verification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

