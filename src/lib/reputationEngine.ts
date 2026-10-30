/**
 * JANSETU REPORTER REPUTATION & TRUST SCORING ENGINE
 * Evaluates citizen credibility, fast-tracks trusted reporters,
 * and restricts repeat fake/spam accounts.
 */

export interface UserReputation {
  userId: string;
  score: number; // 0 to 100 (Default: 60)
  totalSubmitted: number;
  totalVerified: number;
  totalRejected: number;
  totalAudited: number;
  isRestricted: boolean;
  restrictionUntil?: string;
  tier: "new" | "trusted" | "civic_leader" | "probation";
  history: Array<{
    action: string;
    delta: number;
    reason: string;
    timestamp: string;
  }>;
}

const DEFAULT_REPUTATION: UserReputation = {
  userId: "anonymous",
  score: 60,
  totalSubmitted: 0,
  totalVerified: 0,
  totalRejected: 0,
  totalAudited: 0,
  isRestricted: false,
  tier: "new",
  history: [
    {
      action: "account_created",
      delta: 0,
      reason: "Initial neutral civic standing",
      timestamp: new Date().toISOString(),
    },
  ],
};

export function getUserReputation(userId: string = "anonymous"): UserReputation {
  if (typeof window === "undefined") return { ...DEFAULT_REPUTATION, userId };
  try {
    const allRep = JSON.parse(localStorage.getItem("jansetu_reputations") || "{}");
    if (allRep[userId]) {
      return allRep[userId];
    }
  } catch (e) {
    console.warn("Reputation storage parse error:", e);
  }
  return { ...DEFAULT_REPUTATION, userId };
}

export function updateUserReputation(
  userId: string,
  event: "report_submitted" | "report_verified" | "report_rejected_fake" | "audit_completed" | "appeal_granted",
  reasonText: string
): UserReputation {
  const current = getUserReputation(userId);
  let delta = 0;

  switch (event) {
    case "report_submitted":
      current.totalSubmitted += 1;
      delta = 1; // Slight activity reward
      break;
    case "report_verified":
      current.totalVerified += 1;
      delta = 10; // Verified real ground issue
      break;
    case "report_rejected_fake":
      current.totalRejected += 1;
      delta = -30; // Strong penalty for verified fake/spam
      break;
    case "audit_completed":
      current.totalAudited += 1;
      delta = 15; // Volunteer ground audit reward
      break;
    case "appeal_granted":
      delta = 25; // Restoring score on successful appeal
      break;
  }

  current.score = Math.max(5, Math.min(100, current.score + delta));

  // Determine Tier & Restrictions
  if (current.score < 30) {
    current.tier = "probation";
    current.isRestricted = true;
    current.restrictionUntil = new Date(Date.now() + 86400000 * 3).toISOString(); // 3-day probation
  } else if (current.score >= 85) {
    current.tier = "civic_leader";
    current.isRestricted = false;
  } else if (current.score >= 65) {
    current.tier = "trusted";
    current.isRestricted = false;
  } else {
    current.tier = "new";
    current.isRestricted = false;
  }

  current.history.unshift({
    action: event,
    delta,
    reason: reasonText,
    timestamp: new Date().toISOString(),
  });

  // Limit history length to 20
  if (current.history.length > 20) {
    current.history = current.history.slice(0, 20);
  }

  if (typeof window !== "undefined") {
    try {
      const allRep = JSON.parse(localStorage.getItem("jansetu_reputations") || "{}");
      allRep[userId] = current;
      localStorage.setItem("jansetu_reputations", JSON.stringify(allRep));
    } catch (e) {
      console.warn("Reputation storage save error:", e);
    }
  }

  return current;
}

