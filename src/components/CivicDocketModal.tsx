import { useState } from "react";
import type { MasterIssue } from "@/lib/deduplicationEngine";
import { downloadOrPrintCivicDocket, generateCivicDocketHtml } from "@/lib/docketGenerator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Printer, Download, FileText, ShieldCheck, Lock } from "lucide-react";

interface CivicDocketModalProps {
  masterIssue: MasterIssue | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CivicDocketModal({ masterIssue, isOpen, onClose }: CivicDocketModalProps) {
  const [redactPii, setRedactPii] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);

  if (!masterIssue) return null;

  function handlePrint() {
    downloadOrPrintCivicDocket(masterIssue);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="size-6 text-primary" />
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Official Civic Complaint Summary Docket
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate shareable, printable docket for CPGRAMS, RTI, Lokayukta, and District Administration.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* SUMMARY DOCKET PREVIEW BOX */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex justify-between items-center border-b border-primary/20 pb-2">
              <span className="font-bold text-primary">Master Issue ID: {masterIssue.master_issue_id}</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-bold">
                {masterIssue.current_status}
              </span>
            </div>
            <p className="font-bold text-foreground">{masterIssue.title}</p>
            <p className="text-muted-foreground">{masterIssue.description}</p>
            <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-muted-foreground">
              <span>📍 {masterIssue.district}, {masterIssue.block_ward}</span>
              <span>👥 {masterIssue.total_affected_users} Citizens Impacted</span>
              <span>🏢 {masterIssue.assigned_department}</span>
            </div>
          </div>

          {/* DOCKET EXPORT CONTROLS */}
          <div className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-emerald-600" /> Redact Personal Information (DPDP Act)
                </p>
                <p className="text-[10px] text-muted-foreground">Mask citizen email, phone, and exact house address</p>
              </div>
              <Switch checked={redactPii} onCheckedChange={setRedactPii} />
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2">
              <div>
                <p className="font-semibold text-foreground">Include Full Escalation & Status History</p>
                <p className="text-[10px] text-muted-foreground">Attach 12-stage audit trail and SLA logs</p>
              </div>
              <Switch checked={includeTimeline} onCheckedChange={setIncludeTimeline} />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button onClick={handlePrint} className="text-xs font-bold">
              <Printer className="size-3.5 mr-1.5" /> Print / Save as PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
