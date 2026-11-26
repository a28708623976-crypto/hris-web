import type { Dispatch, SetStateAction } from "react";
export type Setter<T> = Dispatch<SetStateAction<T>>;
export type Role = "HR 主管" | "部门负责人" | "普通员工";
export type EmployeeForm = {
  name: string;
  alias: string;
  gender: string;
  phone: string;
  email: string;
  birthDate: string;
  nationality: string;
  ethnicity: string;
  householdType: string;
  householdLocation: string;
  householdAddress: string;
  nativePlace: string;
  politicalStatus: string;
  maritalStatus: string;
  firstWorkDate: string;
  bankCards: {
    bankName: string;
    branchName: string;
    cardNumber: string;
    holderName: string;
    holderIdNumber: string;
    reservedPhone: string;
  }[];
  idDocs: { docType: string; docNumber: string; expiryDate: string }[];
  educations: {
    school: string;
    major: string;
    degreeLevel: string;
    studyMode: string;
    degreeTitle: string;
    startDate: string;
    endDate: string;
  }[];
  emergencyContacts: { name: string; relation: string; phone: string }[];
  familyMembers: {
    name: string;
    relation: string;
    gender: string;
    phone: string;
    birthDate: string;
  }[];
  attachments: Record<string, string>;
  department: string;
  role: string;
  manager: string;
  type: string;
  status: string;
  level: string;
  hireDate: string;
  contractEnd: string;
  probationPeriod: string;
  probationEndDate: string;
  internStartDate: string;
  internEndDate: string;
  internDailyRate: number;
  partTimePayUnit: string;
  partTimePayRate: number;
  probationBaseSalary: number;
  probationPerfSalary: number;
  baseSalary: number;
  perfSalary: number;
  contractEntity: string;
  renewalStatus: string;
};
export type Employee = EmployeeForm & {
  id: string;
  payrollPerformance?: Pick<PerformanceRecord, "grade" | "managerComment" | "okrProgress">;
};
export type OnboardingTask = {
  id: string;
  candidateName: string;
  department: string;
  role: string;
  type: string;
  expectedDate: string;
  baseSalary: number;
  perfSalary: number;
  stage: string;
  checklist: Record<string, boolean>;
  remark: string;
  phone?: string;
  email?: string;
  manager?: string;
  level?: string;
  probationRatio?: number;
};
export type LifecycleTask = {
  id: string;
  type: string;
  employeeName: string;
  employeeId: string;
  department: string;
  role: string;
  detail: string;
  stage: string;
  effectiveDate: string;
  approver: string;
};
export type Job = {
  id: string;
  title: string;
  department: string;
  headcount: number;
  location: string;
  salaryRange: string;
  applicants: number;
  interviewing: number;
  offers: number;
  priority: string;
};
export type Candidate = {
  id: string;
  jobId: string;
  name: string;
  jobTitle: string;
  department: string;
  stage: string;
  score: string;
  exp: string;
  expectedSalary: string;
  availableDate: string;
  interviewer: string;
  evaluation: string;
  phone?: string;
  email?: string;
};
export type PerformanceRecord = {
  id: string;
  name: string;
  department: string;
  role: string;
  okrProgress: number;
  selfEval: string;
  grade: string;
  status: string;
  okrSummary: string;
  managerComment: string;
};
export interface ToastMessage {
  title: string;
  message?: string;
}
export interface PendingMaterials {
  reason: string;
  deadline: string;
}
export type LifecyclePrefill = Pick<
  LifecycleTask,
  "type" | "employeeName" | "employeeId" | "department" | "role"
>;
export type LifecycleForm = LifecyclePrefill & {
  detail: string;
  effectiveDate: string;
};
export type JobForm = Pick<
  Job,
  "title" | "department" | "headcount" | "location" | "salaryRange"
>;
export interface OfferDetails {
  startDate: string;
  baseMonthly: number;
  perfMonthly: number;
  probationRatio: number;
  manager: string;
  level: string;
}
export interface Talent {
  id: string;
  name: string;
  role: string;
  company: string;
  tag: string;
  score: string;
  lastActive: string;
}
export interface SelfRequest {
  requestTypeId?: string;
  typePath?: string[];
  formValues?: RequestValues;
  id: string;
  bizType: string;
  effectiveDate: string;
  reason: string;
  status: string;
}
export interface CandidateLog {
  id: string;
  time: string;
  author: string;
  role: string;
  score?: string;
  verdict?: string;
  strengths?: string;
  concerns?: string;
  text?: string;
  isScorecard: boolean;
}
export interface AppState {
  activeApp: string;
  showAppSwitcher: boolean;
  activeNav: string;
  atsActiveNav: string;
  sidebarCollapsed: boolean;
  role: Role;
  employees: Employee[];
  onboardingTasks: OnboardingTask[];
  lifecycleTasks: LifecycleTask[];
  jobs: Job[];
  candidates: Candidate[];
  perfRecords: PerformanceRecord[];
  atsViewMode: string;
  atsRegionMode: string;
  atsAnonymousMode: boolean;
  atsProgressView: string;
  selectedAtsJobId: string;
  activeCandidateDrawer: Candidate | null;
  scorecardCandidate: Candidate | null;
  offerCandidate: Candidate | null;
  talentPool: Talent[];
  selfRequests: SelfRequest[];
  showNewModal: boolean;
  newEmpForm: EmployeeForm;
  selectedEmployee: Employee | null;
  editEmpForm: Employee | null;
  isEditingEmp: boolean;
  prefillLifecycleModal: LifecyclePrefill | null;
  salaryUnlocked: boolean;
  showSpotlight: boolean;
  spotlightQuery: string;
  toast: ToastMessage | null;
}

export interface CascaderOption {
  id: string;
  label: string;
  children?: readonly CascaderOption[];
}
export type RequestFieldType =
  "text" | "textarea" | "number" | "date" | "select" | "file";
export interface RequestField {
  name: string;
  label: string;
  type: RequestFieldType;
  required: boolean;
  options?: readonly string[];
  min?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  afterField?: string;
}
export type RequestTypeNode = { id: string; label: string } & (
  | { children: readonly RequestTypeNode[]; fields?: never }
  | { fields: readonly RequestField[]; children?: never }
);
export type RequestValues = Record<string, string | File[]>;
export interface RequestSubmission {
  path: string[];
  values: RequestValues;
}
export interface RequestSubmitResult {
  ok: boolean;
  errors: Record<string, string>;
}
