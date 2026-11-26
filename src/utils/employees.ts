import type { EmployeeForm } from "../types";

// Shared by create and edit; validation order and messages follow the prototype.
export const validateEmployeeForm = (form: EmployeeForm) => {
  if (!form.name.trim()) return "请填写员工真实姓名";
  if (!form.gender) return "请选择性别";
  if (!/^\d{11}$/.test(form.phone)) return "个人手机号码必须为 11 位纯数字";
  if (!form.birthDate) return "请选择出生日期";
  if (!form.ethnicity) return "请选择民族";
  if (!form.householdType) return "请选择户口类型";
  if (!form.maritalStatus) return "请选择婚姻状况";
  if (!form.firstWorkDate) return "请选择首次参加工作日期";
  if (!form.role.trim()) return "请在「岗位与薪酬」中填写岗位名称";

  for (let i = 0; i < (form.bankCards || []).length; i += 1) {
    const c = form.bankCards[i];
    if (c.holderIdNumber && !/^\d{18}$/.test(c.holderIdNumber)) {
      return `银行卡 ${i + 1} 的持卡人身份证号必须为 18 位纯数字`;
    }
    if (c.reservedPhone && !/^\d{11}$/.test(c.reservedPhone)) {
      return `银行卡 ${i + 1} 的银行预留手机号必须为 11 位纯数字`;
    }
  }

  for (let i = 0; i < (form.idDocs || []).length; i += 1) {
    const d = form.idDocs[i];
    if (d.docType === "居民身份证" && !/^\d{18}$/.test(d.docNumber)) {
      return `证件信息 ${i + 1} 为居民身份证，必须填写 18 位纯数字`;
    }
  }

  const firstFamily = form.familyMembers?.[0];
  if (!firstFamily || !firstFamily.name.trim()) {
    return "请在「家庭成员」中至少填写一位直系亲属（父母/兄弟姐妹）姓名";
  }
  return null;
};
