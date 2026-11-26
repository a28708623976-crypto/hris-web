import assert from "node:assert/strict";
import { createInitialState, useStore } from "../src/store";
import {
  approveLifecycle,
  completeOnboarding,
  createLifecycleTask,
  rejectLifecycle,
} from "../src/store/workflows";
import type { LifecycleForm, Role } from "../src/types";

let count = 0;
const check = (label: string, run: () => void) => {
  run();
  count++;
};
const reset = (role: Role = "HR 主管") =>
  useStore.setState({ ...createInitialState(), role });
const data = () => {
  const { employees, onboardingTasks, lifecycleTasks } = useStore.getState();
  return { employees, onboardingTasks, lifecycleTasks };
};
const unchanged = (label: string, action: () => unknown) =>
  check(label, () => {
    const before = data();
    action();
    assert.deepEqual(data(), before, label);
  });
const all = {
  idCard: true,
  diploma: true,
  resignationCert: true,
  bankCard: true,
  medicalReport: true,
};
const partial = { ...all, resignationCert: false };
const transfer: LifecycleForm = {
  type: "内部调岗",
  employeeName: "林晓梅",
  employeeId: "EMP002",
  department: "运营部",
  role: "验收调岗",
  detail: "专项调岗核对",
  effectiveDate: "2026-12-01",
};
reset();
unchanged("missing task cannot create employee", () =>
  completeOnboarding("missing", all, false),
);
unchanged("incomplete materials require secondary confirmation", () =>
  completeOnboarding("OB-2026-001", partial, false),
);
unchanged("pending requires deadline and reason", () =>
  completeOnboarding("OB-2026-001", partial, true),
);
unchanged("pending requires deadline", () =>
  completeOnboarding("OB-2026-001", partial, true, {
    reason: "特批入职",
    deadline: "",
  }),
);
unchanged("pending requires nonblank reason", () =>
  completeOnboarding("OB-2026-001", partial, true, {
    reason: " ",
    deadline: "2026-12-08",
  }),
);
let notifications = 0;
const unsubscribe = useStore.subscribe((state) => {
  notifications++;
  assert.equal(state.employees.length, 13);
  assert.equal(
    state.onboardingTasks[1].stage,
    "已完成入职建档",
    "employee and task must be committed together",
  );
});
completeOnboarding("OB-2026-002", all, false);
unsubscribe();
check("one atomic onboarding write", () => assert.equal(notifications, 1));
check("employee created once", () =>
  assert.equal(useStore.getState().employees.length, 13),
);
check("next employee ID", () =>
  assert.equal(useStore.getState().employees[0].id, "EMP013"),
);
check("onboarding carries name and department", () => {
  const e = useStore.getState().employees[0];
  assert.equal(e.name, "宋清欢");
  assert.equal(e.department, "技术部");
});
check("probation status", () =>
  assert.equal(useStore.getState().employees[0].status, "试用期"),
);
check("contract end calculation", () =>
  assert.equal(useStore.getState().employees[0].contractEnd, "2029-12-08"),
);
check("probation end calculation", () =>
  assert.equal(useStore.getState().employees[0].probationEndDate, "2027-03-08"),
);
check("salary mapped as prototype", () => {
  const e = useStore.getState().employees[0];
  assert.equal(e.baseSalary, 28000);
  assert.equal(e.probationBaseSalary, 22400);
  assert.equal(e.perfSalary, 6000);
});
unchanged("completed task cannot be onboarded again", () =>
  completeOnboarding("OB-2026-002", all, false),
);
completeOnboarding("OB-2026-001", partial, true, {
  reason: "特批入职",
  deadline: "2026-12-08",
});
check("second onboarding allocates unique ID", () => {
  assert.equal(useStore.getState().employees[0].id, "EMP014");
  assert.equal(
    new Set(useStore.getState().employees.map((e) => e.id)).size,
    14,
  );
});
check("pending stage and remark", () => {
  const task = useStore.getState().onboardingTasks[0];
  assert.equal(task.stage, "材料待补 · 截止 2026-12-08");
  assert.ok(task.remark.includes("特批入职"));
  assert.deepEqual(task.checklist, partial);
});
unchanged("pending task cannot be onboarded again", () =>
  completeOnboarding("OB-2026-001", all, false),
);
check("onboarding leaves mock seeds unchanged", () => {
  assert.equal(createInitialState().employees.length, 12);
  assert.equal(createInitialState().onboardingTasks[0].stage, "待核验入职材料");
});
reset();
const checklist = { ...all };
completeOnboarding("OB-2026-001", checklist, false);
checklist.idCard = false;
check("committed checklist is a snapshot", () =>
  assert.equal(useStore.getState().onboardingTasks[0].checklist.idCard, true),
);
for (const role of ["普通员工", "部门负责人"] as Role[]) {
  reset(role);
  unchanged(role + " cannot onboard", () =>
    completeOnboarding("OB-2026-002", all, false),
  );
}
reset();
const beforeTransfer = useStore.getState().employees;
createLifecycleTask(transfer);
check("resolve real employee ID instead of placeholder", () =>
  assert.equal(useStore.getState().lifecycleTasks[0].employeeId, "EMP001"),
);
approveLifecycle("LC-2026-005");
check("transfer changes intended employee only", () => {
  const employees = useStore.getState().employees;
  assert.equal(employees[0].department, "运营部");
  assert.equal(employees[0].role, "验收调岗");
  for (let i = 1; i < employees.length; i++)
    assert.deepEqual(employees[i], beforeTransfer[i]);
});
check("transfer archived", () =>
  assert.equal(useStore.getState().lifecycleTasks[0].stage, "已生效归档"),
);
unchanged("archived approval is idempotent", () =>
  approveLifecycle("LC-2026-005"),
);
unchanged("archived task cannot be rejected", () =>
  rejectLifecycle("LC-2026-005", "反复回调"),
);
reset();
approveLifecycle("LC-2026-001");
check("confirmation updates employee status", () =>
  assert.equal(
    useStore.getState().employees.find((e) => e.id === "EMP002")?.status,
    "正式员工",
  ),
);
reset();
createLifecycleTask({
  ...transfer,
  type: "离职办理",
  employeeName: "张伟",
  employeeId: "EMP002",
  department: "技术部",
  role: "AI 视效工程师",
});
approveLifecycle("LC-2026-005");
check("resignation updates employee status", () =>
  assert.equal(
    useStore.getState().employees.find((e) => e.id === "EMP002")?.status,
    "已离职",
  ),
);
reset();
unchanged("reject requires reason", () => rejectLifecycle("LC-2026-001", " "));
const beforeReject = useStore.getState().employees;
rejectLifecycle("LC-2026-001", "  需补交考核材料  ");
check("reject reason saved and trimmed", () => {
  const task = useStore.getState().lifecycleTasks[0];
  assert.equal(task.stage, "已驳回");
  assert.ok(task.detail.endsWith("（驳回原因：需补交考核材料）"));
});
check("rejection leaves employee unchanged", () =>
  assert.deepEqual(useStore.getState().employees, beforeReject),
);
unchanged("rejected task cannot be approved", () =>
  approveLifecycle("LC-2026-001"),
);
unchanged("repeated rejection is idempotent", () =>
  rejectLifecycle("LC-2026-001", "再次回调"),
);
reset();
unchanged("unknown employee never binds placeholder", () =>
  createLifecycleTask({ ...transfer, employeeName: "不存在的员工" }),
);
useStore.setState((state) => ({
  employees: [...state.employees, { ...state.employees[0], id: "EMP099" }],
}));
unchanged("ambiguous name cannot target two employees", () =>
  createLifecycleTask(transfer),
);
createLifecycleTask({ ...transfer, employeeId: "EMP099" });
check("employee-detail prefill disambiguates equal names", () =>
  assert.equal(useStore.getState().lifecycleTasks[0].employeeId, "EMP099"),
);
approveLifecycle("LC-2026-005");
check("prefilled equal-name transfer changes only its ID", () => {
  assert.equal(
    useStore.getState().employees.find((e) => e.id === "EMP099")?.role,
    "验收调岗",
  );
  assert.equal(
    useStore.getState().employees.find((e) => e.id === "EMP001")?.role,
    "AI 编剧",
  );
});
reset("部门负责人");
unchanged("department lead cannot approve other department", () =>
  approveLifecycle("LC-2026-001"),
);
unchanged("department lead cannot reject other department", () =>
  rejectLifecycle("LC-2026-001", "越部门"),
);
unchanged("department lead cannot create confirmation", () =>
  createLifecycleTask({ ...transfer, type: "转正评估" }),
);
unchanged("department lead cannot create resignation", () =>
  createLifecycleTask({ ...transfer, type: "离职办理" }),
);
unchanged("department lead cannot target another department", () =>
  createLifecycleTask({ ...transfer, department: "技术部" }),
);
unchanged("department lead cannot bind foreign employee", () =>
  createLifecycleTask(transfer),
);
createLifecycleTask({ ...transfer, employeeName: "顾北辰" });
check("department lead transfer binds local employee", () =>
  assert.equal(useStore.getState().lifecycleTasks[0].employeeId, "EMP011"),
);
approveLifecycle("LC-2026-005");
check("department lead local transfer takes effect", () =>
  assert.equal(
    useStore.getState().employees.find((e) => e.id === "EMP011")?.role,
    "验收调岗",
  ),
);
reset("普通员工");
unchanged("employee cannot create lifecycle task", () =>
  createLifecycleTask(transfer),
);
unchanged("employee cannot approve lifecycle task", () =>
  approveLifecycle("LC-2026-001"),
);
unchanged("employee cannot reject lifecycle task", () =>
  rejectLifecycle("LC-2026-001", "越权"),
);
reset();
console.log(
  `PASS ${count} onboarding/lifecycle state checks: atomic writes, duplicate protection, employee identity, department scopes and terminal stages.`,
);
