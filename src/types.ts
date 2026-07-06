/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Reporter' | 'Level2' | 'Superuser';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  country: string; // Default country for this user
}

export type IncidentCategory =
  | 'Injury'
  | 'Ill-health'
  | 'Property damaged'
  | 'Near miss'
  | 'Hazard Observation';

export interface InvolvedPerson {
  name: string;
  staffId: string;
  department: string;
  businessUnit: string;
  isEmployee: boolean; // true = Employee, false = Other worker
  isInjured: boolean; // true = Injured Person, false = Involved Person
  placeOfEvent: string;
}

export interface Witness {
  name: string;
  staffId: string;
  department: string;
  businessUnit: string;
  isEmployee: boolean; // true = Employee, false = Other worker
}

export interface ClassificationCriteria {
  // 1-17 Items as outlined in the spreadsheet specification
  suddenEvent: boolean; // 1
  externalCause: boolean; // 2
  injuryCausedByEvent: boolean; // 3
  causalLink: boolean; // 4
  occurredInWorkEnvironment: boolean; // 5
  workRelated: boolean; // 6
  resultsInDeath: { yes: boolean; count: number }; // 7
  recoveryMoreThan6Months: { yes: boolean; count: number }; // 8
  absenceMoreThanOneDay: { yes: boolean; lostTimeDays: number; count: number }; // 9 (9.1 Total lost time days)
  restrictedWorkOrChangeRole: { yes: boolean; count: number }; // 10
  lossOfConsciousness: { yes: boolean; count: number }; // 11
  medicalTreatmentBeyondFirstAid: { yes: boolean; count: number }; // 12
  significantInjuryDiagnosedByPhysician: { yes: boolean; count: number }; // 13
  firstAidOnly: { yes: boolean; count: number }; // 14
  equipmentOrPropertyDamage: boolean; // 15
  potentialToCauseInjury: boolean; // 16
  hazardObservationPotentialHarm: boolean; // 17
}

export type BodyPartKey =
  | 'head'
  | 'eye'
  | 'face'
  | 'ear'
  | 'throat_neck'
  | 'tooth_teeth'
  | 'shoulder'
  | 'lungs'
  | 'breast'
  | 'back'
  | 'elbow'
  | 'abdomen_pelvis'
  | 'arm'
  | 'hip_leg'
  | 'hand_wrist'
  | 'finger'
  | 'groin'
  | 'knee'
  | 'foot_ankle'
  | 'toe';

export interface IncidentReport {
  id: string;
  status: 'draft' | 'investigating' | 'closed';
  createdAt: string;
  lastStep?: number; // tracks the last active step of the wizard before saving as draft

  // --- STEP 1 ---
  date: string;
  time: string;
  location: string; // Site DC Name
  country: string;
  category: IncidentCategory;
  emailToCc: string;

  // --- STEP 2 ---
  involvedPersons: InvolvedPerson[];
  witnesses: Witness[];

  // --- STEP 3 ---
  occurrenceTitle: string;
  eventDescription: string;
  classification: ClassificationCriteria;
  affectedBodyParts: Record<BodyPartKey, boolean>;
  injuryType: string[]; // checklist values

  // --- STEP 4 (Level 2 / Superuser only) ---
  investigation: {
    whyHappened: string; // 1
    whyFirstCause: string; // 2
    whySystemFailed: string; // 3
    whyControlIneffective: string; // 4
    whyGapExists: string; // 5
  };
  actions: {
    immediateCorrective: string;
    longTermPreventive: string;
    completionDate: string;
  };
  verification: {
    verifiedBy: string;
    dateOfVerification: string;
    remarks: string;
  };
  closeRemarks: string;
}

export interface DistributionCenter {
  id: string;
  name: string; // DC Name
  country: string;
  manager: string;
  status: 'active' | 'inactive';
}

export interface WorkingHoursEntry {
  country: string; // Market
  year: number;
  month: string; // e.g. "Jan", "Feb", "Mar"
  hours: number;
  employeeHours?: number;
  otherWorkerHours?: number;
  updatedBy: string;
  updatedAt: string;
}
