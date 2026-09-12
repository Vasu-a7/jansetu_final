/**
 * JANSETU SLA CALCULATOR & MULTI-TIER GOV ESCALATION ENGINE
 * Computes category-specific SLA deadlines, real-time overdue statuses,
 * and automatic multi-tier governance escalation levels.
 */

export interface SlaPolicy {
  category: string;
  department: string;
  acknowledgementHours: number; // e.g. 48 hours
  initialResponseDays: number; // e.g. 7 days
  resolutionTargetDays: number; // e.g. 30 days
}

export const DEFAULT_SLA_POLICIES: Record<string, SlaPolicy> = {
  "water supply": {
    category: "Water Supply",
    department: "Drinking Water & Sanitation Dept (DWSD)",
    acknowledgementHours: 24,
    initialResponseDays: 3,
    resolutionTargetDays: 14,
  },
  "street lighting": {
    category: "Street Lighting",
    department: "Urban Local Bodies (ULB) Electrical Cell",
    acknowledgementHours: 48,
    initialResponseDays: 5,
    resolutionTargetDays: 15,
  },
  "road maintenance": {
    category: "Road Maintenance",
    department: "Public Works Department (PWD) / RCD",
    acknowledgementHours: 48,
    initialResponseDays: 7,
    resolutionTargetDays: 30,
  },
  "sanitation & waste": {
    category: "Sanitation & Waste",
    department: "Municipal Corporation Health Wing",
    acknowledgementHours: 24,
    initialResponseDays: 2,
    resolutionTargetDays: 7,
  },
  "health & hospital": {
    category: "Health & Hospital",
    department: "Health, Medical Education & Family Welfare",
    acknowledgementHours: 12,
    initialResponseDays: 2,
    resolutionTargetDays: 10,
  },
  "education & school": {
    category: "Education & School",
    department: "School Education & Literacy Dept",
    acknowledgementHours: 48,
    initialResponseDays: 7,
    resolutionTargetDays: 21,
  },
  default: {
    category: "General Civic Concern",
    department: "District Grievance Redressal Cell",
    acknowledgementHours: 48,
    initialResponseDays: 7,
    resolutionTargetDays: 30,
  },
};

export interface SlaStatusResult {
  slaDeadline: string;
  slaStatus: "on_time" | "warning" | "overdue";
  daysRemaining: number;
  overdueDays: number;
  escalationLevel: number; // 1: Local/Ward, 2: Block (BDO), 3: District (DC/DM), 4: State Nodal
  escalationTitle: string;
  formattedOverdueBadge: string;
  formattedEscalationText: string;
  nextEscalationText: string;
}

/**
 * Gets SLA Policy for a category
 */
export function getSlaPolicy(category: string): SlaPolicy {
  const key = (category || "").toLowerCase().trim();
  return DEFAULT_SLA_POLICIES[key] || DEFAULT_SLA_POLICIES.default;
}

/**
 * Calculates real-time SLA status and escalation tier
 */
export function calculateSlaAndEscalation(
  firstReportedAt: string,
  category: string,
  currentStatus: string
): SlaStatusResult {
  const policy = getSlaPolicy(category);
  const startDate = new Date(firstReportedAt).getTime();
  const now = Date.now();
  
  // Calculate Target Resolution Deadline
  const targetMs = startDate + policy.resolutionTargetDays * 24 * 3600 * 1000;
  const slaDeadline = new Date(targetMs).toISOString();

  // If issue is already resolved or closed, SLA is on_time
  const isResolvedState = ["Resolved", "Closed", "Citizen confirmation pending"].includes(currentStatus);
  if (isResolvedState) {
    return {
      slaDeadline,
      slaStatus: "on_time",
      daysRemaining: 0,
      overdueDays: 0,
      escalationLevel: 1,
      escalationTitle: "Ward Engineer / Local Officer",
      formattedOverdueBadge: "Resolved Within SLA",
      formattedEscalationText: "Action Completed",
      nextEscalationText: "Case Resolved",
    };
  }

  const diffMs = targetMs - now;
  const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));

  let slaStatus: "on_time" | "warning" | "overdue" = "on_time";
  let overdueDays = 0;
  let daysRemaining = Math.max(0, diffDays);

  if (diffMs < 0) {
    slaStatus = "overdue";
    overdueDays = Math.abs(Math.floor(diffMs / (1000 * 3600 * 24)));
  } else if (diffMs <= 2 * 24 * 3600 * 1000) {
    slaStatus = "warning";
  }

  // Calculate Multi-Tier Escalation Hierarchy
  let escalationLevel = 1;
  let escalationTitle = "Ward Engineer / Local Officer";
  let nextEscalationText = "Next escalation in 3 days";

  if (overdueDays > 14) {
    escalationLevel = 4;
    escalationTitle = "State Nodal Secretary / CM Jansamvad Cell";
    nextEscalationText = "Maximum State Level Escalation Active";
  } else if (overdueDays > 7) {
    escalationLevel = 3;
    escalationTitle = "Deputy Commissioner / District Magistrate (DC/DM)";
    nextEscalationText = "Next escalation to State Nodal in " + (14 - overdueDays) + " days";
  } else if (overdueDays > 0) {
    escalationLevel = 2;
    escalationTitle = "Block Development Officer (BDO) / Executive Officer";
    nextEscalationText = "Next escalation to District Collector in " + (7 - overdueDays) + " days";
  }

  // Format Display Strings as requested in specification
  let formattedOverdueBadge = "";
  if (slaStatus === "overdue") {
    formattedOverdueBadge = `Response overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
  } else if (slaStatus === "warning") {
    formattedOverdueBadge = `SLA deadline: ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;
  } else {
    formattedOverdueBadge = `SLA Target: ${policy.resolutionTargetDays} Days`;
  }

  let formattedEscalationText = `Escalated to ${escalationTitle}`;

  return {
    slaDeadline,
    slaStatus,
    daysRemaining,
    overdueDays,
    escalationLevel,
    escalationTitle,
    formattedOverdueBadge,
    formattedEscalationText,
    nextEscalationText,
  };
}
