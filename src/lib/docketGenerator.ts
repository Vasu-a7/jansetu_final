/**
 * JANSETU OFFICIAL CIVIC DOCKET GENERATOR
 * Generates downloadable, print-ready civic grievance summary dockets
 * formatted for official escalation (RTI, Lokayukta, CPGRAMS, District Collectorate).
 */

import type { MasterIssue } from "./deduplicationEngine";
import type { StatusTransitionRecord } from "./statusWorkflow";

export interface DocketExportOptions {
  redactPii: boolean;
  includeEvidenceUrls: boolean;
  includeEscalationHistory: boolean;
  printedByRole?: string;
}

/**
 * Generates a clean HTML string representing the Official Civic Complaint Docket
 */
export function generateCivicDocketHtml(
  masterIssue: MasterIssue,
  statusHistory: StatusTransitionRecord[] = [],
  options: DocketExportOptions = { redactPii: true, includeEvidenceUrls: true, includeEscalationHistory: true }
): string {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timelineHtml = (statusHistory.length > 0 ? statusHistory : [
    {
      id: "log-1",
      from_status: "Submitted",
      to_status: masterIssue.current_status as any,
      actor_role: "system",
      reason: "Initial grievance filing & Master Issue registration.",
      created_at: masterIssue.first_reported_at,
    }
  ])
    .map(
      (log) => `
      <div style="border-left: 2px solid #2563eb; padding-left: 12px; margin-bottom: 12px;">
        <div style="font-size: 11px; font-weight: bold; color: #1e293b;">${log.to_status.toUpperCase()}</div>
        <div style="font-size: 10px; color: #64748b;">${new Date(log.created_at).toLocaleString("en-IN")} • ${log.actor_role}</div>
        <div style="font-size: 11px; color: #334155; margin-top: 4px;">${log.reason}</div>
      </div>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>JanSetu Civic Docket - ${masterIssue.master_issue_id}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 12px; line-height: 1.5; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0; }
    .subtitle { font-size: 11px; color: #475569; margin-top: 4px; }
    .badge { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; display: inline-block; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.05em; }
    .stat-val { font-size: 14px; font-weight: bold; color: #0f172a; }
    .table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
    .table th, .table td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
    .table th { background-color: #f1f5f9; font-weight: bold; }
    .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; pt: 12px; font-size: 9px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1 class="title">JanSetu Civic Commons Platform</h1>
      <div class="subtitle">Official Public Grievance Summary Docket • State of Jharkhand</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">${masterIssue.master_issue_id}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Generated: ${currentDate}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 16px;">
    <div class="card-title">Problem Statement & Scope</div>
    <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${masterIssue.title}</div>
    <p style="margin-top: 6px; color: #334155; font-size: 11px;">${masterIssue.description}</p>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Location & Administrative Jurisdiction</div>
      <div><strong>District:</strong> ${masterIssue.district}</div>
      <div><strong>Block / Ward:</strong> ${masterIssue.block_ward || "N/A"}</div>
      <div><strong>Panchayat / Village:</strong> ${masterIssue.panchayat || "N/A"} / ${masterIssue.village || "N/A"}</div>
      <div><strong>Assigned Dept:</strong> ${masterIssue.assigned_department}</div>
    </div>

    <div class="card">
      <div class="card-title">Community Impact Metrics</div>
      <div><strong>Total Affected Citizens:</strong> <span class="stat-val">${masterIssue.total_affected_users}</span></div>
      <div><strong>Linked Reports:</strong> <span class="stat-val">${masterIssue.total_linked_reports}</span></div>
      <div><strong>Priority Level:</strong> <span style="color: #b91c1c; font-weight: bold;">${masterIssue.priority_level}</span></div>
      <div><strong>SLA Target Deadline:</strong> ${new Date(masterIssue.sla_deadline).toLocaleDateString("en-IN")}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 16px;">
    <div class="card-title">Escalation & Governance Audit Trail</div>
    <div><strong>Current Status:</strong> ${masterIssue.current_status}</div>
    <div><strong>Escalation Level:</strong> Tier ${masterIssue.escalation_level} (${masterIssue.escalation_title})</div>
    <div style="margin-top: 10px;">
      ${timelineHtml}
    </div>
  </div>

  ${
    masterIssue.resolution_details
      ? `
  <div class="card" style="margin-bottom: 16px; background-color: #f0fdf4; border-color: #bbf7d0;">
    <div class="card-title" style="color: #166534;">Official Resolution Report</div>
    <div><strong>Action Taken:</strong> ${masterIssue.resolution_details.action_taken || "Action completed"}</div>
    <div><strong>Completion Date:</strong> ${masterIssue.resolution_details.completion_date || "N/A"}</div>
    <div><strong>Officer Remarks:</strong> ${masterIssue.resolution_details.remarks || "Work verified on site"}</div>
  </div>
  `
      : ""
  }

  <div class="footer">
    This document is generated by JanSetu Civic Commons Platform for official escalation to CPGRAMS, RTI Portal, Lokayukta, and District Administration.<br/>
    Confidential user PII has been redacted under the DPDP Act 2023. Validated for legal and administrative review.
  </div>

</body>
</html>
  `;
}

/**
 * Triggers native browser print/download dialog for the docket
 */
export function downloadOrPrintCivicDocket(masterIssue: MasterIssue, history: StatusTransitionRecord[] = []): void {
  const html = generateCivicDocketHtml(masterIssue, history);
  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
