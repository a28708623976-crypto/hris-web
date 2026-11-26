import {
  certificateContent,
  certificatePdf,
  certificateWord,
  downloadCertificate,
  type CertificateType,
} from "../utils/certificates";
import { Download, FileText, Lock } from "lucide-react";
import { useMemo } from "react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import type { Workspace } from "../hooks/useWorkspace";
import { usePageState as useState } from "../store/pageState";
import type { Employee } from "../types";
import { formatDateCn } from "../utils";
export function CertificatesModuleView({
  employees,
  onTriggerToast,
  salaryUnlocked,
}: {
  employees: Employee[];
  onTriggerToast: Workspace["triggerToast"];
  salaryUnlocked: boolean;
}) {
  const [selectedEmpId, setSelectedEmpId] = useState(
    employees[0]?.id || "EMP001",
  );
  const [certType, setCertType] = useState<CertificateType>("在职证明");
  const [purpose, setPurpose] = useState("办理个人签证 / 居住证积分申请");
  const [resignDate, setResignDate] = useState("");

  const targetEmp = useMemo(
    () => employees.find((e) => e.id === selectedEmpId) || employees[0],
    [employees, selectedEmpId],
  );

  const isIncomeLocked = certType === "收入证明" && !salaryUnlocked;
  const isResignMissingDate = certType === "离职证明" && !resignDate;
  const isDownloadDisabled = isIncomeLocked || isResignMissingDate;

  const grossMonthly =
    (targetEmp?.baseSalary || 0) + (targetEmp?.perfSalary || 0);

  const handleDownloadDoc = async (ext: "PDF" | "Word") => {
    if (isDownloadDisabled || !targetEmp) return;
    const content = certificateContent(
      targetEmp,
      certType,
      purpose,
      resignDate,
      salaryUnlocked,
    );
    if (!content) return;
    try {
      const blob =
        ext === "PDF"
          ? await certificatePdf(content)
          : await certificateWord(content);
      downloadCertificate(
        blob,
        `${targetEmp.name}_${certType}_无章底稿.${ext === "PDF" ? "pdf" : "docx"}`,
      );
      onTriggerToast(
        `已生成并下载 ${certType} (${ext})`,
        "无章版标准电子文档已保存至本地",
      );
    } catch {
      onTriggerToast("证明导出未完成", "请重试生成文件");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
          DIGITAL CERTIFICATES
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
          证明文件
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          实时读取员工档案数据生成标准无章证明底稿，支持导出 PDF 与 Word 文档。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#1D1D1F]">证明生成参数配置</h2>

          <div>
            <label className="block font-medium text-[#6E6E73] mb-1.5">
              选择开具对象
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] font-semibold text-[#1D1D1F] outline-none"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}（{e.id} · {e.status}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#6E6E73] mb-1.5">
              证明文件类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["在职证明", "收入证明", "离职证明"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCertType(type as CertificateType)}
                  className={`py-2.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                    certType === type
                      ? "bg-[#1D1D1F] text-white border-[#1D1D1F]"
                      : "bg-[#F5F5F7] text-[#515154] border-transparent hover:bg-[#EBEBF0]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {certType === "离职证明" ? (
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1.5">
                离职日期 <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="date"
                value={resignDate}
                onChange={(e) => setResignDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1.5">
                证明用途说明
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>
          )}

          {isIncomeLocked && (
            <div className="p-3 rounded-xl bg-[#FFF5E6] border border-[#FF9500]/30 text-[#B25E00] text-[11px] font-medium flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>请先在考勤薪资页解锁薪资明细</span>
            </div>
          )}

          {isResignMissingDate && (
            <div className="p-3 rounded-xl bg-[#F5F5F7] text-[#6E6E73] text-[11px]">
              请先选择离职日期后，再生成导出离职证明文件。
            </div>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <AppleActionButton
              variant="primary"
              icon={Download}
              disabled={isDownloadDisabled}
              onClick={() => handleDownloadDoc("PDF")}
            >
              生成文件 (PDF)
            </AppleActionButton>
            <AppleActionButton
              variant="secondary"
              icon={FileText}
              disabled={isDownloadDisabled}
              onClick={() => handleDownloadDoc("Word")}
            >
              生成文件 (Word)
            </AppleActionButton>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="text-center">
              <div className="text-[10px] font-semibold tracking-widest text-[#86868B] uppercase">
                STANDARD DOCUMENT PREVIEW
              </div>
              <h2 className="text-xl font-bold text-[#1D1D1F] mt-1 tracking-wide">
                {certType}
              </h2>
            </div>

            <div className="mt-8 space-y-4 text-[13px] text-[#1D1D1F] leading-7">
              <div>致相关单位：</div>
              {certType === "在职证明" && (
                <>
                  <p className="indent-7">
                    兹证明 <span className="font-bold">{targetEmp.name}</span>
                    （员工工号：
                    <span className="font-mono">{targetEmp.id}</span>），自{" "}
                    <span className="font-mono">{targetEmp.hireDate}</span>{" "}
                    起加入我司并任职于{" "}
                    <span className="font-bold">{targetEmp.department}</span>
                    ，担任 <span className="font-bold">
                      {targetEmp.role}
                    </span>{" "}
                    一职，当前雇佣状态为「
                    {targetEmp.status}」。
                  </p>
                  <p className="indent-7">
                    本证明仅限用于「{purpose}
                    」，不作其他任何经济或法律担保用途。特此证明。
                  </p>
                </>
              )}

              {certType === "收入证明" && (
                <>
                  <p className="indent-7">
                    兹证明 <span className="font-bold">{targetEmp.name}</span>
                    （员工工号：
                    <span className="font-mono">{targetEmp.id}</span>），自{" "}
                    <span className="font-mono">{targetEmp.hireDate}</span>{" "}
                    起在我司{" "}
                    <span className="font-bold">{targetEmp.department}</span>{" "}
                    担任 <span className="font-bold">{targetEmp.role}</span>{" "}
                    一职，税前月综合收入为人民币{" "}
                    <span className="font-mono font-bold text-[#0071E3]">
                      {salaryUnlocked
                        ? `¥ ${grossMonthly.toLocaleString()}`
                        : "¥**,***"}
                    </span>{" "}
                    元。
                  </p>
                  <p className="indent-7">
                    本证明仅限用于「{purpose}
                    」，不作任何经济担保用途。特此证明。
                  </p>
                </>
              )}

              {certType === "离职证明" && (
                <p className="indent-7">
                  兹证明 <span className="font-bold">{targetEmp.name}</span>
                  （员工工号：
                  <span className="font-mono">{targetEmp.id}</span>），自{" "}
                  <span className="font-bold">
                    {formatDateCn(targetEmp.hireDate)}
                  </span>{" "}
                  起在我司任职于{" "}
                  <span className="font-bold">{targetEmp.department}</span>{" "}
                  部门，担任 <span className="font-bold">{targetEmp.role}</span>{" "}
                  一职，于{" "}
                  <span
                    className={`font-bold ${
                      resignDate ? "text-[#1D1D1F]" : "text-[#D97706]"
                    }`}
                  >
                    {formatDateCn(resignDate)}
                  </span>{" "}
                  离职，双方劳动合同已解除。特此证明。
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-[#86868B] font-mono">
            <span>文档编号：DOC-{targetEmp.id}-20261125（无章版标准底稿）</span>
            <span>生成日期：2026年11月25日</span>
          </div>
        </div>
      </div>
    </div>
  );
}
