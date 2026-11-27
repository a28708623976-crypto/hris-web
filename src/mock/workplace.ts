import { INITIAL_EMPLOYEES } from "./employees";

// The prototype's November attendance and leave sample, keyed by employee.
// Keep raw balances here so Dashboard never embeds a metric in its JSX.
export interface WorkplaceRecord {
  employeeId: string;
  annualLeaveEntitlement: number;
  annualLeaveUsed: number;
  compensatoryHours: number;
  scheduledMinutes: number;
  compliantMinutes: number;
  pendingAppeals: number;
}
export const INITIAL_WORKPLACE_RECORDS: WorkplaceRecord[] =
  INITIAL_EMPLOYEES.map((employee) => ({
    employeeId: employee.id,
    annualLeaveEntitlement: 10,
    annualLeaveUsed: 1.5,
    compensatoryHours: 12,
    scheduledMinutes: 22 * 8 * 60,
    compliantMinutes: 22 * 8 * 60 - 63,
    pendingAppeals: 0,
  }));
