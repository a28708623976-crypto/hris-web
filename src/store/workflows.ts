import type {
  AppState,
  LifecycleForm,
  LifecycleTask,
  OnboardingTask,
  PendingMaterials,
  ToastMessage,
} from "../types";
import {
  calcContractEndDate,
  calcProbationEndDate,
  createEmptyEmployeeForm,
} from "../utils";
import { useStore } from "./index";

type WorkflowState = Pick<
  AppState,
  "role" | "employees" | "onboardingTasks" | "lifecycleTasks"
>;
type WorkflowPatch = Partial<
  Pick<AppState, "employees" | "onboardingTasks" | "lifecycleTasks">
>;
type Transition = (
  state: WorkflowState,
) => { patch: WorkflowPatch; toast: ToastMessage } | null;

// Resolve against the current store and commit related data together. Repeated
// callbacks cannot reuse a stale task stage or allocate the same employee ID.
function apply(transition: Transition): ToastMessage | null {
  let toast: ToastMessage | null = null;
  useStore.setState((state) => {
    const result = transition(state);
    if (!result) return state;
    toast = result.toast;
    return Object.keys(result.patch).length ? result.patch : state;
  });
  return toast;
}

function canReview(state: WorkflowState, task: LifecycleTask) {
  return (
    state.role === "HR 主管" ||
    (state.role === "部门负责人" &&
      task.department ===
        state.employees.find((employee) => employee.id === "EMP004")
          ?.department)
  );
}
const terminal = (task: LifecycleTask) =>
  task.stage === "已生效归档" || task.stage === "已驳回";

export function completeOnboarding(
  taskId: string,
  checklist: OnboardingTask["checklist"],
  isPendingMaterials: boolean,
  pendingMeta: PendingMaterials | null = null,
) {
  return apply((state) => {
    const task = state.onboardingTasks.find((task) => task.id === taskId);
    if (
      state.role !== "HR 主管" ||
      !task ||
      task.stage === "已完成入职建档" ||
      task.stage.startsWith("材料待补")
    )
      return null;
    const materialKeys = [
      "idCard",
      "diploma",
      "resignationCert",
      "bankCard",
      "medicalReport",
    ];
    if (!isPendingMaterials && !materialKeys.every((key) => checklist[key]))
      return null;
    if (
      isPendingMaterials &&
      (!pendingMeta?.deadline || !pendingMeta.reason.trim())
    )
      return null;
    const pendingLabel =
      isPendingMaterials && pendingMeta?.deadline
        ? `材料待补 · 截止 ${pendingMeta.deadline}`
        : "材料待补全";
    const maxNum = state.employees.reduce((max, employee) => {
      const number = parseInt(employee.id.replace(/\D/g, ""), 10);
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);
    const nextId = `EMP${String(maxNum + 1).padStart(3, "0")}`;
    const probationRatio = (task.probationRatio || 80) / 100;
    const employee = createEmptyEmployeeForm({
      id: nextId,
      name: task.candidateName,
      phone: task.phone || "",
      email: task.email || "",
      department: task.department,
      role: task.role,
      manager: task.manager || "陈嘉宁",
      level: task.level || "P5",
      type: task.type || "全职",
      status: "试用期",
      hireDate: task.expectedDate,
      contractEnd: calcContractEndDate(task.expectedDate, 3),
      probationPeriod: "3个月",
      probationEndDate: calcProbationEndDate(task.expectedDate, "3个月"),
      probationBaseSalary: Math.round((task.baseSalary || 0) * probationRatio),
      probationPerfSalary: task.perfSalary || 0,
      baseSalary: task.baseSalary || 0,
      perfSalary: task.perfSalary || 0,
    });
    return {
      patch: {
        employees: [employee, ...state.employees],
        onboardingTasks: state.onboardingTasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                checklist: { ...checklist },
                stage: isPendingMaterials ? pendingLabel : "已完成入职建档",
                remark:
                  isPendingMaterials && pendingMeta
                    ? `${item.remark}（先办入职原因：${pendingMeta.reason} · 补交截止：${pendingMeta.deadline}）`
                    : item.remark,
              }
            : item,
        ),
      },
      toast: {
        title: isPendingMaterials
          ? `已办理先行入职（${pendingLabel}）`
          : "入职材料核验通过并完成建档",
        message: `${task.candidateName} 已分配工号 ${nextId} 并同步至花名册`,
      },
    };
  });
}

export function approveLifecycle(taskId: string) {
  return apply((state) => {
    const task = state.lifecycleTasks.find((task) => task.id === taskId);
    if (
      !task ||
      terminal(task) ||
      !canReview(state, task) ||
      !state.employees.some((employee) => employee.id === task.employeeId)
    )
      return null;
    return {
      patch: {
        lifecycleTasks: state.lifecycleTasks.map((item) =>
          item.id === taskId ? { ...item, stage: "已生效归档" } : item,
        ),
        employees: state.employees.map((employee) => {
          if (employee.id !== task.employeeId) return employee;
          if (task.type === "转正评估")
            return { ...employee, status: "正式员工" };
          if (task.type === "离职办理")
            return { ...employee, status: "已离职" };
          if (task.type === "内部调岗")
            return {
              ...employee,
              role: task.role,
              department: task.department,
            };
          return employee;
        }),
      },
      toast: {
        title: "审批已办结并同步花名册",
        message: `${task.employeeName} 的「${task.type}」已生效`,
      },
    };
  });
}

export function rejectLifecycle(taskId: string, reason: string) {
  return apply((state) => {
    const task = state.lifecycleTasks.find((task) => task.id === taskId);
    if (!task || terminal(task) || !canReview(state, task) || !reason.trim())
      return null;
    return {
      patch: {
        lifecycleTasks: state.lifecycleTasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                stage: "已驳回",
                detail: `${item.detail}（驳回原因：${reason.trim()}）`,
              }
            : item,
        ),
      },
      toast: {
        title: "流程已驳回退回",
        message: `单号 ${taskId} 已退回发起人修改`,
      },
    };
  });
}

export function createLifecycleTask(form: LifecycleForm) {
  return apply((state) => {
    const isDeptLead = state.role === "部门负责人";
    const department = state.employees.find(
      (employee) => employee.id === "EMP004",
    )?.department;
    if (state.role !== "HR 主管" && !isDeptLead) return null;
    if (
      isDeptLead &&
      (form.type !== "内部调岗" ||
        !department ||
        form.department !== department)
    )
      return null;
    if (
      !["转正评估", "内部调岗", "离职办理"].includes(form.type) ||
      !form.employeeName.trim() ||
      !form.role.trim()
    )
      return null;
    // The prototype form has no employee-ID input. Resolve the entered name
    // instead of persisting its unrelated EMP002 placeholder.
    const employees = state.employees.filter(
      (employee) =>
        employee.name === form.employeeName.trim() &&
        (!isDeptLead || employee.department === department),
    );
    const employee =
      employees.find((employee) => employee.id === form.employeeId) ??
      (employees.length === 1 ? employees[0] : undefined);
    if (!employee)
      return {
        patch: {},
        toast: {
          title: "流程提交未完成",
          message: isDeptLead
            ? "请填写本部门员工的唯一真实姓名"
            : "请填写员工档案中的唯一真实姓名",
        },
      };
    const maxSeq = state.lifecycleTasks.reduce((max, task) => {
      const parts = task.id.split("-");
      const number = parseInt(parts[parts.length - 1], 10);
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);
    const id = `LC-2026-${String(maxSeq + 1).padStart(3, "0")}`;
    const task: LifecycleTask = {
      id,
      type: form.type,
      employeeName: form.employeeName,
      employeeId: employee.id,
      department: form.department,
      role: form.role,
      detail:
        form.detail || `申请办理 ${form.employeeName} 的「${form.type}」流程。`,
      stage: "待 HR 终审",
      effectiveDate: form.effectiveDate,
      approver: "李明（HR 主管）",
    };
    return {
      patch: { lifecycleTasks: [task, ...state.lifecycleTasks] },
      toast: {
        title: `已发起「${form.type}」审批流`,
        message: `单号 ${id} 已推送至审批节点`,
      },
    };
  });
}
