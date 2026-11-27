import { api, errorMessage } from "./client";
import { useStore } from "../store";
import { useAuthStore } from "../store/auth";
import { useEmployeeDraft } from "../store/employeeDraft";
import type { Employee, ToastMessage } from "../types";
function mergeRecords<T extends { id: string }>(
  previous: T[],
  next: T[],
  current: T[],
): T[] {
  if (previous === next) return current;
  const changes = new Map(
    next
      .filter(
        (record) => previous.find((item) => item.id === record.id) !== record,
      )
      .map((record) => [record.id, record]),
  );
  const added = next.filter(
    (record) => !current.some((item) => item.id === record.id),
  );
  return [
    ...added,
    ...current.map((record) => changes.get(record.id) || record),
  ];
}
// Business modules remain local mock records. Their employee changes commit only
// after the employee API succeeds; no optimistic archive survives a failed write.
export async function persistEmployeeMutation(
  apply: () => ToastMessage | null,
  key?: string,
) {
  if (useEmployeeDraft.getState().busy) {
    useStore
      .getState()
      .setToast({ title: "正在保存", message: "请等待当前操作完成" });
    return false;
  }
  const writeId = crypto.randomUUID();
  useEmployeeDraft.setState({ busy: true, writeId });
  const actor = useAuthStore.getState().user?.id;
  const before = useStore.getState();
  const snapshot = {
    employees: before.employees,
    onboardingTasks: before.onboardingTasks,
    lifecycleTasks: before.lifecycleTasks,
    perfRecords: before.perfRecords,
  };
  try {
    const toast = apply();
    const next = useStore.getState();
    const proposed = {
      employees: next.employees,
      onboardingTasks: next.onboardingTasks,
      lifecycleTasks: next.lifecycleTasks,
      perfRecords: next.perfRecords,
    };
    useStore.setState(snapshot);
    if (!toast) return false;
    const changed = proposed.employees.filter(
      (employee) =>
        snapshot.employees.find((previous) => previous.id === employee.id) !==
        employee,
    );
    const saved: Employee[] = [];
    const created = changed.filter(
      (employee) =>
        !snapshot.employees.some((previous) => previous.id === employee.id),
    );
    const updates = changed.filter((employee) => !created.includes(employee));
    if (created.length > 1) throw new Error("一次只能新增一位员工");
    for (const employee of created) {
      const response = await api<{ employee: Employee }>("/employees", {
        method: "POST",
        headers: { "Idempotency-Key": key || crypto.randomUUID() },
        body: JSON.stringify(employee),
      });
      saved.push(response.employee);
    }
    if (updates.length > 1) {
      const response = await api<{ employees: Employee[] }>(
        "/employees/batch",
        { method: "POST", body: JSON.stringify({ employees: updates }) },
      );
      saved.push(...response.employees);
    } else if (updates.length === 1) {
      const response = await api<{ employee: Employee }>(
        "/employees/" + updates[0].id,
        { method: "PUT", body: JSON.stringify(updates[0]) },
      );
      saved.push(response.employee);
    }
    if (useAuthStore.getState().user?.id !== actor) return false;
    const replace = new Map(
      changed.map((employee, index) => [employee.id, saved[index]]),
    );
    // Current workflows either create one employee or update existing ones.
    const canonical = proposed.employees.map(
      (employee) => replace.get(employee.id) || employee,
    );
    const finalToast = { ...toast };
    if (created.length && saved[0])
      finalToast.message = toast.message?.replaceAll(
        created[0].id,
        saved[0].id,
      );
    useStore.setState((current) => ({
      employees: mergeRecords(snapshot.employees, canonical, current.employees),
      onboardingTasks: mergeRecords(
        snapshot.onboardingTasks,
        proposed.onboardingTasks,
        current.onboardingTasks,
      ),
      lifecycleTasks: mergeRecords(
        snapshot.lifecycleTasks,
        proposed.lifecycleTasks,
        current.lifecycleTasks,
      ),
      perfRecords: mergeRecords(
        snapshot.perfRecords,
        proposed.perfRecords,
        current.perfRecords,
      ),
      toast: finalToast,
    }));
    return true;
  } catch (error) {
    if (useAuthStore.getState().user?.id === actor)
      useStore.setState({
        toast: { title: "保存未完成", message: errorMessage(error) },
      });
    return false;
  } finally {
    if (useEmployeeDraft.getState().writeId === writeId)
      useEmployeeDraft.setState({ busy: false, writeId: null });
  }
}
