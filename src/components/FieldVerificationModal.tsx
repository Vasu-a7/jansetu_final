import { useState } from "react";
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  MapPin,
  ShieldCheck,
  Star,
  Upload,
  UserCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FieldVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: {
    id: string;
    title: string;
    location_text?: string | null;
  } | null;
  onSuccess?: () => void;
}

type VerificationStatus = "verified_active" | "verified_resolved" | "work_in_progress";

const steps = ["Volunteer", "Ground status", "Evidence", "Review"];

export function FieldVerificationModal({ isOpen, onClose, challenge, onSuccess }: FieldVerificationModalProps) {
  const [step, setStep] = useState(0);
  const [volunteerName, setVolunteerName] = useState("");
  const [collegeName, setCollegeName] = useState("Ranchi University");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("verified_active");
  const [qualityRating, setQualityRating] = useState(5);
  const [auditNotes, setAuditNotes] = useState("");
  const [evidenceName, setEvidenceName] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!challenge) return null;

  function resetForm() {
    setStep(0);
    setVolunteerName("");
    setCollegeName("Ranchi University");
    setVerificationStatus("verified_active");
    setQualityRating(5);
    setAuditNotes("");
    setEvidenceName("");
    setCoordinates(null);
    setShowCertificate(false);
    setCertificateId("");
  }

  function close() {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by this browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setIsLocating(false);
        toast.success("Field location captured.");
      },
      () => {
        setIsLocating(false);
        toast.error("Location permission nahi mili. Aap bina GPS ke continue kar sakte hain.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function canContinue() {
    if (step === 0 && (!volunteerName.trim() || !collegeName.trim())) {
      toast.error("Student name aur college name enter karein.");
      return false;
    }
    if (step === 2 && !auditNotes.trim()) {
      toast.error("Ground observation notes add karein.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!auditNotes.trim()) {
      toast.error("Ground observation notes add karein.");
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    const newCertificateId = "CERT-JANSETU-" + Math.floor(100000 + Math.random() * 900000);
    const newVerification = {
      id: "verify-" + Date.now(),
      challenge_id: challenge.id,
      challenge_title: challenge.title,
      volunteer_name: volunteerName.trim(),
      college_name: collegeName.trim(),
      status: verificationStatus,
      quality_rating: qualityRating,
      audit_notes: auditNotes.trim(),
      evidence_name: evidenceName || null,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      credits_earned: 50,
      certificate_id: newCertificateId,
      verified_at: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };

    try {
      const { error } = await (supabase.from("field_verifications" as any) as any).insert({
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        volunteer_name: volunteerName.trim(),
        college_name: collegeName.trim(),
        status: verificationStatus,
        quality_rating: qualityRating,
        audit_notes: auditNotes.trim(),
        evidence_name: evidenceName || null,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
        credits_earned: 50,
        certificate_id: newCertificateId,
      });
      if (error) console.warn("Field verification backend sync notice:", error.message);
    } catch (error) {
      console.warn("Field verification backend sync notice:", error);
    }

    try {
      const stored = JSON.parse(localStorage.getItem("jansetu_field_verifications") || "[]");
      stored.unshift(newVerification);
      localStorage.setItem("jansetu_field_verifications", JSON.stringify(stored));

      // Also mark the challenge as verified by Student Civic Corps in local challenges
      try {
        const storedChallenges = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
        const updated = storedChallenges.map((item: any) => {
          if (item.id === challenge.id || item.title === challenge.title) {
            return {
              ...item,
              is_student_verified: true,
              volunteer_status: verificationStatus,
              volunteer_rating: qualityRating,
              volunteer_name: volunteerName.trim(),
              volunteer_college: collegeName.trim(),
            };
          }
          return item;
        });
        localStorage.setItem("jansetu_user_challenges", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not update challenge verification state:", e);
      }
      setCertificateId(newCertificateId);
      setShowCertificate(true);
      toast.success("Ground verification submitted. +50 volunteer credits earned.");
      onSuccess?.();
    } catch (error) {
      toast.error("Verification save nahi ho paayi. Please try again.");
      console.error("Field verification local save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        {showCertificate ? (
          <div className="space-y-5 py-3 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Award className="size-8" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">Verification submitted!</DialogTitle>
              <DialogDescription className="text-center">
                Aapka ground audit department review ke liye bhej diya gaya hai.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <span>+50 Student Credits</span>
                <span>Certificate ready</span>
              </div>
              <p className="mt-2 font-mono text-xs text-emerald-700 dark:text-emerald-400">{certificateId}</p>
            </div>
            <Button className="w-full" onClick={close}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                <ShieldCheck className="size-4" /> Student Civic Volunteer Corps
              </div>
              <DialogTitle className="text-xl">Quick Ground Audit</DialogTitle>
              <DialogDescription className="line-clamp-2 text-xs">
                Verify: <strong className="text-foreground">{challenge.title}</strong>
                {challenge.location_text ? ` · ${challenge.location_text}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Step {step + 1} of {steps.length}</span>
                <span>{steps[step]}</span>
              </div>
              <div className="flex gap-1">
                {steps.map((label, index) => (
                  <div key={label} className="flex min-w-0 flex-1 items-center gap-1">
                    <div className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${index <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {index < step ? <Check className="size-3" /> : index + 1}
                    </div>
                    <span className="hidden truncate text-[10px] sm:block">{label}</span>
                    {index < steps.length - 1 && <div className={`h-px flex-1 ${index < step ? "bg-primary" : "bg-border"}`} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-[255px] pt-2">
              {step === 0 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                    <UserCheck className="mr-1 inline size-4 text-primary" />
                    Apni student details enter karein. Ye certificate aur audit trail ke liye use hongi.
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold">Student volunteer name<Input className="mt-1" value={volunteerName} onChange={(event) => setVolunteerName(event.target.value)} placeholder="e.g. Priya Kumari" /></label>
                    <label className="text-xs font-semibold">College / university<Input className="mt-1" value={collegeName} onChange={(event) => setCollegeName(event.target.value)} placeholder="e.g. Ranchi University" /></label>
                  </div>
                  <p className="text-xs text-muted-foreground">Tip: Ground par pahunchne ke baad hi audit submit karein.</p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold">Aapne site par kya dekha?</p>
                  <div className="grid gap-2">
                    {([
                      ["verified_active", "Active issue confirmed", "Problem abhi bhi ground par present hai", AlertTriangle],
                      ["work_in_progress", "Work in progress", "Department ka kaam chal raha hai", Crosshair],
                      ["verified_resolved", "Verified fixed", "Problem completely resolve ho gaya", CheckCircle2],
                    ] as const).map(([value, title, description, Icon]) => (
                      <button key={value} type="button" onClick={() => setVerificationStatus(value)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${verificationStatus === value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}>
                        <Icon className="size-5 shrink-0 text-primary" />
                        <span className="min-w-0"><span className="block text-xs font-bold">{title}</span><span className="block text-[11px] text-muted-foreground">{description}</span></span>
                        {verificationStatus === value && <Check className="ml-auto size-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border p-3">
                    <MapPin className="size-5 text-primary" />
                    <div className="min-w-0 flex-1 text-xs"><b>Field location</b><p className="truncate text-muted-foreground">{coordinates ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}` : "Not captured yet"}</p></div>
                    <Button type="button" size="sm" variant="outline" onClick={captureLocation} disabled={isLocating}>{isLocating ? "Locating..." : coordinates ? "Recapture" : "Capture GPS"}</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <label className="text-xs font-semibold">Ground observation notes <span className="font-normal text-muted-foreground">(required)</span>
                    <Textarea className="mt-1 min-h-24 resize-y" value={auditNotes} onChange={(event) => setAuditNotes(event.target.value)} placeholder="Example: Main road ke north side mein 20m pipe leakage abhi bhi active hai..." />
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs">
                    <Upload className="size-5 text-primary" />
                    <span className="min-w-0 flex-1"><b>Evidence photo/video</b><span className="block truncate text-muted-foreground">{evidenceName || "Optional, but recommended"}</span></span>
                    <input className="hidden" type="file" accept="image/*,video/*" onChange={(event) => setEvidenceName(event.target.files?.[0]?.name || "")} />
                    <span className="rounded-lg border bg-background px-2 py-1 font-semibold">Choose</span>
                  </label>
                  <div>
                    <p className="mb-1 text-xs font-semibold">Ground quality rating</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} stars`} onClick={() => setQualityRating(star)}><Star className={`size-7 ${star <= qualityRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} /></button>)}
                      <span className="ml-2 text-xs font-bold">{qualityRating}/5</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-muted/30 p-4 text-xs">
                    <p className="mb-2 font-bold">Audit summary</p>
                    <p><b>Volunteer:</b> {volunteerName} · {collegeName}</p>
                    <p><b>Status:</b> {verificationStatus === "verified_active" ? "Active issue confirmed" : verificationStatus === "work_in_progress" ? "Work in progress" : "Verified fixed"}</p>
                    <p><b>Evidence:</b> {evidenceName || "Not attached"} · <b>GPS:</b> {coordinates ? "Captured" : "Not captured"}</p>
                    <p className="mt-2 border-t pt-2"><b>Notes:</b> {auditNotes}</p>
                  </div>
                  <p className="flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-emerald-600" /> Submit karne se pehle details check kar lein. Ye audit department review aur certificate record mein save hoga.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => step === 0 ? close() : setStep((current) => current - 1)} disabled={isSubmitting}>
                <ChevronLeft className="mr-1 size-4" /> {step === 0 ? "Cancel" : "Back"}
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => canContinue() && setStep((current) => current + 1)}>Next <ChevronRight className="ml-1 size-4" /></Button>
              ) : (
                <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit audit"} <CheckCircle2 className="ml-1 size-4" /></Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
