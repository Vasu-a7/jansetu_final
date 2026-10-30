import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Scale, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitReportAppeal } from "@/lib/moderationEngine";

interface ReportAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id: string;
    tracking_id?: string;
    title: string;
    rejection_reason?: string;
    user_id?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function ReportAppealModal({
  isOpen,
  onClose,
  report,
  onSuccess,
}: ReportAppealModalProps) {
  const [appealReason, setAppealReason] = useState("");
  const [additionalProof, setAdditionalProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!report) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appealReason.trim() || appealReason.trim().length < 15) {
      toast.error("Please provide a detailed explanation for your appeal (min 15 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      submitReportAppeal(
        report.id,
        report.tracking_id || "JS-TRACK",
        report.user_id || "current-user",
        appealReason.trim(),
        additionalProof.trim() || undefined
      );

      toast.success("Civic Appeal successfully submitted for secondary review!");
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Failed to submit appeal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider mb-1">
                <Scale className="size-4" /> Civic Justice & Review Board
              </div>
              <DialogTitle className="text-xl font-bold">Appeal Rejected Report</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Re-evaluation for: <strong className="text-foreground">{report.title}</strong>
              </DialogDescription>
            </DialogHeader>

            {report.rejection_reason && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs">
                <p className="font-semibold text-destructive flex items-center gap-1.5 mb-1">
                  <AlertCircle className="size-3.5" /> Rejection Ground / Moderator Note:
                </p>
                <p className="text-muted-foreground">{report.rejection_reason}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Ground Clarification & Defense
                </label>
                <Textarea
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Explain why this issue is genuine, how the location is accurate, or why the previous evaluation was mistaken..."
                  className="min-h-24 resize-y text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Additional Evidence Link / Photo URL (Optional)
                </label>
                <Input
                  value={additionalProof}
                  onChange={(e) => setAdditionalProof(e.target.value)}
                  placeholder="e.g. Photo link, landmark reference, or geotagged URL"
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-1.5 font-semibold bg-amber-600 hover:bg-amber-700 text-white" disabled={isSubmitting}>
                  <Scale className="size-4" />
                  {isSubmitting ? "Submitting Appeal..." : "Submit Appeal for Review"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Appeal Registered</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your appeal has been queued for secondary review by senior civic ombudsmen. You will receive an update once verified.
            </p>
            <Button onClick={onClose} className="w-full font-semibold">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

