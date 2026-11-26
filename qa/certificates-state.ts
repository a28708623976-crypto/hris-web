import assert from "node:assert/strict";
import { createInitialState } from "../src/store";
import { certificateContent } from "../src/utils/certificates";
const employee = createInitialState().employees[0];
let count = 0;
const check = (label: string, run: () => void) => {
  run();
  count++;
};
check("income locked", () =>
  assert.equal(
    certificateContent(employee, "收入证明", "用途", "", false),
    null,
  ),
);
check("resignation requires date", () =>
  assert.equal(certificateContent(employee, "离职证明", "", "", true), null),
);
check("employment data and purpose", () => {
  const c = certificateContent(employee, "在职证明", "签证申请", "", false)!;
  assert.ok(c.paragraphs.join("").includes("林晓梅"));
  assert.ok(c.paragraphs.join("").includes("签证申请"));
  assert.equal(c.documentNumber, "DOC-EMP001-20261125");
});
check("salary reads employee values", () =>
  assert.ok(
    certificateContent(
      { ...employee, baseSalary: 23000, perfSalary: 6000 },
      "收入证明",
      "用途",
      "",
      true,
    )!
      .paragraphs.join("")
      .includes("29,000"),
  ),
);
check("resignation date formatted", () =>
  assert.ok(
    certificateContent(employee, "离职证明", "", "2026-12-07", false)!
      .paragraphs.join("")
      .includes("2026年12月7日"),
  ),
);
check("position and department read live", () =>
  assert.ok(
    certificateContent(
      { ...employee, role: "新岗位", department: "新部门" },
      "在职证明",
      "用途",
      "",
      false,
    )!
      .paragraphs.join("")
      .includes("新部门，担任 新岗位"),
  ),
);
console.log(`PASS ${count} certificate content/lock/date/live-data checks.`);
