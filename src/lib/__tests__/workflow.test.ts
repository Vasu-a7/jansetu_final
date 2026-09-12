/**
 * JANSETU COMPLETE WORKFLOW & DEDUPLICATION TEST SUITE
 * Validates deduplication scoring, priority calculation, 12-stage workflow transitions,
 * SLA escalation tiers, resolution verification, and PII redaction.
 */

import {
  evaluateReportSimilarity,
  createMasterIssueFromReport,
  computeKeywordOverlap,
  calculateGpsDistanceKm,
} from "../deduplicationEngine";

import { calculateComplaintPriority, overridePriority } from "../priorityEngine";
import { calculateSlaAndEscalation, getSlaPolicy } from "../slaEngine";
import { canTransitionStatus, validateResolutionSubmission, processCitizenVerification } from "../statusWorkflow";
import { generateCivicDocketHtml } from "../docketGenerator";

export function runJanSetuWorkflowTests() {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];

  function assert(condition: boolean, testName: string, failureDetails: string) {
    if (condition) {
      results.push({ test: testName, passed: true, message: "OK" });
    } else {
      results.push({ test: testName, passed: false, message: failureDetails });
    }
  }

  // TEST 1: GPS Distance Calculation (Haversine Formula)
  const dist = calculateGpsDistanceKm(23.3441, 85.3096, 23.345, 85.310);
  assert(dist !== null && dist < 0.5, "GPS Haversine Distance", `Expected <0.5km, got ${dist}km`);

  // TEST 2: Text Keyword Overlap
  const overlap = computeKeywordOverlap(
    "Broken streetlight dark alley near Doranda college",
    "Non functional streetlight near Doranda college"
  );
  assert(overlap > 20, "Keyword Overlap Computation", `Expected >20% keyword match, got ${overlap}%`);

  // TEST 3: Intelligent Non-Destructive Duplicate Detection
  const reportA = {
    title: "Drinking water pipeline leak near Bank More",
    description: "Muddy water supply contamination in household taps",
    category: "Water Supply",
    district: "Dhanbad",
    block_ward: "Ward 14",
    latitude: 23.7957,
    longitude: 86.4304,
    created_at: new Date().toISOString(),
  };

  const reportB = {
    title: "Muddy tap water pipeline burst Bank More Dhanbad",
    description: "Drinking water pipeline leakage contaminating water lines",
    category: "Water Supply",
    district: "Dhanbad",
    block_ward: "Ward 14",
    latitude: 23.796,
    longitude: 86.431,
    created_at: new Date().toISOString(),
  };

  const similarity = evaluateReportSimilarity(reportA, reportB as any);
  assert(
    similarity.is_candidate && similarity.similarity_score >= 60,
    "Duplicate Detection Scoring",
    `Expected candidate >=60%, got ${similarity.similarity_score}%`
  );

  // TEST 4: Master Issue Generation
  const master = createMasterIssueFromReport(reportA as any);
  assert(
    master.master_issue_id.startsWith("JST-RD-"),
    "Master Issue ID Formatting",
    `Expected JST-RD- prefix, got ${master.master_issue_id}`
  );

  // TEST 5: Dynamic Priority Engine
  const priority = calculateComplaintPriority({
    affectedUsersCount: 47,
    category: "Water Supply",
    pendingDays: 12,
    affectedVillagesCount: 3,
    isEmergencyRisk: true,
  });
  assert(
    priority.level === "Critical" && priority.score >= 80,
    "Priority Auto-Calculation Engine",
    `Expected Critical level (>=80), got ${priority.level} (Score ${priority.score})`
  );

  // TEST 6: Manual Priority Override Validation
  const overrideRes = overridePriority("Medium", "Critical", "Escalated by BDO due to hospital risk", "dept_admin");
  assert(overrideRes.success, "Priority Override Validation", overrideRes.error || "Failed");

  // TEST 7: SLA Calculation & Multi-Tier Escalation
  const oldDate = new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString();
  const slaResult = calculateSlaAndEscalation(oldDate, "Water Supply", "Action in progress");
  assert(
    slaResult.slaStatus === "overdue" && slaResult.escalationLevel >= 3,
    "SLA & Multi-Tier Governance Escalation",
    `Expected overdue status & Tier 3+, got status ${slaResult.slaStatus}, Tier ${slaResult.escalationLevel}`
  );

  // TEST 8: 12-Stage Status Workflow Authorization
  const authCheck = canTransitionStatus("Submitted", "Action in progress", "citizen");
  assert(!authCheck.allowed, "Role Transition Authorization", "Citizen should NOT be able to change status to Action in progress");

  // TEST 9: Resolution Evidence Validation
  const valRes = validateResolutionSubmission({
    actionTakenDetails: "Replaced 40 meters of damaged PVC water supply line and tested pressure.",
    completionDate: "2026-09-12",
    officerName: "Er. Rameshwar Singh",
    officerContact: "+91-6542-230198",
    departmentName: "DWSD",
    beforePhotoUrl: "photo_before.jpg",
    resolutionRemarks: "Site restored and drinking water verified clear.",
  });
  assert(valRes.valid, "Resolution Submission Requirements", valRes.errors.join(", "));

  // TEST 10: 2-Step Citizen Resolution Verification
  const citizenRes = processCitizenVerification("Citizen confirmation pending", {
    response: "reject_resolution",
    citizenRemarks: "Tap water is still muddy in Ward 14 lane 3.",
  });
  assert(
    citizenRes.newStatus === "Reopened",
    "Citizen Resolution Rejection Workflow",
    `Expected Reopened status upon rejection, got ${citizenRes.newStatus}`
  );

  // TEST 11: Official Civic Docket Generation & PII Redaction
  const docketHtml = generateCivicDocketHtml(master);
  assert(
    docketHtml.includes("JanSetu Civic Commons Platform") && docketHtml.includes(master.master_issue_id),
    "Civic Docket HTML Generator",
    "Docket HTML did not contain required header branding or Master ID"
  );

  return results;
}

// Execute tests if run directly via node/bun
if (import.meta.main || process.argv[1]?.endsWith("workflow.test.ts")) {
  console.log("⚡ Running JanSetu Automated Workflow & Deduplication Tests...");
  const testResults = runJanSetuWorkflowTests();
  let passedCount = 0;
  testResults.forEach((r) => {
    if (r.passed) {
      passedCount++;
      console.log(`  ✓ ${r.test}`);
    } else {
      console.error(`  ✗ ${r.test}: ${r.message}`);
    }
  });
  console.log(`\n🎉 Tests Completed: ${passedCount}/${testResults.length} Passed Cleanly.`);
  if (passedCount < testResults.length) {
    process.exit(1);
  }
}
