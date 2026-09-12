/**
 * JANSETU INTELLIGENT COMPLAINT DEDUPLICATION ENGINE
 * Calculates non-destructive similarity scores between civic complaints.
 * Links individual reports to unified Master Issues without deleting original data.
 */

export interface CivicReport {
  id: string;
  tracking_id?: string;
  user_id?: string;
  reporter_id?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  district?: string;
  block_ward?: string;
  panchayat?: string;
  village?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  media_url?: string | null;
  audio_url?: string | null;
  master_issue_id?: string | null;
  duplicate_status?: "original" | "suggested_duplicate" | "linked_duplicate" | "disputed";
}

export interface MasterIssue {
  id: string;
  master_issue_id: string; // JST-RD-2026-00124
  title: string;
  description: string;
  category: string;
  district: string;
  block_ward?: string;
  panchayat?: string;
  village?: string;
  latitude?: number | null;
  longitude?: number | null;
  affected_area?: string;
  total_linked_reports: number;
  total_affected_users: number;
  affected_villages_count: number;
  first_reported_at: string;
  latest_report_at: string;
  assigned_department: string;
  assigned_officer_name?: string;
  assigned_officer_contact?: string;
  current_status: string;
  priority_level: "Low" | "Medium" | "High" | "Critical";
  priority_score: number;
  sla_deadline: string;
  sla_status: "on_time" | "warning" | "overdue";
  escalation_level: number;
  escalation_title: string;
  next_escalation_at?: string;
  evidence_count: number;
  resolution_details?: {
    action_taken?: string;
    completion_date?: string;
    officer_info?: string;
    before_url?: string;
    after_url?: string;
    remarks?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface DuplicateMatchResult {
  similarity_score: number; // 0 to 100
  is_candidate: boolean; // >= 60%
  is_strong_match: boolean; // >= 80%
  reasons: string[];
  matched_master_issue?: MasterIssue;
}

/**
 * Calculates Haversine GPS Distance between two coordinates in Kilometers
 */
export function calculateGpsDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes Keyword Overlap (Jaccard Index) between two text strings
 */
export function computeKeywordOverlap(textA: string, textB: string): number {
  const cleanA = new Set(
    textA.toLowerCase().replace(/[^\w\s]/gi, "").split(/\s+/).filter((w) => w.length > 3)
  );
  const cleanB = new Set(
    textB.toLowerCase().replace(/[^\w\s]/gi, "").split(/\s+/).filter((w) => w.length > 3)
  );
  if (cleanA.size === 0 || cleanB.size === 0) return 0;
  let intersection = 0;
  cleanA.forEach((word) => {
    if (cleanB.has(word)) intersection++;
  });
  const union = new Set([...cleanA, ...cleanB]).size;
  return union > 0 ? (intersection / union) * 100 : 0;
}

/**
 * Evaluates similarity between a target report and an existing Master Issue / Report
 */
export function evaluateReportSimilarity(
  newReport: Partial<CivicReport>,
  existing: MasterIssue | CivicReport
): DuplicateMatchResult {
  let totalScore = 0;
  const reasons: string[] = [];

  // 1. Category Matching (Weight: 25%)
  if (newReport.category && existing.category && newReport.category.toLowerCase() === existing.category.toLowerCase()) {
    totalScore += 25;
    reasons.push("Same civic category (" + existing.category + ")");
  }

  // 2. District & Block Locality (Weight: 20%)
  if (newReport.district && existing.district && newReport.district.toLowerCase() === existing.district.toLowerCase()) {
    totalScore += 10;
    reasons.push("Same district (" + existing.district + ")");
    if (
      newReport.block_ward &&
      existing.block_ward &&
      newReport.block_ward.toLowerCase() === existing.block_ward.toLowerCase()
    ) {
      totalScore += 10;
      reasons.push("Same ward/block (" + existing.block_ward + ")");
    }
  }

  // 3. GPS Proximity (Weight: 25%)
  const distanceKm = calculateGpsDistanceKm(
    newReport.latitude,
    newReport.longitude,
    existing.latitude,
    existing.longitude
  );

  if (distanceKm !== null) {
    if (distanceKm <= 0.5) {
      totalScore += 25;
      reasons.push(`Very close location (${(distanceKm * 1000).toFixed(0)} meters)`);
    } else if (distanceKm <= 2.0) {
      totalScore += 15;
      reasons.push(`Nearby location (${distanceKm.toFixed(1)} km)`);
    } else if (distanceKm <= 5.0) {
      totalScore += 5;
    }
  }

  // 4. Keyword / Description Similarity (Weight: 20%)
  const textScore = computeKeywordOverlap(
    `${newReport.title || ""} ${newReport.description || ""}`,
    `${existing.title || ""} ${existing.description || ""}`
  );
  if (textScore > 0) {
    const weightedText = Math.min(20, Math.round((textScore / 50) * 20));
    totalScore += weightedText;
    if (weightedText > 5) {
      reasons.push(`High text keyword overlap (${textScore.toFixed(0)}%)`);
    }
  }

  // 5. Time Window Proximity (Weight: 10%)
  if (newReport.created_at && existing.created_at) {
    const diffDays =
      Math.abs(new Date(newReport.created_at).getTime() - new Date(existing.created_at).getTime()) /
      (1000 * 3600 * 24);
    if (diffDays <= 7) {
      totalScore += 10;
      reasons.push("Reported within the same week");
    } else if (diffDays <= 30) {
      totalScore += 5;
    }
  }

  const finalScore = Math.min(100, Math.round(totalScore));
  return {
    similarity_score: finalScore,
    is_candidate: finalScore >= 60,
    is_strong_match: finalScore >= 80,
    reasons,
  };
}

/**
 * Formats a Master Issue tracking ID: JST-RD-2026-XXXXX
 */
export function generateMasterIssueId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `JST-RD-${year}-${randomNum}`;
}

/**
 * Creates a new Master Issue from an individual report
 */
export function createMasterIssueFromReport(report: CivicReport, departmentName?: string): MasterIssue {
  const masterId = generateMasterIssueId();
  const createdDate = report.created_at || new Date().toISOString();
  
  // Default SLA: 30 days from creation
  const slaDeadline = new Date(new Date(createdDate).getTime() + 30 * 24 * 3600 * 1000).toISOString();

  return {
    id: "master-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
    master_issue_id: masterId,
    title: report.title,
    description: report.description,
    category: report.category || "Infrastructure",
    district: report.district || "Ranchi",
    block_ward: report.block_ward || "Ward 1",
    panchayat: report.panchayat || "Central Panchayat",
    village: report.village || "Ranchi Urban",
    latitude: report.latitude || 23.3441,
    longitude: report.longitude || 85.3096,
    affected_area: `${report.district || "Ranchi"} - ${report.block_ward || "Local Ward"}`,
    total_linked_reports: 1,
    total_affected_users: 1,
    affected_villages_count: 1,
    first_reported_at: createdDate,
    latest_report_at: createdDate,
    assigned_department: departmentName || "Public Works Department (PWD)",
    assigned_officer_name: "District Executive Engineer",
    assigned_officer_contact: "+91-651-2400112",
    current_status: "Submitted",
    priority_level: "Medium",
    priority_score: 45,
    sla_deadline: slaDeadline,
    sla_status: "on_time",
    escalation_level: 1,
    escalation_title: "Ward Engineer / Local Officer",
    evidence_count: (report.media_url ? 1 : 0) + (report.audio_url ? 1 : 0),
    created_at: createdDate,
    updated_at: new Date().toISOString(),
  };
}
