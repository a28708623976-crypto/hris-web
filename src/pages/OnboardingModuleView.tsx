import { Check, Plus, X } from "lucide-react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Workspace } from "../hooks/useWorkspace";
import { usePageState as useState } from "../store/pageState";
import type { OnboardingTask } from "../types";
import { addDaysToDate } from "../utils/index";
export function OnboardingModuleView({
  tasks,
  onCompleteOnboarding,
  onOpenNewModal,
}: {
  tasks: OnboardingTask[];
  onCompleteOnboarding: Workspace["handleCompleteOnboarding"];
  onOpenNewModal: () => void;
}) {
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(
    {},
  );
  const [showPendingConfirm, setShowPendingConfirm] = useState(false);
  const [pendingReasonType, setPendingReasonType] = useState("材料稍后补交");
  const [pendingReasonNote, setPendingReasonNote] = useState("");
  const [pendingDeadline, setPendingDeadline] = useState("2026-12-08");

  const openVerifyModal = (task: OnboardingTask) => {
    setSelectedTask(task);
    setChecklistState({ ...task.checklist });
    setShowPendingConfirm(false);
    setPendingReasonType("材料稍后补交");
    setPendingReasonNote("");
    setPendingDeadline(addDaysToDate(task.expectedDate, 7));
  };

  const checklistItems = [
    { key: "idCard", label: "二代居民身份证正反面扫描件" },
    { key: "diploma", label: "最高学历学位证书及学信网验证报告" },
    { key: "resignationCert", label: "上家单位离职证明原件" },
    { key: "bankCard", label: "工资代发银行储蓄卡照片及开户行信息" },
    { key: "medicalReport", label: "近 3 个月内入职体检合格报告" },
  ];

  const missingItems = checklistItems.filter(
    (item) => !checklistState[item.key],
  );
  const allChecked = missingItems.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            ONBOARDING PIPELINE
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            入职管理
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            独立追踪新员工 Offer
            签署、入职五项前置资料核验（支持材料待补全先行入职）与正式建档。
          </p>
        </div>
        <AppleActionButton
          variant="primary"
          icon={Plus}
          onClick={onOpenNewModal}
        >
          直接新建员工建档
        </AppleActionButton>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1D1D1F]">
            待报到及材料核验队列
          </span>
          <span className="text-xs text-[#86868B]">
            共 {tasks.length} 条记录
          </span>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {tasks.map((task) => {
            const checkedCount = Object.values(task.checklist || {}).filter(
              Boolean,
            ).length;
            const isPendingTag = task.stage.startsWith("材料待补");
            return (
              <div
                key={task.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFC] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-bold text-[#1D1D1F]">
                      {task.candidateName}
                    </span>
                    <span className="text-xs text-[#6E6E73]">
                      {task.department} · {task.role}
                    </span>
                    {isPendingTag ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF5E6] text-[#B25E00]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
                        {task.stage}
                      </span>
                    ) : (
                      <StatusBadge status={task.stage} />
                    )}
                  </div>
                  <p className="text-xs text-[#6E6E73]">{task.remark}</p>
                  <div className="text-[11px] text-[#86868B] font-mono">
                    单号：{task.id} · 预计报到：{task.expectedDate} ·
                    材料齐全度：{checkedCount}/5 项
                  </div>
                </div>
                <div className="shrink-0">
                  <AppleActionButton
                    size="sm"
                    onClick={() => openVerifyModal(task)}
                  >
                    {task.stage === "已完成入职建档" || isPendingTag
                      ? "查看建档记录"
                      : "核验材料并办理"}
                  </AppleActionButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  新员工入职材料核验详情
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5 font-mono">
                  {selectedTask.id} · {selectedTask.candidateName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">拟入职部门与岗位</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedTask.department} · {selectedTask.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">预计报到日期</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    {selectedTask.expectedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">定薪标准</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    底薪 ¥{selectedTask.baseSalary.toLocaleString()} + 绩效 ¥
                    {selectedTask.perfSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#1D1D1F] mb-2.5">
                  入职前置五项材料核验清单
                </div>
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <label
                      key={item.key}
                      className="p-3 rounded-xl border border-black/[0.06] bg-white flex items-center justify-between cursor-pointer hover:bg-[#FAFAFC]"
                    >
                      <span className="text-xs text-[#1D1D1F]">
                        {item.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(checklistState[item.key])}
                        onChange={(e) =>
                          setChecklistState((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 accent-[#0071E3] rounded cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              <AppleActionButton
                variant="secondary"
                onClick={() => setSelectedTask(null)}
              >
                关闭
              </AppleActionButton>
              {selectedTask.stage !== "已完成入职建档" &&
                !selectedTask.stage.startsWith("材料待补") && (
                  <div className="flex items-center gap-2">
                    {allChecked ? (
                      <AppleActionButton
                        variant="primary"
                        icon={Check}
                        onClick={() => {
                          onCompleteOnboarding(
                            selectedTask.id,
                            checklistState,
                            false,
                          );
                          setSelectedTask(null);
                        }}
                      >
                        核验通过并建档
                      </AppleActionButton>
                    ) : (
                      <AppleActionButton
                        variant="primary"
                        onClick={() => setShowPendingConfirm(true)}
                      >
                        材料待补全（先办入职）
                      </AppleActionButton>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* 材料没齐时先办入职二次确认小弹窗 */}
      {selectedTask && showPendingConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#1D1D1F]">
                确认材料待补全先行入职
              </h4>
              <button
                onClick={() => setShowPendingConfirm(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF5E6] border border-[#FF9500]/30 text-[#B25E00] leading-relaxed">
              还缺 <span className="font-bold">{missingItems.length}</span> 项：
              {missingItems.map((m) => m.label).join("、")}
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">
                先办入职的原因 <span className="text-[#FF3B30]">*</span>
              </label>
              <select
                value={pendingReasonType}
                onChange={(e) => setPendingReasonType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              >
                <option value="材料稍后补交">材料稍后补交</option>
                <option value="特批入职">特批入职</option>
                <option value="其他">其他</option>
              </select>
              {pendingReasonType === "其他" && (
                <input
                  type="text"
                  placeholder="请填写具体原因备注..."
                  value={pendingReasonNote}
                  onChange={(e) => setPendingReasonNote(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">
                补交截止日期 <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="date"
                value={pendingDeadline}
                onChange={(e) => setPendingDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <AppleActionButton
                variant="secondary"
                onClick={() => setShowPendingConfirm(false)}
              >
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="primary"
                disabled={
                  !pendingDeadline ||
                  (pendingReasonType === "其他" && !pendingReasonNote.trim())
                }
                onClick={() => {
                  const reasonSummary =
                    pendingReasonType === "其他"
                      ? pendingReasonNote.trim()
                      : pendingReasonType;
                  onCompleteOnboarding(selectedTask.id, checklistState, true, {
                    deadline: pendingDeadline,
                    reason: reasonSummary,
                  });
                  setShowPendingConfirm(false);
                  setSelectedTask(null);
                }}
              >
                确认建档
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
