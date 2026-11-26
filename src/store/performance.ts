import { useStore } from "./index";

export function calibratePerformance(id: string, grade: string, comment: string) {
  let changed = false;
  useStore.setState((state) => {
    if (state.role === "普通员工" ||
      !["S (4.9)", "A (4.6)", "B+ (4.2)", "B (3.8)"].includes(grade) ||
      !state.perfRecords.some((record) => record.id === id)) return state;
    changed = true;
    return { perfRecords: state.perfRecords.map((record) => record.id === id
      ? { ...record, grade, managerComment: comment, status: "已校准" } : record) };
  });
  return changed;
}

// Keep the original bonus basis: the prototype defines no grade-to-money conversion.
// Store the calibrated inputs on the employee consumed by the payroll engine.
export function syncPerformancePayroll() {
  let synced = false;
  useStore.setState((state) => {
    if (state.role === "普通员工") return state;
    synced = true;
    return { employees: state.employees.map((employee) => {
      const record = state.perfRecords.find((item) => item.id === employee.id && item.status === "已校准");
      if (!record || employee.status === "已离职") return employee;
      const { grade, managerComment, okrProgress } = record;
      return { ...employee, payrollPerformance: { grade, managerComment, okrProgress } };
    }) };
  });
  return synced;
}
