/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  IncidentReport,
  InvolvedPerson,
  Witness,
  ClassificationCriteria,
  BodyPartKey,
  IncidentCategory,
  DistributionCenter,
  UserRole
} from '../types';
import { COUNTRIES, INJURY_TYPES, BODY_PARTS } from '../utils';
import HumanFigure from './HumanFigure';
import {
  ShieldAlert,
  User,
  Users,
  AlertOctagon,
  Wrench,
  CheckCircle,
  FileText,
  Plus,
  Trash2,
  Lock,
  Save,
  Check,
  ShieldCheck
} from 'lucide-react';

interface InspectionFormProps {
  userRole: UserRole;
  userCountry: string;
  distributionCenters: DistributionCenter[];
  onSaveReport: (report: IncidentReport) => void;
  activeReportId?: string | null;
  onClearActiveId?: () => void;
  allExistingReports?: IncidentReport[];
}

const emptyClassification = (): ClassificationCriteria => ({
  suddenEvent: false,
  externalCause: false,
  injuryCausedByEvent: false,
  causalLink: false,
  occurredInWorkEnvironment: false,
  workRelated: true,
  resultsInDeath: { yes: false, count: 0 },
  recoveryMoreThan6Months: { yes: false, count: 0 },
  absenceMoreThanOneDay: { yes: false, lostTimeDays: 0, count: 0 },
  restrictedWorkOrChangeRole: { yes: false, count: 0 },
  lossOfConsciousness: { yes: false, count: 0 },
  medicalTreatmentBeyondFirstAid: { yes: false, count: 0 },
  significantInjuryDiagnosedByPhysician: { yes: false, count: 0 },
  firstAidOnly: { yes: false, count: 0 },
  equipmentOrPropertyDamage: false,
  potentialToCauseInjury: false,
  hazardObservationPotentialHarm: false
});

const emptyBodyParts = (): Record<BodyPartKey, boolean> => ({
  head: false, eye: false, face: false, ear: false, throat_neck: false,
  tooth_teeth: false, shoulder: false, lungs: false, breast: false,
  back: false, elbow: false, abdomen_pelvis: false, arm: false,
  hip_leg: false, hand_wrist: false, finger: false, groin: false,
  knee: false, foot_ankle: false, toe: false
});

const createNewBlankReport = (defaultCountry: string): IncidentReport => ({
  id: 'inc-' + Date.now(),
  status: 'draft',
  createdAt: new Date().toISOString(),
  date: new Date().toISOString().substring(0, 10),
  time: new Date().toTimeString().substring(0, 5),
  location: '',
  country: defaultCountry,
  category: 'Injury',
  emailToCc: '',
  involvedPersons: [],
  witnesses: [],
  occurrenceTitle: '',
  eventDescription: '',
  classification: emptyClassification(),
  affectedBodyParts: emptyBodyParts(),
  injuryType: [],
  investigation: {
    whyHappened: '',
    whyFirstCause: '',
    whySystemFailed: '',
    whyControlIneffective: '',
    whyGapExists: ''
  },
  actions: {
    immediateCorrective: '',
    longTermPreventive: '',
    completionDate: ''
  },
  verification: {
    verifiedBy: '',
    dateOfVerification: '',
    remarks: ''
  },
  closeRemarks: '',
  pdpaConsent: false
});

export default function InspectionForm({
  userRole,
  userCountry,
  distributionCenters,
  onSaveReport,
  activeReportId,
  onClearActiveId,
  allExistingReports = []
}: InspectionFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [report, setReport] = useState<IncidentReport>(() => createNewBlankReport(userCountry));

  // Temporary inputs to add to rosters in Step 2
  const [tempInvolvedName, setTempInvolvedName] = useState('');
  const [tempInvolvedId, setTempInvolvedId] = useState('');
  const [tempInvolvedDept, setTempInvolvedDept] = useState('');
  const [tempInvolvedBU, setTempInvolvedBU] = useState('');
  const [tempInvolvedIsEmployee, setTempInvolvedIsEmployee] = useState(true);
  const [tempInvolvedIsInjured, setTempInvolvedIsInjured] = useState(true);
  const [tempInvolvedPlace, setTempInvolvedPlace] = useState('');

  const [tempWitnessName, setTempWitnessName] = useState('');
  const [tempWitnessId, setTempWitnessId] = useState('');
  const [tempWitnessDept, setTempWitnessDept] = useState('');
  const [tempWitnessBU, setTempWitnessBU] = useState('');
  const [tempWitnessIsEmployee, setTempWitnessIsEmployee] = useState(true);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Load existing report if editing
  useEffect(() => {
    if (activeReportId) {
      const existing = allExistingReports.find(r => r.id === activeReportId);
      if (existing) {
        setReport(JSON.parse(JSON.stringify(existing))); // deep copy
        if (existing.status === 'draft' && existing.lastStep) {
          const maxAllowed = userRole === 'Reporter' ? 3 : 4;
          const resumedStep = Math.min(existing.lastStep, maxAllowed);
          setCurrentStep(resumedStep);
          showFeedback(`Loaded draft successfully! Resumed at Step ${resumedStep}.`);
        } else {
          setCurrentStep(1);
          showFeedback('Loaded report successfully!');
        }
      }
    }
  }, [activeReportId, allExistingReports]);

  // Handle switching countries - automatically updates filtered DCs list
  const filteredDCs = distributionCenters.filter(dc => dc.country === report.country && dc.status === 'active');

  const showFeedback = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const handleFieldChange = (field: keyof IncidentReport, value: any) => {
    setReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClassificationChange = (key: keyof ClassificationCriteria, value: any) => {
    setReport(prev => ({
      ...prev,
      classification: {
        ...prev.classification,
        [key]: value
      }
    }));
  };

  const handleBodyPartToggle = (key: BodyPartKey, isChecked: boolean) => {
    setReport(prev => ({
      ...prev,
      affectedBodyParts: {
        ...prev.affectedBodyParts,
        [key]: isChecked
      }
    }));
  };

  const handleInjuryTypeToggle = (typeStr: string) => {
    setReport(prev => {
      const idx = prev.injuryType.indexOf(typeStr);
      let nextTypes = [...prev.injuryType];
      if (idx > -1) {
        nextTypes.splice(idx, 1);
      } else {
        nextTypes.push(typeStr);
      }
      return {
        ...prev,
        injuryType: nextTypes
      };
    });
  };

  // ROSTER METHODS: INVOLVED PERSONS
  const addInvolvedPerson = () => {
    if (!tempInvolvedName.trim()) {
      showFeedback('Name of involved person is required', true);
      return;
    }
    if (report.involvedPersons.length >= 5) {
      showFeedback('Roster maximum is 5 persons', true);
      return;
    }

    const newPerson: InvolvedPerson = {
      name: tempInvolvedName,
      staffId: tempInvolvedId,
      department: tempInvolvedDept,
      businessUnit: tempInvolvedBU,
      isEmployee: tempInvolvedIsEmployee,
      isInjured: tempInvolvedIsInjured,
      placeOfEvent: tempInvolvedPlace
    };

    setReport(prev => ({
      ...prev,
      involvedPersons: [...prev.involvedPersons, newPerson]
    }));

    // Reset temporary states
    setTempInvolvedName('');
    setTempInvolvedId('');
    setTempInvolvedDept('');
    setTempInvolvedBU('');
    setTempInvolvedPlace('');
    showFeedback('Added involved person to roster.');
  };

  const removeInvolvedPerson = (index: number) => {
    setReport(prev => {
      const updated = [...prev.involvedPersons];
      updated.splice(index, 1);
      return { ...prev, involvedPersons: updated };
    });
    showFeedback('Removed from roster.');
  };

  // ROSTER METHODS: WITNESSES
  const addWitness = () => {
    if (!tempWitnessName.trim()) {
      showFeedback('Witness Name is required', true);
      return;
    }
    if (report.witnesses.length >= 5) {
      showFeedback('Witness maximum is 5 persons', true);
      return;
    }

    const newWitness: Witness = {
      name: tempWitnessName,
      staffId: tempWitnessId,
      department: tempWitnessDept,
      businessUnit: tempWitnessBU || 'Logistics',
      isEmployee: tempWitnessIsEmployee
    };

    setReport(prev => ({
      ...prev,
      witnesses: [...prev.witnesses, newWitness]
    }));

    // Reset
    setTempWitnessName('');
    setTempWitnessId('');
    setTempWitnessDept('');
    setTempWitnessBU('');
    showFeedback('Added witness successfully.');
  };

  const removeWitness = (index: number) => {
    setReport(prev => {
      const updated = [...prev.witnesses];
      updated.splice(index, 1);
      return { ...prev, witnesses: updated };
    });
    showFeedback('Removed witness.');
  };

  const handleSaveDraft = () => {
    onSaveReport({
      ...report,
      status: 'draft',
      lastStep: currentStep
    });
    showFeedback(`Draft saved successfully! (Step ${currentStep} of 4 cached)`);
  };

  const handleSubmitReport = () => {
    // Basic validation
    if (!report.date || !report.time) {
      showFeedback('Date and Time of Occurrence are mandatory fields', true);
      setCurrentStep(1);
      return;
    }
    if (!report.location) {
      showFeedback('Please select a Site Distribution Center Location', true);
      setCurrentStep(1);
      return;
    }
    if (report.category !== 'Hazard Observation' && report.involvedPersons.length === 0) {
      showFeedback('For injury incidents, you must add at least 1 Involved Person roster in Step 2', true);
      setCurrentStep(2);
      return;
    }
    if (!report.occurrenceTitle.trim()) {
      showFeedback('Please provide a descriptive short title in Step 3', true);
      setCurrentStep(3);
      return;
    }

    if (!report.pdpaConsent) {
      showFeedback('Consent to the PDPA statement is mandatory before submitting.', true);
      setCurrentStep(userRole === 'Reporter' ? 3 : 4);
      return;
    }

    // Determine final status
    const isClosedTriggered = report.status === 'closed' || userRole !== 'Reporter';
    const status: 'draft' | 'investigating' | 'closed' = isClosedTriggered ? 'closed' : 'investigating';

    const finalReport = {
      ...report,
      status
    };

    onSaveReport(finalReport);
    showFeedback(`Report officially submitted as ${status.toUpperCase()}!`);
    
    // Clear and start fresh
    setReport(createNewBlankReport(userCountry));
    setCurrentStep(1);
    if (onClearActiveId) onClearActiveId();
  };

  const loadPresetTemplate = () => {
    const blank = createNewBlankReport(userCountry);
    blank.occurrenceTitle = 'Maintenance Tech Sustained Heat Scorch during Battery Handling';
    blank.eventDescription = 'Slipped battery casing leaked thermal grease onto handling gloves during replacement.';
    blank.location = filteredDCs[0]?.name || '';
    blank.classification.suddenEvent = true;
    blank.classification.injuryCausedByEvent = true;
    blank.classification.medicalTreatmentBeyondFirstAid = { yes: true, count: 1 };
    blank.classification.absenceMoreThanOneDay = { yes: true, lostTimeDays: 3, count: 1 };
    blank.affectedBodyParts.hand_wrist = true;
    blank.affectedBodyParts.finger = true;
    blank.injuryType = ['Contact with hot or cold object', 'Contact with chemicals'];
    setReport(blank);
    showFeedback('Pre-loaded test scenario template.');
  };

  return (
    <div className="global-form-container animate-fade-in">
      <div className="global-form-card overflow-hidden !p-0">
        
        {/* Header Info */}
      <div className="bg-[#1A1A1A] border-b-2 border-dksh-red text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">HSE Incident Record & Inspection Logging</h2>
          <p className="text-xs text-slate-400 mt-1">Multi-step compliant investigation workflow (Step 1 to Step 4)</p>
        </div>
        <div className="flex gap-2">
          {report.status === 'closed' && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-semibold">
              ● STATUS: CLOSED READ-ONLY
            </span>
          )}
          <button
            type="button"
            onClick={loadPresetTemplate}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Load Test Template
          </button>
        </div>
      </div>

      {/* STEPPERS NAVIGATION RETAINING WORDING */}
      <div className="border-b border-gray-100 bg-gray-50/50 p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-start relative">
          
          {/* Background Connecting Line perfectly bisecting the 36px (w-9) circles at exactly 18px top offset */}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-200 top-[18px] -z-0" />
          
          <button
            onClick={() => setCurrentStep(1)}
            className={`relative z-10 flex flex-col items-center gap-1 group ${userRole === 'Reporter' ? 'w-1/3' : 'w-1/4'}`}
            id="form-step-1-btn"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition shrink-0 ${
              currentStep === 1
                ? 'bg-dksh-red border-dksh-red text-white shadow-md'
                : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
            }`}>
              1
            </div>
            <span className={`text-[11px] font-semibold text-center leading-tight max-w-[85px] md:max-w-none transition-all duration-200 ${
              currentStep === 1 ? 'block text-dksh-red font-bold' : 'hidden md:block text-gray-500'
            }`}>
              Reporting Step-1
            </span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`relative z-10 flex flex-col items-center gap-1 ${userRole === 'Reporter' ? 'w-1/3' : 'w-1/4'}`}
            id="form-step-2-btn"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition shrink-0 ${
              currentStep === 2
                ? 'bg-dksh-red border-dksh-red text-white shadow-md'
                : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
            }`}>
              2
            </div>
            <span className={`text-[11px] font-semibold text-center leading-tight max-w-[85px] md:max-w-none transition-all duration-200 ${
              currentStep === 2 ? 'block text-dksh-red font-bold' : 'hidden md:block text-gray-500'
            }`}>
              Step-2 (Roster)
            </span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`relative z-10 flex flex-col items-center gap-1 ${userRole === 'Reporter' ? 'w-1/3' : 'w-1/4'}`}
            id="form-step-3-btn"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition shrink-0 ${
              currentStep === 3
                ? 'bg-dksh-red border-dksh-red text-white shadow-md'
                : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
            }`}>
              3
            </div>
            <span className={`text-[11px] font-semibold text-center leading-tight max-w-[85px] md:max-w-none transition-all duration-200 ${
              currentStep === 3 ? 'block text-dksh-red font-bold' : 'hidden md:block text-gray-500'
            }`}>
              Step-3 (Safety Checks)
            </span>
          </button>

          {userRole !== 'Reporter' && (
            <button
              onClick={() => setCurrentStep(4)}
              className="relative z-10 flex flex-col items-center gap-1 w-1/4"
              id="form-step-4-btn"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition relative shrink-0 ${
                currentStep === 4
                  ? 'bg-dksh-red border-dksh-red text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
              }`}>
                4
              </div>
              <span className={`text-[11px] font-semibold text-center leading-tight max-w-[85px] md:max-w-none transition-all duration-200 ${
                currentStep === 4 ? 'block text-dksh-red font-bold' : 'hidden md:block text-gray-500'
              }`}>
                Step-4 (CAPA & Close)
              </span>
            </button>
          )}

        </div>
      </div>

      {/* FEEDBACK MASSAGE ALERT */}
      {statusMessage && (
        <div className={`p-4 text-sm font-semibold flex items-center gap-2 border-b transition-all duration-300 ${
          statusMessage.isError
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ACTIVE STEP PANELS */}
      <div className="p-4 md:p-8 form-step-container">
        
        {/* ========================================================= */}
        {/* STEP 1: OCCURRENCE CONTEXT */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-l-4 border-amber-500 bg-amber-50/50 p-4 rounded-r-lg">
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Occurrence Details:</h3>
              <p className="text-xs text-amber-700">All fields denoted below are mandatory for audit trails.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Occurrence Date *</label>
                <input
                  type="date"
                  value={report.date}
                  max="2026-06-21"
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (selectedDate && new Date(selectedDate) > new Date('2026-06-21')) {
                      alert('Future incident reporting is not permitted.');
                      return;
                    }
                    handleFieldChange('date', selectedDate);
                  }}
                  className="w-full text-sm font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Occurrence Time *</label>
                <input
                  type="time"
                  value={report.time}
                  onChange={(e) => handleFieldChange('time', e.target.value)}
                  className="w-full text-sm font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Country Location / Market</label>
                {/* Superuser can toggle any country. Level 2 can toggle but default is theirs. */}
                {userRole === 'Superuser' ? (
                  <select
                    value={report.country}
                    onChange={(e) => {
                      setReport(prev => ({ ...prev, country: e.target.value, location: '' }));
                    }}
                    className="w-full text-sm font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none bg-blue-50/50"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <select
                    value={report.country}
                    disabled
                    className="w-full text-sm font-medium border border-gray-200 rounded-lg p-2.5 bg-gray-100 text-slate-400 cursor-not-allowed opacity-60"
                  >
                    <option value={report.country}>{report.country} (Default Context)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Distribution Center Location *</label>
                <select
                  value={report.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full text-sm font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none"
                  required
                >
                  <option value="">-- Choose DC List --</option>
                  {filteredDCs.map(dc => (
                    <option key={dc.id} value={dc.name}>{dc.name} ({dc.manager})</option>
                  ))}
                  {filteredDCs.length === 0 && (
                    <option value="" disabled>No active DCs currently in {report.country}. Add one in Config panel!</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Incident Category Classification</label>
                <select
                  value={report.category}
                  onChange={(e) => handleFieldChange('category', e.target.value as IncidentCategory)}
                  className="w-full text-sm font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none bg-red-50/35 text-slate-900 font-bold"
                >
                  <option value="Injury">Injury</option>
                  <option value="Ill-health">Ill-health</option>
                  <option value="Property damaged">Property damaged</option>
                  <option value="Near miss">Near miss</option>
                  <option value="Hazard Observation">Hazard Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email to CC (Internal Notification)</label>
                <input
                  type="email"
                  value={report.emailToCc}
                  onChange={(e) => handleFieldChange('emailToCc', e.target.value)}
                  placeholder="safety.cc@enterprise.com"
                  className="w-full text-sm font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: DETAILS OF PERSON INVOLVED & WITNESS */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Condition check for Hazard Observation */}
            {report.category === 'Hazard Observation' && (
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-sky-800 text-xs">
                💡 <strong>Category Note:</strong> For <strong>Hazard Observation</strong> logs, recording specific injured rosters is optional. You may skip directly to <strong>Step-3</strong>.
              </div>
            )}

            {/* BOX 1: DETAILS OF PERSON INJURED / INVOLVED */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <User className="text-slate-700 w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Details of Person Injured / Involved (1st Party Reporting)</h3>
                  <p className="text-[11px] text-slate-500">Add next person injured/involved below. Roster accommodates up to 5 persons.</p>
                </div>
              </div>

              {/* Grid to Add Person */}
              <div id="person-injured-inputs-grid" className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">A. Name * (To add)</label>
                  <input
                    type="text"
                    value={tempInvolvedName}
                    onChange={(e) => setTempInvolvedName(e.target.value)}
                    placeholder="E.g. Tan Boon Seng"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">B. Staff ID / NRIC / Passport No.</label>
                  <input
                    type="text"
                    value={tempInvolvedId}
                    onChange={(e) => setTempInvolvedId(e.target.value)}
                    placeholder="E.g. STF-8891"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">C. Department</label>
                  <input
                    type="text"
                    value={tempInvolvedDept}
                    onChange={(e) => setTempInvolvedDept(e.target.value)}
                    placeholder="E.g. Warehouse A"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">D. Business Units</label>
                  <input
                    type="text"
                    value={tempInvolvedBU}
                    onChange={(e) => setTempInvolvedBU(e.target.value)}
                    placeholder="E.g. Cold Chain Storage"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">E. Employment Status</label>
                  <div className="flex gap-4 mt-2">
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={tempInvolvedIsEmployee === true}
                        onChange={() => setTempInvolvedIsEmployee(true)}
                        className="text-dksh-red focus:ring-dksh-red"
                      />
                      Employee (Internal)
                    </label>
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={tempInvolvedIsEmployee === false}
                        onChange={() => setTempInvolvedIsEmployee(false)}
                        className="text-dksh-red focus:ring-dksh-red"
                      />
                      Other worker (Contractor)
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">F. Injury Qualification</label>
                  <div className="flex gap-4 mt-2">
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={tempInvolvedIsInjured === true}
                        onChange={() => setTempInvolvedIsInjured(true)}
                        className="text-dksh-red focus:ring-dksh-red"
                      />
                      Injured Person
                    </label>
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={tempInvolvedIsInjured === false}
                        onChange={() => setTempInvolvedIsInjured(false)}
                        className="text-dksh-red focus:ring-dksh-red"
                      />
                      Involved Person (Associated)
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">G. Place of Event (Precise location)</label>
                  <input
                    type="text"
                    value={tempInvolvedPlace}
                    onChange={(e) => setTempInvolvedPlace(e.target.value)}
                    placeholder="E.g. Aisle B floor level 2 adjacent to charger bay"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={addInvolvedPerson}
                    className="w-full bg-dksh-active-red hover:bg-dksh-red text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" /> Add next person injured/Involved
                  </button>
                </div>
              </div>

              {/* Roster list */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Current Involved Roster: ({report.involvedPersons.length} / 5)</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full bg-white divide-y divide-gray-100 text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">No</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Name / ID</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Department / BU</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Category</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Status</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Event Location</th>
                        <th className="px-3 py-2 text-center font-bold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium">
                      {report.involvedPersons.map((p, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2.5 text-gray-500">{idx + 1}</td>
                          <td className="px-3 py-2.5 text-gray-900 font-semibold">{p.name} <span className="text-[10px] text-gray-400 block">{p.staffId}</span></td>
                          <td className="px-3 py-2.5 text-gray-600">{p.department} <span className="text-[10px] text-gray-400 block">{p.businessUnit}</span></td>
                          <td className="px-3 py-2.5">
                            {p.isEmployee ? (
                              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded">Employee</span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded">Contractor/Other</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-rose-600 font-semibold">{p.isInjured ? 'Injured' : 'Involved'}</td>
                          <td className="px-3 py-2.5 text-gray-500 italic">{p.placeOfEvent}</td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeInvolvedPerson(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded transition"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {report.involvedPersons.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No personnel registered in the reporting roster. Add above!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* BOX 2: DETAILS OF WITNESS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <Users className="text-slate-700 w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Details of Witness (If applicable)</h3>
                  <p className="text-[11px] text-slate-500">Log observers or third party witnesses. Max 5 witnesses.</p>
                </div>
              </div>

              {/* Witness Add Form */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Witness Name</label>
                  <input
                    type="text"
                    value={tempWitnessName}
                    onChange={(e) => setTempWitnessName(e.target.value)}
                    placeholder="E.g. Robert Chin"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Staff ID / NRIC / Passport No.</label>
                  <input
                    type="text"
                    value={tempWitnessId}
                    onChange={(e) => setTempWitnessId(e.target.value)}
                    placeholder="E.g. STF-4431"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Department</label>
                  <input
                    type="text"
                    value={tempWitnessDept}
                    onChange={(e) => setTempWitnessDept(e.target.value)}
                    placeholder="E.g. Transit Log"
                    className="w-full text-xs border rounded p-2 focus:ring-2 focus:ring-dksh-red mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Employment Status</label>
                  <div className="flex gap-4 mt-2">
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={tempWitnessIsEmployee === true}
                        onChange={() => setTempWitnessIsEmployee(true)}
                        className="text-dksh-red focus:ring-dksh-red"
                      />
                      Employee (Internal)
                    </label>
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={tempWitnessIsEmployee === false}
                        onChange={() => setTempWitnessIsEmployee(false)}
                        className="text-dksh-red focus:ring-dksh-red"
                      />
                      Other worker
                    </label>
                  </div>
                </div>
                <div className="flex items-end justify-end lg:col-span-2">
                  <button
                    type="button"
                    onClick={addWitness}
                    className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 transition ml-auto"
                  >
                    <Plus className="w-4 h-4" /> Add next witness
                  </button>
                </div>
              </div>

              {/* Witness Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Witness Roster: ({report.witnesses.length} / 5)</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full bg-white divide-y divide-gray-100 text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">No</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Witness Name / ID</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Department</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-600">Affiliation</th>
                        <th className="px-3 py-2 text-center font-bold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                      {report.witnesses.map((w, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-semibold text-gray-950">{w.name} <span className="text-[10px] text-gray-400 font-mono">({w.staffId})</span></td>
                          <td className="px-3 py-2">{w.department}</td>
                          <td className="px-3 py-2">
                            {w.isEmployee ? (
                              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded">Internal Staff</span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded">External Party</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeWitness(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {report.witnesses.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No formal witnesses logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: OCCURRENCE DETAIL / RISK CRITERIA & HUMAN BODY GRAPHIC */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Occurrence Text Details */}
            <div className="global-sub-card">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Brief Narrative Summary:</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Occurrence Title *</label>
                  <p className="text-[10px] text-rose-500 mb-1">E.g. Maintenance Worker Sustained Fractured Leg Due to Fall from Ladder</p>
                  <input
                    type="text"
                    value={report.occurrenceTitle}
                    onChange={(e) => handleFieldChange('occurrenceTitle', e.target.value)}
                    placeholder="Enter short descriptive title of incident"
                    className="w-full text-sm font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Describe the events (SOP check details / No personal key data)</label>
                  <textarea
                    rows={4}
                    value={report.eventDescription}
                    onChange={(e) => handleFieldChange('eventDescription', e.target.value)}
                    placeholder="Detailed narrative of safety gaps, machine speed settings, cargo conditions prior to issue..."
                    className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-dksh-red focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CRITERIA MATRIX - 17 EXCEL ITEMS */}
            <div className={`rounded-xl border p-4 md:p-6 transition-opacity ${
              report.category === 'Hazard Observation' ? 'bg-sky-50/50 border-sky-100 opacity-80' : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Incident Classification Criteria Checklists</h3>
                  <p className="text-[11px] text-gray-500">Configure yes/no parameters corresponding to physical impacts.</p>
                </div>
              </div>

              {/* Checklist Elements table layout resembling sheet */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left divide-y divide-gray-100">
                  <thead className="bg-gray-50 font-bold text-gray-600">
                    <tr>
                      <th className="px-3 py-2 w-12 text-center">No</th>
                      <th className="px-3 py-2">Qualifying Safety Verification Criteria</th>
                      <th className="px-3 py-2 w-28 text-center">Yes / No</th>
                      <th className="px-3 py-2 w-64">Quantitative Scope (If Yes)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    
                    {/* Items 1 to 6 */}
                    {[
                      { key: 'suddenEvent', num: 1, text: 'There is a sudden (but not abnormal) event' },
                      { key: 'externalCause', num: 2, text: 'At least one external cause' },
                      { key: 'injuryCausedByEvent', num: 3, text: 'The injury caused by the event' },
                      { key: 'causalLink', num: 4, text: 'A casual link between the event and the injury' },
                      { key: 'occurredInWorkEnvironment', num: 5, text: 'The event occurred in the work environment' },
                      { key: 'workRelated', num: 6, text: 'The event must be work related' }
                    ].map(item => {
                      const activeVal = (report.classification as any)[item.key] as boolean;
                      const disabled = false;
                      return (
                        <tr key={item.num} className={disabled ? 'opacity-45' : ''}>
                          <td className="px-3 py-2.5 text-center font-mono text-gray-400">{item.num}</td>
                          <td className="px-3 py-2.5 text-gray-700">{item.text}</td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={activeVal}
                              disabled={disabled}
                              onChange={(e) => handleClassificationChange(item.key as keyof ClassificationCriteria, e.target.checked)}
                              className="w-4 h-4 text-dksh-red border-gray-300 rounded focus:ring-dksh-red cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-gray-400 italic text-[10px]">Boolean check Only</td>
                        </tr>
                      );
                    })}

                    {/* Fatalities: Results in death: Criteria No.7 */}
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono text-gray-400">7</td>
                      <td className="px-3 py-2.5 text-gray-900 font-semibold text-rose-600 flex items-center gap-1">
                        💀 Results in death (Fatality)
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={report.classification.resultsInDeath.yes}
                          onChange={(e) => {
                            const val = e.target.checked;
                            handleClassificationChange('resultsInDeath', { yes: val, count: val ? Math.max(1, report.classification.resultsInDeath.count) : 0 });
                          }}
                          className="w-4 h-4 text-dksh-red border-gray-300 rounded focus:ring-dksh-red cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        {report.classification.resultsInDeath.yes && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase">No. of person:</span>
                            <input
                              type="number"
                              min={1}
                              value={report.classification.resultsInDeath.count}
                              onChange={(e) => {
                                const cnt = parseInt(e.target.value) || 1;
                                handleClassificationChange('resultsInDeath', { yes: true, count: cnt });
                              }}
                              className="w-16 border rounded text-xs p-1 text-center bg-rose-50 border-rose-200"
                            />
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Recovery > 6 Months: Criteria No. 8 */}
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono text-gray-400">8</td>
                      <td className="px-3 py-2.5 text-gray-700">More than 6 months till full recovery (High-Consequence)</td>
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={report.classification.recoveryMoreThan6Months.yes}
                          onChange={(e) => {
                            const val = e.target.checked;
                            handleClassificationChange('recoveryMoreThan6Months', { yes: val, count: val ? Math.max(1, report.classification.recoveryMoreThan6Months.count) : 0 });
                          }}
                          className="w-4 h-4 text-dksh-red border-gray-300 rounded focus:ring-dksh-red cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        {report.classification.recoveryMoreThan6Months.yes && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase">No. of person:</span>
                            <input
                              type="number"
                              min={1}
                              value={report.classification.recoveryMoreThan6Months.count}
                              onChange={(e) => {
                                const cnt = parseInt(e.target.value) || 1;
                                handleClassificationChange('recoveryMoreThan6Months', { yes: true, count: cnt });
                              }}
                              className="w-16 border rounded text-xs p-1 text-center bg-blue-50"
                            />
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Lost Time: Criteria No. 9 */}
                    <tr>
                      <td className="px-3 py-2.5 text-center font-mono text-gray-400">9</td>
                      <td className="px-3 py-2.5 text-gray-900 font-semibold text-amber-700">
                        Involving at least one day of absence beyond the actual day of event (LTI)
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={report.classification.absenceMoreThanOneDay.yes}
                          onChange={(e) => {
                            const val = e.target.checked;
                            handleClassificationChange('absenceMoreThanOneDay', {
                              yes: val,
                              count: val ? Math.max(1, report.classification.absenceMoreThanOneDay.count) : 0,
                              lostTimeDays: val ? Math.max(1, report.classification.absenceMoreThanOneDay.lostTimeDays) : 0
                            });
                          }}
                          className="w-4 h-4 text-dksh-red border-gray-300 rounded focus:ring-dksh-red cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        {report.classification.absenceMoreThanOneDay.yes && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 uppercase">No. of person:</span>
                              <input
                                type="number"
                                min={1}
                                value={report.classification.absenceMoreThanOneDay.count}
                                onChange={(e) => {
                                  const cnt = parseInt(e.target.value) || 1;
                                  handleClassificationChange('absenceMoreThanOneDay', { ...report.classification.absenceMoreThanOneDay, count: cnt });
                                }}
                                className="w-14 border rounded text-xs p-1 text-center bg-amber-50/50"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 uppercase">9.1 Total lost time (days):</span>
                              <input
                                type="number"
                                min={1}
                                value={report.classification.absenceMoreThanOneDay.lostTimeDays}
                                onChange={(e) => {
                                  const days = parseInt(e.target.value) || 1;
                                  handleClassificationChange('absenceMoreThanOneDay', { ...report.classification.absenceMoreThanOneDay, lostTimeDays: days });
                                }}
                                className="w-16 border rounded text-xs p-[2px] text-center font-bold bg-amber-100/50 border-amber-300"
                              />
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Criteria 10 till 14 */}
                    {[
                      { key: 'restrictedWorkOrChangeRole', num: 10, text: 'Restricted work or change of role' },
                      { key: 'lossOfConsciousness', num: 11, text: 'Loss of consciousness' },
                      { key: 'medicalTreatmentBeyondFirstAid', num: 12, text: 'Requiring medical treatment beyond first aid' },
                      { key: 'significantInjuryDiagnosedByPhysician', num: 13, text: 'Significant injury diagnosed by physician' },
                      { key: 'firstAidOnly', num: 14, text: 'Requiring first aid treatment only' }
                    ].map(item => {
                      const data = (report.classification as any)[item.key] as { yes: boolean; count: number };
                      const disabled = false;
                      return (
                        <tr key={item.num} className={disabled ? 'opacity-45' : ''}>
                          <td className="px-3 py-2.5 text-center font-mono text-gray-400">{item.num}</td>
                          <td className="px-3 py-2.5 text-gray-700">{item.text}</td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={data.yes}
                              disabled={disabled}
                              onChange={(e) => {
                                const val = e.target.checked;
                                handleClassificationChange(item.key as keyof ClassificationCriteria, { yes: val, count: val ? Math.max(1, data.count) : 0 });
                              }}
                              className="w-4 h-4 text-dksh-red border-gray-300 rounded focus:ring-dksh-red cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            {data.yes && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 uppercase">No. of person:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={data.count}
                                  onChange={(e) => {
                                    const cnt = parseInt(e.target.value) || 1;
                                    handleClassificationChange(item.key as keyof ClassificationCriteria, { yes: true, count: cnt });
                                  }}
                                  className="w-16 border rounded text-xs p-1 text-center bg-gray-50"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Criteria 15, 16, 17 values */}
                    {[
                      { key: 'equipmentOrPropertyDamage', num: 15, text: 'Damage to equipment, tools, material or property (Property Damage)', color: 'text-rose-600 font-semibold' },
                      { key: 'potentialToCauseInjury', num: 16, text: 'Event with potential to cause injury (Near miss)', color: 'text-amber-600 font-semibold' },
                      { key: 'hazardObservationPotentialHarm', num: 17, text: 'Hazard observation potentially leading to harm to a person', color: 'text-sky-700 font-semibold' }
                    ].map(item => {
                      const activeVal = (report.classification as any)[item.key] as boolean;
                      return (
                        <tr key={item.num} className="bg-slate-50/50">
                          <td className="px-3 py-2.5 text-center font-mono text-gray-400">{item.num}</td>
                          <td className={`px-3 py-2.5 ${item.color}`}>{item.text}</td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={activeVal}
                              onChange={(e) => handleClassificationChange(item.key as keyof ClassificationCriteria, e.target.checked)}
                              className="w-4 h-4 text-dksh-red border-gray-300 rounded focus:ring-dksh-red cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-[10px] font-semibold text-slate-500">Qualifies corresponding category</td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            </div>

            {/* INTERACTIVE COMPONENT: HUMAN BODY PARTS INJURED */}
            {report.category !== 'Hazard Observation' && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="border-b pb-3 mb-6">
                  <h3 className="text-sm font-bold text-gray-900">Body Parts Affected / Injured (select all applicable):</h3>
                  <p className="text-xs text-rose-500 mt-1">**Request to Include body part graphic. Directly touch hotspots on the worker below to toggle checklist, or check items below.</p>
                </div>

                <div id="body-parts-master-wrapper" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left checklist box (4 Cols) */}
                  <div id="mobile-hide-checkbox-list" className="hidden lg:block lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 space-y-2 h-[480px] overflow-y-auto">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold uppercase tracking-wider block mb-3">
                      List Checklist
                    </span>
                    {(Object.keys(BODY_PARTS) as BodyPartKey[]).map(key => {
                      const idVal = `bodypart-${key}`;
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs cursor-pointer border transition font-medium ${
                            report.affectedBodyParts[key]
                              ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                              : 'hover:bg-gray-50 border-gray-100 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={report.affectedBodyParts[key]}
                            onChange={(e) => handleBodyPartToggle(key, e.target.checked)}
                            className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 cursor-pointer"
                            id={idVal}
                          />
                          <span>{BODY_PARTS[key]}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Right Human Worker Graphic wrapper component (8 Cols) */}
                  <div id="body-parts-diagram-area-wrapper" className="lg:col-span-8 flex flex-col items-center">
                    <HumanFigure
                      mode="interactive-select"
                      selectedParts={report.affectedBodyParts}
                      onChange={handleBodyPartToggle}
                    />
                  </div>

                </div>
              </div>
            )}

            {/* WORK RELATED INJURY / ILL HEALTH MAIN TYPE */}
            {report.category !== 'Hazard Observation' && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Main Type of Work-related Injury / Ill health (Choose relevant):</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-5 rounded-lg border border-slate-200">
                  {INJURY_TYPES.map((type, idx) => {
                    const isSelected = report.injuryType.includes(type);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg border text-xs cursor-pointer transition font-medium ${
                          isSelected
                            ? 'bg-red-50 border-red-200 text-slate-900 font-bold shadow-xs'
                            : 'hover:bg-gray-50 border-gray-100 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleInjuryTypeToggle(type)}
                          className="w-4 h-4 text-dksh-red border-gray-300 rounded focus:ring-dksh-red mt-0.5 cursor-pointer"
                        />
                        <span>{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PDPA Consent Statement for Reporter on Step 3 */}
            {userRole === 'Reporter' && (
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-6 space-y-4 shadow-sm mt-6 animate-fade-in" id="pdpa-consent-container-step3-reporter">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-widest">
                      Personal Data Protection Act (PDPA) Consent
                    </h4>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      In accordance with the Personal Data Protection Act (PDPA), DKSH is committed to protecting your personal data and ensuring that your privacy is respected. By submitting this form, you consent to the collection, use, disclosure, and processing of your personal data for the purpose of HSE Incident Reporting and related investigation, corrective action, compliance, and record-keeping activities within DKSH.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-rose-200/60">
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 transition">
                    <input
                      type="checkbox"
                      checked={!!report.pdpaConsent}
                      onChange={(e) => handleFieldChange('pdpaConsent', e.target.checked)}
                      className="w-4 h-4 text-rose-600 border-rose-300 rounded focus:ring-rose-500 cursor-pointer"
                      id="pdpa-consent-checkbox-step3-reporter"
                    />
                    <span className="text-xs font-bold text-rose-950">
                      I agree and consent to the PDPA statement *
                    </span>
                  </label>
                </div>
              </div>
            )}


          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: INVESTIGATION & ACTIONS (LEVEL 2/SUPERUSER ONLY) */}
        {/* ========================================================= */}
        {currentStep === 4 && userRole !== 'Reporter' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="bg-[#1A1A1A] text-white p-5 rounded-xl border border-slate-800 shadow-lg flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-dksh-red shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Investigator & Approvals Panel (Step 4)</h3>
                <p className="text-xs text-slate-300">This form section must only be filled by Lvl 2 Country HSE Managers or Superusers to route back to reporter or close out directly.</p>
              </div>
            </div>

            {/* Section 4.1: 5 Why root cause */}
            {report.category !== 'Hazard Observation' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b pb-2 mb-4">4.1 Root Cause Investigation (The 5-Why Methodology)</h3>
                <div className="space-y-4">
                  {[
                    { field: 'whyHappened', num: 1, label: '1. Why did this incident happen?' },
                    { field: 'whyFirstCause', num: 2, label: '2. Why did the first cause occur?' },
                    { field: 'whySystemFailed', num: 3, label: '3. Why did this process/system fail?' },
                    { field: 'whyControlIneffective', num: 4, label: '4. Why was the control or procedure ineffective or missing?' },
                    { field: 'whyGapExists', num: 5, label: '5. Why does this gap exist in the system (root cause)?' }
                  ].map((item) => (
                    <div key={item.num} className="bg-white p-4 rounded border border-gray-200 shadow-xs">
                      <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">{item.label}</label>
                      <textarea
                        rows={2}
                        value={(report.investigation as any)[item.field]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReport(prev => ({
                            ...prev,
                            investigation: {
                              ...prev.investigation,
                              [item.field]: val
                            }
                          }));
                        }}
                        placeholder="Free Text..."
                        className="w-full text-xs font-medium border border-gray-300 rounded p-2 focus:ring-1 focus:ring-dksh-red focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4.2: Actions */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b pb-2 mb-4">4.2 Proposed Corrective and Preventive Action</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded border border-gray-200">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">a) Immediate Corrective Action</label>
                  <textarea
                    rows={3}
                    value={report.actions.immediateCorrective}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReport(prev => ({ ...prev, actions: { ...prev.actions, immediateCorrective: val } }));
                    }}
                    placeholder="Physical remediation steps deployed within 24 hours..."
                    className="w-full text-xs font-medium border border-gray-300 rounded p-2 focus:ring-1 focus:ring-dksh-red focus:outline-none"
                  />
                </div>

                <div className="bg-white p-4 rounded border border-gray-200">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">b) Long Term Preventive Action</label>
                  <textarea
                    rows={3}
                    value={report.actions.longTermPreventive}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReport(prev => ({ ...prev, actions: { ...prev.actions, longTermPreventive: val } }));
                    }}
                    placeholder="Engineering controls, WMS system configuration alterations to prevent recursive failures..."
                    className="w-full text-xs font-medium border border-gray-300 rounded p-2 focus:ring-1 focus:ring-dksh-red focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={report.actions.completionDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReport(prev => ({ ...prev, actions: { ...prev.actions, completionDate: val } }));
                    }}
                    className="w-full md:w-1/3 text-xs font-semibold border border-gray-300 rounded p-2 focus:ring-1 focus:ring-dksh-red"
                  />
                </div>
              </div>
            </div>

            {/* Section 4.3 & 4.4: Verification & Sign-off close */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b pb-2 mb-4">4.3 Verification & Sign-Off Close</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded border border-gray-200 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Verified by (Name/Signature)</label>
                  <input
                    type="text"
                    value={report.verification.verifiedBy}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReport(prev => ({ ...prev, verification: { ...prev.verification, verifiedBy: val } }));
                    }}
                    placeholder="HSE Auditor name"
                    className="w-full text-xs font-semibold border rounded p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Date of Verification</label>
                  <input
                    type="date"
                    value={report.verification.dateOfVerification}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReport(prev => ({ ...prev, verification: { ...prev.verification, dateOfVerification: val } }));
                    }}
                    className="w-full text-xs font-semibold border rounded p-2 mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Audit Verification Remarks / Proof of closing</label>
                  <textarea
                    rows={2}
                    value={report.verification.remarks}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReport(prev => ({ ...prev, verification: { ...prev.verification, remarks: val } }));
                    }}
                    placeholder="E.g. Verified photo attachments of machinery shield upgrades. Conducted team briefing on 2026-05-12."
                    className="w-full text-xs font-medium border rounded p-2 mt-1"
                  />
                </div>
              </div>

              {/* 4.4 Investigation Team/PIC close the incident */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                  4.4 Investigation Team / PIC close the incident notes
                </label>
                <textarea
                  rows={2}
                  value={report.closeRemarks}
                  onChange={(e) => handleFieldChange('closeRemarks', e.target.value)}
                  placeholder="Final administrative summaries / Insurance claims reference numbers / Closed..."
                  className="w-full text-xs font-medium border border-amber-300 bg-white rounded p-2.5 focus:ring-1 focus:ring-amber-500 mt-1"
                />
              </div>

              {/* 4.5 PDPA Consent Statement */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-6 space-y-4 shadow-sm" id="pdpa-consent-container-step4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-widest">
                      Personal Data Protection Act (PDPA) Consent
                    </h4>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      In accordance with the Personal Data Protection Act (PDPA), DKSH is committed to protecting your personal data and ensuring that your privacy is respected. By submitting this form, you consent to the collection, use, disclosure, and processing of your personal data for the purpose of HSE Incident Reporting and related investigation, corrective action, compliance, and record-keeping activities within DKSH.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-rose-200/60">
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 transition">
                    <input
                      type="checkbox"
                      checked={!!report.pdpaConsent}
                      onChange={(e) => handleFieldChange('pdpaConsent', e.target.checked)}
                      className="w-4 h-4 text-rose-600 border-rose-300 rounded focus:ring-rose-500 cursor-pointer"
                      id="pdpa-consent-checkbox-step4"
                    />
                    <span className="text-xs font-bold text-rose-950">
                      I agree and consent to the PDPA statement
                    </span>
                  </label>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* FOOTER WIZARD CONTROLS */}
      <div className="border-t border-gray-100 bg-slate-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Step back */}
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className={`px-5 py-2 rounded-lg font-bold text-xs border transition ${
            currentStep === 1
              ? 'border-gray-200 text-gray-300 bg-gray-100 cursor-not-allowed'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous Step
        </button>

        {/* CC State */}
        <div className="text-xs text-gray-500 font-mono italic">
          {report.involvedPersons.length} personnel, {report.witnesses.length} witnesses logged
        </div>

        {/* Forward or submit */}
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 transition flex items-center justify-center gap-1"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>

          {currentStep < (userRole === 'Reporter' ? 3 : 4) ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(userRole === 'Reporter' ? 3 : 4, prev + 1))}
              className="w-full sm:w-auto bg-dksh-active-red hover:bg-dksh-red text-white text-xs font-bold px-5 py-2 rounded-lg transition shadow-sm"
              id="next-step-btn"
            >
              Next Step
            </button>
          ) : (
            userRole === 'Reporter' ? (
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={!report.pdpaConsent}
                className={`w-full sm:w-auto text-xs font-bold px-6 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow ${
                  !report.pdpaConsent
                    ? 'bg-red-200 text-indigo-50/80 cursor-not-allowed opacity-70'
                    : 'bg-dksh-active-red hover:bg-dksh-red text-white'
                }`}
                id="submit-reporter-btn-step3"
              >
                <Check className="w-4 h-4" /> Submit Incident Report
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={!report.pdpaConsent}
                className={`w-full sm:w-auto text-xs font-bold px-6 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow ${
                  !report.pdpaConsent
                    ? 'bg-emerald-300 text-emerald-50/80 cursor-not-allowed opacity-70'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                id="submit-close-btn-step4"
              >
                <Check className="w-4 h-4" /> Submit Report & Close
              </button>
            )
          )}
        </div>

      </div>

    </div>
  </div>
  );
}
