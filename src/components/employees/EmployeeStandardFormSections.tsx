import { Plus } from "lucide-react";
import {
  ATTACHMENT_SLOTS,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  ETHNIC_GROUPS,
  GLOBAL_BANKS,
  HOUSEHOLD_TYPES,
  ID_DOC_TYPES,
  JOB_LEVELS,
  MARITAL_STATUSES,
  PROBATION_OPTIONS,
} from "../../constants/index";
import { usePageState as useState } from "../../store/pageState";
import type { EmployeeForm } from "../../types";
import {
  calcAge,
  calcContractEndDate,
  calcProbationEndDate,
  calcTenure,
} from "../../utils/index";
import { AppleActionButton } from "../ui/AppleActionButton";
export function EmployeeStandardFormSections<T extends EmployeeForm>({
  form,
  setForm,
  readOnly = false,
}: {
  form: T;
  setForm: (update: (previous: T) => T) => void;
  readOnly?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    { id: "personal", label: "个人信息", required: true },
    { id: "bank", label: "银行卡信息", required: true },
    { id: "idDocs", label: "证件信息", required: true },
    { id: "education", label: "教育经历", required: true },
    { id: "emergency", label: "紧急联系人", required: true },
    { id: "family", label: "家庭成员", required: true },
    { id: "attachments", label: "资料附件", required: true },
    { id: "jobPayroll", label: "岗位与薪酬", required: true },
  ];

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl text-xs transition-all outline-none ${
    readOnly
      ? "bg-[#F5F5F7]/80 text-[#1D1D1F] cursor-default"
      : "bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3]"
  }`;

  const updateField = <K extends keyof EmployeeForm>(
    key: K,
    val: EmployeeForm[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "hireDate" && next.type === "全职") {
        next.probationEndDate = calcProbationEndDate(
          val as string,
          next.probationPeriod,
        );
        next.contractEnd = calcContractEndDate(val as string, 3);
      } else if (key === "probationPeriod" && next.type === "全职") {
        next.probationEndDate = calcProbationEndDate(
          next.hireDate,
          val as string,
        );
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[470px] max-h-[68vh]">
      {/* 左侧目录导航 */}
      <div className="w-full md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-black/[0.06] bg-[#FAFAFC] p-3 flex md:flex-col gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? "bg-[#EBF5FF] text-[#0071E3] font-semibold"
                  : "text-[#515154] hover:bg-black/[0.04]"
              }`}
            >
              <span>
                {t.label}
                {t.required && <span className="text-[#FF3B30] ml-0.5">*</span>}
              </span>
              {active && (
                <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 右侧表单内容区 */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
              个人信息
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  姓名 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="请输入真实姓名"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  别名 / 英文名
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="请输入别名或花名"
                  value={form.alias}
                  onChange={(e) => updateField("alias", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  性别 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-[#6E6E73]">
                    手机号码 <span className="text-[#FF3B30]">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      form.phone.length === 11
                        ? "text-[#248A3D]"
                        : "text-[#86868B]"
                    }`}
                  >
                    {form.phone.length}/11 位数字
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-2.5 rounded-xl bg-[#EFEFF4] text-xs font-medium text-[#6E6E73]">
                    +86
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    disabled={readOnly}
                    placeholder="请输入 11 位手机号码"
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 11),
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  个人邮箱
                </label>
                <input
                  type="email"
                  disabled={readOnly}
                  placeholder="用于接收电子工资条与入职通知"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  出生日期 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  年龄（根据出生日期自动计算）
                </label>
                <input
                  type="text"
                  disabled
                  value={form.birthDate ? calcAge(form.birthDate) : "—"}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  民族 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.ethnicity}
                  onChange={(e) => updateField("ethnicity", e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  {ETHNIC_GROUPS.map((eth) => (
                    <option key={eth} value={eth}>
                      {eth}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  户口类型 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.householdType}
                  onChange={(e) => updateField("householdType", e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  {HOUSEHOLD_TYPES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  婚姻状况 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.maritalStatus}
                  onChange={(e) => updateField("maritalStatus", e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  {MARITAL_STATUSES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  首次参加工作日期 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.firstWorkDate}
                  onChange={(e) => updateField("firstWorkDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  累计工龄（自动计算）
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    form.firstWorkDate ? calcTenure(form.firstWorkDate) : "—"
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "bank" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                银行卡信息
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField("bankCards", [
                      ...form.bankCards,
                      {
                        bankName: "招商银行 (CMB)",
                        branchName: "",
                        cardNumber: "",
                        holderName: form.name || "",
                        holderIdNumber: "",
                        reservedPhone: form.phone || "",
                      },
                    ])
                  }
                >
                  添加银行卡
                </AppleActionButton>
              )}
            </div>
            {form.bankCards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    银行卡信息 {idx + 1}
                  </span>
                  {!readOnly && form.bankCards.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "bankCards",
                          form.bankCards.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      银行卡号 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={readOnly}
                      placeholder="请输入储蓄卡号"
                      value={card.cardNumber}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = {
                          ...card,
                          cardNumber: e.target.value.replace(/\D/g, ""),
                        };
                        updateField("bankCards", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      持卡人姓名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入持卡人姓名"
                      value={card.holderName}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = { ...card, holderName: e.target.value };
                        updateField("bankCards", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        持卡人身份证号 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          (card.holderIdNumber || "").length === 18
                            ? "text-[#248A3D]"
                            : "text-[#86868B]"
                        }`}
                      >
                        {(card.holderIdNumber || "").length}/18 位数字
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={18}
                      disabled={readOnly}
                      placeholder="请输入 18 位身份证号"
                      value={card.holderIdNumber || ""}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = {
                          ...card,
                          holderIdNumber: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 18),
                        };
                        updateField("bankCards", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      所属银行（全球银行列表）{" "}
                      <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={card.bankName}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = { ...card, bankName: e.target.value };
                        updateField("bankCards", list);
                      }}
                      className={inputClass}
                    >
                      {GLOBAL_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      详细支行名称 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="例如：北京朝外支行 / 杭州高新支行"
                      value={card.branchName}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = { ...card, branchName: e.target.value };
                        updateField("bankCards", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        银行预留手机号 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          (card.reservedPhone || "").length === 11
                            ? "text-[#248A3D]"
                            : "text-[#86868B]"
                        }`}
                      >
                        {(card.reservedPhone || "").length}/11 位数字
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      disabled={readOnly}
                      placeholder="请输入 11 位银行预留手机号"
                      value={card.reservedPhone || ""}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = {
                          ...card,
                          reservedPhone: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11),
                        };
                        updateField("bankCards", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "idDocs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                证件信息（居民身份证限制 18 位纯数字，其他证件不限）
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField("idDocs", [
                      ...form.idDocs,
                      {
                        docType: "护照",
                        docNumber: "",
                        expiryDate: "2035-01-01",
                      },
                    ])
                  }
                >
                  添加证件信息
                </AppleActionButton>
              )}
            </div>
            {form.idDocs.map((doc, idx) => {
              const isResidentId = doc.docType === "居民身份证";
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      证件信息 {idx + 1}
                    </span>
                    {!readOnly && form.idDocs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "idDocs",
                            form.idDocs.filter((_, i) => i !== idx),
                          )
                        }
                        className="text-xs text-[#D70015] hover:underline cursor-pointer"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        证件类型 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <select
                        disabled={readOnly}
                        value={doc.docType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          const list = [...form.idDocs];
                          list[idx] = {
                            ...doc,
                            docType: newType,
                            docNumber:
                              newType === "居民身份证"
                                ? doc.docNumber.replace(/\D/g, "").slice(0, 18)
                                : doc.docNumber,
                          };
                          updateField("idDocs", list);
                        }}
                        className={inputClass}
                      >
                        {ID_DOC_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-[#6E6E73]">
                          证件号码 <span className="text-[#FF3B30]">*</span>
                        </label>
                        {isResidentId ? (
                          <span
                            className={`text-[10px] font-mono ${
                              doc.docNumber.length === 18
                                ? "text-[#248A3D]"
                                : "text-[#86868B]"
                            }`}
                          >
                            {doc.docNumber.length}/18 位数字
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#0071E3]">
                            不限格式
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        inputMode={isResidentId ? "numeric" : "text"}
                        maxLength={isResidentId ? 18 : 40}
                        disabled={readOnly}
                        placeholder={
                          isResidentId
                            ? "请输入 18 位纯数字身份证号"
                            : "请输入证件号码"
                        }
                        value={doc.docNumber}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const formatted = isResidentId
                            ? raw.replace(/\D/g, "").slice(0, 18)
                            : raw;
                          const list = [...form.idDocs];
                          list[idx] = { ...doc, docNumber: formatted };
                          updateField("idDocs", list);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        有效期至 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <input
                        type="date"
                        disabled={readOnly}
                        value={doc.expiryDate}
                        onChange={(e) => {
                          const list = [...form.idDocs];
                          list[idx] = { ...doc, expiryDate: e.target.value };
                          updateField("idDocs", list);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                教育经历
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField("educations", [
                      ...form.educations,
                      {
                        school: "",
                        major: "",
                        degreeLevel: "本科",
                        studyMode: "全日制",
                        degreeTitle: "学士",
                        startDate: "2016-09-01",
                        endDate: "2020-06-30",
                      },
                    ])
                  }
                >
                  添加教育经历
                </AppleActionButton>
              )}
            </div>
            {form.educations.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    教育经历 {idx + 1}
                  </span>
                  {!readOnly && form.educations.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "educations",
                          form.educations.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      学历 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={edu.degreeLevel}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, degreeLevel: e.target.value };
                        updateField("educations", list);
                      }}
                      className={inputClass}
                    >
                      <option value="博士">博士</option>
                      <option value="硕士">硕士</option>
                      <option value="本科">本科</option>
                      <option value="大专">大专</option>
                      <option value="高中及以下">高中及以下</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      学习形式 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={edu.studyMode || "全日制"}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, studyMode: e.target.value };
                        updateField("educations", list);
                      }}
                      className={inputClass}
                    >
                      <option value="全日制">全日制</option>
                      <option value="非全日制">非全日制</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      毕业院校 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入学校全称"
                      value={edu.school}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, school: e.target.value };
                        updateField("educations", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      所学专业 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入专业名称"
                      value={edu.major}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, major: e.target.value };
                        updateField("educations", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      开始日期 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={edu.startDate}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, startDate: e.target.value };
                        updateField("educations", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      结束日期 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={edu.endDate}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, endDate: e.target.value };
                        updateField("educations", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "emergency" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                紧急联系人
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField("emergencyContacts", [
                      ...form.emergencyContacts,
                      { name: "", relation: "配偶", phone: "" },
                    ])
                  }
                >
                  添加紧急联系人
                </AppleActionButton>
              )}
            </div>
            {form.emergencyContacts.map((ec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    紧急联系人 {idx + 1}
                  </span>
                  {!readOnly && form.emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "emergencyContacts",
                          form.emergencyContacts.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      姓名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入联系人姓名"
                      value={ec.name}
                      onChange={(e) => {
                        const list = [...form.emergencyContacts];
                        list[idx] = { ...ec, name: e.target.value };
                        updateField("emergencyContacts", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      关系 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={ec.relation}
                      onChange={(e) => {
                        const list = [...form.emergencyContacts];
                        list[idx] = { ...ec, relation: e.target.value };
                        updateField("emergencyContacts", list);
                      }}
                      className={inputClass}
                    >
                      <option value="父亲">父亲</option>
                      <option value="母亲">母亲</option>
                      <option value="配偶">配偶</option>
                      <option value="兄弟姐妹">兄弟姐妹</option>
                      <option value="其他亲属">其他亲属</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        联系电话 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#86868B]">
                        {ec.phone.length}/11 位
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      disabled={readOnly}
                      placeholder="请输入 11 位手机号码"
                      value={ec.phone}
                      onChange={(e) => {
                        const list = [...form.emergencyContacts];
                        list[idx] = {
                          ...ec,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                        };
                        updateField("emergencyContacts", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "family" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                家庭成员（必填至少一位直系亲属：父母 / 兄弟姐妹）
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField("familyMembers", [
                      ...form.familyMembers,
                      {
                        name: "",
                        relation: "父亲",
                        gender: "男",
                        phone: "",
                        birthDate: "",
                      },
                    ])
                  }
                >
                  添加家庭成员
                </AppleActionButton>
              )}
            </div>
            {form.familyMembers.map((fm, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    家庭成员 {idx + 1}{" "}
                    {idx === 0 && (
                      <span className="text-[#FF3B30]">*（必填）</span>
                    )}
                  </span>
                  {!readOnly && form.familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "familyMembers",
                          form.familyMembers.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      姓名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入家庭成员姓名"
                      value={fm.name}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = { ...fm, name: e.target.value };
                        updateField("familyMembers", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      与本人关系 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={fm.relation}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = { ...fm, relation: e.target.value };
                        updateField("familyMembers", list);
                      }}
                      className={inputClass}
                    >
                      <option value="父亲">父亲</option>
                      <option value="母亲">母亲</option>
                      <option value="兄弟">兄弟</option>
                      <option value="姐妹">姐妹</option>
                      <option value="配偶">配偶</option>
                      <option value="子女">子女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      性别 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={fm.gender}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = { ...fm, gender: e.target.value };
                        updateField("familyMembers", list);
                      }}
                      className={inputClass}
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        联系电话 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#86868B]">
                        {fm.phone.length}/11 位
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      disabled={readOnly}
                      placeholder="请输入 11 位手机号码"
                      value={fm.phone}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = {
                          ...fm,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                        };
                        updateField("familyMembers", list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
              资料附件（支持 JPEG / JPG / PNG / PDF / DOC / DOCX，单文件 ≤
              50MB）
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ATTACHMENT_SLOTS.map((slot) => {
                const uploadedFile = form.attachments?.[slot.key];
                return (
                  <div
                    key={slot.key}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      uploadedFile
                        ? "bg-[#F2FBF4] border-[#34C759]/25"
                        : "bg-[#FAFAFC] border-black/[0.06]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                        {slot.label}
                        {slot.required && (
                          <span className="text-[#FF3B30] ml-0.5">*</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#86868B] truncate mt-0.5">
                        {uploadedFile
                          ? `已归档：${uploadedFile}`
                          : "暂未上传附件"}
                      </div>
                    </div>
                    {!readOnly && (
                      <label className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] cursor-pointer">
                        {uploadedFile ? "替换" : "上传"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              updateField("attachments", {
                                ...(form.attachments || {}),
                                [slot.key]: f.name,
                              });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "jobPayroll" && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
              岗位与薪酬定级
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  所属部门 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className={inputClass}
                >
                  {DEPARTMENTS.filter((d) => d !== "全部部门").map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  岗位名称 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="例如：高级产品交互设计师"
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  直属上级 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={form.manager}
                  onChange={(e) => updateField("manager", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  岗位职级
                </label>
                <select
                  disabled={readOnly}
                  value={form.level}
                  onChange={(e) => updateField("level", e.target.value)}
                  className={inputClass}
                >
                  {JOB_LEVELS.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  员工类型 <span className="text-[#FF3B30]">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {EMPLOYMENT_TYPES.map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateField("type", tp)}
                      className={`py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        form.type === tp
                          ? "bg-[#1D1D1F] text-white border-[#1D1D1F]"
                          : "bg-[#F5F5F7] text-[#515154] border-transparent"
                      }`}
                    >
                      {tp}
                    </button>
                  ))}
                </div>
              </div>

              {form.type === "全职" && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      劳动合同开始时间 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.hireDate}
                      onChange={(e) => updateField("hireDate", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      劳动合同结束时间（默认整 3 年）
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.contractEnd}
                      onChange={(e) =>
                        updateField("contractEnd", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期周期
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PROBATION_OPTIONS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          disabled={readOnly}
                          onClick={() => updateField("probationPeriod", p)}
                          className={`py-2 rounded-xl text-[11px] font-semibold border cursor-pointer ${
                            form.probationPeriod === p
                              ? "bg-[#0071E3] text-white border-[#0071E3]"
                              : "bg-[#F5F5F7] text-[#515154] border-transparent"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期结束时间（整月自动计算）
                    </label>
                    <input
                      type="date"
                      disabled
                      value={form.probationEndDate}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期底薪（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.probationBaseSalary}
                      onChange={(e) =>
                        updateField(
                          "probationBaseSalary",
                          Number(e.target.value) || 0,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期绩效基数（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.probationPerfSalary}
                      onChange={(e) =>
                        updateField(
                          "probationPerfSalary",
                          Number(e.target.value) || 0,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      转正底薪（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.baseSalary}
                      onChange={(e) =>
                        updateField("baseSalary", Number(e.target.value) || 0)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      转正绩效基数（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.perfSalary}
                      onChange={(e) =>
                        updateField("perfSalary", Number(e.target.value) || 0)
                      }
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {form.type === "实习" && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      实习期开始时间
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.internStartDate}
                      onChange={(e) =>
                        updateField("internStartDate", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      实习期结束时间
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.internEndDate}
                      onChange={(e) =>
                        updateField("internEndDate", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      实习补贴 / 实习报酬（元/天）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.internDailyRate}
                      onChange={(e) =>
                        updateField(
                          "internDailyRate",
                          Number(e.target.value) || 0,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {(form.type === "劳务" || form.type === "兼职") && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      计薪标准模式
                    </label>
                    <select
                      disabled={readOnly}
                      value={form.partTimePayUnit}
                      onChange={(e) =>
                        updateField("partTimePayUnit", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="按天计酬 (元/天)">按天计酬 (元/天)</option>
                      <option value="按月计酬 (元/月)">按月计酬 (元/月)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      协议报酬金额（{form.partTimePayUnit}）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.partTimePayRate}
                      onChange={(e) =>
                        updateField(
                          "partTimePayRate",
                          Number(e.target.value) || 0,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
