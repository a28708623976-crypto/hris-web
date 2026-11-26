import "./certificates-state";
import "./attendance-state";
import "./contracts-state";
import "./self-service-state";
import "./workflows-state";
import { validateEmployeeForm } from "../src/utils/employees";
import assert from "node:assert/strict";
import * as actual from "../src/utils";
import * as reference from "./.prototype-reference";
import { createInitialState, useStore } from "../src/store";

for (const date of [
  "",
  "invalid",
  "1996-05-12",
  "2026-11-25",
  "2027-01-01",
  "2020-02-29",
]) {
  assert.equal(actual.calcAge(date), reference.calcAge(date));
  assert.equal(actual.calcTenure(date), reference.calcTenure(date));
}
for (const date of ["", "invalid", "2026-11-25", "2024-01-31", "2024-02-29"]) {
  for (const period of ["", "3个月", "6个月", "invalid"])
    assert.equal(
      actual.calcProbationEndDate(date, period),
      reference.calcProbationEndDate(date, period),
    );
  for (const years of [1, 3, 5])
    assert.equal(
      actual.calcContractEndDate(date, years),
      reference.calcContractEndDate(date, years),
    );
  for (const days of [-1, 0, 7])
    assert.equal(
      actual.addDaysToDate(date, days),
      reference.addDaysToDate(date, days),
    );
}
for (const overrides of [
  {},
  { hireDate: "" },
  { hireDate: "2026-12-01", probationPeriod: "6个月" },
  { contractEnd: "", probationEndDate: "" },
])
  assert.deepEqual(
    actual.createEmptyEmployeeForm(overrides),
    reference.createEmptyEmployeeForm(overrides),
  );
const initial = createInitialState();
for (const [key, fixture] of Object.entries({
  employees: reference.INITIAL_EMPLOYEES,
  onboardingTasks: reference.INITIAL_ONBOARDING_TASKS,
  lifecycleTasks: reference.INITIAL_LIFECYCLE_TASKS,
  jobs: reference.INITIAL_JOBS,
  candidates: reference.INITIAL_CANDIDATES,
  perfRecords: reference.INITIAL_PERF_RECORDS,
}))
  assert.deepEqual(initial[key as keyof typeof initial], fixture);
useStore.setState(initial);
useStore.getState().setSidebarCollapsed((value) => !value);
useStore.getState().setSidebarCollapsed((value) => !value);
assert.equal(useStore.getState().sidebarCollapsed, false);
useStore.getState().setRole("部门负责人");
assert.equal(useStore.getState().role, "部门负责人");
const count = useStore.getState().employees.length;
useStore
  .getState()
  .setEmployees((previous) => [...previous, { ...previous[0], id: "QA-ONLY" }]);
assert.equal(useStore.getState().employees.length, count + 1);
assert.equal(
  createInitialState().employees.length,
  count,
  "Mock seed is not mutated by store updates",
);
console.log(
  "PASS prototype date/form parity, all six business seed datasets, and functional Zustand updates.",
);

// Exercise every prototype employee-validation branch, including optional bank fields.
const validEmployeeForm = actual.createEmptyEmployeeForm({
  name: "专项验收",
  gender: "女",
  phone: "13800138000",
  birthDate: "1996-05-12",
  ethnicity: "汉族",
  householdType: "本市城镇",
  maritalStatus: "未婚",
  firstWorkDate: "2020-06-01",
  role: "工程师",
  idDocs: [
    {
      docType: "居民身份证",
      docNumber: "110105199605124321",
      expiryDate: "2036-05-12",
    },
  ],
  familyMembers: [
    {
      name: "验收家属",
      relation: "母亲",
      gender: "女",
      phone: "",
      birthDate: "",
    },
  ],
});
const validationCases: [
  string,
  Partial<typeof validEmployeeForm>,
  string | null,
][] = [
  ["valid", {}, null],
  ["name", { name: "  " }, "请填写员工真实姓名"],
  ["gender", { gender: "" }, "请选择性别"],
  ...["", "1380013800", "138001380000", "1380013800X"].map(
    (phone) =>
      ["phone " + phone, { phone }, "个人手机号码必须为 11 位纯数字"] as [
        string,
        Partial<typeof validEmployeeForm>,
        string,
      ],
  ),
  ["birthDate", { birthDate: "" }, "请选择出生日期"],
  ["ethnicity", { ethnicity: "" }, "请选择民族"],
  ["householdType", { householdType: "" }, "请选择户口类型"],
  ["maritalStatus", { maritalStatus: "" }, "请选择婚姻状况"],
  ["firstWorkDate", { firstWorkDate: "" }, "请选择首次参加工作日期"],
  ["job title", { role: " " }, "请在「岗位与薪酬」中填写岗位名称"],
  [
    "bank holder ID",
    {
      bankCards: [
        {
          ...validEmployeeForm.bankCards[0],
          holderIdNumber: "12345678901234567",
        },
      ],
    },
    "银行卡 1 的持卡人身份证号必须为 18 位纯数字",
  ],
  [
    "bank phone",
    {
      bankCards: [
        { ...validEmployeeForm.bankCards[0], reservedPhone: "1380013800" },
      ],
    },
    "银行卡 1 的银行预留手机号必须为 11 位纯数字",
  ],
  [
    "second bank phone",
    {
      bankCards: [
        validEmployeeForm.bankCards[0],
        { ...validEmployeeForm.bankCards[0], reservedPhone: "1380013800X" },
      ],
    },
    "银行卡 2 的银行预留手机号必须为 11 位纯数字",
  ],
  ...["", "11010519960512432", "1101051996051243210", "11010519960512432X"].map(
    (docNumber) =>
      [
        "resident ID " + docNumber,
        { idDocs: [{ ...validEmployeeForm.idDocs[0], docNumber }] },
        "证件信息 1 为居民身份证，必须填写 18 位纯数字",
      ] as [string, Partial<typeof validEmployeeForm>, string],
  ),
  [
    "passport",
    {
      idDocs: [
        {
          ...validEmployeeForm.idDocs[0],
          docType: "护照",
          docNumber: "E12345678",
        },
      ],
    },
    null,
  ],
  [
    "no family",
    { familyMembers: [] },
    "请在「家庭成员」中至少填写一位直系亲属（父母/兄弟姐妹）姓名",
  ],
  [
    "blank first family",
    {
      familyMembers: [
        { ...validEmployeeForm.familyMembers[0], name: " " },
        validEmployeeForm.familyMembers[0],
      ],
    },
    "请在「家庭成员」中至少填写一位直系亲属（父母/兄弟姐妹）姓名",
  ],
];
for (const [label, overrides, expected] of validationCases) {
  const form = { ...validEmployeeForm, ...overrides };
  assert.equal(validateEmployeeForm(form), expected, label);
  assert.equal(
    validateEmployeeForm(form),
    reference.referenceValidateEmployeeForm(form),
    label + " matches prototype",
  );
}
console.log(
  `PASS ${validationCases.length} employee validation cases against the unmodified prototype.`,
);
