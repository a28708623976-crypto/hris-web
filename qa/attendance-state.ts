import assert from "node:assert/strict";
import { createInitialState } from "../src/store";
import { employeeGross, payrollSummary } from "../src/utils/payroll";
const employees = createInitialState().employees;
let count = 0;
const check = (label: string, run: () => void) => {
  run();
  count++;
};
const initial = payrollSummary(employees);
check("active headcount", () => assert.equal(initial.activeList.length, 11));
check("departed employee excluded", () =>
  assert.ok(!initial.activeList.some((employee) => employee.id === "EMP012")),
);
check("employee gross", () => assert.equal(employeeGross(employees[0]), 27000));
check("zero salary stays zero", () =>
  assert.equal(employeeGross({ baseSalary: 0, perfSalary: 0 }), 0),
);
check("base salary edit updates total", () =>
  assert.equal(
    payrollSummary(
      employees.map((e) =>
        e.id === "EMP001" ? { ...e, baseSalary: e.baseSalary + 1000 } : e,
      ),
    ).totalGross,
    initial.totalGross + 1000,
  ),
);
check("performance salary edit updates total", () =>
  assert.equal(
    payrollSummary(
      employees.map((e) =>
        e.id === "EMP001" ? { ...e, perfSalary: e.perfSalary + 500 } : e,
      ),
    ).totalGross,
    initial.totalGross + 500,
  ),
);
check("resignation removes pay", () =>
  assert.equal(
    payrollSummary(
      employees.map((e) =>
        e.id === "EMP001" ? { ...e, status: "已离职" } : e,
      ),
    ).totalGross,
    initial.totalGross - 27000,
  ),
);
check("onboarding adds pay", () =>
  assert.equal(
    payrollSummary([
      ...employees,
      {
        ...employees[0],
        id: "EMP013",
        baseSalary: 10000,
        perfSalary: 2000,
        status: "试用期",
      },
    ]).totalGross,
    initial.totalGross + 12000,
  ),
);
check("empty payroll", () =>
  assert.deepEqual(payrollSummary([]), { activeList: [], totalGross: 0 }),
);
console.log(`PASS ${count} attendance/payroll live-calculation checks.`);
