import assert from "node:assert/strict";
import { SELF_SERVICE_REQUEST_TYPES } from "../src/constants/selfService";
import { createInitialState, useStore } from "../src/store";
import { submitSelfRequest } from "../src/store/selfService";
import type {
  CascaderOption,
  RequestTypeNode,
  RequestValues,
} from "../src/types";
import { resolveCascaderPath } from "../src/utils/cascader";
import { resolveRequest, validateRequest } from "../src/utils/selfService";

let count = 0;
const check = (label: string, run: () => void) => {
  run();
  count++;
};
const leaves: { node: RequestTypeNode; path: string[]; labels: string[] }[] =
  [];
const ids = new Set<string>();
const queue = SELF_SERVICE_REQUEST_TYPES.map((node) => ({
  node,
  path: [node.id],
  labels: [node.label],
}));
check("four request categories", () =>
  assert.deepEqual(
    SELF_SERVICE_REQUEST_TYPES.map((node) => node.label),
    ["假勤申请", "资产申领", "费用报销", "综合行政"],
  ),
);
for (const root of SELF_SERVICE_REQUEST_TYPES)
  check(root.label + " has at least two children", () =>
    assert.ok(root.children && root.children.length >= 2),
  );
while (queue.length) {
  const item = queue.shift()!;
  assert.ok(!ids.has(item.node.id));
  ids.add(item.node.id);
  if (item.node.children?.length)
    for (const child of item.node.children)
      queue.push({
        node: child,
        path: [...item.path, child.id],
        labels: [...item.labels, child.label],
      });
  else leaves.push(item);
}
for (const { node, path, labels } of leaves) {
  check(node.id + " has an independent valid field schema", () => {
    assert.ok(node.fields?.length);
    assert.equal(
      new Set(node.fields!.map((field) => field.name)).size,
      node.fields!.length,
    );
    for (const field of node.fields!) {
      assert.ok(field.label);
      assert.equal(typeof field.required, "boolean");
    }
  });
  check(node.id + " resolves full leaf path", () =>
    assert.deepEqual(resolveRequest(path)?.labels, labels),
  );
  check(node.id + " required fields reject empty submissions", () =>
    assert.equal(
      Object.keys(validateRequest({ path, values: {} }).errors).length,
      node.fields!.filter((field) => field.required).length,
    ),
  );
}
let deep: CascaderOption = { id: "level-64", label: "第64级" };
for (let level = 63; level >= 1; level--)
  deep = { id: `level-${level}`, label: `第${level}级`, children: [deep] };
check("64 levels have no fixed depth limit", () =>
  assert.equal(
    resolveCascaderPath(
      [deep],
      Array.from({ length: 64 }, (_, index) => `level-${index + 1}`),
    ).length,
    64,
  ),
);
check("invalid path is rejected", () =>
  assert.deepEqual(
    resolveCascaderPath(SELF_SERVICE_REQUEST_TYPES, ["leave", "missing"]),
    [],
  ),
);
useStore.setState(createInitialState());
for (const path of [
  [],
  ["leave"],
  ["leave", "leave-vacation"],
  ["missing"],
  ["leave", "assets-hardware", "computer"],
])
  check("non-leaf/invalid selection " + path.join("/"), () => {
    const before = useStore.getState().selfRequests;
    const result = submitSelfRequest({ path, values: {} });
    assert.equal(result.ok, false);
    assert.ok(result.errors.typePath);
    assert.equal(useStore.getState().selfRequests, before);
  });
const annual = ["leave", "leave-vacation", "annual-leave"];
const validLeave = {
  startDate: "2026-12-01",
  endDate: "2026-12-02",
  days: "1.5",
  handover: "李明",
  reason: "年度休假",
};
for (const [name, value] of [
  ["handover", " "],
  ["days", "0"],
  ["days", "NaN"],
  ["days", "1.1"],
  ["endDate", "2026-11-30"],
  ["endDate", "2026-02-30"],
])
  check("invalid leave " + name + " " + value, () =>
    assert.equal(
      submitSelfRequest({
        path: annual,
        values: { ...validLeave, [name]: value },
      }).ok,
      false,
    ),
  );
for (const { node, path, labels } of leaves) {
  const values: RequestValues = { unconfigured: "must not persist" };
  for (const field of node.fields!) {
    values[field.name] =
      field.type === "file"
        ? [
            new File(["invoice bytes"], "验收发票.pdf", {
              type: "application/pdf",
            }),
          ]
        : field.type === "select"
          ? field.options![0]
          : field.type === "date"
            ? field.afterField
              ? "2026-12-02"
              : "2026-12-01"
            : field.type === "number"
              ? String(field.min ?? 1)
              : "验收内容";
  }
  check(node.id + " submits its configured form and full path", () => {
    const result = submitSelfRequest({ path, values });
    assert.equal(result.ok, true);
    const record = useStore.getState().selfRequests[0];
    assert.equal(record.bizType, labels.join(" / "));
    assert.equal(record.requestTypeId, node.id);
    assert.deepEqual(record.typePath, labels);
    assert.equal(record.formValues?.unconfigured, undefined);
    for (const field of node.fields!)
      if (field.type === "file") {
        const files = record.formValues![field.name] as File[];
        assert.equal(files[0].name, "验收发票.pdf");
        assert.equal(files[0].size, 13);
        (values[field.name] as File[]).push(new File(["x"], "later.pdf"));
        assert.equal(files.length, 1, "record copies attachment list");
      }
  });
}
check("request IDs stay unique", () => {
  const records = useStore.getState().selfRequests;
  assert.equal(
    new Set(records.map((record) => record.id)).size,
    records.length,
  );
});
const expense = ["expenses", "expenses-daily", "office-expense"];
check("invoice upload required", () =>
  assert.ok(
    validateRequest({
      path: expense,
      values: {
        expenseDate: "2026-12-01",
        amount: "1.00",
        costOwner: "技术部",
        purpose: "办公采购",
      },
    }).errors.invoices,
  ),
);
check("cost owner must be configured option", () =>
  assert.ok(
    validateRequest({
      path: expense,
      values: {
        expenseDate: "2026-12-01",
        amount: "1.00",
        costOwner: "未知部门",
        purpose: "办公采购",
        invoices: [new File(["invoice"], "发票.pdf")],
      },
    }).errors.costOwner,
  ),
);
useStore.setState(createInitialState());
console.log(
  `PASS ${count} self-service configuration, 64-level paths, leaf-only selection, validation, attachments and submission checks.`,
);
