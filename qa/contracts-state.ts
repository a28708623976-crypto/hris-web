import assert from "node:assert/strict";
import { createInitialState, useStore } from "../src/store";
import { renewContract, terminateRenewal } from "../src/store/contracts";
import type { Role } from "../src/types";
let count = 0;
const check = (label: string, run: () => void) => {
  run();
  count++;
};
const reset = (role: Role = "HR 主管") =>
  useStore.setState({ ...createInitialState(), role });
reset();
const original = useStore.getState().employees;
terminateRenewal("EMP001");
check("termination changes only renewal flag", () => {
  assert.equal(useStore.getState().employees[0].renewalStatus, "terminated");
  assert.equal(
    useStore.getState().employees[0].contractEnd,
    original[0].contractEnd,
  );
});
const notice = renewContract(
  "EMP001",
  "2031-12-12",
  "编剧总监",
  "modified",
  "补充工作地点",
);
check("renewal updates date, position and status", () => {
  const e = useStore.getState().employees[0];
  assert.equal(e.contractEnd, "2031-12-12");
  assert.equal(e.role, "编剧总监");
  assert.equal(e.renewalStatus, "normal");
});
check("supplement notice matches prototype", () =>
  assert.ok(notice?.message?.includes("已附补充条款")),
);
check("unrelated employees untouched", () =>
  assert.deepEqual(useStore.getState().employees.slice(1), original.slice(1)),
);
check("blank job keeps existing job", () => {
  renewContract("EMP001", "2032-12-12", "", "unchanged", "");
  assert.equal(useStore.getState().employees[0].role, "编剧总监");
});
check("unknown employee does not emit success", () =>
  assert.equal(
    renewContract("missing", "2031-01-01", "x", "unchanged", ""),
    null,
  ),
);
for (const role of ["部门负责人", "普通员工"] as Role[]) {
  reset(role);
  const before = useStore.getState().employees;
  check(role + " cannot renew", () => {
    assert.equal(
      renewContract("EMP005", "2031-01-01", "x", "unchanged", ""),
      null,
    );
    assert.equal(useStore.getState().employees, before);
  });
  check(role + " cannot terminate", () => {
    assert.equal(terminateRenewal("EMP005"), null);
    assert.equal(useStore.getState().employees, before);
  });
}
reset();
check("departed employee cannot renew", () =>
  assert.equal(
    renewContract("EMP012", "2031-01-01", "x", "unchanged", ""),
    null,
  ),
);
check("departed employee cannot terminate", () =>
  assert.equal(terminateRenewal("EMP012"), null),
);
reset();
console.log(
  `PASS ${count} contract state checks: renewal, termination, identity and HR-only updates.`,
);
