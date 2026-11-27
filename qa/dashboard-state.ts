import assert from "node:assert/strict";
import { createInitialState, useStore } from "../src/store";
import { dashboardSummary } from "../src/utils/dashboard";
import {
  completeOnboarding,
  approveLifecycle,
  rejectLifecycle,
} from "../src/store/workflows";
import { renewContract } from "../src/store/contracts";
useStore.setState(createInitialState());
const summary = () => {
  const s = useStore.getState();
  return dashboardSummary(
    s.employees,
    s.onboardingTasks,
    s.lifecycleTasks,
    s.employees.find((e) => e.id === "EMP005")!,
  );
};
let report = summary();
assert.equal(report.activeEmps.length, 11);
assert.equal(report.waitingOnboardingCount, 2);
assert.equal(report.pendingLifecycleCount, 2);
assert.equal(report.annualLeaveDays, 8.5);
assert.equal(report.attendanceCompliance, "99.4");
const before = report.expiringCount;
renewContract("EMP005", "2031-12-31", "", "unchanged", "");
assert.equal(summary().expiringCount, before - 1);
const task = useStore.getState().onboardingTasks[1];
completeOnboarding(task.id, task.checklist, false);
report = summary();
assert.equal(report.activeEmps.length, 12);
assert.equal(report.waitingOnboardingCount, 1);
const first = useStore.getState().onboardingTasks[0];
completeOnboarding(first.id, first.checklist, true, {
  reason: "材料稍后补交",
  deadline: "2026-12-08",
  note: "",
});
report = summary();
assert.equal(report.waitingOnboardingCount, 0);
assert.equal(report.pendingOnboardingCount, 1);
rejectLifecycle("LC-2026-001", "暂缓评估");
assert.equal(summary().pendingLifecycleCount, 1);
const probation = summary().probationCount;
approveLifecycle("LC-2026-002");
assert.equal(summary().probationCount, probation - 1);
assert.equal(summary().pendingLifecycleCount, 0);
const state = useStore.getState();
const changed = state.employees.map((e) =>
  e.id === "EMP005" ? { ...e, department: "创新部" } : e,
);
assert.ok(
  dashboardSummary(
    changed,
    [],
    [],
    changed.find((e) => e.id === "EMP005")!,
  ).deptList.includes("创新部"),
);
const empty = dashboardSummary(
  [],
  [],
  [],
  state.employees.find((e) => e.id === "EMP005")!,
  [],
);
assert.equal(empty.activeEmps.length, 0);
assert.equal(empty.expiringCount, 0);
assert.equal(empty.attendanceCompliance, "0.0");
assert.equal(empty.annualLeaveDays, 0);
const personal = dashboardSummary(
  state.employees,
  [],
  [],
  state.employees.find((e) => e.id === "EMP005")!,
  [
    {
      employeeId: "EMP005",
      annualLeaveEntitlement: 12,
      annualLeaveUsed: 3,
      compensatoryHours: 8,
      scheduledMinutes: 100,
      compliantMinutes: 98,
      pendingAppeals: 2,
    },
  ],
);
assert.equal(personal.annualLeaveDays, 9);
assert.equal(personal.attendanceCompliance, "98.0");
assert.equal(personal.pendingAppeals, 2);
useStore.setState(createInitialState());
console.log(
  "PASS 21 dashboard live-summary checks: onboarding, materials, rejection, conversion, renewal, departments, attendance balances and empty data.",
);
