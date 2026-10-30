import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { flagReportForModeration, type FlaggedReportItem } from "@/lib/moderationEngine";

interface ReportFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id: string;
    tracking_id?: string;
    title: string;
    description: string;
    category: string;
    district?: string;
    block_ward?: string;
    location_text?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    media_url?: string | null;
    user_id?: string | null;
    reporter_id?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function ReportFlagModal({
  isOpen,
  onClose,
  report,
  onSuccess,
}: ReportFlagModalProps) {
  const [flagReason, setFlagReason] = useState<FlaggedReportItem["flagReason"]>("fake_non_existent");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!report) return null;

  async function handleFlagSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      flagReportForModeration(
        report,
        flagReason,
        details.trim(),
        "citizen-auditor"
      );
      toast.success("Report flagged and forwarded to the Moderation & Audit Board.");
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error("Failed to flag report.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="size-4" /> Anti-Spam & Fraud Prevention
          </div>
          <DialogTitle className="text-xl font-bold">Flag or Dispute Report</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Disputing: <strong className="text-foreground">{report.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFlagSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Dispute Category / Concern
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: "fake_non_existent", label: "🚫 Fake / Issue Does Not Exist on Ground" },
                { value: "wrong_location", label: "📍 Wrong Location / Address Mismatch" },
                { value: "already_resolved", label: "✅ Already Resolved / Old Outdated Issue" },
                { value: "duplicate_spam", label: "🔁 Duplicate / Repeated Spam Complaint" },
                { value: "abusive_language", label: "⚠️ Inappropriate / Abusive Content" },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    flagReason === item.value
                      ? "border-destructive bg-destructive/5 text-destructive font-semibold"
                      : "border-border text-foreground hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="flag_reason"
                    value={item.value}
                    checked={flagReason === item.value}
                    onChange={(e) => setFlagReason(e.target.value as any)}
                    className="size-3.5 accent-destructive"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Additional Details / Evidence of Fake Claim (Optional)
            </label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. I live right next to this location and there is no pothole here, photo looks internet-sourced..."
              className="min-h-16 resize-y text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="gap-1.5 font-semibold text-xs"
              disabled={isSubmitting}
            >
              <Flag className="size-3.5" />
              {isSubmitting ? "Submitting Flag..." : "Submit Flag to Moderator Queue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

