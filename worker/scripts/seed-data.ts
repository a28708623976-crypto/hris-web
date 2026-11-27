import { INITIAL_EMPLOYEES } from "../../src/mock/employees";
import { employeeFieldErrors } from "../../shared/employees";
export function seedEmployees() {
  return INITIAL_EMPLOYEES.map((employee, index) => {
    const result = {
      ...employee,
      ethnicity: employee.ethnicity || "汉族",
      householdType: employee.householdType || "本市城镇",
      maritalStatus: employee.maritalStatus || "未婚",
      firstWorkDate: employee.firstWorkDate || employee.hireDate,
      familyMembers: employee.familyMembers[0]?.name
        ? employee.familyMembers
        : [
            {
              name: "测试家属" + String(index + 1),
              relation: "母亲",
              gender: "女",
              phone: "",
              birthDate: "",
            },
          ],
      idDocs: employee.idDocs.map((doc) =>
        doc.docType === "居民身份证" && !doc.docNumber
          ? {
              ...doc,
              docNumber:
                "990000" +
                employee.birthDate.replaceAll("-", "") +
                String(index + 1).padStart(4, "0"),
            }
          : doc,
      ),
      attachments: {},
    };
    const parsed = employeeFieldErrors(result);
    if (parsed.errors.length)
      throw new Error(
        "Invalid test seed " +
          employee.id +
          ": " +
          parsed.errors.map((e) => e.field).join(","),
      );
    return result;
  });
}
