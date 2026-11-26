import { Ban, Check, Plus, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DEPARTMENTS } from "../constants/index";
import type { Workspace } from "../hooks/useWorkspace";
import { usePageState as useState } from "../store/pageState";
import type { Employee, LifecyclePrefill, LifecycleTask, Role } from "../types";
export function LifecycleModuleView({
  tasks,
  onApproveTask,
  onRejectTask,
  onCreateTask,
  role,
  currentUser,
  prefillModal,
  onClearPrefillModal,
}: {
  tasks: LifecycleTask[];
  onApproveTask: Workspace["handleApproveLifecycle"];
  onRejectTask: Workspace["handleRejectLifecycle"];
  onCreateTask: Workspace["handleCreateLifecycleTask"];
  role: Role;
  currentUser: Employee;
  prefillModal: LifecyclePrefill | null;
  onClearPrefillModal: () => void;
}) {
  const [typeFilter, setTypeFilter] = useState("全部类型");
  const [selectedTask, setSelectedTask] = useState<LifecycleTask | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    type: "内部调岗",
    employeeName: "",
    employeeId: "EMP002",
    department: currentUser.department,
    role: "",
    effectiveDate: "2026-12-01",
    detail: "",
  });

  useEffect(() => {
    if (prefillModal) {
      setTaskForm({
        type: prefillModal.type || "转正评估",
        employeeName: prefillModal.employeeName || "",
        employeeId: prefillModal.employeeId || "EMP002",
        department: prefillModal.department || currentUser.department,
        role: prefillModal.role || "",
        effectiveDate: "2026-12-01",
        detail:
          prefillModal.type === "离职办理"
            ? "申请办理离职交接与劳动合同解除流程。"
            : "试用期考核达标，申请如期办理转正评估。",
      });
      setShowNewTaskModal(true);
      onClearPrefillModal();
    }
  }, [prefillModal, currentUser.department, onClearPrefillModal]);

  const isDeptLead = role === "部门负责人";
  const scopedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (isDeptLead && t.department !== currentUser.department) return false;
      if (typeFilter !== "全部类型" && t.type !== typeFilter) return false;
      return true;
    });
  }, [tasks, isDeptLead, currentUser.department, typeFilter]);

  const tabs = ["全部类型", "转正评估", "内部调岗", "离职办理"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            LIFECYCLE MANAGEMENT
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            转调离管理
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            {isDeptLead
              ? `当前仅展示「${currentUser.department}」部门异动流转，支持发起本部门内部调岗与审批节点复核。`
              : "员工转正评估、内部调岗与离职办理全流程审批中心，审批生效后自动同步员工档案。"}
          </p>
        </div>
        <AppleActionButton
          variant="primary"
          icon={Plus}
          onClick={() => {
            setTaskForm({
              type: isDeptLead ? "内部调岗" : "转正评估",
              employeeName: "",
              employeeId: "EMP002",
              department: currentUser.department,
              role: "",
              effectiveDate: "2026-12-01",
              detail: "",
            });
            setShowNewTaskModal(true);
          }}
        >
          {isDeptLead ? "发起本部门内部调岗" : "发起人事异动流程"}
        </AppleActionButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = typeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-[#1D1D1F] text-white"
                  : "bg-white text-[#515154] border border-black/[0.06] hover:bg-[#F5F5F7]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] divide-y divide-black/[0.05]">
        {scopedTasks.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#86868B]">
            当前筛选条件下暂无转调离流程记录
          </div>
        ) : (
          scopedTasks.map((task) => (
            <div
              key={task.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFC]"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EBF5FF] text-[#0071E3] text-[11px] font-bold">
                    {task.type}
                  </span>
                  <span className="text-sm font-bold text-[#1D1D1F]">
                    {task.employeeName}
                  </span>
                  <span className="text-xs font-mono text-[#86868B]">
                    {task.employeeId}
                  </span>
                  <span className="text-xs text-[#6E6E73]">
                    {task.department} · {task.role}
                  </span>
                  <StatusBadge status={task.stage} />
                </div>
                <p className="text-xs text-[#515154]">{task.detail}</p>
                <div className="text-[11px] text-[#86868B] font-mono">
                  单号：{task.id} · 预计生效日期：{task.effectiveDate} ·
                  当前节点负责人：{task.approver}
                </div>
              </div>
              <AppleActionButton
                size="xs"
                onClick={() => {
                  setSelectedTask(task);
                  setShowRejectBox(false);
                  setRejectReason("");
                }}
              >
                查看详情
              </AppleActionButton>
            </div>
          ))
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-black/[0.08] overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  {selectedTask.type} · 审批详情
                </h3>
                <p className="text-[#86868B] font-mono mt-0.5">
                  {selectedTask.id}
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
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">员工信息</span>
                  <span className="font-bold text-[#1D1D1F]">
                    {selectedTask.employeeName}（{selectedTask.employeeId}）
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">部门与目标岗位</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedTask.department} · {selectedTask.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">预计生效日期</span>
                  <span className="font-mono font-semibold">
                    {selectedTask.effectiveDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">当前节点负责人</span>
                  <span className="font-semibold text-[#0071E3]">
                    {selectedTask.approver}
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl border border-black/[0.06] text-[#1D1D1F] leading-relaxed">
                {selectedTask.detail}
              </div>

              {showRejectBox && (
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#D70015]">
                    请填写驳回原因 *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="请说明需补充材料或驳回退回的具体原因..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FFF2F2]/60 border border-[#FF3B30]/30 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {selectedTask.stage !== "已生效归档" &&
              selectedTask.stage !== "已驳回" ? (
                <>
                  {!showRejectBox ? (
                    <AppleActionButton
                      variant="danger"
                      icon={Ban}
                      onClick={() => setShowRejectBox(true)}
                    >
                      驳回申请
                    </AppleActionButton>
                  ) : (
                    <AppleActionButton
                      variant="danger"
                      disabled={!rejectReason.trim()}
                      onClick={() => {
                        onRejectTask(selectedTask.id, rejectReason.trim());
                        setSelectedTask(null);
                      }}
                    >
                      确认驳回退回
                    </AppleActionButton>
                  )}
                  <div className="flex items-center gap-2">
                    <AppleActionButton
                      variant="secondary"
                      onClick={() => setSelectedTask(null)}
                    >
                      关闭
                    </AppleActionButton>
                    <AppleActionButton
                      variant="primary"
                      icon={Check}
                      onClick={() => {
                        onApproveTask(selectedTask.id);
                        setSelectedTask(null);
                      }}
                    >
                      同意并归档生效
                    </AppleActionButton>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <AppleActionButton onClick={() => setSelectedTask(null)}>
                    关闭
                  </AppleActionButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                发起人事异动流程
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1">
                异动类型
              </label>
              <select
                disabled={isDeptLead}
                value={taskForm.type}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, type: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              >
                <option value="转正评估">转正评估</option>
                <option value="内部调岗">内部调岗</option>
                <option value="离职办理">离职办理</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  员工姓名 *
                </label>
                <input
                  type="text"
                  placeholder="例如：张伟"
                  value={taskForm.employeeName}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, employeeName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  目标部门
                </label>
                <select
                  disabled={isDeptLead}
                  value={taskForm.department}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, department: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                >
                  {DEPARTMENTS.filter((d) => d !== "全部部门").map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  目标岗位 *
                </label>
                <input
                  type="text"
                  placeholder="请输入岗位名称"
                  value={taskForm.role}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, role: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  预计生效日期
                </label>
                <input
                  type="date"
                  value={taskForm.effectiveDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, effectiveDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1">
                申请说明与评估意见
              </label>
              <textarea
                rows={2}
                value={taskForm.detail}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, detail: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <AppleActionButton
                variant="secondary"
                onClick={() => setShowNewTaskModal(false)}
              >
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="primary"
                disabled={
                  !taskForm.employeeName.trim() || !taskForm.role.trim()
                }
                onClick={() => {
                  onCreateTask(taskForm);
                  setShowNewTaskModal(false);
                }}
              >
                提交审批流程
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
