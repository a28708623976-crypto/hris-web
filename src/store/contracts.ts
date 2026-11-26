import type { Employee, ToastMessage } from "../types";
import { useStore } from "./index";

function updateContract(
  empId: string,
  update: (employee: Employee) => Employee,
) {
  let changed = false;
  useStore.setState((state) => {
    if (
      state.role !== "HR 主管" ||
      !state.employees.some(
        (employee) => employee.id === empId && employee.status !== "已离职",
      )
    )
      return state;
    changed = true;
    return {
      employees: state.employees.map((employee) =>
        employee.id === empId ? update(employee) : employee,
      ),
    };
  });
  return changed;
}
export function renewContract(
  empId: string,
  newEndDate: string,
  newRoleName: string,
  clauseMode: string,
  clauseNotes: string,
): ToastMessage | null {
  if (
    !updateContract(empId, (employee) => ({
      ...employee,
      contractEnd: newEndDate,
      role: newRoleName || employee.role,
      renewalStatus: "normal",
    }))
  )
    return null;
  return {
    title: "劳动合同电子续签已生效",
    message: `合同到期日已更新至 ${newEndDate}（${clauseMode === "modified" && clauseNotes ? "已附补充条款" : "按原条款顺延"}）`,
  };
}
export function terminateRenewal(empId: string): ToastMessage | null {
  if (
    !updateContract(empId, (employee) => ({
      ...employee,
      renewalStatus: "terminated",
    }))
  )
    return null;
  return {
    title: "已标记到期不再续签",
    message: "系统已将该合同纳入到期终止提醒清单",
  };
}
