/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IncidentReport,
  DistributionCenter,
  WorkingHoursEntry,
  BodyPartKey,
  ClassificationCriteria
} from './types';

export const COUNTRIES = [
  'Malaysia',
  'Singapore',
  'Thailand',
  'Indonesia',
  'Philippines',
  'Vietnam'
];

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const BODY_PARTS: Record<BodyPartKey, string> = {
  head: 'Head (not face)',
  eye: 'Eye',
  face: 'Face',
  ear: 'Ear',
  throat_neck: 'Throat, neck',
  tooth_teeth: 'Tooth, teeth',
  shoulder: 'Shoulder',
  lungs: 'Lungs',
  breast: 'Breast',
  back: 'Back (not neck)',
  elbow: 'Elbow',
  abdomen_pelvis: 'Abdomen, pelvis',
  arm: 'Arm',
  hip_leg: 'Hip, leg',
  hand_wrist: 'Hand, wrist',
  finger: 'Finger',
  groin: 'Groin',
  knee: 'Knee',
  foot_ankle: 'Foot, ankle',
  toe: 'Toe'
};

export const INJURY_TYPES = [
  'Caught in/between objects / machinery',
  'Contact with chemicals',
  'Contact with electricity / electrical arc',
  'Contact with hot or cold object',
  'Contact with moving machinery',
  'Contact with noise',
  'Struck by moving object / vehicle / equipment',
  'Falls from a higher level',
  'Inhaling, absorbing, or swallowing hazardous substances',
  'Overextension / Overexertion / Body physical effort'
];

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

export const INITIAL_DCS: DistributionCenter[] = [
  { id: 'dc-1', name: 'DC Shah Alam Ground', country: 'Malaysia', manager: 'Siti Aminah', status: 'active' },
  { id: 'dc-2', name: 'DC Penang Hub', country: 'Malaysia', manager: 'Tan Kah Sheng', status: 'active' },
  { id: 'dc-3', name: 'DC Jurong Portway', country: 'Singapore', manager: 'Lee Kian Hean', status: 'active' },
  { id: 'dc-4', name: 'DC Changi Air Cargo', country: 'Singapore', manager: 'Sarah Lim', status: 'active' },
  { id: 'dc-5', name: 'DC Bangkok North Gate', country: 'Thailand', manager: 'Somchai S.', status: 'active' },
  { id: 'dc-6', name: 'DC Samut Prakan Terminal', country: 'Thailand', manager: 'Anong P.', status: 'active' },
  { id: 'dc-7', name: 'DC Jakarta West Cargo', country: 'Indonesia', manager: 'Agung Wibowo', status: 'active' },
  { id: 'dc-8', name: 'DC Surabaya Sea Depot', country: 'Indonesia', manager: 'Eko Santoso', status: 'active' },
  { id: 'dc-9', name: 'DC Manila South Port', country: 'Philippines', manager: 'Jose Rizal Jr.', status: 'active' },
  { id: 'dc-10', name: 'DC Cavite Tech Park', country: 'Philippines', manager: 'Maria Santos', status: 'active' }
];

export const INITIAL_WORKING_HOURS: WorkingHoursEntry[] = [];

// Populate 2025 and 2026 working hours for all countries
COUNTRIES.forEach(country => {
  const baseHours = country === 'Malaysia' ? 180000 : country === 'Singapore' ? 140000 : 160000;
  
  // 2025: All months populated
  MONTHS.forEach(m => {
    // slight variation based on month
    const variance = (m.charCodeAt(0) * m.charCodeAt(1)) % 15000;
    const hrsVal = baseHours + variance;
    const empHrs = Math.round(hrsVal * 0.65);
    INITIAL_WORKING_HOURS.push({
      country,
      year: 2025,
      month: m,
      hours: hrsVal,
      employeeHours: empHrs,
      otherWorkerHours: hrsVal - empHrs,
      updatedBy: 'System Auto-Populate',
      updatedAt: '2025-12-31T23:00:00Z'
    });
  });

  // 2026: Jan to Apr populated (May is intentionally left blank so we can simulate the update error)
  MONTHS.slice(0, 4).forEach(m => {
    const variance = (m.charCodeAt(0) * m.charCodeAt(1)) % 12000;
    const hrsVal = baseHours - 5000 + variance;
    const empHrs = Math.round(hrsVal * 0.65);
    INITIAL_WORKING_HOURS.push({
      country,
      year: 2026,
      month: m,
      hours: hrsVal,
      employeeHours: empHrs,
      otherWorkerHours: hrsVal - empHrs,
      updatedBy: 'HSE Coordinator',
      updatedAt: '2026-05-30T10:30:00Z'
    });
  });

  // June 2026 is intentionally left BLANK so the app prompts the user first!
});

export const INITIAL_INCIDENTS: IncidentReport[] = [
  // Record 1: Fatality & High recovery, 2026-02
  {
    id: 'inc-101',
    status: 'closed',
    createdAt: '2026-02-12T08:30:00Z',
    date: '2026-02-12',
    time: '08:15',
    location: 'DC Shah Alam Ground',
    country: 'Malaysia',
    category: 'Injury',
    emailToCc: 'safety.my@agency.com',
    involvedPersons: [
      {
        name: 'Ahmad Faiz',
        staffId: 'STF-5542',
        department: 'Receiving & Staging',
        businessUnit: 'Consumer Retail Logistics',
        isEmployee: true,
        isInjured: true,
        placeOfEvent: 'Aisle B6 Rack-Level 4'
      }
    ],
    witnesses: [
      {
        name: 'Ramu Krishnan',
        staffId: 'STF-8812',
        department: 'Forklift Ops',
        businessUnit: 'Consumer Retail Logistics',
        isEmployee: true
      }
    ],
    occurrenceTitle: 'Operator Struck by Falling Pallet resulting in leg fracture and head injury',
    eventDescription: 'Stacking operation malfunctioned on High-rack-Aisle B6. Standard safety latch was misaligned. The pallet came loose and collided with the safety cage, fracturing the operator\'s right leg and causing concussion.',
    classification: {
      ...emptyClassification(),
      suddenEvent: true,
      externalCause: true,
      injuryCausedByEvent: true,
      causalLink: true,
      occurredInWorkEnvironment: true,
      workRelated: true,
      recoveryMoreThan6Months: { yes: true, count: 1 }, // Criteria 8
      absenceMoreThanOneDay: { yes: true, lostTimeDays: 14, count: 1 }, // Criteria 9
      restrictedWorkOrChangeRole: { yes: true, count: 1 } // Criteria 10
    },
    affectedBodyParts: {
      ...emptyBodyParts(),
      head: true,
      hip_leg: true,
      foot_ankle: true
    },
    injuryType: ['Struck by moving object / vehicle / equipment', 'Falls from a higher level'],
    investigation: {
      whyHappened: 'High level pallet was loaded beyond strict configuration limits.',
      whyFirstCause: 'Operator did not verify load weigh-slip via WMS.',
      whySystemFailed: 'WMS had a legacy threshold bug which bypassed visual warning triggers.',
      whyControlIneffective: 'Secondary physical guardrails were weak and buckled under high load impact.',
      whyGapExists: 'No automated weight scales inside the staging lift elevators.'
    },
    actions: {
      immediateCorrective: 'Lockout Aisle B6. Reinstate heavier anchor-bolts on the safety cage. Upgrade physical steel deflectors.',
      longTermPreventive: 'Rollout automated forklift weight sensor locks across Malaysia sites. Revise WMS code.',
      completionDate: '2026-03-01'
    },
    verification: {
      verifiedBy: 'Siti Aminah (HSE Manager)',
      dateOfVerification: '2026-03-05',
      remarks: 'Validated physical guard repairs. Verified forklift software update on Siti-My fleet.'
    },
    closeRemarks: 'All compliance metrics logged. Team briefed. Incident closed.'
  },
  // Record 2: Fatality in Thailand, 2026-03
  {
    id: 'inc-102',
    status: 'closed',
    createdAt: '2026-03-15T15:20:00Z',
    date: '2026-03-15',
    time: '14:45',
    location: 'DC Samut Prakan Terminal',
    country: 'Thailand',
    category: 'Injury',
    emailToCc: 'somchai.s@agency.com',
    involvedPersons: [
      {
        name: 'Arun V.',
        staffId: 'STF-TY992',
        department: 'Maintenance Support',
        businessUnit: 'HVAC Services',
        isEmployee: false,
        isInjured: true,
        placeOfEvent: 'Roof Hatch Unit C'
      }
    ],
    witnesses: [
      {
        name: 'Kitti S.',
        staffId: 'STF-TY211',
        department: 'Facilities',
        businessUnit: 'HVAC Services',
        isEmployee: true
      }
    ],
    occurrenceTitle: 'Fatal collapse of HVAC heavy condenser mount',
    eventDescription: 'Contractor was servicing roof-level HVAC mount. Anchor support rusted through, causing heavy structure collapse onto worker. Vital injuries led to clinical death in hospital.',
    classification: {
      ...emptyClassification(),
      suddenEvent: true,
      externalCause: true,
      injuryCausedByEvent: true,
      causalLink: true,
      occurredInWorkEnvironment: true,
      workRelated: true,
      resultsInDeath: { yes: true, count: 1 }, // Criteria 7
      recoveryMoreThan6Months: { yes: false, count: 0 },
      absenceMoreThanOneDay: { yes: true, lostTimeDays: 120, count: 1 }
    },
    affectedBodyParts: {
      ...emptyBodyParts(),
      back: true,
      shoulder: true,
      lungs: true
    },
    injuryType: ['Struck by moving object / vehicle / equipment'],
    investigation: {
      whyHappened: 'Corroded outdoor roof mounting failed structurally without warning.',
      whyFirstCause: 'Moisture accumulation under steel plates went unnoticed.',
      whySystemFailed: 'Yearly structural audit schedule missed outdoor roof hatches.',
      whyControlIneffective: 'Zero backup hoist line was tethered to heavy HVAC system.',
      whyGapExists: 'No clear checklist for hazardous climate corroded parts.'
    },
    actions: {
      immediateCorrective: 'Inspect all rooftop anchors. Implement a structural ban until certified safe.',
      longTermPreventive: 'Install non-corrosive fiberglass reinforcement support frames. Standardize quarterly visual testing.',
      completionDate: '2026-04-10'
    },
    verification: {
      verifiedBy: 'Anong P. (Lead Investigator)',
      dateOfVerification: '2026-04-15',
      remarks: 'Verified engineering certification of rooftop anchors.'
    },
    closeRemarks: 'Inquest completed. Structural integrity confirmed. Closed.'
  },
  // Record 3: Recordable / Lost time injury, Singapore, 2026-01
  {
    id: 'inc-103',
    status: 'closed',
    createdAt: '2026-01-20T10:00:00Z',
    date: '2026-01-20',
    time: '09:30',
    location: 'DC Jurong Portway',
    country: 'Singapore',
    category: 'Injury',
    emailToCc: 'safety.sg@agency.com',
    involvedPersons: [
      {
        name: 'Marcus Goh',
        staffId: 'STF-SG655',
        department: 'Sortation and Pack',
        businessUnit: 'E-commerce Hub',
        isEmployee: true,
        isInjured: true,
        placeOfEvent: 'Conveyor Line 4 Junction'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Entrapment of glove inside automated conveyor roller mechanism',
    eventDescription: 'Hand caught in conveyor nip point when operator reached in to clear a jammed package sticker before pressing emergency stop.',
    classification: {
      ...emptyClassification(),
      suddenEvent: true,
      externalCause: true,
      injuryCausedByEvent: true,
      causalLink: true,
      occurredInWorkEnvironment: true,
      workRelated: true,
      absenceMoreThanOneDay: { yes: true, lostTimeDays: 5, count: 1 }, // Criteria 9
      restrictedWorkOrChangeRole: { yes: true, count: 1 }, // Criteria 10
      medicalTreatmentBeyondFirstAid: { yes: true, count: 1 } // Criteria 12
    },
    affectedBodyParts: {
      ...emptyBodyParts(),
      hand_wrist: true,
      finger: true
    },
    injuryType: ['Caught in/between objects / machinery', 'Contact with moving machinery'],
    investigation: {
      whyHappened: 'Manual sticker clearing while machinery was actively running.',
      whyFirstCause: 'Operator bypassed SOP to achieve high hourly sortation targets.',
      whySystemFailed: 'Emergency pull cords were placed 3 meters away from the active roller section.',
      whyControlIneffective: 'Drip tray mechanism shield was missing a securing screw.',
      whyGapExists: 'No interlocking automatic shut-off switches on removable shields.'
    },
    actions: {
      immediateCorrective: 'Install interlocking visual trip sensors on the roller plate shield.',
      longTermPreventive: 'Refit conveyor belts with proximal emergency pull cords. Conduct lockout-tagout retraining.',
      completionDate: '2026-02-05'
    },
    verification: {
      verifiedBy: 'Lee Kian Hean (Site Director)',
      dateOfVerification: '2026-02-09',
      remarks: 'Sensor interlocks functional. Physical cage guards checked and confirmed secure.'
    },
    closeRemarks: 'LOTO session completed. Signed off.'
  },
  // Record 4: Near Miss, Malaysia, 2026-04
  {
    id: 'inc-104',
    status: 'closed',
    createdAt: '2026-04-05T11:00:00Z',
    date: '2026-04-05',
    time: '10:45',
    location: 'DC Penang Hub',
    country: 'Malaysia',
    category: 'Near miss',
    emailToCc: 'hse.penang@agency.com',
    involvedPersons: [
      {
        name: 'Lim Wei Jian',
        staffId: 'STF-MY322',
        department: 'Pallet Storage',
        businessUnit: 'Heavy Logistics',
        isEmployee: true,
        isInjured: false,
        placeOfEvent: 'Dock Gate 12 Clearance'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Forklift near miss at wet weather loading lane',
    eventDescription: 'Forklift skidded due to rainwater ingress on Dock Gate 12 floor ramp. Came to sudden halt 15cm from supervisor desk. No injury occurred.',
    classification: {
      ...emptyClassification(),
      potentialToCauseInjury: true // Criteria 16
    },
    affectedBodyParts: emptyBodyParts(),
    injuryType: ['Struck by moving object / vehicle / equipment'],
    investigation: {
      whyHappened: 'Wet environment on ramp due to high rain wind blow-in.',
      whyFirstCause: 'Dock door weather seals were broken.',
      whySystemFailed: 'Standard facility check didn\'t flag weather seals for 9 months.',
      whyControlIneffective: 'Anti-skid high traction floor tape was worn flat.',
      whyGapExists: 'No wet sensor alert system on docking aprons.'
    },
    actions: {
      immediateCorrective: 'Replace Dock Gate 12 weather seals. Apply fresh high-grit epoxy adhesive texturing.',
      longTermPreventive: 'Add rain canopy extensions on dock exterior rampways.',
      completionDate: '2026-04-20'
    },
    verification: {
      verifiedBy: 'Tan Kah Sheng (Admin Coordinator)',
      dateOfVerification: '2026-04-22',
      remarks: 'Weather seals replaced, ramp slip resistance test passed.'
    },
    closeRemarks: 'Slip-test success. Remediation verified.'
  },
  // Record 5: Hazard Observation, Singapore, 2026-05
  {
    id: 'inc-105',
    status: 'investigating',
    createdAt: '2026-05-18T14:10:00Z',
    date: '2026-05-18',
    time: '13:50',
    location: 'DC Changi Air Cargo',
    country: 'Singapore',
    category: 'Hazard Observation',
    emailToCc: 'hse.changi@agency.com',
    involvedPersons: [],
    witnesses: [],
    occurrenceTitle: 'Exposed electrical wiring bundle near main water pipe manifold',
    eventDescription: 'Spotted high-voltage wire insulation stripped off due to rodent bites, sitting less than 20cm away from the automated pressure pump main valve manifold.',
    classification: {
      ...emptyClassification(),
      hazardObservationPotentialHarm: true // Criteria 17
    },
    affectedBodyParts: emptyBodyParts(),
    injuryType: [],
    investigation: {
      whyHappened: 'Rodent damage inside insulation ductwork.',
      whyFirstCause: 'Pest prevention bait houses were empty in Sector G.',
      whySystemFailed: 'Pest control service provider failed monthly inspection report SLA.',
      whyControlIneffective: 'No armoring conduit pipes used for critical wires adjacent to plumbing.',
      whyGapExists: 'No unified safety registry for utilities overlaps.'
    },
    actions: {
      immediateCorrective: 'Cordon off water pump Sector G. Turn off breaker 4. Replace wire bundles with steel-armored conduit.',
      longTermPreventive: 'Establish rodent-proof wire channels in all wet storage compartments.',
      completionDate: '2026-05-25'
    },
    verification: {
      verifiedBy: 'Sarah Lim (Facility Specialist)',
      dateOfVerification: '2026-05-24',
      remarks: 'Physical metal conduit mounted. Tested safety trip breaker.'
    },
    closeRemarks: ''
  },
  // Record 6: Property Damage, Indonesia, 2026-03
  {
    id: 'inc-106',
    status: 'closed',
    createdAt: '2026-03-22T16:00:00Z',
    date: '2026-03-22',
    time: '15:30',
    location: 'DC Jakarta West Cargo',
    country: 'Indonesia',
    category: 'Property damaged',
    emailToCc: 'agung.w@agency.com',
    involvedPersons: [
      {
        name: 'Supardi L.',
        staffId: 'STF-IND331',
        department: 'Inbound Logistics',
        businessUnit: 'Freight Forwarding',
        isEmployee: true,
        isInjured: false,
        placeOfEvent: 'Battery Charging Dock 2'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Battery charger short circuit leading to cabinet fire',
    eventDescription: 'Incorrect charger cable gauge melted during high rapid-load battery cycle, creating sparks that ignited oil residue inside structural shelving. Serious aesthetic/structural damage to charging cabinet.',
    classification: {
      ...emptyClassification(),
      equipmentOrPropertyDamage: true // Criteria 15
    },
    affectedBodyParts: emptyBodyParts(),
    injuryType: ['Contact with electricity / electrical arc', 'Contact with hot or cold object'],
    investigation: {
      whyHappened: 'Overloaded circuit running on thin wire.',
      whyFirstCause: 'Technician used third-party generic spare cable instead of OEM parts.',
      whySystemFailed: 'Generic cables were stored in the same drawer as OEM high-voltage adapters.',
      whyControlIneffective: 'Automatic fire suppression system nozzle was covered in paint residue during remodeling, slowing heat-trigger detection.',
      whyGapExists: 'No certification check on sub-components logs.'
    },
    actions: {
      immediateCorrective: 'Remove all non-OEM chargers. Clean and certify all aerosol fire nozzles.',
      longTermPreventive: 'Secure spare cabinets with restricted RFID access to prevent unauthorized wire substitutions.',
      completionDate: '2026-04-03'
    },
    verification: {
      verifiedBy: 'Agung Wibowo (HSE Manager)',
      dateOfVerification: '2026-04-05',
      remarks: 'Cabinet reconstructed using flame retardant coatings. Suppression test passed.'
    },
    closeRemarks: 'Rebuilt safe. Closed.'
  },
  // Record 7: Injury, Philippines, 2026-04
  {
    id: 'inc-107',
    status: 'closed',
    createdAt: '2026-04-18T10:30:00Z',
    date: '2026-04-18',
    time: '10:00',
    location: 'DC Cavite Tech Park',
    country: 'Philippines',
    category: 'Injury',
    emailToCc: 'm.santos@agency.com',
    involvedPersons: [
      {
        name: 'John Paul Perez',
        staffId: 'STF-PH882',
        department: 'Sorting Gate',
        businessUnit: 'Express Parcel',
        isEmployee: true,
        isInjured: true,
        placeOfEvent: 'Conveyor Sort line'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Laceration of wrist while handling pallet steel-straps',
    eventDescription: 'Experienced cutting of left wrist. Pallet tension strap unexpectedly snapped during bundle unpacking without wearing kevlar hazard protection gloves.',
    classification: {
      ...emptyClassification(),
      suddenEvent: true,
      externalCause: true,
      injuryCausedByEvent: true,
      causalLink: true,
      absenceMoreThanOneDay: { yes: false, lostTimeDays: 0, count: 0 },
      firstAidOnly: { yes: true, count: 1 } // Criteria 14
    },
    affectedBodyParts: {
      ...emptyBodyParts(),
      hand_wrist: true,
      finger: true
    },
    injuryType: ['Caught in/between objects / machinery'],
    investigation: {
      whyHappened: 'Steel strap snapped on release.',
      whyFirstCause: 'Unpacking process done quickly under high parcel queue.',
      whySystemFailed: 'Operator did not wear level 5 cut-resistant protective equipment.',
      whyControlIneffective: 'PPE locker was stored far away from unpacking site.',
      whyGapExists: 'No physical safety hooks used when de-tensioning bundles.'
    },
    actions: {
      immediateCorrective: 'Provide local cutting stations with safety PPE permanently tethered to the table.',
      longTermPreventive: 'Conduct cut safety awareness campaigns recursively across Philippines sites.',
      completionDate: '2026-04-25'
    },
    verification: {
      verifiedBy: 'Maria Santos (Manager)',
      dateOfVerification: '2026-04-28',
      remarks: 'PPE is now deployed right at conveyor entry point.'
    },
    closeRemarks: 'Wrist minor injury healed. SOP updated.'
  },
  // Record 8: Ill health, Vietnam, 2026-05
  {
    id: 'inc-108',
    status: 'closed',
    createdAt: '2026-05-11T16:00:00Z',
    date: '2026-05-11',
    time: '15:15',
    location: 'Vietnam Main Depot',
    country: 'Vietnam',
    category: 'Ill-health',
    emailToCc: 'hse.vietnam@agency.com',
    involvedPersons: [
      {
        name: 'Nguyen Van Tu',
        staffId: 'STF-VN110',
        department: 'Chemical Storage',
        businessUnit: 'Import Logistics',
        isEmployee: true,
        isInjured: true,
        placeOfEvent: 'Chemical Bay 11'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Inhalation of chemical fumes during barrel transit',
    eventDescription: 'Barrel of cleaning solvent leaked some vapor during moving. Operator wasn\'t wearing organic respiratory filter, causing dizziness and nausea.',
    classification: {
      ...emptyClassification(),
      suddenEvent: true,
      externalCause: true,
      injuryCausedByEvent: true,
      causalLink: true,
      absenceMoreThanOneDay: { yes: true, lostTimeDays: 2, count: 1 }, // Criteria 9
      medicalTreatmentBeyondFirstAid: { yes: true, count: 1 } // Criteria 12
    },
    affectedBodyParts: {
      ...emptyBodyParts(),
      lungs: true,
      throat_neck: true
    },
    injuryType: ['Inhaling, absorbing, or swallowing hazardous substances', 'Contact with chemicals'],
    investigation: {
      whyHappened: 'Barrel lid gasket was dry-rotted.',
      whyFirstCause: 'Barrel storing checklist had no maintenance date for gaskets.',
      whySystemFailed: 'Standard chemical safety sheets were in English only, hard to read for local staff.',
      whyControlIneffective: 'Organic vapor respirator was in stock but outdated.',
      whyGapExists: 'Missing local translation for volatile warnings.'
    },
    actions: {
      immediateCorrective: 'Provide chemical warning charts in Vietnamese. Dispose of compromised barrels.',
      longTermPreventive: 'Implement mandatory chemical training in local language prior to bay access.',
      completionDate: '2026-05-20'
    },
    verification: {
      verifiedBy: 'Tran Le Giang (Specialist)',
      dateOfVerification: '2026-05-25',
      remarks: 'Vietnamese translations posted. Air filters replaced in organic masks.'
    },
    closeRemarks: 'Personnel certified as fit. Closed.'
  },
  // 3 robust 2025 records to create gorgeous year-over-year historic analytics
  {
    id: 'inc-051',
    status: 'closed',
    createdAt: '2025-08-14T09:15:00Z',
    date: '2025-08-14',
    time: '09:00',
    location: 'DC Shah Alam Ground',
    country: 'Malaysia',
    category: 'Injury',
    emailToCc: 'hse.my@agency.com',
    involvedPersons: [
      {
        name: 'Kassim Osman',
        staffId: 'STF-4432',
        department: 'Sorting',
        businessUnit: 'Parcels',
        isEmployee: true,
        isInjured: true,
        placeOfEvent: 'Conveyor Staging Area'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Finger crush injury under conveyor drive pulley',
    eventDescription: 'Finger minor bone fracture while conducting active lubrication sequence without applying appropriate motor lockout key.',
    classification: {
      ...emptyClassification(),
      suddenEvent: true,
      externalCause: true,
      injuryCausedByEvent: true,
      causalLink: true,
      absenceMoreThanOneDay: { yes: true, lostTimeDays: 10, count: 1 }, // Criteria 9
      medicalTreatmentBeyondFirstAid: { yes: true, count: 1 } // Criteria 12
    },
    affectedBodyParts: {
      ...emptyBodyParts(),
      finger: true,
      hand_wrist: true
    },
    injuryType: ['Contact with moving machinery', 'Caught in/between objects / machinery'],
    investigation: {
      whyHappened: 'Greasing was done whilst the belt was revolving.',
      whyFirstCause: 'Lubrication nipple was positioned directly adjacent to rotational sprockets.',
      whySystemFailed: 'No remote greasing expansion line was piped out of the engine casing.',
      whyControlIneffective: 'Safety instruction card was bleached and missing.',
      whyGapExists: 'Zero physical stop interlock on grease hatches.'
    },
    actions: {
      immediateCorrective: 'Fit remote-lubrication piping to direct grease safely 50cm back from gears.',
      longTermPreventive: 'Ensure remote lubrication extensions are pre-engineered on all machine procurements.',
      completionDate: '2025-08-30'
    },
    verification: {
      verifiedBy: 'Siti Aminah',
      dateOfVerification: '2025-09-02',
      remarks: 'Tested remote grease outlet. Fully functional.'
    },
    closeRemarks: 'LOTO retrained. Closed.'
  },
  {
    id: 'inc-052',
    status: 'closed',
    createdAt: '2025-10-18T14:00:00Z',
    date: '2025-10-18',
    time: '13:45',
    location: 'DC Changi Air Cargo',
    country: 'Singapore',
    category: 'Hazard Observation',
    emailToCc: 'safety.sg@agency.com',
    involvedPersons: [],
    witnesses: [],
    occurrenceTitle: 'Pallet stack leaning over pathway at mezzanine',
    eventDescription: 'Five-tier height stacked wooden crates structural shift causing 15-degree leaning angle pointing on high traffic pedestrian walking lane.',
    classification: {
      ...emptyClassification(),
      hazardObservationPotentialHarm: true
    },
    affectedBodyParts: emptyBodyParts(),
    injuryType: [],
    investigation: {
      whyHappened: 'Unbalanced bottom pallet structural decay.',
      whyFirstCause: 'Pallet exposed to outdoor moisture before warehouse staging.',
      whySystemFailed: 'Moisture measurements were not part of inventory check.',
      whyControlIneffective: 'Zero support mesh to prevent stack leaning.',
      whyGapExists: 'No standard limits on humid-timber pallets.'
    },
    actions: {
      immediateCorrective: 'Dismantle leaning pallet immediately. Restructure pallet check policies.',
      longTermPreventive: 'Specify hot-treated plastic pallet guidelines for high altitude storage.',
      completionDate: '2025-10-22'
    },
    verification: {
      verifiedBy: 'Lee Kian Hean',
      dateOfVerification: '2025-10-24',
      remarks: 'Stack relocated. Solid plastic pallet used.'
    },
    closeRemarks: 'Resolved.'
  },
  {
    id: 'inc-110',
    status: 'closed',
    createdAt: '2026-04-12T14:00:00Z',
    date: '2026-04-12',
    time: '13:30',
    location: 'DC Shah Alam Ground',
    country: 'Malaysia',
    category: 'Injury',
    emailToCc: 'safety.my@agency.com',
    involvedPersons: [
      {
        name: 'Mohamed Syakir',
        staffId: 'STF-MY391',
        department: 'Outbound Sorting',
        businessUnit: 'Consumer Fast Moving Goods',
        isEmployee: true,
        isInjured: true,
        placeOfEvent: 'Conveyor Section A-4'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Pinched index finger in conveyor guard overlap',
    eventDescription: 'Operator pinched his index finger when restoring a side guard plate on active Conveyor Sector A-4. The glove was caught under the lip of the plate.',
    classification: {
      ...emptyClassification(),
      suddenEvent: true,
      externalCause: true,
      injuryCausedByEvent: true,
      causalLink: true,
      occurredInWorkEnvironment: true,
      workRelated: true,
      absenceMoreThanOneDay: { yes: true, lostTimeDays: 3, count: 1 },
      medicalTreatmentBeyondFirstAid: { yes: true, count: 1 }
    },
    affectedBodyParts: {
      ...emptyBodyParts(),
      finger: true,
      hand_wrist: true
    },
    injuryType: ['Contact with moving machinery', 'Caught in/between objects / machinery'],
    investigation: {
      whyHappened: 'Side guard plate was missing structural alignment pins, causing operator to manually shift the heavy metal flange.',
      whyFirstCause: 'Hinges were deformed.',
      whySystemFailed: 'Daily walkthrough didn\'t emphasize checklist verification of guard hinges.',
      whyControlIneffective: 'Conveyor drive was not isolated (no LOTO applied) before touching the guard chassis.',
      whyGapExists: 'No interlocking switch installed on Conveyor Section A-4 guard casing.'
    },
    actions: {
      immediateCorrective: 'Apply LOTO strictly. Realign and weld industrial-grade guide pins to Conveyor A-4 guard panel.',
      longTermPreventive: 'Install electrical contact interlocks to trip the motor power immediately if any side guard opens.',
      completionDate: '2026-04-14'
    },
    verification: {
      verifiedBy: 'Siti Aminah (HSE Manager)',
      dateOfVerification: '2026-04-16',
      remarks: 'Verified physical alignment pins and emergency trip operation.'
    },
    closeRemarks: 'Remeasurement completed. Closed.'
  },
  {
    id: 'inc-111',
    status: 'investigating',
    createdAt: '2026-04-20T10:00:00Z',
    date: '2026-04-20',
    time: '09:15',
    location: 'DC Bangkok North Gate',
    country: 'Thailand',
    category: 'Near miss',
    emailToCc: 'somchai.s@agency.com',
    involvedPersons: [
      {
        name: 'Chatchai K.',
        staffId: 'STF-TH771',
        department: 'Inventory Management',
        businessUnit: 'Healthcare Pharma Solutions',
        isEmployee: true,
        isInjured: false,
        placeOfEvent: 'Cold Storage Room 3'
      }
    ],
    witnesses: [],
    occurrenceTitle: 'Icy condensation layer causing floor slip near pharma pallet shelf',
    eventDescription: 'Operator nearly lost balance when walking into Cold Room 3 due to an unlogged leak in the humidifier drainage pipe, causing a 2-meter icy glaze on the floor. Guardrail prevented a fall.',
    classification: {
      ...emptyClassification(),
      potentialToCauseInjury: true
    },
    affectedBodyParts: emptyBodyParts(),
    injuryType: ['Falls from a higher level'],
    investigation: {
      whyHappened: 'De-icing cycle overflowed due to a blocked drainage conduit.',
      whyFirstCause: 'Dust from storage cardboard packages clogged the drainage screen.',
      whySystemFailed: 'Yearly deep cooling cleanup was scheduled too far out.',
      whyControlIneffective: 'No high-traction thermal floor mats were laid down in high-traffic zones of Cold Room 3.',
      whyGapExists: 'No localized automated moisture sensor triggers to flag drainage overflows.'
    },
    actions: {
      immediateCorrective: 'Clear blocked drainage pipes and dry ice glaze. Deploy warning stanchions and thermal anti-slip mats.',
      longTermPreventive: 'Change chemical filters on humidifier units. Establish monthly checklist item for cold room drainage audits.',
      completionDate: '2026-04-22'
    },
    verification: {
      verifiedBy: 'Somchai S. (Thailand HSE Lead)',
      dateOfVerification: '2026-04-25',
      remarks: 'Observed clean drainage and high-grit thermal mats in place.'
    },
    closeRemarks: ''
  }
];

/**
 * Calculates safety metrics from list of reports and total hours.
 * Multiplied by 1,000,000 for industry standardization.
 */
/**
 * Centralized, timezone-independent helper to extract the exact count/value for a report for a specific metric.
 */
export function getMetricValueForReport(r: IncidentReport, key: string): number {
  const cl = r.classification;
  if (!cl) return 0;

  switch (key) {
    case 'fatalities':
      return cl.resultsInDeath?.yes ? (cl.resultsInDeath.count || 1) : 0;
    case 'highConsequence':
      return cl.recoveryMoreThan6Months?.yes ? (cl.recoveryMoreThan6Months.count || 1) : 0;
    case 'lti':
      return cl.absenceMoreThanOneDay?.yes ? (cl.absenceMoreThanOneDay.count || 1) : 0;
    case 'recordable': {
      let isRec = false;
      if (cl.recoveryMoreThan6Months?.yes) isRec = true;
      if (cl.absenceMoreThanOneDay?.yes) isRec = true;
      if (cl.restrictedWorkOrChangeRole?.yes) isRec = true;
      if (cl.lossOfConsciousness?.yes) isRec = true;
      if (cl.medicalTreatmentBeyondFirstAid?.yes) isRec = true;
      if (cl.significantInjuryDiagnosedByPhysician?.yes) isRec = true;
      return (isRec || r.category === 'Injury' || r.category === 'Ill-health') ? 1 : 0;
    }
    case 'workRelated': {
      let isRec = false;
      if (cl.recoveryMoreThan6Months?.yes) isRec = true;
      if (cl.absenceMoreThanOneDay?.yes) isRec = true;
      if (cl.restrictedWorkOrChangeRole?.yes) isRec = true;
      if (cl.lossOfConsciousness?.yes) isRec = true;
      if (cl.medicalTreatmentBeyondFirstAid?.yes) isRec = true;
      if (cl.significantInjuryDiagnosedByPhysician?.yes) isRec = true;
      const isWorkRelated = !!cl.firstAidOnly?.yes;
      return (isRec || isWorkRelated || r.category === 'Injury' || r.category === 'Ill-health') ? 1 : 0;
    }
    case 'propertyDamage':
      return (cl.equipmentOrPropertyDamage || r.category === 'Property damaged') ? 1 : 0;
    case 'nearMiss':
      return (r.category === 'Near miss' || cl.potentialToCauseInjury) ? 1 : 0;
    case 'riskObs':
      return (r.category === 'Hazard Observation' || cl.hazardObservationPotentialHarm) ? 1 : 0;
    default:
      return 0;
  }
}

export function calculateSafetyMetrics(
  reports: IncidentReport[],
  totalWorkingHours: number
) {
  // If working hours is 0, return 0 for rates to avoid division by zero
  const factor = totalWorkingHours > 0 ? (1000000 / totalWorkingHours) : 0;

  let totalFatalities = 0;
  let totalHighConsequence = 0;
  let totalRecordable = 0;
  let totalWorkRelated = 0;
  let totalLostTime = 0;
  let propertyDamageCount = 0;
  let nearMissCount = 0;
  let hazardCount = 0;

  reports.forEach(r => {
    totalFatalities += getMetricValueForReport(r, 'fatalities');
    totalHighConsequence += getMetricValueForReport(r, 'highConsequence');
    totalRecordable += getMetricValueForReport(r, 'recordable');
    totalWorkRelated += getMetricValueForReport(r, 'workRelated');
    totalLostTime += getMetricValueForReport(r, 'lti');
    propertyDamageCount += getMetricValueForReport(r, 'propertyDamage');
    nearMissCount += getMetricValueForReport(r, 'nearMiss');
    hazardCount += getMetricValueForReport(r, 'riskObs');
  });

  return {
    fatalitiesCount: totalFatalities,
    fatalitiesRate: parseFloat((totalFatalities * factor).toFixed(2)),

    highConsequenceCount: totalHighConsequence,
    highConsequenceRate: parseFloat((totalHighConsequence * factor).toFixed(2)),

    recordableCount: totalRecordable,
    recordableRate: parseFloat((totalRecordable * factor).toFixed(2)),

    workRelatedCount: totalWorkRelated,
    workRelatedRate: parseFloat((totalWorkRelated * factor).toFixed(2)),

    lostTimeCount: totalLostTime,
    lostTimeRate: parseFloat((totalLostTime * factor).toFixed(2)),

    propertyDamageCount,
    nearMissCount,
    hazardCount,
    complianceScore: Math.max(0, Math.min(100, parseFloat((100 - (totalFatalities * 35 + totalLostTime * 10 + totalRecordable * 5 + propertyDamageCount * 2 + nearMissCount * 0.5) / Math.max(1, reports.length)).toFixed(1))))
  };
}
