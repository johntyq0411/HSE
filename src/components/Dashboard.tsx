/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { IncidentReport, WorkingHoursEntry, UserRole, BodyPartKey, IncidentCategory } from '../types';
import { COUNTRIES, MONTHS, calculateSafetyMetrics, getMetricValueForReport } from '../utils';
import { exportReportToPDF } from '../utils/pdfGenerator';
import HumanFigure from './HumanFigure';
import {
  HeartPulse,
  TrendingUp,
  Clock,
  Maximize2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  ListTodo,
  FileSpreadsheet,
  ExternalLink,
  FileText,
  X,
  ShieldCheck,
  Activity,
  UserCheck,
  FileDown,
  Users,
  Lock
} from 'lucide-react';

interface DashboardProps {
  userRole: UserRole;
  userCountry: string;
  setUserRole?: (r: UserRole) => void;
  setUserCountry?: (c: string) => void;
  reports: IncidentReport[];
  workingHours: WorkingHoursEntry[];
  onSaveWorkingHours: (entry: WorkingHoursEntry) => void;
  filterCountry: string;
  setFilterCountry: (c: string) => void;
}

// Convert a Date object to YYYY-MM-DD local string
const formatDateToYYYYMMDD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const rMin = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${rMin}`;
};

// Find all month-year pairs that completely or partially overlap with the range
const getOverlappingMonths = (start: Date, end: Date) => {
  const result: { year: number; monthStr: string; monthIndex: number }[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const finish = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (current <= finish) {
    const yr = current.getFullYear();
    const mIdx = current.getMonth();
    result.push({
      year: yr,
      monthStr: MONTHS[mIdx],
      monthIndex: mIdx
    });
    current.setMonth(current.getMonth() + 1);
  }
  return result;
};

// Format Date object to dynamic friendly label
const formatDateLabel = (d: Date) => {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const BODY_PART_LABELS: Record<BodyPartKey, string> = {
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

const getReportWorkerType = (r: IncidentReport) => {
  if (!r.involvedPersons || r.involvedPersons.length === 0) return 'N/A';
  const hasEmp = r.involvedPersons.some(p => p.isEmployee);
  const hasOth = r.involvedPersons.some(p => !p.isEmployee);
  if (hasEmp && hasOth) return 'Employee & Contractor';
  if (hasEmp) return 'Employee';
  if (hasOth) return 'Contractor / Third Party';
  return 'N/A';
};

const getBodyPartsAffected = (r: IncidentReport) => {
  if (!r.affectedBodyParts) return 'None';
  const parts = Object.entries(r.affectedBodyParts)
    .filter(([_, val]) => val === true)
    .map(([key]) => BODY_PART_LABELS[key as BodyPartKey] || key);
  return parts.length > 0 ? parts.join(', ') : 'None';
};

const getClassificationLabel = (r: IncidentReport) => {
  const checks: string[] = [];
  const cl = r.classification;
  if (!cl) return 'None';
  if (cl.resultsInDeath?.yes) checks.push('Results in Death (No.7)');
  if (cl.recoveryMoreThan6Months?.yes) checks.push('Recovery >6 Months (No.8)');
  if (cl.absenceMoreThanOneDay?.yes) checks.push('Absence >1 Day / LTI (No.9)');
  if (cl.restrictedWorkOrChangeRole?.yes) checks.push('Restricted Work (No.10)');
  if (cl.lossOfConsciousness?.yes) checks.push('Loss of Consciousness (No.11)');
  if (cl.medicalTreatmentBeyondFirstAid?.yes) checks.push('MTC Beyond First Aid (No.12)');
  if (cl.significantInjuryDiagnosedByPhysician?.yes) checks.push('Significant Injury (No.13)');
  if (cl.firstAidOnly?.yes) checks.push('First Aid Only (No.14)');
  if (cl.equipmentOrPropertyDamage) checks.push('Property Damage (No.15)');
  if (cl.potentialToCauseInjury) checks.push('Near Miss (No.16)');
  if (cl.hazardObservationPotentialHarm) checks.push('Hazard Obs (No.17)');
  return checks.length > 0 ? checks.join(', ') : 'None';
};

const getReportsForMetric = (reportsList: IncidentReport[], metricKey: string) => {
  return reportsList.filter(r => getMetricValueForReport(r, metricKey) > 0);
};

export default function Dashboard({
  userRole,
  userCountry,
  setUserRole,
  setUserCountry,
  reports,
  workingHours,
  onSaveWorkingHours,
  filterCountry,
  setFilterCountry
}: DashboardProps) {
  // Date range picker states (dynamic and highly user friendly)
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1)); // Default: Jan 1, 2026
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 4, 31)); // Default: May 31, 2026 (Routine Audit Range)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState<boolean>(true);

  // Temporary picker states before Apply is clicked
  const [tempStartDate, setTempStartDate] = useState<Date | null>(new Date(2026, 0, 1));
  const [tempEndDate, setTempEndDate] = useState<Date | null>(new Date(2026, 4, 31));

  // Navigation states inside the calendar
  const [calYear, setCalYear] = useState<number>(2026);
  const [calMonth, setCalMonth] = useState<number>(4); // Default to navigated month May (0-index of MONTHS)

  // Quick preset ranges definition
  const PRESETS = [
    { label: 'Jan — Apr 2026 (Populated)', start: new Date(2026, 0, 1), end: new Date(2026, 3, 30) },
    { label: 'Jan — May 2026 (Routine Audit)', start: new Date(2026, 0, 1), end: new Date(2026, 4, 31) },
    { label: 'Year To Date (2026)', start: new Date(2026, 0, 1), end: new Date(2026, 5, 23) },
    { label: 'Q1 2026', start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) },
    { label: 'Full Year 2026', start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) },
    { label: 'Full Year 2025 (Historical)', start: new Date(2025, 0, 1), end: new Date(2025, 11, 31) }
  ];

  const applyPreset = (start: Date, end: Date) => {
    setTempStartDate(start);
    setTempEndDate(end);
    setStartDate(start);
    setEndDate(end);
    setIsDatePickerOpen(false);
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(calYear, calMonth, day);
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(clickedDate);
      setTempEndDate(null);
    } else {
      if (clickedDate < tempStartDate) {
        setTempStartDate(clickedDate);
      } else {
        setTempEndDate(clickedDate);
      }
    }
  };

  // Generate days array for active navigated calendar month/year
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridCells = [...blanks, ...days];

  // Worker category filter
  const [filterWorkerType, setFilterWorkerType] = useState<'Overall' | 'Employee' | 'Other Worker'>('Overall');

  // Incident category filter from step 1
  const [filterIncidentCategory, setFilterIncidentCategory] = useState<'Overall' | IncidentCategory>('Overall');

  // Body part filter
  const [filterBodyPart, setFilterBodyPart] = useState<BodyPartKey | 'Overall'>('Overall');

  // Selected card state for detailed view and modal export
  const [selectedEnlargedCard, setSelectedEnlargedCard] = useState<any | null>(null);
  const [selectedDetailReport, setSelectedDetailReport] = useState<IncidentReport | null>(null);
  const [hoveredModalMonthIdx, setHoveredModalMonthIdx] = useState<number | null>(null);

  // Temporary state for entering missing working hours
  const [selectedMissingIndex, setSelectedMissingIndex] = useState<number>(0);
  const [inputEmployeeHours, setInputEmployeeHours] = useState<string>('117000');
  const [inputOtherHours, setInputOtherHours] = useState<string>('63000');
  const [inputOverallHours, setInputOverallHours] = useState<string>('180000');
  const [hoursFeedback, setHoursFeedback] = useState<string | null>(null);

  const handleEmployeeHoursChange = (val: string) => {
    setInputEmployeeHours(val);
    const emp = parseFloat(val) || 0;
    const oth = parseFloat(inputOtherHours) || 0;
    setInputOverallHours((emp + oth).toString());
  };

  const handleOtherHoursChange = (val: string) => {
    setInputOtherHours(val);
    const emp = parseFloat(inputEmployeeHours) || 0;
    const oth = parseFloat(val) || 0;
    setInputOverallHours((emp + oth).toString());
  };

  // Interactive chart state to prevent jumps and display comprehensive details
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Lock view to home country if regular coordinator
  const finalCountryFilter = userRole === 'Superuser' ? filterCountry : userCountry;

  // 1. DYNAMICALLY DETECT IF SELECTED FILTER HAS RECORDED HOURS
  // If month is 'Overall', we need the sum of all monthly records for that year.
  // If specific month, we check if that specific month has a record.
  const hoursCheck = useMemo(() => {
    const targetCountries = finalCountryFilter === 'Overall' ? COUNTRIES : [finalCountryFilter];
    const overlappingMonths = getOverlappingMonths(startDate, endDate);

    let totalHrs = 0;
    let missingInfo: { country: string; year: number; month: string }[] = [];

    targetCountries.forEach(cty => {
      overlappingMonths.forEach(om => {
        // June 2026 onwards shouldn't be counted as missing since the month/year is not finished yet
        if (om.year === 2026 && om.monthIndex >= 5) {
          const found = workingHours.find(
            wh => wh.country === cty && wh.year === om.year && wh.month === om.monthStr
          );
          if (found) {
            if (filterWorkerType === 'Employee') {
              totalHrs += found.employeeHours !== undefined ? found.employeeHours : Math.round(found.hours * 0.65);
            } else if (filterWorkerType === 'Other Worker') {
              totalHrs += found.otherWorkerHours !== undefined ? found.otherWorkerHours : (found.hours - (found.employeeHours !== undefined ? found.employeeHours : Math.round(found.hours * 0.65)));
            } else {
              totalHrs += found.hours;
            }
          }
          return;
        }

        const found = workingHours.find(
          wh => wh.country === cty && wh.year === om.year && wh.month === om.monthStr
        );
        if (found) {
          if (filterWorkerType === 'Employee') {
            totalHrs += found.employeeHours !== undefined ? found.employeeHours : Math.round(found.hours * 0.65);
          } else if (filterWorkerType === 'Other Worker') {
            totalHrs += found.otherWorkerHours !== undefined ? found.otherWorkerHours : (found.hours - (found.employeeHours !== undefined ? found.employeeHours : Math.round(found.hours * 0.65)));
          } else {
            totalHrs += found.hours;
          }
        } else {
          missingInfo.push({ country: cty, year: om.year, month: om.monthStr });
        }
      });
    });

    return {
      totalHours: totalHrs,
      isMissing: missingInfo.length > 0,
      missingList: missingInfo
    };
  }, [workingHours, finalCountryFilter, startDate, endDate, filterWorkerType]);

  // Safe fallback if selectedMissingIndex gets out of range
  const activeMissingTarget = useMemo(() => {
    if (!hoursCheck.missingList || hoursCheck.missingList.length === 0) return null;
    const idx = selectedMissingIndex >= hoursCheck.missingList.length ? 0 : selectedMissingIndex;
    return hoursCheck.missingList[idx];
  }, [hoursCheck.missingList, selectedMissingIndex]);

  // Handle saving the prompted working hours
  const handleSaveHoursPrompt = () => {
    if (userRole !== 'Superuser' && userRole !== 'Level2') {
      alert('Access Denied: Only Country HSE Managers are authorized to insert labor hours.');
      return;
    }

    const empNum = parseFloat(inputEmployeeHours);
    const othNum = parseFloat(inputOtherHours);
    const overallNum = parseFloat(inputOverallHours);

    if (isNaN(overallNum) || overallNum <= 0) {
      alert('Please enter a valid positive number for overall working hours.');
      return;
    }

    if (activeMissingTarget) {
      // Save for the selected missing combo
      const target = activeMissingTarget;
      const targetIdx = MONTHS.indexOf(target.month);

      if (target.year === 2026 && targetIdx >= 5) {
        alert('June onwards cannot be inputted yet as the month is still not finished.');
        return;
      }

      onSaveWorkingHours({
        country: target.country,
        year: target.year,
        month: target.month,
        hours: overallNum,
        employeeHours: isNaN(empNum) ? Math.round(overallNum * 0.65) : empNum,
        otherWorkerHours: isNaN(othNum) ? (overallNum - (isNaN(empNum) ? Math.round(overallNum * 0.65) : empNum)) : othNum,
        updatedBy: `User (${userRole})`,
        updatedAt: new Date().toISOString()
      });

      setHoursFeedback(`Hours successfully saved for ${target.country} - ${target.month} ${target.year}!`);
      setTimeout(() => setHoursFeedback(null), 3000);
    }
  };

  // CSV Export utility for the enlarged data report
  const handleExportCSV = (card: any) => {
    if (!card) return;
    
    // Headers for the exported CSV file
    const headers = [
      'Month',
      'Reporting Year',
      'Case Count',
      'Labor Hours Recorded',
      'Calculated Monthly Incident Rate (Per 1M Hours)'
    ];
    
    const csvRows = chartMonthlyData.map(d => {
      const val = (d as any)[card.key] as number;
      // Calculate rate for this specific month
      const factor = d.hours > 0 ? (1000000 / d.hours) : 0;
      const calculatedRate = parseFloat((d.hours > 0 ? (val * factor) : 0).toFixed(2));
      
      return [
        d.originalMonth || d.month,
        d.year,
        val,
        d.hours,
        card.showRate ? calculatedRate : 'N/A'
      ];
    });

    const csvContent = [
      [`${card.title} Trend Export Details`],
      [`Period Scope: ${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}`],
      [`Country Market Scope: ${finalCountryFilter}`],
      [`Worker Category Scope: ${filterWorkerType}`],
      [`Incident Category Scope: ${filterIncidentCategory}`],
      [],
      headers,
      ...csvRows
    ].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const rangeLabel = `${formatDateLabel(startDate).replace(/\s/g, '_')}_to_${formatDateLabel(endDate).replace(/\s/g, '_')}`;
    link.setAttribute('download', `${card.key}_enlarged_data_${rangeLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. FILTER REPORTS TO APPLICABLE SCOPE
  const baseFilteredReports = useMemo(() => {
    const startStr = formatDateToYYYYMMDD(startDate);
    const endStr = formatDateToYYYYMMDD(endDate);

    return reports.filter(r => {
      // Country Filter
      if (finalCountryFilter !== 'Overall' && r.country !== finalCountryFilter) return false;

      // Custom Date Range Filter
      if (r.date < startStr || r.date > endStr) return false;

      // Worker Category Filter
      if (filterWorkerType === 'Employee') {
        const hasEmployeeInvolved = r.involvedPersons && r.involvedPersons.length > 0 && r.involvedPersons.some(p => p.isEmployee);
        if (r.involvedPersons && r.involvedPersons.length > 0 && !hasEmployeeInvolved) {
          return false;
        }
      } else if (filterWorkerType === 'Other Worker') {
        const hasOtherInvolved = r.involvedPersons && r.involvedPersons.length > 0 && r.involvedPersons.some(p => !p.isEmployee);
        if (r.involvedPersons && r.involvedPersons.length > 0 && !hasOtherInvolved) {
          return false;
        }
      }

      // Incident Category Filter
      if (filterIncidentCategory !== 'Overall' && r.category !== filterIncidentCategory) return false;

      return true;
    });
  }, [reports, finalCountryFilter, startDate, endDate, filterWorkerType, filterIncidentCategory]);

  const filteredReports = useMemo(() => {
    if (filterBodyPart === 'Overall') return baseFilteredReports;
    return baseFilteredReports.filter(r => r.affectedBodyParts?.[filterBodyPart] === true);
  }, [baseFilteredReports, filterBodyPart]);

  // 3. COMPILE METRIC SCORECARDS USING FORMULAS
  const metrics = useMemo(() => {
    return calculateSafetyMetrics(filteredReports, hoursCheck.totalHours);
  }, [filteredReports, hoursCheck.totalHours]);

  // 4. COMPILE BODY PART COUNT LISTS FOR THE DYNAMIC SILHOUETTE
  const bodyPartCounts = useMemo(() => {
    const cts: Record<BodyPartKey, number> = {
      head: 0, eye: 0, face: 0, ear: 0, throat_neck: 0, tooth_teeth: 0,
      shoulder: 0, lungs: 0, breast: 0, back: 0, elbow: 0, abdomen_pelvis: 0,
      arm: 0, hip_leg: 0, hand_wrist: 0, finger: 0, groin: 0, knee: 0,
      foot_ankle: 0, toe: 0
    };

    baseFilteredReports.forEach(r => {
      if (r.category !== 'Hazard Observation' && r.affectedBodyParts) {
        Object.keys(cts).forEach(part => {
          if (r.affectedBodyParts[part as BodyPartKey]) {
            cts[part as BodyPartKey]++;
          }
        });
      }
    });

    return cts;
  }, [baseFilteredReports]);

  // 5. DATA FOR THE MONTHLY CASE/RATE COMPILATION (CHART 1)
  const chartMonthlyData = useMemo(() => {
    const overlappingMonths = getOverlappingMonths(startDate, endDate);

    return overlappingMonths.map(om => {
      const year = om.year;
      const m = om.monthStr;

      // Find working hours for this month in target country
      let monthlyHours = 0;
      const targetCountries = finalCountryFilter === 'Overall' ? COUNTRIES : [finalCountryFilter];
      targetCountries.forEach(cty => {
        const hFound = workingHours.find(wh => wh.country === cty && wh.year === year && wh.month === m);
        if (hFound) {
          if (filterWorkerType === 'Employee') {
            monthlyHours += hFound.employeeHours !== undefined ? hFound.employeeHours : Math.round(hFound.hours * 0.65);
          } else if (filterWorkerType === 'Other Worker') {
            monthlyHours += hFound.otherWorkerHours !== undefined ? hFound.otherWorkerHours : (hFound.hours - (hFound.employeeHours !== undefined ? hFound.employeeHours : Math.round(hFound.hours * 0.65)));
          } else {
            monthlyHours += hFound.hours;
          }
        }
      });

      // Filter reports for this month from already filtered reports to remain 100% consistent and timezone-independent
      const mReports = filteredReports.filter(r => {
        const parts = r.date.split('-');
        if (parts.length < 2) return false;
        const rYear = parseInt(parts[0], 10);
        const rMonthNum = parseInt(parts[1], 10);
        return rYear === year && MONTHS[rMonthNum - 1] === m;
      });

      // Calculate totals using getMetricValueForReport
      let ltiCount = 0;
      let recordableCount = 0;
      let nearMissCount = 0;
      let riskObsCount = 0;
      let fatalitiesCount = 0;
      let highConsequenceCount = 0;
      let workRelatedCount = 0;
      let propertyDamageCount = 0;

      mReports.forEach(r => {
        fatalitiesCount += getMetricValueForReport(r, 'fatalities');
        highConsequenceCount += getMetricValueForReport(r, 'highConsequence');
        ltiCount += getMetricValueForReport(r, 'lti');
        recordableCount += getMetricValueForReport(r, 'recordable');
        workRelatedCount += getMetricValueForReport(r, 'workRelated');
        propertyDamageCount += getMetricValueForReport(r, 'propertyDamage');
        nearMissCount += getMetricValueForReport(r, 'nearMiss');
        riskObsCount += getMetricValueForReport(r, 'riskObs');
      });

      const isMultiYear = startDate.getFullYear() !== endDate.getFullYear();
      const label = isMultiYear ? `${m} '${String(year).slice(-2)}` : m;

      return {
        month: label,
        year: year,
        originalMonth: m,
        hours: monthlyHours,
        fatalities: fatalitiesCount,
        highConsequence: highConsequenceCount,
        lti: ltiCount,
        recordable: recordableCount,
        workRelated: workRelatedCount,
        propertyDamage: propertyDamageCount,
        nearMiss: nearMissCount,
        riskObs: riskObsCount,
        totalCases: mReports.length
      };
    });
  }, [filteredReports, workingHours, finalCountryFilter, startDate, endDate]);

  // Render SVG Area Path helpers
  const maxChartValue = useMemo(() => {
    let highest = 2; // Guard minimum
    chartMonthlyData.forEach(d => {
      const vals = [d.lti, d.recordable, d.workRelated, d.propertyDamage, d.nearMiss, d.riskObs, d.fatalities, d.highConsequence];
      const mVal = Math.max(...vals);
      if (mVal > highest) highest = mVal;
    });
    return Math.ceil(highest * 1.15); // Add padding
  }, [chartMonthlyData]);

  // Locations breakdown lists for bottom bar chart
  const locationBreakdown = useMemo(() => {
    const counts: Record<string, { injuries: number; nearMisses: number; hazards: number }> = {};
    
    filteredReports.forEach(r => {
      const loc = r.location || 'Unknown Site';
      if (!counts[loc]) counts[loc] = { injuries: 0, nearMisses: 0, hazards: 0 };
      
      if (r.category === 'Injury' || r.category === 'Ill-health') counts[loc].injuries++;
      else if (r.category === 'Near miss') counts[loc].nearMisses++;
      else if (r.category === 'Hazard Observation') counts[loc].hazards++;
    });

    return Object.entries(counts).map(([name, val]) => ({ name, ...val }));
  }, [filteredReports]);

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* 1. COLLAPSIBLE ACCORDION FOR TOP-LEVEL FILTERS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <button
          onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition duration-150 text-left min-h-[48px]"
          id="toggle-filters-accordion"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <SlidersHorizontal className="text-dksh-red w-4 h-4 shrink-0" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              {isFiltersCollapsed ? 'Show Filters & Controls' : 'Hide Filters & Controls'}
            </span>
            {isFiltersCollapsed && (
              <span className="hidden sm:inline-block text-[10px] text-gray-500 font-medium truncate ml-2">
                Active — Market: <strong className="text-dksh-red">{finalCountryFilter}</strong> | Dates: <strong className="text-dksh-red">{formatDateLabel(startDate)} - {formatDateLabel(endDate)}</strong> | Workers: <strong className="text-dksh-red">{filterWorkerType}</strong> | Category: <strong className="text-dksh-red">{filterIncidentCategory}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 pl-2 shrink-0">
            {isFiltersCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </button>

        {!isFiltersCollapsed && (
          <div className="p-4 border-t border-gray-150 bg-white space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Simulator Role (Only visible if setters are provided, styled for mobile) */}
              {setUserRole && (
                <div className="flex flex-col gap-1.5 md:hidden">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Test Env Role Simulator</span>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full text-xs font-semibold border rounded-lg p-3 bg-white border-gray-200 focus:ring-1 focus:ring-dksh-red min-h-[48px]"
                  >
                    <option value="Superuser">🔑 Role: Super User</option>
                    <option value="Level2">👔 Role: Country HSE Manager (Lvl 2)</option>
                    <option value="Reporter">📝 Role: Reporter (Step 4 Audit only)</option>
                  </select>
                </div>
              )}

              {/* Simulator Market (Only visible if setters are provided, styled for mobile) */}
              {setUserCountry && (
                <div className="flex flex-col gap-1.5 md:hidden">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Test Env Market Simulator</span>
                  <select
                    value={userCountry}
                    disabled={userRole === 'Reporter'}
                    onChange={(e) => setUserCountry(e.target.value)}
                    className="w-full text-xs font-semibold border rounded-lg p-3 bg-white border-gray-200 focus:ring-1 focus:ring-dksh-red min-h-[48px] disabled:opacity-50 disabled:bg-gray-100"
                  >
                    {COUNTRIES.map(cty => (
                      <option key={cty} value={cty}>Market: {cty}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Country Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Country Market</span>
                {userRole === 'Superuser' ? (
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full text-xs font-semibold border rounded-lg p-3 md:p-1.5 bg-gray-50/50 border-gray-200 focus:ring-1 focus:ring-dksh-red min-h-[48px] md:min-h-[38px]"
                  >
                    <option value="Overall">Overall (All Markets)</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <select
                    value={filterCountry}
                    disabled
                    className="w-full text-xs font-semibold border rounded-lg p-3 md:p-1.5 bg-gray-100 text-slate-400 cursor-not-allowed opacity-60 border-gray-200 min-h-[48px] md:min-h-[38px]"
                  >
                    <option value={userCountry}>{userCountry} (Locked)</option>
                  </select>
                )}
              </div>

              {/* User friendly calendar-based Date Range selector */}
              <div className="flex flex-col gap-1.5 relative text-left">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Audited Date Range</span>
                <button
                  onClick={() => {
                    setTempStartDate(startDate);
                    setTempEndDate(endDate);
                    setIsDatePickerOpen(!isDatePickerOpen);
                  }}
                  className="w-full flex items-center justify-between gap-2 text-xs font-semibold border border-gray-200 rounded-lg p-3 md:p-1.5 bg-gray-50/50 hover:bg-gray-100 transition focus:ring-1 focus:ring-dksh-red min-h-[48px] md:min-h-[38px] text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-3.5 h-3.5 text-dksh-red shrink-0" />
                    <span className="truncate">
                      {formatDateLabel(startDate)} — {formatDateLabel(endDate)}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>

                {isDatePickerOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-2xl p-4 z-50 flex flex-col md:flex-row gap-4 w-[92vw] sm:w-[480px] md:w-auto md:min-w-[500px]">
                    
                    {/* Left side: Presets panel */}
                    <div className="w-full md:w-40 border-b pb-3 md:border-b-0 md:pb-0 md:border-r md:pr-3 border-gray-100 flex flex-col gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quick Presets</span>
                      {PRESETS.map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => applyPreset(preset.start, preset.end)}
                          className="text-left text-xs p-2 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-950 font-medium transition cursor-pointer min-h-[48px] md:min-h-[36px]"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
     
                    {/* Right side: Interactive Calendar */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0 sm:min-w-[280px]">
                      
                      {/* Calendar Month/Year Navigator Header */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            let m = calMonth - 1;
                            let y = calYear;
                            if (m < 0) {
                              m = 11;
                              y -= 1;
                            }
                            setCalMonth(m);
                            setCalYear(y);
                          }}
                          className="p-2 hover:bg-gray-100 rounded transition text-gray-500 cursor-pointer min-h-[48px] md:min-h-[36px] flex items-center justify-center"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <span className="text-xs font-bold text-gray-800">
                          {MONTHS[calMonth]} {calYear}
                        </span>

                        <button
                          onClick={() => {
                            let m = calMonth + 1;
                            let y = calYear;
                            if (m > 11) {
                              m = 0;
                              y += 1;
                            }
                            setCalMonth(m);
                            setCalYear(y);
                          }}
                          className="p-2 hover:bg-gray-100 rounded transition text-gray-500 cursor-pointer min-h-[48px] md:min-h-[36px] flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Days grid of the navigated month */}
                      <div className="grid grid-cols-7 gap-1 text-center font-sans">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayChar, i) => (
                          <span key={i} className="text-[10px] font-bold text-gray-400">{dayChar}</span>
                        ))}

                        {gridCells.map((val, cellIdx) => {
                          if (val === null) {
                            return <div key={cellIdx} className="h-6 w-6" />;
                          }
                          
                          const cellDate = new Date(calYear, calMonth, val);
                          
                          const isStart = tempStartDate && formatDateToYYYYMMDD(tempStartDate) === formatDateToYYYYMMDD(cellDate);
                          const isEnd = tempEndDate && formatDateToYYYYMMDD(tempEndDate) === formatDateToYYYYMMDD(cellDate);
                          const isBetween = tempStartDate && tempEndDate && cellDate > tempStartDate && cellDate < tempEndDate;
                          
                          let cellClass = "h-8 w-8 text-[11px] rounded-md font-semibold select-none flex items-center justify-center transition cursor-pointer ";
                          if (isStart || isEnd) {
                            cellClass += "bg-dksh-red text-white";
                          } else if (isBetween) {
                            cellClass += "bg-red-50 text-dksh-red hover:bg-dksh-red/10";
                          } else {
                            cellClass += "text-gray-700 hover:bg-gray-100";
                          }

                          return (
                            <button
                              key={cellIdx}
                              onClick={() => handleDayClick(val)}
                              className={cellClass}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback selections & Range verification info */}
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[10px] text-gray-600 space-y-1 mt-1">
                        <div>
                          <span className="font-semibold text-gray-800">Start Date:</span>{' '}
                          {tempStartDate ? formatDateLabel(tempStartDate) : <span className="italic text-gray-400">Not selected</span>}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800">End Date:</span>{' '}
                          {tempEndDate ? formatDateLabel(tempEndDate) : <span className="italic text-gray-400">Select an end date</span>}
                        </div>
                      </div>

                      {/* Actions buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-105 mt-1">
                        <button
                          onClick={() => setIsDatePickerOpen(false)}
                          className="px-3 py-2 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 rounded bg-transparent cursor-pointer min-h-[48px] md:min-h-[36px]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (tempStartDate && tempEndDate) {
                              if (tempStartDate > tempEndDate) {
                                alert('Start date must be before or equal to End date.');
                                return;
                              }
                              setStartDate(tempStartDate);
                              setEndDate(tempEndDate);
                              setIsDatePickerOpen(false);
                            } else {
                              alert('Please select both a Start and an End date before applying.');
                            }
                          }}
                          className="px-3 py-2 bg-dksh-red hover:bg-dksh-red/90 text-white font-bold text-[11px] rounded cursor-pointer min-h-[48px] md:min-h-[36px]"
                        >
                          Apply Range
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </div>

              {/* Worker Category selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Worker Category</span>
                <select
                  value={filterWorkerType}
                  onChange={(e) => setFilterWorkerType(e.target.value as 'Overall' | 'Employee' | 'Other Worker')}
                  className="w-full text-xs font-semibold border rounded-lg p-3 md:p-1.5 bg-gray-50/50 border-gray-200 focus:ring-1 focus:ring-dksh-red font-sans min-h-[48px] md:min-h-[38px]"
                >
                  <option value="Overall">Overall Workers</option>
                  <option value="Employee">Employee</option>
                  <option value="Other Worker">Other Worker</option>
                </select>
              </div>

              {/* Incident Category selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Incident Category</span>
                <select
                  value={filterIncidentCategory}
                  onChange={(e) => setFilterIncidentCategory(e.target.value as 'Overall' | IncidentCategory)}
                  className="w-full text-xs font-semibold border rounded-lg p-3 md:p-1.5 bg-gray-50/50 border-gray-200 focus:ring-1 focus:ring-dksh-red font-sans min-h-[48px] md:min-h-[38px]"
                >
                  <option value="Overall">All Categories</option>
                  <option value="Injury">Injury</option>
                  <option value="Ill-health">Ill-health</option>
                  <option value="Property damaged">Property Damaged</option>
                  <option value="Near miss">Near Miss</option>
                  <option value="Hazard Observation">Hazard Observation</option>
                </select>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 2. LABOR HOURS ENTRY CARD */}
      {hoursCheck.isMissing && activeMissingTarget && (
        <div id="labor-entry-main-card" className="bg-white border border-red-150 rounded-xl p-5 shadow-md flex flex-col gap-4 w-full">
          
          <div id="labor-entry-header-row" className="flex items-start justify-between gap-3 border-b border-red-100 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-red-600 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-red-950 uppercase tracking-wider shrink-0">
                  Labor Entry Required:
                </span>
              </div>
              <select
                value={selectedMissingIndex >= hoursCheck.missingList.length ? 0 : selectedMissingIndex}
                onChange={(e) => setSelectedMissingIndex(parseInt(e.target.value))}
                className="text-xs font-bold border border-red-200 rounded-lg p-3 sm:py-1.5 sm:px-2.5 bg-red-50/50 text-red-950 focus:ring-1 focus:ring-red-400 outline-none w-full sm:w-auto sm:max-w-[280px] truncate min-h-[48px] sm:min-h-[36px]"
              >
                {hoursCheck.missingList.map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item.country} — {item.month} {item.year}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tooltip Info Icon with explanation */}
            <div className="relative group inline-block shrink-0 pt-1">
              <Info className="w-5 h-5 text-red-400 hover:text-red-700 transition cursor-pointer" />
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-slate-900 text-white text-[11px] rounded-xl p-4 shadow-xl z-[100] w-72 pointer-events-none font-normal leading-relaxed">
                <p className="font-bold text-amber-400 mb-1">ℹ️ Working Hours Required</p>
                <p className="mb-2">You must input working hours for previous months before safety stats can be calculated! Overall hours is calculated automatically as Employee + Other Worker, but can be overwritten manually.</p>
                {hoursCheck.missingList.length > 1 && (
                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <p className="font-semibold text-red-300">Remaining missing periods ({hoursCheck.missingList.length}):</p>
                    <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                      {hoursCheck.missingList.slice(0, 15).map((comb, i) => (
                        <span key={i} className="bg-red-950/80 text-red-300 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-red-900">
                          {comb.country} - {comb.month}
                        </span>
                      ))}
                      {hoursCheck.missingList.length > 15 && (
                        <span className="text-[9px] text-gray-400">+{hoursCheck.missingList.length - 15} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Squeezed inputs refactored to stack vertically on mobile, horizontally on desktop */}
          <div id="labor-entry-inputs-and-btn-row" className="flex flex-col md:flex-row md:items-end gap-4 w-full">
            <div id="labor-entry-group-employee" className="flex flex-col flex-1 gap-1.5">
              <span className="text-xs md:text-[10px] font-bold text-gray-500 uppercase">Employee Hours</span>
              <input
                type="number"
                disabled={userRole !== 'Superuser' && userRole !== 'Level2'}
                value={inputEmployeeHours}
                onChange={(e) => handleEmployeeHoursChange(e.target.value)}
                placeholder="Employee"
                className="w-full text-sm font-bold border border-gray-200 rounded-lg p-3 md:p-2 bg-white font-sans text-slate-800 focus:ring-1 focus:ring-red-400 disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[48px] md:min-h-[40px]"
              />
            </div>
            <div id="labor-entry-group-other" className="flex flex-col flex-1 gap-1.5">
              <span className="text-xs md:text-[10px] font-bold text-gray-500 uppercase">Other Hours</span>
              <input
                type="number"
                disabled={userRole !== 'Superuser' && userRole !== 'Level2'}
                value={inputOtherHours}
                onChange={(e) => handleOtherHoursChange(e.target.value)}
                placeholder="Other"
                className="w-full text-sm font-bold border border-gray-200 rounded-lg p-3 md:p-2 bg-white font-sans text-slate-800 focus:ring-1 focus:ring-red-400 disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[48px] md:min-h-[40px]"
              />
            </div>
            <div id="labor-entry-group-total" className="flex flex-col flex-1 gap-1.5">
              <span className="text-xs md:text-[10px] font-bold text-gray-700 uppercase">Total Hours</span>
              <input
                type="number"
                disabled={userRole !== 'Superuser' && userRole !== 'Level2'}
                value={inputOverallHours}
                onChange={(e) => setInputOverallHours(e.target.value)}
                placeholder="Total"
                className="w-full text-sm font-bold border border-red-200 rounded-lg p-3 md:p-2 bg-red-50 font-sans text-red-950 font-semibold focus:ring-1 focus:ring-red-400 disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[48px] md:min-h-[40px]"
              />
            </div>
            <div id="labor-entry-group-button" className="flex flex-col w-full md:w-auto">
              <button
                disabled={userRole !== 'Superuser' && userRole !== 'Level2'}
                onClick={handleSaveHoursPrompt}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm md:text-xs py-3 md:py-2.5 px-6 rounded-lg transition shrink-0 cursor-pointer shadow-md text-center justify-center flex items-center min-h-[48px] md:min-h-[40px]"
                title={userRole !== 'Superuser' && userRole !== 'Level2' ? "Only Country HSE Manager can insert labor hours" : ""}
              >
                Save & Unlock
              </button>
            </div>
          </div>

          {userRole !== 'Superuser' && userRole !== 'Level2' && (
            <div className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-150 px-3 py-2 rounded-lg flex items-center gap-1.5 animate-fade-in shadow-xs">
              <Lock className="w-4 h-4 text-rose-500 shrink-0" /> Insert restricted to Country HSE Manager Only
            </div>
          )}

          {hoursFeedback && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
              ✓ {hoursFeedback}
            </div>
          )}
        </div>
      )}

      {!hoursCheck.isMissing && (
        <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="leading-snug">
            Standard Catalog Active: <strong className="text-emerald-950">{hoursCheck.totalHours.toLocaleString()} labor-hours</strong> recorded.
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SPLIT TRENDS GRID: 7 INCIDENT CLASSIFICATIONS + COMPLIANCE DIAL */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        
        {(() => {
          const splitSeries = [
            {
              key: 'fatalities',
              title: 'Fatalities result (No.7)',
              criteria: 'Formula standard * 1M',
              color: '#ef4444',
              stroke: '#9D2235',
              bgLight: 'bg-rose-50/50',
              textDark: 'text-rose-900',
              borderColor: 'border-rose-100',
              badge: 'Death',
              count: metrics.fatalitiesCount,
              rate: metrics.fatalitiesRate,
              showRate: true,
            },
            {
              key: 'highConsequence',
              title: 'High consequence work-related injuries (No.8)',
              criteria: 'Recovery time > 6 months',
              color: '#f97316',
              stroke: '#ea580c',
              bgLight: 'bg-amber-50/50',
              textDark: 'text-amber-950',
              borderColor: 'border-amber-100',
              badge: '>6M',
              count: metrics.highConsequenceCount,
              rate: metrics.highConsequenceRate,
              showRate: true,
            },
            {
              key: 'lti',
              title: 'Lost time injury rate (No.9)',
              criteria: '1 day+ absence criteria',
              color: '#10b981',
              stroke: '#059669',
              bgLight: 'bg-emerald-50/50',
              textDark: 'text-emerald-950',
              borderColor: 'border-emerald-100',
              badge: 'LTI',
              count: metrics.lostTimeCount,
              rate: metrics.lostTimeRate,
              showRate: true,
            },
            {
              key: 'recordable',
              title: 'Recordable Injuries (No. 8-13)',
              criteria: 'TRIR continuous tracking',
              color: '#6366f1',
              stroke: '#4f46e5',
              bgLight: 'bg-red-50/50',
              textDark: 'text-[#1A1A1A]',
              borderColor: 'border-red-100',
              badge: 'REC',
              count: metrics.recordableCount,
              rate: metrics.recordableRate,
              showRate: true,
            },
            {
              key: 'workRelated',
              title: 'Work-Related Injuries (No. 8-14)',
              criteria: 'GRI standard rate calculation',
              color: '#14b8a6', // teal color
              stroke: '#0d9488',
              bgLight: 'bg-teal-50/50',
              textDark: 'text-teal-950',
              borderColor: 'border-teal-100',
              badge: 'WRI',
              count: metrics.workRelatedCount,
              rate: metrics.workRelatedRate,
              showRate: true,
            },
            {
              key: 'propertyDamage',
              title: 'Property Damage (No.15)',
              criteria: 'Asset/Equipment damage occurrences',
              color: '#a855f7', // purple color
              stroke: '#7e22ce',
              bgLight: 'bg-purple-50/50',
              textDark: 'text-purple-950',
              borderColor: 'border-purple-100',
              badge: 'PD',
              count: metrics.propertyDamageCount,
              rate: 0,
              showRate: false, // "Property Damage no15, no rate required"
            },
            {
              key: 'nearMiss',
              title: 'Near Misses (No.16)',
              criteria: 'Potential / Unsafe conditions',
              color: '#fbbf24',
              stroke: '#d97706',
              bgLight: 'bg-yellow-50/50',
              textDark: 'text-yellow-950',
              borderColor: 'border-yellow-100',
              badge: 'NM',
              count: metrics.nearMissCount,
              rate: 0,
              showRate: false,
            },
            {
              key: 'riskObs',
              title: 'Hazard Observation (No.17)',
              criteria: 'Unsafe actions identified',
              color: '#3b82f6',
              stroke: '#2563eb',
              bgLight: 'bg-blue-50/50',
              textDark: 'text-blue-950',
              borderColor: 'border-blue-100',
              badge: 'HZ',
              count: metrics.hazardCount,
              rate: 0,
              showRate: false, // "Hazard / Risk obs to hazard observation only, no rate required"
            }
          ];

          return (
            <>
              {splitSeries.map((s) => {
                const maxValForThisKey = Math.max(
                  1,
                  ...chartMonthlyData.map(d => (d as any)[s.key] as number)
                );
                const paddedMax = Math.ceil(maxValForThisKey * 1.15);

                const points = chartMonthlyData.map((d, idx) => {
                  const x = 30 + (355 / 11) * idx;
                  const val = (d as any)[s.key] as number;
                  const y = 95 - (80 * val) / paddedMax;
                  return { x, y, val };
                });

                const pathString = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                const areaString = points.length > 0 
                  ? (pathString + ` L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`)
                  : '';

                const isHovered = hoveredMonthIdx !== null;
                const activeMonthVal = isHovered && hoveredMonthIdx < chartMonthlyData.length
                  ? (chartMonthlyData[hoveredMonthIdx] as any)[s.key] as number
                  : 0;

                return (
                  <div 
                    key={s.key} 
                    onClick={() => setSelectedEnlargedCard(s)}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between h-[210px] relative select-none cursor-pointer group hover:border-dksh-red active:scale-[0.995]"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relX = e.clientX - rect.left;
                      const svgX = (relX / rect.width) * 400;
                      const graphX = svgX - 30;
                      const colWidth = 355 / 11;
                      const closestIdx = Math.round(graphX / colWidth);
                      if (closestIdx >= 0 && closestIdx < chartMonthlyData.length) {
                        setHoveredMonthIdx(closestIdx);
                      }
                    }}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                    title="Click to enlarge, analyze detailed trends and export monthly data to CSV"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block truncate group-hover:text-amber-600 transition-colors">
                          {s.title}
                        </span>
                        <span className="text-[9px] text-gray-400 block font-normal mt-0.5 truncate">
                          {s.criteria} <span className="text-[8px] font-bold text-dksh-red opacity-0 group-hover:opacity-100 transition-opacity ml-1">(Enlarge & Export)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase font-mono ${s.bgLight} ${s.textDark} border ${s.borderColor}`}>
                          {s.badge}
                        </div>
                        <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-600 transition-colors" />
                      </div>
                    </div>

                    {/* Stat readout */}
                    <div className="mt-2.5 flex items-center justify-between border-b pb-1.5 border-gray-50">
                      {/* Left side: Case Number */}
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Cases</span>
                        <span className="text-xl font-extrabold font-mono tracking-tight text-gray-950">
                          {isHovered ? activeMonthVal : s.count}
                        </span>
                      </div>

                      {/* Middle: Hover month indicator */}
                      <div className="text-center">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block select-none">
                          {isHovered ? `${chartMonthlyData[hoveredMonthIdx].month}` : 'Year'}
                        </span>
                      </div>

                      {/* Right side: Rate (if required) */}
                      {s.showRate ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Rate</span>
                          <span className="text-xl font-bold font-mono tracking-tight" style={{ color: s.stroke }}>
                            {isHovered ? (
                              chartMonthlyData[hoveredMonthIdx].hours > 0 
                                ? parseFloat((activeMonthVal * (1000000 / chartMonthlyData[hoveredMonthIdx].hours)).toFixed(2))
                                : 0
                            ) : s.rate}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight italic">No Rate</span>
                          <span className="text-xl font-bold text-gray-300 font-mono">-</span>
                        </div>
                      )}
                    </div>

                    {/* Compact SVG Mini-Chart */}
                    <div className="h-[90px] w-full relative mt-1">
                      <svg viewBox="0 0 400 110" className="w-full h-full font-mono text-[8px] text-gray-400 select-none overflow-visible">
                        {/* Static dotted guideline at 0 */}
                        <line x1="30" y1="100" x2="385" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                        
                        {/* Dynamic mid line if max > 1 */}
                        {paddedMax > 1 && (
                          <line x1="30" y1="55" x2="385" y2="55" stroke="#f8fafc" strokeWidth="1" strokeDasharray="3 3" />
                        )}

                        {/* Synchronized Hover Vertical Guideline */}
                        {isHovered && hoveredMonthIdx < points.length && (
                          <line
                            x1={points[hoveredMonthIdx].x}
                            y1="10"
                            x2={points[hoveredMonthIdx].x}
                            y2="100"
                            stroke="#cbd5e1"
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                          />
                        )}

                        {/* Fill Area path */}
                        {points.length > 0 && (
                          <path
                            d={areaString}
                            fill={s.color}
                            fillOpacity="0.06"
                            className="transition-all duration-300"
                          />
                        )}

                        {/* Bold Curve Line */}
                        {points.length > 0 && (
                          <path
                            d={pathString}
                            fill="none"
                            stroke={s.stroke}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                        )}

                        {/* Interaction Dots / Numbers */}
                        {points.map((p, pIdx) => {
                          const isActive = hoveredMonthIdx === pIdx;
                          return (
                            <g key={pIdx}>
                              {isActive ? (
                                <g>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="5.5"
                                    fill={s.stroke}
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={p.x}
                                    y={p.y - 8}
                                    textAnchor="middle"
                                    className="font-bold fill-slate-900 text-[10px] font-sans drop-shadow-sm"
                                  >
                                    {p.val}
                                  </text>
                                </g>
                              ) : (
                                (p.val > 0 || pIdx === 0 || pIdx === points.length - 1) && (
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="2.2"
                                    fill="#ffffff"
                                    stroke={s.stroke}
                                    strokeWidth="1.5"
                                    className="opacity-60 hover:opacity-100 transition-all duration-100"
                                  />
                                )
                              )}
                              {/* Display Month text on X-Axis */}
                              <text
                                x={p.x}
                                y="109"
                                textAnchor="middle"
                                className={`text-[7.5px] font-sans transition-all duration-100 ${
                                  isActive ? 'fill-slate-900 font-bold' : 'fill-gray-300'
                                }`}
                              >
                                {chartMonthlyData[pIdx].month}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                  </div>
                );
              })}



            </>
          );
        })()}

      </div>

      {/* ========================================================= */}
      {/* 4. EXECUTIVE ANALYTICS: BODILY INJURIES SILHOUETTE */}
      {/* ========================================================= */}
      <div className="mt-4 max-w-5xl mx-auto w-full">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6 flex flex-col justify-between items-center text-center">
          <div className="border-b pb-4 w-full">
            <h4 className="font-bold text-sm text-gray-900 flex items-center justify-center gap-1.5">
              <HeartPulse className="text-rose-500 w-5 h-5 shrink-0 animate-pulse" />
              Interactive Bodily Injury Counts
            </h4>
            <p className="text-[11px] text-gray-400 mt-1">
              Interactive human silhouette showing involved body parts based on filters
            </p>
          </div>

          {filterBodyPart !== 'Overall' && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs w-full max-w-sm animate-fade-in">
              <span className="text-rose-950 font-bold">
                Filtered: <strong className="text-rose-700">{BODY_PART_LABELS[filterBodyPart] || filterBodyPart}</strong>
              </span>
              <button
                onClick={() => setFilterBodyPart('Overall')}
                className="text-[10px] bg-rose-700 hover:bg-rose-800 text-white font-extrabold py-1 px-2.5 rounded-lg transition shadow-xs cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          <div className="py-2 w-full flex justify-center">
            <HumanFigure
              mode="dashboard-view"
              counts={bodyPartCounts}
              selectedParts={filterBodyPart !== 'Overall' ? { [filterBodyPart]: true } as any : {}}
              onChange={(key) => {
                setFilterBodyPart(prev => prev === key ? 'Overall' : key);
              }}
            />
          </div>
        </div>
      </div>

      {/* ENLARGED CHART & DATA CSV EXPORT MODAL */}
      {selectedEnlargedCard && (() => {
        const modalRef = selectedEnlargedCard;
        
        // Find max value in scale
        const maxVal = Math.max(1, ...chartMonthlyData.map(d => (d as any)[modalRef.key] as number));
        const paddedMax = Math.ceil(maxVal * 1.15);
        
        const grWidth = 480;
        const grHeight = 200;
        const offsetLeft = 65;
        const offsetBottom = 240;
        
        const modalPoints = chartMonthlyData.map((d, idx) => {
          const x = offsetLeft + (grWidth / 11) * idx;
          const val = (d as any)[modalRef.key] as number;
          const y = offsetBottom - (grHeight * val) / paddedMax;
          return { x, y, val, month: d.month, hours: d.hours };
        });

        const pStr = modalPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
        const aStr = modalPoints.length > 0 
          ? (pStr + ` L ${modalPoints[modalPoints.length - 1].x} ${offsetBottom} L ${modalPoints[0].x} ${offsetBottom} Z`)
          : '';

        const activeHoveredMonth = hoveredModalMonthIdx !== null && hoveredModalMonthIdx < chartMonthlyData.length
          ? chartMonthlyData[hoveredModalMonthIdx]
          : null;
          
        const activeHoveredVal = activeHoveredMonth
          ? (activeHoveredMonth as any)[modalRef.key] as number
          : null;

        return (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-start justify-center p-4 sm:p-8 md:p-12 overflow-y-auto animate-fade-in"
            onClick={() => {
              setSelectedEnlargedCard(null);
              setHoveredModalMonthIdx(null);
            }}
          >
            <div 
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-7xl w-full flex flex-col text-gray-900 my-2 sm:my-4"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {/* Modal Header */}
              <div className="border-b border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${modalRef.bgLight} ${modalRef.textDark} border ${modalRef.borderColor}`}>
                      {modalRef.badge}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-950">
                      {modalRef.title} Trend Analysis
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                    <span>Criteria: <strong>{modalRef.criteria}</strong></span>
                    <span className="text-gray-300">•</span>
                    <span>Country: <strong className="text-dksh-red uppercase">{finalCountryFilter === 'Overall' ? 'All Corporate' : finalCountryFilter}</strong></span>
                    <span className="text-gray-300">•</span>
                    <span>Worker Category: <strong className="text-dksh-red font-semibold">{filterWorkerType}</strong></span>
                    <span className="text-gray-300">•</span>
                    <span>Category: <strong className="text-sky-600 font-semibold">{filterIncidentCategory}</strong></span>
                    <span className="text-gray-300">•</span>
                    <span>Period: <strong>{formatDateLabel(startDate)} — {formatDateLabel(endDate)}</strong></span>
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedEnlargedCard(null);
                    setHoveredModalMonthIdx(null);
                  }}
                  className="p-1 px-3 rounded-lg border border-gray-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition font-bold text-xs flex items-center gap-1.5 self-end sm:self-auto"
                >
                  Close (ESC)
                </button>
              </div>

              {/* High Fidelity Line/Area Chart spanning full width */}
              <div className="p-6 bg-slate-50/30 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    12 Months Performance Chart
                  </h4>
                  <span className="text-[10px] bg-red-50 text-dksh-red px-2 py-0.5 rounded font-bold font-mono tracking-wide uppercase">
                    Cases & Incident Frequency Rate
                  </span>
                </div>

                {/* SVG Chart */}
                <div className="h-[280px] w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs relative select-none">
                  <svg viewBox="0 0 600 300" className="w-full h-full font-mono text-[9px] text-gray-400 select-none overflow-visible">
                    
                    {/* Horizontal Grid Guidelines */}
                    <line x1="60" y1="240" x2="550" y2="240" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="60" y1="140" x2="550" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="60" y1="40" x2="550" y2="40" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Y-Axis scale texts */}
                    <text x="45" y="244" textAnchor="end" className="fill-gray-400 font-bold">0</text>
                    <text x="45" y="144" textAnchor="end" className="fill-gray-400 font-bold">{(paddedMax / 2).toFixed(paddedMax % 2 === 0 ? 0 : 1)}</text>
                    <text x="45" y="44" textAnchor="end" className="fill-gray-400 font-bold">{paddedMax}</text>

                    {/* X-Axis Month lines context */}
                    {modalPoints.map((p, pIdx) => {
                      const isActive = hoveredModalMonthIdx === pIdx;
                      return (
                        <g key={pIdx}>
                          <line
                            x1={p.x}
                            y1="40"
                            x2={p.x}
                            y2="240"
                            stroke={isActive ? '#cbd5e1' : '#f8fafc'}
                            strokeWidth={isActive ? 1.5 : 1}
                            strokeDasharray={isActive ? 'none' : '3 6'}
                          />
                          {/* Circle Node Trigger area */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isActive ? 6.5 : 4}
                            fill={isActive ? modalRef.stroke : '#ffffff'}
                            stroke={modalRef.stroke}
                            strokeWidth={isActive ? 2 : 1.75}
                            className="transition-all duration-150 cursor-pointer"
                            onMouseEnter={() => setHoveredModalMonthIdx(pIdx)}
                            onMouseLeave={() => setHoveredModalMonthIdx(null)}
                          />
                          {/* Active Point count text display directly on nodal paths */}
                          {isActive && (
                            <g>
                              <rect
                                x={p.x - 22}
                                y={p.y - 25}
                                width="44"
                                height="18"
                                rx="4"
                                fill="#1e293b"
                              />
                              <text
                                x={p.x}
                                y={p.y - 13}
                                textAnchor="middle"
                                className="fill-white font-bold text-[8.5px]"
                              >
                                {p.val}
                              </text>
                            </g>
                          )}
                          {/* X Axis label month string */}
                          <text
                            x={p.x}
                            y="256"
                            textAnchor="middle"
                            className={`text-[8.5px] font-sans ${isActive ? 'fill-slate-900 font-bold' : 'fill-gray-400'}`}
                          >
                            {p.month}
                          </text>
                        </g>
                      );
                    })}

                    {/* Line Paths fill areas inside chart */}
                    {modalPoints.length > 0 && (
                      <>
                        <path
                          d={aStr}
                          fill={modalRef.color}
                          fillOpacity="0.08"
                          className="transition-all duration-300 pointer-events-none"
                        />
                        <path
                          d={pStr}
                          fill="none"
                          stroke={modalRef.stroke}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300 pointer-events-none"
                        />
                      </>
                    )}
                    
                  </svg>

                  {/* SVG Tooltip mouse listener strip overlays */}
                  <div className="absolute inset-x-[60px] top-[40px] bottom-[60px] flex">
                    {modalPoints.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full cursor-crosshair"
                        onMouseEnter={() => setHoveredModalMonthIdx(idx)}
                        onMouseLeave={() => setHoveredModalMonthIdx(null)}
                      />
                    ))}
                  </div>
                </div>

                {/* Highlight bar readout */}
                <div className="mt-4 bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">
                      {hoveredModalMonthIdx !== null ? `Data Highlight: ${chartMonthlyData[hoveredModalMonthIdx].month}` : 'Year Scope Summary'}
                    </span>
                    <h5 className="text-sm font-extrabold text-white font-mono flex items-center gap-4 flex-wrap">
                      {hoveredModalMonthIdx !== null ? (
                        <>
                          <span>Cases: <strong className="text-yellow-400">{activeHoveredVal}</strong></span>
                          {modalRef.showRate && (
                            <span>Rate: <strong style={{ color: modalRef.stroke }}>
                              {chartMonthlyData[hoveredModalMonthIdx].hours > 0 
                                ? parseFloat((activeHoveredVal * (1000000 / chartMonthlyData[hoveredModalMonthIdx].hours)).toFixed(2)) 
                                : 0}
                            </strong></span>
                          )}
                        </>
                      ) : (
                        <>
                          <span>Cases: <strong className="text-yellow-400">{modalRef.count}</strong></span>
                          {modalRef.showRate && (
                            <span>Rate: <strong style={{ color: modalRef.stroke }}>{modalRef.rate}</strong></span>
                          )}
                        </>
                      )}
                    </h5>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-sans">
                    <span className="block">Labor Hours: <strong>{hoveredModalMonthIdx !== null ? chartMonthlyData[hoveredModalMonthIdx].hours.toLocaleString() : hoursCheck.totalHours.toLocaleString()}</strong></span>
                    <span className="block mt-0.5">Safety Class: <strong className="text-emerald-400 font-mono">OK</strong></span>
                  </div>
                </div>
              </div>

              {/* SECTION: DETAILED UNDERLYING INCIDENT RECORDS TABLE */}
              {(() => {
                const metricReports = getReportsForMetric(filteredReports, modalRef.key);

                const handleExportIndividualCSV = (metricTitle: string, individualReports: IncidentReport[]) => {
                  const headers = [
                    'Incident ID',
                    'Worker Type',
                    'Location',
                    'Country',
                    'Department',
                    'Body Part Affected',
                    'Incident Classification',
                    'Main Type of Injury/Ill-health',
                    'Lost Time Days',
                    'Report Status'
                  ];

                  const csvRows = individualReports.map(r => {
                    return [
                      r.id,
                      getReportWorkerType(r),
                      r.location || 'N/A',
                      r.country,
                      r.involvedPersons?.map(p => p.department).filter(Boolean).join('; ') || 'N/A',
                      getBodyPartsAffected(r),
                      getClassificationLabel(r),
                      r.injuryType?.join('; ') || 'None',
                      r.classification?.absenceMoreThanOneDay?.lostTimeDays || 0,
                      r.status
                    ];
                  });

                  const csvContent = [
                    [`Underlying Cases: ${metricTitle}`],
                    [`Period Scope: ${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}`],
                    [`Country Market Scope: ${finalCountryFilter}`],
                    [`Worker Category Scope: ${filterWorkerType}`],
                    [`Incident Category Scope: ${filterIncidentCategory}`],
                    [],
                    headers,
                    ...csvRows
                  ].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  const rangeLabel = `${formatDateLabel(startDate).replace(/\s/g, '_')}_to_${formatDateLabel(endDate).replace(/\s/g, '_')}`;
                  link.setAttribute('download', `individual_cases_${modalRef.key}_${rangeLabel}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                };

                return (
                  <div className="border-t border-gray-100 p-6 bg-slate-50/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <ListTodo className="w-4 h-4 text-rose-600" />
                          Underlying Incident & HSE Records ({metricReports.length} Cases)
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">
                          Detailed log of individual compliance occurrences registered in the system for this trend metric. Click ID to view details.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleExportIndividualCSV(modalRef.title, metricReports)}
                        className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export All Cases to Excel/CSV
                      </button>
                    </div>

                    {metricReports.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-xs">
                        <table className="min-w-full text-left divide-y divide-gray-150 border-collapse">
                          <thead className="bg-slate-50 font-bold text-gray-500 uppercase text-[10px] tracking-wider whitespace-nowrap">
                            <tr>
                              <th className="px-4 py-3 border-b border-gray-150">Link Incident ID</th>
                              <th className="px-4 py-3 border-b border-gray-150">Worker Type</th>
                              <th className="px-4 py-3 border-b border-gray-150">Location</th>
                              <th className="px-4 py-3 border-b border-gray-150">Country</th>
                              <th className="px-4 py-3 border-b border-gray-150">Department</th>
                              <th className="px-4 py-3 border-b border-gray-150">Body Part Affected</th>
                              <th className="px-4 py-3 border-b border-gray-150">Incident Classification</th>
                              <th className="px-4 py-3 border-b border-gray-150">Main Type of Injury/Ill-health</th>
                              <th className="px-4 py-3 border-b border-gray-150 text-right">Lost Time Days</th>
                              <th className="px-4 py-3 border-b border-gray-150 text-center">Report Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-[11px] text-gray-700 whitespace-nowrap">
                            {metricReports.map((r) => {
                              const workerType = getReportWorkerType(r);
                              const departments = r.involvedPersons?.map(p => p.department).filter(Boolean).join(', ') || 'N/A';
                              const bodyParts = getBodyPartsAffected(r);
                              const classifications = getClassificationLabel(r);
                              const injuryTypes = r.injuryType?.join(', ') || 'None';
                              const lostTimeDays = r.classification?.absenceMoreThanOneDay?.lostTimeDays || 0;

                              return (
                                <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                                  {/* Link Incident ID */}
                                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                    <button
                                      onClick={() => setSelectedDetailReport(r)}
                                      className="inline-flex items-center gap-1 text-[#9D2235] hover:text-red-700 hover:underline font-extrabold focus:outline-hidden transition"
                                      title="Click to view complete details popup"
                                    >
                                      {r.id}
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </td>

                                  {/* Worker Type */}
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      workerType === 'Employee' 
                                        ? 'bg-red-50 text-dksh-red border border-red-100' 
                                        : workerType === 'Contractor / Third Party'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}>
                                      {workerType}
                                    </span>
                                  </td>

                                  {/* Location */}
                                  <td className="px-4 py-3 font-semibold text-gray-900 truncate max-w-[150px]" title={r.location}>
                                    {r.location || 'N/A'}
                                  </td>

                                  {/* Country */}
                                  <td className="px-4 py-3 font-bold text-slate-700">
                                    {r.country}
                                  </td>

                                  {/* Department */}
                                  <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={departments}>
                                    {departments}
                                  </td>

                                  {/* Body Part Affected */}
                                  <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={bodyParts}>
                                    {bodyParts}
                                  </td>

                                  {/* Incident Classification */}
                                  <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]" title={classifications}>
                                    {classifications}
                                  </td>

                                  {/* Main Type of Injury/Ill-health */}
                                  <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]" title={injuryTypes}>
                                    {injuryTypes}
                                  </td>

                                  {/* Lost Time Days */}
                                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                                    {lostTimeDays}
                                  </td>

                                  {/* Report Status */}
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      r.status === 'draft' 
                                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                                        : r.status === 'investigating'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}>
                                      {r.status === 'draft' ? 'Draft' : r.status === 'investigating' ? 'Investigating' : 'Closed & Verified'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-150 rounded-2xl p-8 text-center text-gray-400 italic text-xs">
                        No underlying individual incident cases currently match the selected filters for this HSE trend.
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          </div>
        );
      })()}
      {/* COMPREHENSIVE OVERLAY DETAILS POPUP FOR SELECTED REPORT */}
      {selectedDetailReport && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-start overflow-y-auto p-4 md:p-8 z-[100] animate-fade-in text-gray-900"
          onClick={() => setSelectedDetailReport(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-150 overflow-hidden my-4 flex flex-col text-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#9D2235] text-white px-2.5 py-1 rounded">
                    HSE Compliance Incident Report
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    ID: {selectedDetailReport.id}
                  </span>
                  <span className="bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded text-xs font-semibold uppercase">
                    {selectedDetailReport.category}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {selectedDetailReport.occurrenceTitle || 'HSE Ticket Details Log'}
                </h1>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportReportToPDF(selectedDetailReport)}
                  className="bg-[#9D2235] hover:bg-[#801b2a] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  title="Export this transaction as PDF matching input form format"
                >
                  <FileDown className="w-4 h-4" />
                  Export to PDF
                </button>
                <button
                  onClick={() => setSelectedDetailReport(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Close ticket review"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - 4 COMPREHENSIVE FORM-STYLE SECTIONS */}
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[75vh]">
              
              {/* STEP 1: OCCURRENCE CONTEXT */}
              <div className="space-y-4">
                <div className="border-l-4 border-amber-500 bg-amber-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">STEP 1: OCCURRENCE CONTEXT</h3>
                  <p className="text-xs text-amber-700">Official incident metadata and routing parameters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Occurrence Date</span>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {selectedDetailReport.date}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Occurrence Time</span>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {selectedDetailReport.time}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Country / Market Location</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedDetailReport.country}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Site Location DC</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedDetailReport.location}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Event Category</span>
                    <p className="text-sm font-bold text-[#9D2235] uppercase">
                      {selectedDetailReport.category}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CC Email Recipients</span>
                    <p className="text-sm font-semibold text-slate-700 truncate" title={selectedDetailReport.emailToCc}>
                      {selectedDetailReport.emailToCc || 'No CC list specified'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Current Report Status</span>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        selectedDetailReport.status === 'draft' 
                          ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                          : selectedDetailReport.status === 'investigating'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {selectedDetailReport.status === 'draft' ? 'Draft' : selectedDetailReport.status === 'investigating' ? 'Investigating (Level 2)' : 'Closed & Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: DETAILS OF PERSON INVOLVED & WITNESS */}
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 bg-red-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">STEP 2: DETAILS OF PERSON INVOLVED & WITNESS</h3>
                  <p className="text-xs text-dksh-red">Roster logs of primary personnel and observers present during the event.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Involved Personnel */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#9D2235]" />
                      2.1 Involved Personnel Roster
                    </h4>
                    {selectedDetailReport.involvedPersons && selectedDetailReport.involvedPersons.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-xs bg-white">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 font-bold text-gray-500 border-b border-slate-100">
                              <th className="p-3">Name</th>
                              <th className="p-3">Staff ID</th>
                              <th className="p-3">Department/BU</th>
                              <th className="p-3">Role Type</th>
                              <th className="p-3">Injured</th>
                              <th className="p-3">Event Location</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-gray-700">
                            {selectedDetailReport.involvedPersons.map((p, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900">{p.name}</td>
                                <td className="p-3 font-mono text-[11px] text-gray-500">{p.staffId || 'N/A'}</td>
                                <td className="p-3 font-medium">
                                  {p.department}
                                  {p.businessUnit && <span className="text-gray-400"> ({p.businessUnit})</span>}
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    p.isEmployee ? 'bg-red-50 text-dksh-red' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {p.isEmployee ? 'Employee' : 'Other'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    p.isInjured ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {p.isInjured ? 'Yes (Injured)' : 'No (Involved)'}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-500 truncate max-w-[120px]">{p.placeOfEvent || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-white p-4 rounded-lg border border-slate-100">
                        No involved persons registered in roster logs.
                      </p>
                    )}
                  </div>

                  {/* Witnesses */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      2.2 Witness Roster Records
                    </h4>
                    {selectedDetailReport.witnesses && selectedDetailReport.witnesses.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-xs bg-white">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 font-bold text-gray-500 border-b border-slate-100">
                              <th className="p-3">Witness Name</th>
                              <th className="p-3">Staff ID</th>
                              <th className="p-3">Department/BU</th>
                              <th className="p-3">Role Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-gray-700">
                            {selectedDetailReport.witnesses.map((w, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900">{w.name}</td>
                                <td className="p-3 font-mono text-[11px] text-gray-500">{w.staffId || 'N/A'}</td>
                                <td className="p-3 font-medium">
                                  {w.department}
                                  {w.businessUnit && <span className="text-gray-400"> ({w.businessUnit})</span>}
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    w.isEmployee ? 'bg-red-50 text-dksh-red' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {w.isEmployee ? 'Employee' : 'Other'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-white p-4 rounded-lg border border-slate-100">
                        No witness logs added to this record.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 3: OCCURRENCE DETAIL / RISK CRITERIA & HUMAN BODY GRAPHIC */}
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">STEP 3: OCCURRENCE DETAIL, RISK CRITERIA & PHYSICAL TRAUMA</h3>
                  <p className="text-xs text-emerald-700">Brief narrative of the incident, compliance checklists, and injury graphics.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left block (Narrative, Injury type, Human silhouette graphic) - 7 cols */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Narrative Summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#9D2235]" />
                        Occurrence Description Narrative
                      </h4>
                      <p className="text-xs font-bold text-slate-800 bg-amber-50 p-2.5 rounded border border-amber-100">
                        Title: {selectedDetailReport.occurrenceTitle || 'N/A'}
                      </p>
                      <div className="p-4 bg-white border border-slate-150 rounded-xl text-xs leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                        {selectedDetailReport.eventDescription || 'No detailed narrative provided for this log.'}
                      </div>
                    </div>

                    {/* Injury Details & Human silhouette split */}
                    {selectedDetailReport.category !== 'Hazard Observation' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Injury Types Recorded</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedDetailReport.injuryType && selectedDetailReport.injuryType.length > 0 ? (
                                selectedDetailReport.injuryType.map((typeStr, i) => (
                                  <span key={i} className="bg-[#9D2235] text-white text-[10px] font-extrabold px-2 py-1 rounded shadow-xs">
                                    {typeStr}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400 italic">None logged</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Affected Body Parts</span>
                            <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                              {Object.entries(selectedDetailReport.affectedBodyParts || {})
                                .filter(([_, value]) => value === true)
                                .map(([key]) => (
                                  <div key={key} className="bg-red-50 text-red-700 border border-red-100 rounded-md px-2 py-1 text-[10px] font-bold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9D2235]" />
                                    {BODY_PART_LABELS[key as BodyPartKey] || key}
                                  </div>
                                ))}
                              {Object.values(selectedDetailReport.affectedBodyParts || {}).filter(Boolean).length === 0 && (
                                <span className="text-xs text-gray-400 italic">No physical trauma reported.</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Graphic component */}
                        <div className="border border-slate-150 rounded-xl bg-white p-3 flex flex-col items-center justify-center min-h-[220px]">
                          <span className="text-[9px] uppercase font-bold text-gray-400 mb-2">Trauma Mapping Graphic</span>
                          <div className="scale-[0.45] -my-28">
                            {(() => {
                              const dummyCounts = {} as Record<BodyPartKey, number>;
                              Object.entries(selectedDetailReport.affectedBodyParts || {}).forEach(([k, v]) => {
                                if (v) dummyCounts[k as BodyPartKey] = 5; // Highlight with high intensity color
                              });
                              return (
                                <HumanFigure
                                  mode="dashboard-view"
                                  counts={dummyCounts}
                                  hideLabels={true}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right block (Compliance Checklist) - 5 cols */}
                  <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        HSE Compliance Checklist
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        System-evaluated compliance criteria for auditing trails:
                      </p>
                      
                      <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                        {Object.entries(selectedDetailReport.classification || {}).map(([key, value]) => {
                          let isTrue = false;
                          let valStr = '';

                          if (typeof value === 'boolean') {
                            isTrue = value;
                            valStr = isTrue ? 'YES' : 'NO';
                          } else if (value && typeof value === 'object') {
                            const obj = value as any;
                            isTrue = !!obj.yes;
                            valStr = isTrue ? `YES` : 'NO';
                            if (key === 'absenceMoreThanOneDay' && isTrue && obj.lostTimeDays) {
                              valStr += ` (${obj.lostTimeDays} Days LTI)`;
                            }
                          }

                          // Label mapping
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

                          return (
                            <div
                              key={key}
                              className={`flex items-start justify-between gap-3 text-[10px] p-1.5 rounded-lg border transition ${
                                isTrue
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                                  : 'bg-white border-slate-100 text-gray-500'
                              }`}
                            >
                              <span className="leading-tight font-medium">
                                {CLASSIFICATION_LABELS[key] || key}
                              </span>
                              <span className={`font-bold uppercase px-1.5 py-0.5 rounded text-[8px] ${
                                isTrue ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {valStr}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: INVESTIGATION & ACTIONS */}
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 bg-red-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">STEP 4: INVESTIGATION, CORRECTIVE ACTIONS & SIGN-OFF</h3>
                  <p className="text-xs text-dksh-red">Root cause 5-Why methodology analysis, corrective actions, and sign-off status.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 5-Why Analysis */}
                  {selectedDetailReport.category !== 'Hazard Observation' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-dksh-red" />
                        4.1 Root Cause Investigation (5-Why Methodology)
                      </h4>
                      
                      <div className="space-y-2.5 text-xs">
                        {[
                          { num: 1, title: 'Why 1 (Incident Occurred)', val: selectedDetailReport.investigation?.whyHappened },
                          { num: 2, title: 'Why 2 (Immediate Cause)', val: selectedDetailReport.investigation?.whyFirstCause },
                          { num: 3, title: 'Why 3 (System Failure)', val: selectedDetailReport.investigation?.whySystemFailed },
                          { num: 4, title: 'Why 4 (Control Ineffectiveness)', val: selectedDetailReport.investigation?.whyControlIneffective },
                          { num: 5, title: 'Why 5 (Process or Systemic Gap - Root Cause)', val: selectedDetailReport.investigation?.whyGapExists }
                        ].map((why) => (
                          <div key={why.num} className="p-2.5 bg-white border border-slate-200/60 rounded-xl">
                            <span className="font-extrabold text-[9px] text-dksh-red block uppercase tracking-wider mb-0.5">{why.title}</span>
                            <p className="text-gray-700 font-medium leading-relaxed">{why.val || 'Not analyzed.'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAPA Plan & Verification */}
                  <div className={`space-y-6 ${selectedDetailReport.category === 'Hazard Observation' ? 'md:col-span-2' : ''}`}>
                    {/* Actions */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        4.2 Proposed Corrective & Preventive Action (CAPA)
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl">
                          <span className="font-extrabold text-[9px] text-emerald-600 block uppercase tracking-wider mb-0.5">Immediate Corrective Actions</span>
                          <p className="text-gray-700 font-medium">{selectedDetailReport.actions?.immediateCorrective || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl">
                          <span className="font-extrabold text-[9px] text-emerald-600 block uppercase tracking-wider mb-0.5">Long-Term Preventive Actions</span>
                          <p className="text-gray-700 font-medium">{selectedDetailReport.actions?.longTermPreventive || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl flex justify-between items-center">
                          <span className="font-extrabold text-[9px] text-gray-500 uppercase tracking-wider">Target Completion Date</span>
                          <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {selectedDetailReport.actions?.completionDate || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification and Closing */}
                    <div className="bg-emerald-50/20 border border-emerald-150 rounded-2xl p-6 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-[#9D2235] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        4.3 Verification & Sign-off Close
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="p-2.5 bg-white border border-emerald-100 rounded-xl">
                          <span className="font-extrabold text-[9px] text-emerald-600 block uppercase tracking-wider mb-0.5">Verified By</span>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-bold">{selectedDetailReport.verification?.verifiedBy || 'Pending verification'}</span>
                            {selectedDetailReport.verification?.dateOfVerification && (
                              <span className="text-gray-400 font-mono text-[9px]">{selectedDetailReport.verification.dateOfVerification}</span>
                            )}
                          </div>
                          {selectedDetailReport.verification?.remarks && (
                            <p className="text-gray-500 text-[10px] mt-1.5 border-t border-slate-150 pt-1.5 italic">
                              Remarks: {selectedDetailReport.verification.remarks}
                            </p>
                          )}
                        </div>

                        <div className="p-2.5 bg-white border border-emerald-100 rounded-xl">
                          <span className="font-extrabold text-[9px] text-gray-500 block uppercase tracking-wider mb-0.5">4.4 Supplementary Closing Remarks</span>
                          <p className="text-gray-700 italic font-medium">
                            {selectedDetailReport.closeRemarks || 'No supplementary close notes.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t px-6 py-4 flex justify-between items-center gap-2">
              <span className="text-[10px] font-mono text-gray-400">
                Logged in DKSH HSE compliant records system
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReportToPDF(selectedDetailReport)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileDown className="w-4.5 h-4.5 text-[#9D2235]" />
                  Export to PDF
                </button>
                <button
                  onClick={() => setSelectedDetailReport(null)}
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  Done View
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
