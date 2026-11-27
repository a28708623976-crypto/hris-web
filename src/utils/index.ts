import type { Employee, EmployeeForm } from "../types";
export {
  calcAge,
  calcTenure,
  calcProbationEndDate,
  calcContractEndDate,
  addDaysToDate,
} from "../../shared/dates";
import { calcProbationEndDate, calcContractEndDate } from "../../shared/dates";

export function createEmptyEmployeeForm<T extends Partial<Employee>>(
  overrides: T = {} as T,
): EmployeeForm & T {
  const defaultHire =
    overrides.hireDate !== undefined ? overrides.hireDate : "2026-11-25";
  const defaultProbPeriod =
    overrides.probationPeriod !== undefined
      ? overrides.probationPeriod
      : "3个月";
  const defaultContractEnd =
    overrides.contractEnd !== undefined
      ? overrides.contractEnd
      : defaultHire
        ? calcContractEndDate(defaultHire, 3)
        : "";
  const defaultProbEnd =
    overrides.probationEndDate !== undefined
      ? overrides.probationEndDate
      : defaultHire
        ? calcProbationEndDate(defaultHire, defaultProbPeriod)
        : "";

  return {
    name: "",
    alias: "",
    gender: "",
    phone: "",
    email: "",
    birthDate: "",
    nationality: "中国",
    ethnicity: "",
    householdType: "",
    householdLocation: "",
    householdAddress: "",
    nativePlace: "浙江省 / 杭州市",
    politicalStatus: "群众",
    maritalStatus: "",
    firstWorkDate: "",
    bankCards: [
      {
        bankName: "招商银行 (CMB)",
        branchName: "",
        cardNumber: "",
        holderName: "",
        holderIdNumber: "",
        reservedPhone: "",
      },
    ],
    idDocs: [
      {
        docType: "居民身份证",
        docNumber: "",
        expiryDate: "2035-06-15",
      },
    ],
    educations: [
      {
        school: "",
        major: "",
        degreeLevel: "本科",
        studyMode: "全日制",
        degreeTitle: "学士",
        startDate: "2016-09-01",
        endDate: "2020-06-30",
      },
    ],
    emergencyContacts: [
      {
        name: "",
        relation: "父亲",
        phone: "",
      },
    ],
    familyMembers: [
      {
        name: "",
        relation: "母亲",
        gender: "女",
        phone: "",
        birthDate: "",
      },
    ],
    attachments: {},
    department: "技术部",
    role: "",
    manager: "陈嘉宁",
    type: "全职",
    status: "试用期",
    level: "P5",
    hireDate: defaultHire,
    contractEnd: defaultContractEnd,
    probationPeriod: defaultProbPeriod,
    probationEndDate: defaultProbEnd,
    internStartDate: "2026-11-25",
    internEndDate: "2027-02-25",
    internDailyRate: 300,
    partTimePayUnit: "按天计酬 (元/天)",
    partTimePayRate: 500,
    probationBaseSalary: 16000,
    probationPerfSalary: 4000,
    baseSalary: 20000,
    perfSalary: 5000,
    contractEntity: "标准签约实体（默认租户）",
    renewalStatus: "normal",
    ...overrides,
  };
}

export const formatDateCn = (isoStr: string) => {
  if (!isoStr) return "（请选择离职日期）";
  const parts = isoStr.split("-");
  if (parts.length !== 3) return isoStr;
  return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
};
