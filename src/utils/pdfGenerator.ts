import { jsPDF } from 'jspdf';
import { IncidentReport, BodyPartKey } from '../types';

export const BODY_PART_LABELS: Record<BodyPartKey, string> = {
  head: 'Head',
  eye: 'Eyes',
  face: 'Face',
  ear: 'Ears',
  throat_neck: 'Throat & Neck',
  tooth_teeth: 'Tooth/Teeth',
  shoulder: 'Shoulder',
  lungs: 'Lungs',
  breast: 'Breast/Chest',
  back: 'Back',
  elbow: 'Elbow',
  abdomen_pelvis: 'Abdomen & Pelvis',
  arm: 'Arm',
  hip_leg: 'Hip & Leg',
  hand_wrist: 'Hand & Wrist',
  finger: 'Fingers',
  groin: 'Groin',
  knee: 'Knee',
  foot_ankle: 'Foot & Ankle',
  toe: 'Toes'
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  suddenEvent: '1. Sudden, unexpected event',
  externalCause: '2. Caused by external physical force',
  injuryCausedByEvent: '3. Personal injury caused by event',
  causalLink: '4. Causal link established',
  occurredInWorkEnvironment: '5. Event occurred in workplace',
  workRelated: '6. Incident is work-related (DKSH)',
  resultsInDeath: '7. Results in Death',
  recoveryMoreThan6Months: '8. Recovery > 6 months',
  absenceMoreThanOneDay: '9. Absence > 1 calendar day (LTI)',
  restrictedWorkOrChangeRole: '10. Restricted work/role change',
  lossOfConsciousness: '11. Loss of consciousness',
  medicalTreatmentBeyondFirstAid: '12. Medical treatment (MTC)',
  significantInjuryDiagnosedByPhysician: '13. Diagnosed significant injury',
  firstAidOnly: '14. First-aid treatment only (FAC)',
  equipmentOrPropertyDamage: '15. Equipment/property damage (PD)',
  potentialToCauseInjury: '16. Had potential (Near Miss)',
  hazardObservationPotentialHarm: '17. Hazard observation'
};

export function exportReportToPDF(report: IncidentReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  const contentWidth = pageWidth - (marginX * 2); // 180mm

  let y = 15;
  let pageNum = 1;

  // Helper to draw Header & Footer on each page
  const drawHeaderAndFooter = (currentPage: number) => {
    // Top colored brand bar
    doc.setFillColor(157, 34, 53); // DKSH Red
    doc.rect(marginX, 10, contentWidth, 5, 'F');
    
    // Header text
    doc.setTextColor(157, 34, 53);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`DKSH HEALTH, SAFETY & ENVIRONMENT (HSE) COMPLIANCE AUDIT`, marginX, 20);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`REPORT ID: ${report.id}`, pageWidth - marginX, 20, { align: 'right' });

    // Header divider line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginX, 22, pageWidth - marginX, 22);

    // Footer
    doc.line(marginX, pageHeight - 15, pageWidth - marginX, pageHeight - 15);
    doc.setFontSize(7);
    doc.text(`CONFIDENTIAL - DKSH HSE COMPLIANCE AUDIT RECORD SYSTEM`, marginX, pageHeight - 10);
    doc.text(`Page ${currentPage}`, pageWidth - marginX, pageHeight - 10, { align: 'right' });
  };

  const checkPageSpace = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 20) {
      doc.addPage();
      pageNum++;
      y = 30; // reset y on new page
      drawHeaderAndFooter(pageNum);
    }
  };

  // Draw first page header/footer
  drawHeaderAndFooter(pageNum);
  y = 30; // initial content start y

  // Title block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  const titleLines = doc.splitTextToSize(report.occurrenceTitle || 'HSE Compliance Ticket', contentWidth);
  doc.text(titleLines, marginX, y);
  y += (titleLines.length * 5) + 4;

  // Document Info Sub-header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(157, 34, 53);
  doc.text(`HSE COMPLIANCE AUDIT REPORT`, marginX, y);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - marginX, y, { align: 'right' });
  y += 6;

  // Horizontal divider
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6;

  // ==========================================
  // SECTION 1: OCCURRENCE CONTEXT
  // ==========================================
  checkPageSpace(50);
  doc.setFillColor(248, 250, 252); // slate-50 background for section
  doc.rect(marginX, y, contentWidth, 36, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200 border
  doc.rect(marginX, y, contentWidth, 36, 'S');

  // Left Section header bar
  doc.setFillColor(157, 34, 53); // Red Left Border
  doc.rect(marginX, y, 1.5, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('STEP 1: OCCURRENCE CONTEXT', marginX + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500

  // Column 1
  doc.text('OCCURRENCE DATE/TIME:', marginX + 4, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.date} at ${report.time}`, marginX + 4, y + 18);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SITE LOCATION DC / MARKET:', marginX + 65, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const locStr = `${report.location} (${report.country})`;
  const locLines = doc.splitTextToSize(locStr, 55);
  doc.text(locLines, marginX + 65, y + 18);

  // Column 3
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('EVENT CATEGORY (TYPE):', marginX + 125, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(157, 34, 53); // DKSH Red for Category
  doc.text(report.category.toUpperCase(), marginX + 125, y + 18);

  // CC list & Status on next line in context
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CC RECIPIENTS:', marginX + 4, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(report.emailToCc || 'No CC list specified', marginX + 4, y + 30);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('REPORT STATUS:', marginX + 125, y + 26);
  doc.setFont('helvetica', 'bold');
  const statusStr = report.status === 'draft' ? 'DRAFT' : report.status === 'investigating' ? 'INVESTIGATING (LVL 2)' : 'CLOSED & VERIFIED';
  doc.setTextColor(report.status === 'closed' ? 16 : 245, report.status === 'closed' ? 185 : 158, report.status === 'closed' ? 129 : 11);
  doc.text(statusStr, marginX + 125, y + 30);

  y += 42;

  // ==========================================
  // SECTION 2: DETAILS OF PERSON INVOLVED & WITNESS
  // ==========================================
  checkPageSpace(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('STEP 2: DETAILS OF PERSON INVOLVED & WITNESS', marginX, y);
  y += 4;

  // Involved Persons Subheading
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(`2.1 Involved Personnel Roster (${report.involvedPersons?.length || 0} Persons Involved)`, marginX, y);
  y += 3;

  if (report.involvedPersons && report.involvedPersons.length > 0) {
    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Name', marginX + 2, y + 4.5);
    doc.text('Staff ID', marginX + 35, y + 4.5);
    doc.text('Dept / BU', marginX + 60, y + 4.5);
    doc.text('Employment', marginX + 115, y + 4.5);
    doc.text('Injured Status', marginX + 145, y + 4.5);
    doc.text('Event Location', marginX + 168, y + 4.5);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);

    report.involvedPersons.forEach((p) => {
      checkPageSpace(8);
      doc.setFillColor(255, 255, 255);
      doc.rect(marginX, y, contentWidth, 6.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.text(p.name, marginX + 2, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.text(p.staffId || 'N/A', marginX + 35, y + 4.5);
      
      const deptStr = `${p.department}${p.businessUnit ? ` (${p.businessUnit})` : ''}`;
      const wrappedDept = doc.splitTextToSize(deptStr, 52);
      doc.text(wrappedDept[0] || '', marginX + 60, y + 4.5);
      
      doc.text(p.isEmployee ? 'Employee' : 'Other Worker', marginX + 115, y + 4.5);
      doc.setFont('helvetica', 'bold');
      if (p.isInjured) {
        doc.setTextColor(185, 28, 28); // red-700
        doc.text('Yes (Injured)', marginX + 145, y + 4.5);
      } else {
        doc.setTextColor(71, 85, 105);
        doc.text('No (Involved)', marginX + 145, y + 4.5);
      }
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(p.placeOfEvent || 'N/A', marginX + 168, y + 4.5);
      y += 6.5;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No personnel registered in involved roster.', marginX + 2, y + 4);
    y += 6;
  }
  y += 3;

  // Witness Roster Subheading
  checkPageSpace(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`2.2 Witness Roster (${report.witnesses?.length || 0} Witnesses Logged)`, marginX, y);
  y += 3;

  if (report.witnesses && report.witnesses.length > 0) {
    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Witness Name', marginX + 2, y + 4.5);
    doc.text('Staff ID / ID No.', marginX + 50, y + 4.5);
    doc.text('Department / BU', marginX + 95, y + 4.5);
    doc.text('Employment Status', marginX + 150, y + 4.5);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);

    report.witnesses.forEach((w) => {
      checkPageSpace(8);
      doc.setFillColor(255, 255, 255);
      doc.rect(marginX, y, contentWidth, 6.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.text(w.name, marginX + 2, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.text(w.staffId || 'N/A', marginX + 50, y + 4.5);
      const deptStr = `${w.department}${w.businessUnit ? ` (${w.businessUnit})` : ''}`;
      doc.text(deptStr, marginX + 95, y + 4.5);
      doc.text(w.isEmployee ? 'Employee' : 'Other / Contractor', marginX + 150, y + 4.5);
      y += 6.5;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No witnesses registered for this incident.', marginX + 2, y + 4);
    y += 6;
  }
  y += 5;

  // ==========================================
  // SECTION 3: OCCURRENCE DETAIL / RISK CRITERIA & PHYSICAL TRAUMA
  // ==========================================
  checkPageSpace(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('STEP 3: OCCURRENCE NARRATIVE & RISK CLASSIFICATION', marginX, y);
  y += 4;

  // Narrative Box
  doc.setFillColor(253, 251, 247); // warm off-white
  doc.setDrawColor(241, 229, 211);
  const narrativeText = report.eventDescription || 'No detailed narrative provided.';
  const wrappedNarrative = doc.splitTextToSize(narrativeText, contentWidth - 8);
  const boxHeight = (wrappedNarrative.length * 4) + 12;

  checkPageSpace(boxHeight + 10);
  doc.rect(marginX, y, contentWidth, boxHeight, 'F');
  doc.rect(marginX, y, contentWidth, boxHeight, 'S');

  // Left border
  doc.setFillColor(217, 119, 6);
  doc.rect(marginX, y, 1.2, boxHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('DETAILED INCIDENT OCCURRENCE NARRATIVE:', marginX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(wrappedNarrative, marginX + 4, y + 12);
  y += boxHeight + 6;

  // Injury checklist & Affected parts split
  checkPageSpace(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const isHazardObs = report.category === 'Hazard Observation';
  doc.text(isHazardObs ? '3.1 HSE Compliance Checklist' : '3.1 Injury Type & Body Parts Traumatized', marginX, y);
  y += 4;

  const leftX = marginX;
  const colWidth = (contentWidth / 2) - 4; // 86mm
  const rightX = isHazardObs ? marginX : (marginX + colWidth + 8); // 109mm
  
  let currentYLeft = y;
  let currentYRight = y;

  if (!isHazardObs) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('MAIN WORK-RELATED INJURY TYPES:', leftX, currentYLeft + 3);
    currentYLeft += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    if (report.injuryType && report.injuryType.length > 0) {
      report.injuryType.forEach((t) => {
        doc.text(`• ${t}`, leftX + 2, currentYLeft);
        currentYLeft += 4;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('No specific work injury type classified.', leftX + 2, currentYLeft);
      currentYLeft += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
    }
    currentYLeft += 2;

    doc.setFont('helvetica', 'bold');
    doc.text('AFFECTED BODY PARTS LOGGED:', leftX, currentYLeft + 3);
    currentYLeft += 6;

    doc.setFont('helvetica', 'normal');
    const activeParts = Object.entries(report.affectedBodyParts || {})
      .filter(([_, val]) => val === true)
      .map(([key]) => BODY_PART_LABELS[key as BodyPartKey] || key);

    if (activeParts.length > 0) {
      activeParts.forEach((part) => {
        doc.text(`• ${part}`, leftX + 2, currentYLeft);
        currentYLeft += 4;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('No physical trauma to body parts reported.', leftX + 2, currentYLeft);
      currentYLeft += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
    }
  } else {
    currentYLeft = y;
  }

  // ========================================================
  // RIGHT COLUMN: HSE COMPLIANCE CRITERIA CHECKLIST
  // ========================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('HSE COMPLIANCE CRITERIA CHECKLIST:', rightX, currentYRight + 3);
  currentYRight += 6;

  doc.setFontSize(6.5);
  Object.entries(report.classification || {}).forEach(([key, value]) => {
    let isTrue = false;
    let detailStr = '';

    if (typeof value === 'boolean') {
      isTrue = value;
      detailStr = isTrue ? 'YES' : 'NO';
    } else if (value && typeof value === 'object') {
      const obj = value as any;
      isTrue = !!obj.yes;
      detailStr = isTrue ? 'YES' : 'NO';
      if (key === 'absenceMoreThanOneDay' && isTrue && obj.lostTimeDays) {
        detailStr += ` (${obj.lostTimeDays} days LTI)`;
      }
    }

    const label = CLASSIFICATION_LABELS[key] || key;
    
    doc.setFont('helvetica', isTrue ? 'bold' : 'normal');
    doc.setTextColor(isTrue ? 6 : 100, isTrue ? 95 : 116, isTrue ? 70 : 139);
    doc.text(`[${detailStr}]  ${label}`, rightX, currentYRight);
    currentYRight += 3.4;
  });

  y = Math.max(currentYLeft, currentYRight) + 6;

  // ==========================================
  // SECTION 4: INVESTIGATION & ACTIONS
  // ==========================================
  checkPageSpace(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('STEP 4: INVESTIGATION, CORRECTIVE ACTIONS & SIGN-OFF', marginX, y);
  y += 4;

  if (!isHazardObs) {
    checkPageSpace(40);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('4.1 Root Cause Investigation (The 5-Why Methodology)', marginX, y);
    y += 3.5;

    const whyFields = [
      { label: 'Why 1 (Incident Occurred):', val: report.investigation?.whyHappened },
      { label: 'Why 2 (Immediate Cause):', val: report.investigation?.whyFirstCause },
      { label: 'Why 3 (System Failure):', val: report.investigation?.whySystemFailed },
      { label: 'Why 4 (Control Ineffectiveness):', val: report.investigation?.whyControlIneffective },
      { label: 'Why 5 (Process Gap - Root Cause):', val: report.investigation?.whyGapExists }
    ];

    whyFields.forEach((why) => {
      checkPageSpace(14);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(230, 230, 230);
      
      const textVal = why.val || 'Not analyzed/empty.';
      const wrappedWhyText = doc.splitTextToSize(textVal, contentWidth - 6);
      const whyCardHeight = (wrappedWhyText.length * 3.5) + 6;
      
      doc.rect(marginX, y, contentWidth, whyCardHeight, 'F');
      doc.rect(marginX, y, contentWidth, whyCardHeight, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(79, 70, 229);
      doc.text(why.label, marginX + 3, y + 4.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(wrappedWhyText, marginX + 3, y + 8.5);
      
      y += whyCardHeight + 2;
    });
    y += 2;
  }

  checkPageSpace(30);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('4.2 Proposed Corrective and Preventive Action (CAPA)', marginX, y);
  y += 3.5;

  checkPageSpace(18);
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(230, 230, 230);
  const corrText = report.actions?.immediateCorrective || 'N/A';
  const wrappedCorr = doc.splitTextToSize(corrText, contentWidth - 6);
  const corrHeight = (wrappedCorr.length * 3.5) + 6;
  doc.rect(marginX, y, contentWidth, corrHeight, 'F');
  doc.rect(marginX, y, contentWidth, corrHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('IMMEDIATE CORRECTIVE ACTION:', marginX + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(wrappedCorr, marginX + 3, y + 8.5);
  y += corrHeight + 2;

  checkPageSpace(18);
  doc.setFillColor(250, 250, 250);
  const prevText = report.actions?.longTermPreventive || 'N/A';
  const wrappedPrev = doc.splitTextToSize(prevText, contentWidth - 6);
  const prevHeight = (wrappedPrev.length * 3.5) + 6;
  doc.rect(marginX, y, contentWidth, prevHeight, 'F');
  doc.rect(marginX, y, contentWidth, prevHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('LONG-TERM PREVENTIVE ACTION:', marginX + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(wrappedPrev, marginX + 3, y + 8.5);
  y += prevHeight + 2;

  checkPageSpace(8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`TARGET COMPLETION DATE:  ${report.actions?.completionDate || 'N/A'}`, marginX, y + 4);
  y += 8;

  checkPageSpace(35);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('4.3 Verification, Sign-Off Close & Remarks', marginX, y);
  y += 3.5;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  
  const remarksText = report.verification?.remarks || 'No verification remarks.';
  const closeRemarksText = report.closeRemarks || 'No supplementary close notes.';
  
  const wrappedRem = doc.splitTextToSize(remarksText, contentWidth - 6);
  const wrappedCloseRem = doc.splitTextToSize(closeRemarksText, contentWidth - 6);
  const signoffHeight = (wrappedRem.length * 3.5) + (wrappedCloseRem.length * 3.5) + 18;

  checkPageSpace(signoffHeight + 5);
  doc.rect(marginX, y, contentWidth, signoffHeight, 'F');
  doc.rect(marginX, y, contentWidth, signoffHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text(`VERIFIED BY:  ${report.verification?.verifiedBy || 'Pending Verification'}`, marginX + 3, y + 6);
  doc.text(`DATE OF VERIFICATION:  ${report.verification?.dateOfVerification || 'Pending'}`, marginX + 110, y + 6);

  doc.setFontSize(6.5);
  doc.setTextColor(74, 85, 104);
  doc.text('VERIFICATION DETAILS & REMARKS:', marginX + 3, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(wrappedRem, marginX + 3, y + 16);

  let currentYOffset = y + 16 + (wrappedRem.length * 3.5) + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(74, 85, 104);
  doc.text('SUPPLEMENTARY CLOSING REMARKS:', marginX + 3, currentYOffset);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(wrappedCloseRem, marginX + 3, currentYOffset + 4);

  y += signoffHeight + 5;

  doc.save(`DKSH_HSE_Audit_Report_${report.id}.pdf`);
}
