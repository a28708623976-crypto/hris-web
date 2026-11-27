import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { useStore, createInitialState } from "../../src/store";
import { useAuthStore } from "../../src/store/auth";
import { useEmployeeDraft } from "../../src/store/employeeDraft";
import { persistEmployeeMutation } from "../../src/api/employeeTransactions";
import {
  approveLifecycle,
  completeOnboarding,
} from "../../src/store/workflows";
import { renewContract } from "../../src/store/contracts";
import { syncPerformancePayroll } from "../../src/store/performance";
import { seedEmployees } from "../../worker/scripts/seed-data";
const originalFetch = globalThis.fetch;
function reset() {
  useStore.setState({
    ...createInitialState(),
    employees: seedEmployees().map((employee) => ({ ...employee, version: 1 })),
  });
  useAuthStore.setState({
    user: { id: "hr", email: "", role: "hr_lead", employee_id: "EMP005" },
    status: "authenticated",
  });
  useEmployeeDraft.setState({
    busy: false,
    writeId: null,
    onboarding: null,
    creationKey: null,
  });
}
afterEach(() => {
  globalThis.fetch = originalFetch;
  reset();
});
test("failed lifecycle and onboarding writes keep employee and task states unchanged", async () => {
  reset();
  globalThis.fetch = async () =>
    Response.json({ error: "测试失败" }, { status: 503 });
  const before = useStore.getState();
  assert.equal(
    await persistEmployeeMutation(() => approveLifecycle("LC-2026-001")),
    false,
  );
  assert.equal(useStore.getState().employees, before.employees);
  assert.equal(useStore.getState().lifecycleTasks, before.lifecycleTasks);
  const task = before.onboardingTasks[1];
  assert.equal(
    await persistEmployeeMutation(
      () => completeOnboarding(task.id, task.checklist, false),
      "onboarding:test",
    ),
    false,
  );
  assert.equal(useStore.getState().employees, before.employees);
  assert.equal(useStore.getState().onboardingTasks, before.onboardingTasks);
});
test("multiple performance changes use one atomic endpoint and roll back together", async () => {
  reset();
  let endpoint = "";
  globalThis.fetch = async (input) => {
    endpoint = String(input);
    return Response.json({ error: "测试批量失败" }, { status: 503 });
  };
  const before = useStore.getState().employees;
  assert.equal(
    await persistEmployeeMutation(() =>
      syncPerformancePayroll() ? { title: "saved" } : null,
    ),
    false,
  );
  assert.equal(endpoint, "/api/employees/batch");
  assert.equal(useStore.getState().employees, before);
  assert.ok(
    useStore
      .getState()
      .employees.every((employee) => !employee.payrollPerformance),
  );
});
test("canonical API version wins after successful save", async () => {
  reset();
  globalThis.fetch = async (_input, init) =>
    Response.json({
      employee: { ...JSON.parse(String(init?.body)), version: 2 },
    });
  assert.equal(
    await persistEmployeeMutation(() =>
      renewContract("EMP001", "2035-12-31", "", "unchanged", ""),
    ),
    true,
  );
  const employee = useStore
    .getState()
    .employees.find((e) => e.id === "EMP001")!;
  assert.equal(employee.contractEnd, "2035-12-31");
  assert.equal(employee.version, 2);
});
test("response from logged-out account cannot repopulate private state", async () => {
  reset();
  let resolve!: (response: Response) => void;
  globalThis.fetch = () =>
    new Promise<Response>((done) => {
      resolve = done;
    });
  const privateEmployee = useStore.getState().employees[0];
  const pending = persistEmployeeMutation(() =>
    renewContract("EMP001", "2035-12-31", "", "unchanged", ""),
  );
  useAuthStore.setState({ user: null, status: "anonymous" });
  useStore.setState({ employees: [] });
  resolve(Response.json({ employee: privateEmployee }));
  assert.equal(await pending, false);
  assert.deepEqual(useStore.getState().employees, []);
});

for (const success of [false, true])
  test(`unrelated mock changes survive pending employee save (${success ? "success" : "failure"})`, async () => {
    reset();
    let resolve!: (response: Response) => void;
    globalThis.fetch = () =>
      new Promise<Response>((done) => {
        resolve = done;
      });
    const before = useStore.getState();
    const pending = persistEmployeeMutation(() =>
      renewContract("EMP001", "2035-12-31", "", "unchanged", ""),
    );
    const added = { ...before.onboardingTasks[0], id: "OB-concurrent" };
    useStore.getState().setOnboardingTasks((current) => [added, ...current]);
    resolve(
      success
        ? Response.json({
            employee: {
              ...before.employees[0],
              contractEnd: "2035-12-31",
              version: 2,
            },
          })
        : Response.json({ error: "失败" }, { status: 503 }),
    );
    assert.equal(await pending, success);
    assert.ok(
      useStore.getState().onboardingTasks.some((task) => task.id === added.id),
    );
  });
