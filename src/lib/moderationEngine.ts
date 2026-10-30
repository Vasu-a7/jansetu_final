/**
 * JANSETU MODERATION & CITIZEN APPEAL ENGINE
 * Powers real moderation review queues, community flag handling,
 * and transparent appeal workflows for rejected reports.
 */

import { updateUserReputation } from "./reputationEngine";

export interface FlaggedReportItem {
  id: string;
  reportId: string;
  trackingId: string;
  reportTitle: string;
  reportDescription: string;
  category: string;
  district: string;
  blockWard?: string;
  locationText?: string;
  latitude?: number | null;
  longitude?: number | null;
  mediaUrl?: string | null;
  reporterId: string;
  reporterName?: string;
  flagReason: "fake_non_existent" | "wrong_location" | "abusive_language" | "duplicate_spam" | "already_resolved";
  flagDetails?: string;
  flaggedBy: string;
  flaggedAt: string;
  moderationStatus: "pending_review" | "approved" | "rejected" | "evidence_requested";
  moderatorNotes?: string;
  moderatedAt?: string;
  rejectionReason?: string;
}

export interface ReportAppeal {
  id: string;
  reportId: string;
  trackingId: string;
  reporterId: string;
  appealReason: string;
  additionalEvidenceUrl?: string;
  submittedAt: string;
  status: "pending" | "upheld" | "denied";
  reviewNotes?: string;
}

const MODERATION_STORAGE_KEY = "jansetu_moderation_queue";
const APPEALS_STORAGE_KEY = "jansetu_report_appeals";

export function getModerationQueue(): FlaggedReportItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MODERATION_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function flagReportForModeration(
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
  },
  flagReason: FlaggedReportItem["flagReason"],
  flagDetails: string = "",
  flaggedByUserId: string = "citizen-community"
): FlaggedReportItem {
  const queue = getModerationQueue();

  const newItem: FlaggedReportItem = {
    id: "flag-" + Date.now(),
    reportId: report.id,
    trackingId: report.tracking_id || "JS-UNASSIGNED",
    reportTitle: report.title,
    reportDescription: report.description,
    category: report.category,
    district: report.district || "Jharkhand",
    blockWard: report.block_ward,
    locationText: report.location_text || undefined,
    latitude: report.latitude,
    longitude: report.longitude,
    mediaUrl: report.media_url,
    reporterId: report.user_id || report.reporter_id || "anonymous",
    flagReason,
    flagDetails,
    flaggedBy: flaggedByUserId,
    flaggedAt: new Date().toISOString(),
    moderationStatus: "pending_review",
  };

  queue.unshift(newItem);
  if (typeof window !== "undefined") {
    localStorage.setItem(MODERATION_STORAGE_KEY, JSON.stringify(queue));
  }

  return newItem;
}

export function resolveModerationItem(
  flagId: string,
  decision: "approved" | "rejected" | "evidence_requested",
  moderatorNotes: string = "",
  rejectionReason: string = ""
): boolean {
  const queue = getModerationQueue();
  const itemIndex = queue.findIndex((item) => item.id === flagId);
  if (itemIndex === -1) return false;

  const item = queue[itemIndex]!;
  item.moderationStatus = decision;
  item.moderatorNotes = moderatorNotes;
  item.moderatedAt = new Date().toISOString();

  if (decision === "rejected") {
    item.rejectionReason = rejectionReason || "The report failed field authenticity and evidence criteria.";
    // Penalize reporter reputation
    updateUserReputation(item.reporterId, "report_rejected_fake", `Report ${item.trackingId} rejected by moderation: ${item.rejectionReason}`);
  } else if (decision === "approved") {
    // Reward verified status
    updateUserReputation(item.reporterId, "report_verified", `Report ${item.trackingId} approved after community review.`);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(MODERATION_STORAGE_KEY, JSON.stringify(queue));

    // Also update matching report in jansetu_user_challenges
    try {
      const storedChallenges = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
      const updated = storedChallenges.map((c: any) => {
        if (c.id === item.reportId || c.tracking_id === item.trackingId) {
          return {
            ...c,
            status: decision === "rejected" ? "rejected" : c.status,
            rejection_reason: decision === "rejected" ? item.rejectionReason : undefined,
            moderation_status: decision,
          };
        }
        return c;
      });
      localStorage.setItem("jansetu_user_challenges", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not sync moderation decision with challenges:", e);
    }
  }

  return true;
}

export function submitReportAppeal(
  reportId: string,
  trackingId: string,
  reporterId: string,
  appealReason: string,
  additionalEvidenceUrl?: string
): ReportAppeal {
  const appeals: ReportAppeal[] = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem(APPEALS_STORAGE_KEY) || "[]")
    : [];

  const newAppeal: ReportAppeal = {
    id: "appeal-" + Date.now(),
    reportId,
    trackingId,
    reporterId,
    appealReason,
    additionalEvidenceUrl,
    submittedAt: new Date().toISOString(),
    status: "pending",
  };

  appeals.unshift(newAppeal);
  if (typeof window !== "undefined") {
    localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(appeals));
  }

  return newAppeal;
}

export function getAppeals(): ReportAppeal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(APPEALS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

