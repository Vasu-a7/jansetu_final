/**
 * JANSETU AUTOMATED COMPLAINT PRIORITY ENGINE
 * Dynamically computes complaint priority based on community impact, pending duration,
 * vulnerable target sectors, and emergency risks.
 */

export interface PriorityFactors {
  affectedUsersCount: number;
  category: string;
  pendingDays: number;
  affectedVillagesCount: number;
  isEmergencyRisk?: boolean;
  isVulnerableGroupImpacted?: boolean;
  hasUnresolvedHistory?: boolean;
}

export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

export interface PriorityCalculationResult {
  score: number; // 0 - 100+
  level: PriorityLevel;
  breakdown: Array<{ factor: string; points: number }>;
}

const CRITICAL_SECTOR_KEYWORDS = [
  "water",
  "drinking water",
  "hospital",
  "clinic",
  "school",
  "bridge collapse",
  "road hazard",
  "sewage leak",
  "electric wire",
  "safety",
  "flood",
  "ambulance",
];

/**
 * Calculates priority score and level automatically based on civic factors
 */
export function calculateComplaintPriority(factors: PriorityFactors): PriorityCalculationResult {
  let score = 20; // Base score
  const breakdown: Array<{ factor: string; points: number }> = [
    { factor: "Base Civic Priority", points: 20 },
  ];

  // 1. Affected Users Count (+5 points per 10 users, max 30 points)
  const userPoints = Math.min(30, Math.floor((factors.affectedUsersCount || 1) / 5) * 5);
  if (userPoints > 0) {
    score += userPoints;
    breakdown.push({ factor: `Affected Citizens (${factors.affectedUsersCount})`, points: userPoints });
  }

  // 2. Critical Sector Impact (Water, Hospital, School, Road, Safety) (+20 points)
  const catLower = (factors.category || "").toLowerCase();
  const isCriticalSector = CRITICAL_SECTOR_KEYWORDS.some((kw) => catLower.includes(kw));
  if (isCriticalSector) {
    score += 20;
    breakdown.push({ factor: `Critical Infrastructure / Public Safety (${factors.category})`, points: 20 });
  }

  // 3. Pending Duration Impact (+2 points per pending day, max 20 points)
  const pendingDays = Math.max(0, factors.pendingDays || 0);
  const pendingPoints = Math.min(20, pendingDays * 2);
  if (pendingPoints > 0) {
    score += pendingPoints;
    breakdown.push({ factor: `Pending Duration (${pendingDays} days)`, points: pendingPoints });
  }

  // 4. Multi-Village / Multi-Ward Impact (+15 points)
  if ((factors.affectedVillagesCount || 1) > 1) {
    score += 15;
    breakdown.push({ factor: `Multi-Village Impact (${factors.affectedVillagesCount} villages)`, points: 15 });
  }

  // 5. Emergency / Vulnerable Citizen Risk (+20 points)
  if (factors.isEmergencyRisk) {
    score += 20;
    breakdown.push({ factor: "Emergency Hazard Risk", points: 20 });
  }
  if (factors.isVulnerableGroupImpacted) {
    score += 10;
    breakdown.push({ factor: "Impact on Vulnerable Groups", points: 10 });
  }

  // Determine Level from Score Thresholds
  let level: PriorityLevel = "Low";
  if (score >= 80) {
    level = "Critical";
  } else if (score >= 60) {
    level = "High";
  } else if (score >= 35) {
    level = "Medium";
  } else {
    level = "Low";
  }

  return {
    score,
    level,
    breakdown,
  };
}

/**
 * Validates a manual priority override by an authorized user
 */
export function overridePriority(
  currentLevel: PriorityLevel,
  newLevel: PriorityLevel,
  overrideReason: string,
  userRole: string
): { success: boolean; error?: string } {
  if (!overrideReason || overrideReason.trim().length < 10) {
    return {
      success: false,
      error: "Mandatory reason required (at least 10 characters) for manual priority override.",
    };
  }

  const allowedRoles = ["verified_official", "dept_admin", "moderator", "super_admin", "bdo", "dc"];
  if (!allowedRoles.includes(userRole.toLowerCase())) {
    return {
      success: false,
      error: "Unauthorized: Only official department users or admins can override priority.",
    };
  }

  return { success: true };
}
