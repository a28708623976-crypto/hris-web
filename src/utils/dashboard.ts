import { DEPARTMENTS } from "../constants";
import {
  INITIAL_WORKPLACE_RECORDS,
  type WorkplaceRecord,
} from "../mock/workplace";
import type { Employee, LifecycleTask, OnboardingTask } from "../types";

export function dashboardSummary(
  employees: readonly Employee[],
  onboardingTasks: readonly OnboardingTask[],
  lifecycleTasks: readonly LifecycleTask[],
  currentUser: Employee,
  workplace: readonly WorkplaceRecord[] = INITIAL_WORKPLACE_RECORDS,
) {
  const activeEmps = employees.filter(
    (employee) => employee.status !== "已离职",
  );
  const pendingOnboarding = onboardingTasks.filter(
    (task) => task.stage !== "已完成入职建档",
  );
  const waitingOnboardingCount = pendingOnboarding.filter(
    (task) => !task.stage.startsWith("材料待补"),
  ).length;
  const pendingLifecycleCount = lifecycleTasks.filter(
    (task) => !["已生效归档", "已驳回"].includes(task.stage),
  ).length;
  const deptList = [
    ...new Set([
      ...DEPARTMENTS.slice(1),
      ...activeEmps.map((employee) => employee.department),
    ]),
  ];
  const activeIds = new Set(activeEmps.map((employee) => employee.id));
  const attendance = workplace.filter((record) =>
    activeIds.has(record.employeeId),
  );
  const scheduled = attendance.reduce(
    (total, record) => total + record.scheduledMinutes,
    0,
  );
  const compliant = attendance.reduce(
    (total, record) => total + record.compliantMinutes,
    0,
  );
  const personal = workplace.find(
    (record) => record.employeeId === currentUser.id,
  );
  return {
    activeEmps,
    probationCount: activeEmps.filter(
      (employee) => employee.status === "试用期",
    ).length,
    expiringCount: activeEmps.filter(
      (employee) =>
        employee.contractEnd && employee.contractEnd <= "2026-12-31",
    ).length,
    pendingLifecycleCount,
    pendingOnboardingCount: pendingOnboarding.length,
    waitingOnboardingCount,
    deptList,
    attendanceCompliance: scheduled
      ? ((compliant / scheduled) * 100).toFixed(1)
      : "0.0",
    pendingAppeals: attendance.reduce(
      (total, record) => total + record.pendingAppeals,
      0,
    ),
    annualLeaveDays: personal
      ? Math.max(0, personal.annualLeaveEntitlement - personal.annualLeaveUsed)
      : 0,
    compensatoryHours: personal?.compensatoryHours ?? 0,
  };
}
