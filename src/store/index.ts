import { create } from "zustand";
import { INITIAL_CANDIDATES } from "../mock/candidates";
import { INITIAL_EMPLOYEES } from "../mock/employees";
import { INITIAL_JOBS } from "../mock/jobs";
import { INITIAL_LIFECYCLE_TASKS } from "../mock/lifecycle";
import { INITIAL_ONBOARDING_TASKS } from "../mock/onboarding";
import { INITIAL_PERF_RECORDS } from "../mock/performance";
import { INITIAL_SELF_REQUESTS } from "../mock/selfRequests";
import { INITIAL_TALENT_POOL } from "../mock/talentPool";
import type { AppState, Setter } from "../types";
import { createEmptyEmployeeForm } from "../utils/index";

export const createInitialState = (): AppState => ({
  activeApp: "hris",
  showAppSwitcher: false,
  activeNav: "employees",
  atsActiveNav: "ats-funnel",
  sidebarCollapsed: false,
  role: "HR 主管",
  employees: INITIAL_EMPLOYEES,
  onboardingTasks: INITIAL_ONBOARDING_TASKS,
  lifecycleTasks: INITIAL_LIFECYCLE_TASKS,
  jobs: INITIAL_JOBS,
  candidates: INITIAL_CANDIDATES,
  perfRecords: INITIAL_PERF_RECORDS,
  atsViewMode: "dashboard",
  atsRegionMode: "domestic",
  atsAnonymousMode: false,
  atsProgressView: "kanban",
  selectedAtsJobId: "JOB-101",
  activeCandidateDrawer: null,
  scorecardCandidate: null,
  offerCandidate: null,
  talentPool: INITIAL_TALENT_POOL,
  selfRequests: INITIAL_SELF_REQUESTS,
  showNewModal: false,
  newEmpForm: (() => createEmptyEmployeeForm())(),
  selectedEmployee: null,
  editEmpForm: null,
  isEditingEmp: false,
  prefillLifecycleModal: null,
  salaryUnlocked: false,
  showSpotlight: false,
  spotlightQuery: "",
  toast: null,
});
type Actions = {
  [K in keyof AppState as `set${Capitalize<K>}`]: Setter<AppState[K]>;
};
export const useStore = create<AppState & Actions>()((set) => {
  const initial = createInitialState();
  const actions = Object.fromEntries(
    Object.keys(initial).map((key) => [
      `set${key[0].toUpperCase()}${key.slice(1)}`,
      (value: unknown) =>
        set((state) => ({
          [key]:
            typeof value === "function"
              ? value(state[key as keyof AppState])
              : value,
        })),
    ]),
  ) as Actions;
  return { ...initial, ...actions };
});
