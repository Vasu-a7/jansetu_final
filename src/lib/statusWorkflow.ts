/**
 * JANSETU 12-STAGE COMPLAINT STATUS WORKFLOW & RESOLUTION ENGINE
 * Enforces structured state transitions, role-based authorization,
 * resolution verification requirements, and status history logs.
 */

export type ComplaintStatus =
  | "Submitted"
  | "Acknowledged"
  | "Assigned"
  | "Inspection scheduled"
  | "Under review"
  | "Action in progress"
  | "Resolved"
  | "Citizen confirmation pending"
  | "Rejected"
  | "Reopened"
  | "Escalated"
  | "Closed";

export interface StatusTransitionRecord {
  id: string;
  complaint_id?: string;
  master_issue_id?: string;
  from_status: string;
  to_status: ComplaintStatus;
  changed_by_user_id?: string;
  actor_role: string; // citizen, officer, bdo, dc, moderator, super_admin, system
  reason: string;
  supporting_evidence_url?: string;
  created_at: string;
}

export interface ResolutionSubmissionPayload {
  actionTakenDetails: string;
  completionDate: string;
  officerName: string;
  officerContact: string;
  departmentName: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  supportingDocumentUrl?: string;
  resolutionRemarks: string;
}

export interface CitizenVerificationPayload {
  response:
    | "problem_solved"
    | "partially_solved"
    | "problem_not_solved"
    | "reject_resolution"
    | "reopen_complaint"
    | "add_more_evidence"
    | "file_appeal";
  citizenRemarks: string;
  additionalEvidenceUrl?: string;
}

/**
 * List of all 12 valid statuses in sequential workflow order
 */
export const WORKFLOW_STAGES: ComplaintStatus[] = [
  "Submitted",
  "Acknowledged",
  "Assigned",
  "Inspection scheduled",
  "Under review",
  "Action in progress",
  "Resolved",
  "Citizen confirmation pending",
  "Rejected",
  "Reopened",
  "Escalated",
  "Closed",
];

/**
 * Validates if a user role can perform a specific status transition
 */
export function canTransitionStatus(
  currentStatus: ComplaintStatus,
  nextStatus: ComplaintStatus,
  userRole: string
): { allowed: boolean; error?: string } {
  const role = (userRole || "citizen").toLowerCase();

  // Citizen-only actions (reopen, dispute, confirm, appeal)
  if (["Reopened", "Closed"].includes(nextStatus)) {
    if (!["citizen", "super_admin", "moderator"].includes(role)) {
      return {
        allowed: false,
        error: "Only citizens or system moderators can reopen or close a verified complaint.",
      };
    }
  }

  // Official-only actions (acknowledgment, assignment, inspection, action in progress, resolution)
  const officialRoles = ["verified_official", "dept_admin", "moderator", "super_admin", "bdo", "dc"];
  if (
    ["Acknowledged", "Assigned", "Inspection scheduled", "Under review", "Action in progress", "Resolved", "Citizen confirmation pending"].includes(
      nextStatus
    )
  ) {
    if (!officialRoles.includes(role)) {
      return {
        allowed: false,
        error: "Unauthorized: Only government department officials can update administrative status.",
      };
    }
  }

  return { allowed: true };
}

/**
 * Validates mandatory resolution fields before government can submit resolution
 */
export function validateResolutionSubmission(payload: ResolutionSubmissionPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!payload.actionTakenDetails || payload.actionTakenDetails.trim().length < 15) {
    errors.push("Detailed description of action taken is required (at least 15 characters).");
  }
  if (!payload.completionDate) {
    errors.push("Work completion date is required.");
  }
  if (!payload.officerName || !payload.departmentName) {
    errors.push("Responsible officer and department details are mandatory.");
  }
  if (!payload.beforePhotoUrl && !payload.afterPhotoUrl && !payload.supportingDocumentUrl) {
    errors.push("At least one before/after photo or work completion document is required as evidence.");
  }
  if (!payload.resolutionRemarks || payload.resolutionRemarks.trim().length < 10) {
    errors.push("Resolution remarks are required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Processes citizen verification response on a resolved issue
 */
export function processCitizenVerification(
  currentStatus: ComplaintStatus,
  payload: CitizenVerificationPayload
): { newStatus: ComplaintStatus; logMessage: string } {
  switch (payload.response) {
    case "problem_solved":
      return {
        newStatus: "Closed",
        logMessage: "Citizen confirmed problem fully solved. Issue closed successfully.",
      };
    case "partially_solved":
      return {
        newStatus: "Action in progress",
        logMessage: `Citizen reported partial resolution: "${payload.citizenRemarks}". Work resumed.`,
      };
    case "problem_not_solved":
    case "reject_resolution":
      return {
        newStatus: "Reopened",
        logMessage: `Citizen rejected government resolution: "${payload.citizenRemarks}". Case reopened.`,
      };
    case "reopen_complaint":
      return {
        newStatus: "Reopened",
        logMessage: `Citizen reopened complaint: "${payload.citizenRemarks}".`,
      };
    case "add_more_evidence":
      return {
        newStatus: "Under review",
        logMessage: `Citizen submitted additional evidence: "${payload.citizenRemarks}". Re-evaluating.`,
      };
    case "file_appeal":
      return {
        newStatus: "Escalated",
        logMessage: `Citizen filed formal appeal: "${payload.citizenRemarks}". Escalated to senior authority.`,
      };
    default:
      return {
        newStatus: "Citizen confirmation pending",
        logMessage: "Awaiting citizen confirmation.",
      };
  }
}
