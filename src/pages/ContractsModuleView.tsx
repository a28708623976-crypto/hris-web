import { Ban, Check, Filter, X } from "lucide-react";
import { useMemo } from "react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Workspace } from "../hooks/useWorkspace";
import { usePageState as useState } from "../store/pageState";
import type { Employee } from "../types";
export function ContractsModuleView({
  employees,
  onRenewContract,
  onTerminateRenewal,
  isSelfOnly = false,
}: {
  employees: Employee[];
  onRenewContract: Workspace["handleRenewContract"];
  onTerminateRenewal: Workspace["handleTerminateRenewal"];
  isSelfOnly?: boolean;
}) {
  const [onlyExpiring, setOnlyExpiring] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [renewYears, setRenewYears] = useState(3);
  const [newEndDate, setNewEndDate] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [clauseMode, setClauseMode] = useState("unchanged"); // 'unchanged' | 'modified'
  const [clauseNotes, setClauseNotes] = useState("");

  const openContractModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setRenewYears(3);
    const base = new Date(emp.contractEnd);
    if (!Number.isNaN(base.getTime())) {
      base.setFullYear(base.getFullYear() + 3);
      setNewEndDate(base.toISOString().slice(0, 10));
    } else {
      setNewEndDate("2029-12-31");
    }
    setNewRoleName(emp.role);
    setClauseMode("unchanged");
    setClauseNotes("");
  };

  const handleSelectYears = (yrs: number) => {
    setRenewYears(yrs);
    if (selectedEmp) {
      const base = new Date(selectedEmp.contractEnd);
      if (!Number.isNaN(base.getTime())) {
        base.setFullYear(base.getFullYear() + yrs);
        setNewEndDate(base.toISOString().slice(0, 10));
      }
    }
  };

  const visibleList = useMemo(() => {
    return employees.filter((e) => {
      if (e.status === "已离职") return false;
      if (onlyExpiring) return e.contractEnd <= "2026-12-31";
      return true;
    });
  }, [employees, onlyExpiring]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            {isSelfOnly ? "MY CONTRACT" : "CONTRACT & COMPLIANCE"}
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {isSelfOnly ? "我的合同" : "合同管理"}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            {isSelfOnly
              ? "查看本人劳动合同起止周期、签约主体与电子续签状态。"
              : "劳动合同台账监控与电子续签管理，点击详情可编辑续签条款或标记到期不再续签。"}
          </p>
        </div>
        {!isSelfOnly && (
          <AppleActionButton
            variant={onlyExpiring ? "primary" : "secondary"}
            icon={Filter}
            onClick={() => setOnlyExpiring(!onlyExpiring)}
          >
            {onlyExpiring ? "显示全部合同" : "仅看即将到期预警"}
          </AppleActionButton>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">签署人</th>
              <th className="py-3.5 px-4">所属部门</th>
              <th className="py-3.5 px-4">岗位名称</th>
              <th className="py-3.5 px-4">签约主体</th>
              <th className="py-3.5 px-4">入职起始日</th>
              <th className="py-3.5 px-4">合同到期日</th>
              <th className="py-3.5 px-4">合同状态</th>
              <th className="py-3.5 px-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {visibleList.map((emp) => {
              const isExpiring = emp.contractEnd <= "2026-12-31";
              const statusLabel =
                emp.renewalStatus === "terminated"
                  ? "不再续签"
                  : isExpiring
                    ? "即将到期"
                    : "正常履行中";
              return (
                <tr key={emp.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                    {emp.name}{" "}
                    <span className="font-mono text-[#86868B] font-normal">
                      {emp.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#1D1D1F]">
                    {emp.department}
                  </td>
                  <td className="py-3.5 px-4 text-[#1D1D1F] font-medium">
                    {emp.role}
                  </td>
                  <td className="py-3.5 px-4 text-[#6E6E73]">
                    {emp.contractEntity}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                    {emp.hireDate}
                  </td>
                  <td
                    className={`py-3.5 px-4 font-mono ${
                      isExpiring
                        ? "text-[#D97706] font-semibold"
                        : "text-[#6E6E73]"
                    }`}
                  >
                    {emp.contractEnd}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={statusLabel} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <AppleActionButton
                      size="xs"
                      onClick={() => openContractModal(emp)}
                    >
                      查看详情
                    </AppleActionButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  劳动合同详情与电子续签
                </h3>
                <p className="text-xs text-[#86868B] font-mono mt-0.5">
                  CTR-{selectedEmp.id} · {selectedEmp.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">签约员工</span>
                  <span className="font-bold text-[#1D1D1F]">
                    {selectedEmp.name}（{selectedEmp.id}）
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">所属部门与岗位</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedEmp.department} · {selectedEmp.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">原合同起止周期</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    {selectedEmp.hireDate} 至 {selectedEmp.contractEnd}
                  </span>
                </div>
              </div>

              {!isSelfOnly && (
                <div className="space-y-3">
                  <div className="font-bold text-[#1D1D1F]">
                    续签合同信息编辑
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 3, 5].map((yrs) => (
                      <button
                        key={yrs}
                        type="button"
                        onClick={() => handleSelectYears(yrs)}
                        className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                          renewYears === yrs
                            ? "bg-[#1D1D1F] text-white border-[#1D1D1F]"
                            : "bg-[#F5F5F7] text-[#515154] border-transparent"
                        }`}
                      >
                        续签 {yrs} 年
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        新合同到期日期
                      </label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        续签后岗位名称
                      </label>
                      <input
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      续签补充条款模式
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setClauseMode("unchanged")}
                        className={`py-2 px-3 rounded-xl font-semibold border cursor-pointer ${
                          clauseMode === "unchanged"
                            ? "bg-[#0071E3] text-white border-[#0071E3]"
                            : "bg-[#F5F5F7] text-[#515154] border-transparent"
                        }`}
                      >
                        无修改（按原条款顺延）
                      </button>
                      <button
                        type="button"
                        onClick={() => setClauseMode("modified")}
                        className={`py-2 px-3 rounded-xl font-semibold border cursor-pointer ${
                          clauseMode === "modified"
                            ? "bg-[#0071E3] text-white border-[#0071E3]"
                            : "bg-[#F5F5F7] text-[#515154] border-transparent"
                        }`}
                      >
                        需修改补充条款
                      </button>
                    </div>
                    {clauseMode === "modified" && (
                      <textarea
                        rows={2}
                        placeholder="请具体填写需变更的薪资、工作地点或补充协议条款..."
                        value={clauseNotes}
                        onChange={(e) => setClauseNotes(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {!isSelfOnly ? (
                <>
                  <AppleActionButton
                    variant="danger"
                    icon={Ban}
                    onClick={() => {
                      onTerminateRenewal(selectedEmp.id);
                      setSelectedEmp(null);
                    }}
                  >
                    到期不再续签
                  </AppleActionButton>
                  <div className="flex items-center gap-2">
                    <AppleActionButton
                      variant="secondary"
                      onClick={() => setSelectedEmp(null)}
                    >
                      取消
                    </AppleActionButton>
                    <AppleActionButton
                      variant="primary"
                      icon={Check}
                      onClick={() => {
                        onRenewContract(
                          selectedEmp.id,
                          newEndDate,
                          newRoleName,
                          clauseMode,
                          clauseNotes,
                        );
                        setSelectedEmp(null);
                      }}
                    >
                      保存条款并办理电子续签
                    </AppleActionButton>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <AppleActionButton onClick={() => setSelectedEmp(null)}>
                    关闭
                  </AppleActionButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
