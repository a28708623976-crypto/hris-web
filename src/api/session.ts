import { api, clearSession } from "./client";
import { useAuthStore, type AuthUser } from "../store/auth";
import { useStore } from "../store";
import { INITIAL_EMPLOYEES } from "../mock/employees";
import type { Employee, Role } from "../types";
let generation = 0;
export async function loadSession() {
  const current = ++generation;
  useAuthStore.setState({ status: "loading", error: "" });
  try {
    const { user } = await api<{ user: AuthUser }>("/auth/me");
    const employees =
      user.role === "dept_head"
        ? INITIAL_EMPLOYEES
        : (await api<{ employees: Employee[] }>("/employees")).employees;
    if (current !== generation) return;
    const roles: Record<AuthUser["role"], Role> = {
      hr_lead: "HR 主管",
      dept_head: "部门负责人",
      employee: "普通员工",
    };
    useStore.setState((state) => ({
      role: roles[user.role],
      employees,
      onboardingTasks: state.onboardingTasks.map((task) => {
        const employee = employees.find(
          (item) => item.onboarding?.taskId === task.id,
        );
        return employee?.onboarding
          ? { ...task, stage: employee.onboarding.stage }
          : task;
      }),
    }));
    useAuthStore.setState({ user, status: "authenticated", error: "" });
  } catch (error) {
    if (current !== generation) return;
    if (useAuthStore.getState().status !== "anonymous")
      useAuthStore.setState({
        status: "error",
        error: error instanceof Error ? error.message : "无法加载登录信息",
      });
  }
}
export async function logout() {
  await api("/auth/logout", { method: "POST", body: "{}" });
  generation++;
  clearSession();
}
