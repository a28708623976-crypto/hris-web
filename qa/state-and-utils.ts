import assert from "node:assert/strict";
import * as actual from "../src/utils";
import * as reference from "./.prototype-reference";
import { createInitialState, useStore } from "../src/store";

for (const date of [
  "",
  "invalid",
  "1996-05-12",
  "2026-11-25",
  "2027-01-01",
  "2020-02-29",
]) {
  assert.equal(actual.calcAge(date), reference.calcAge(date));
  assert.equal(actual.calcTenure(date), reference.calcTenure(date));
}
for (const date of ["", "invalid", "2026-11-25", "2024-01-31", "2024-02-29"]) {
  for (const period of ["", "3个月", "6个月", "invalid"])
    assert.equal(
      actual.calcProbationEndDate(date, period),
      reference.calcProbationEndDate(date, period),
    );
  for (const years of [1, 3, 5])
    assert.equal(
      actual.calcContractEndDate(date, years),
      reference.calcContractEndDate(date, years),
    );
  for (const days of [-1, 0, 7])
    assert.equal(
      actual.addDaysToDate(date, days),
      reference.addDaysToDate(date, days),
    );
}
for (const overrides of [
  {},
  { hireDate: "" },
  { hireDate: "2026-12-01", probationPeriod: "6个月" },
  { contractEnd: "", probationEndDate: "" },
])
  assert.deepEqual(
    actual.createEmptyEmployeeForm(overrides),
    reference.createEmptyEmployeeForm(overrides),
  );
const initial = createInitialState();
for (const [key, fixture] of Object.entries({
  employees: reference.INITIAL_EMPLOYEES,
  onboardingTasks: reference.INITIAL_ONBOARDING_TASKS,
  lifecycleTasks: reference.INITIAL_LIFECYCLE_TASKS,
  jobs: reference.INITIAL_JOBS,
  candidates: reference.INITIAL_CANDIDATES,
  perfRecords: reference.INITIAL_PERF_RECORDS,
}))
  assert.deepEqual(initial[key as keyof typeof initial], fixture);
useStore.setState(initial);
useStore.getState().setSidebarCollapsed((value) => !value);
useStore.getState().setSidebarCollapsed((value) => !value);
assert.equal(useStore.getState().sidebarCollapsed, false);
useStore.getState().setRole("部门负责人");
assert.equal(useStore.getState().role, "部门负责人");
const count = useStore.getState().employees.length;
useStore
  .getState()
  .setEmployees((previous) => [...previous, { ...previous[0], id: "QA-ONLY" }]);
assert.equal(useStore.getState().employees.length, count + 1);
assert.equal(
  createInitialState().employees.length,
  count,
  "Mock seed is not mutated by store updates",
);
console.log(
  "PASS prototype date/form parity, all six business seed datasets, and functional Zustand updates.",
);
