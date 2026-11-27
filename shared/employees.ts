import { calcContractEndDate, calcProbationEndDate } from "./dates";
import { z } from "zod";
import { createEmptyEmployeeForm } from "../src/utils";
import type { EmployeeForm } from "../src/types";
const text = z.string().max(10000);
const money = z.number().finite().nonnegative();
const date = text.refine(
  (value) =>
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value),
  "日期必须为有效的 YYYY-MM-DD",
);
const defaults = createEmptyEmployeeForm();
const strings = Object.fromEntries(
  Object.entries(defaults)
    .filter(([, v]) => typeof v === "string")
    .map(([k]) => [k, text]),
);
const numbers = Object.fromEntries(
  Object.entries(defaults)
    .filter(([, v]) => typeof v === "number")
    .map(([k]) => [k, money]),
);
export const employeeSchema = z
  .object({
    ...strings,
    ...numbers,
    bankCards: z
      .array(
        z.object({
          bankName: text,
          branchName: text,
          cardNumber: text,
          holderName: text,
          holderIdNumber: text,
          reservedPhone: text,
        }),
      )
      .max(20),
    idDocs: z
      .array(z.object({ docType: text, docNumber: text, expiryDate: date }))
      .max(20),
    educations: z
      .array(
        z.object({
          school: text,
          major: text,
          degreeLevel: text,
          studyMode: text,
          degreeTitle: text,
          startDate: date,
          endDate: date,
        }),
      )
      .max(30),
    emergencyContacts: z
      .array(z.object({ name: text, relation: text, phone: text }))
      .max(20),
    familyMembers: z
      .array(
        z.object({
          name: text,
          relation: text,
          gender: text,
          phone: text,
          birthDate: date,
        }),
      )
      .max(30),
    attachments: z.record(z.string(), text),
    onboarding: z.object({ taskId: text, stage: text }).optional(),
    payrollPerformance: z
      .object({
        grade: text,
        managerComment: text,
        okrProgress: z.number().min(0).max(100),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const form = data as unknown as EmployeeForm;
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });
    if (!form.name?.trim()) issue(["name"], "请填写员工真实姓名");
    if (!form.gender) issue(["gender"], "请选择性别");
    if (!/^\d{11}$/.test(form.phone || ""))
      issue(["phone"], "个人手机号码必须为 11 位纯数字");
    if (!form.birthDate) issue(["birthDate"], "请选择出生日期");
    if (!form.ethnicity) issue(["ethnicity"], "请选择民族");
    if (!form.householdType) issue(["householdType"], "请选择户口类型");
    if (!form.maritalStatus) issue(["maritalStatus"], "请选择婚姻状况");
    if (!form.firstWorkDate) issue(["firstWorkDate"], "请选择首次参加工作日期");
    if (!form.role?.trim()) issue(["role"], "请在「岗位与薪酬」中填写岗位名称");
    for (const [i, c] of form.bankCards.entries()) {
      if (c.holderIdNumber && !/^\d{18}$/.test(c.holderIdNumber))
        issue(
          ["bankCards", i, "holderIdNumber"],
          `银行卡 ${i + 1} 的持卡人身份证号必须为 18 位纯数字`,
        );
      if (c.reservedPhone && !/^\d{11}$/.test(c.reservedPhone))
        issue(
          ["bankCards", i, "reservedPhone"],
          `银行卡 ${i + 1} 的银行预留手机号必须为 11 位纯数字`,
        );
    }
    for (const [i, d] of form.idDocs.entries())
      if (d.docType === "居民身份证" && !/^\d{18}$/.test(d.docNumber))
        issue(
          ["idDocs", i, "docNumber"],
          `证件信息 ${i + 1} 为居民身份证，必须填写 18 位纯数字`,
        );
    if (!form.familyMembers[0]?.name.trim())
      issue(
        ["familyMembers", 0, "name"],
        "请在「家庭成员」中至少填写一位直系亲属（父母/兄弟姐妹）姓名",
      );
    for (const name of ["department", "hireDate", "contractEntity"] as const)
      if (!form[name]?.trim())
        issue(
          [name],
          {
            department: "请选择所属部门",
            hireDate: "请选择入职日期",
            contractEntity: "请选择签约主体",
          }[name],
        );
    for (const name of [
      "birthDate",
      "firstWorkDate",
      "hireDate",
      "contractEnd",
      "probationEndDate",
      "internStartDate",
      "internEndDate",
    ] as const) {
      const value = form[name];
      if (!date.safeParse(value).success)
        issue([name], "日期必须为有效的 YYYY-MM-DD");
    }
  });
export function employeeFieldErrors(value: unknown) {
  const parsed = employeeSchema.safeParse(value);
  if (parsed.success)
    return { data: parsed.data as unknown as EmployeeForm, errors: [] };
  return {
    data: null,
    errors: parsed.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

export function normaliseEmployeeDates(
  form: EmployeeForm,
  previous?: EmployeeForm,
): EmployeeForm {
  return {
    ...form,
    probationEndDate: calcProbationEndDate(form.hireDate, form.probationPeriod),
    contractEnd:
      !form.contractEnd ||
      (previous &&
        form.hireDate !== previous.hireDate &&
        form.contractEnd === previous.contractEnd)
        ? calcContractEndDate(form.hireDate, 3)
        : form.contractEnd,
  };
}
