import type { Employee } from "../types";

export function employeeGross(
  employee: Pick<Employee, "baseSalary" | "perfSalary">,
) {
  return (employee.baseSalary || 0) + (employee.perfSalary || 0);
}
export function payrollSummary(employees: readonly Employee[]) {
  const activeList = employees.filter(
    (employee) => employee.status !== "已离职",
  );
  return {
    activeList,
    totalGross: activeList.reduce(
      (total, employee) => total + employeeGross(employee),
      0,
    ),
  };
}
