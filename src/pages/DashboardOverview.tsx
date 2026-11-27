import { dashboardSummary } from "../utils/dashboard";
import { ChevronRight, Plus, Users } from "lucide-react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import type { Workspace } from "../hooks/useWorkspace";
import type { Employee, LifecycleTask, OnboardingTask, Role } from "../types";
export function DashboardOverview({
  employees,
  onboardingTasks,
  lifecycleTasks,
  onNavigate,
  onOpenNewModal,
  role,
  currentUser,
}: {
  employees: Employee[];
  onboardingTasks: OnboardingTask[];
  lifecycleTasks: LifecycleTask[];
  onNavigate: Workspace["setActiveNav"];
  onOpenNewModal: () => void;
  role: Role;
  currentUser: Employee;
}) {
  const isEmployee = role === "普通员工";
  const isHr = role === "HR 主管";
  const {
    activeEmps,
    probationCount,
    expiringCount,
    pendingLifecycleCount,
    pendingOnboardingCount,
    waitingOnboardingCount,
    deptList,
    attendanceCompliance,
    pendingAppeals,
    annualLeaveDays,
    compensatoryHours,
  } = dashboardSummary(employees, onboardingTasks, lifecycleTasks, currentUser);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            {isEmployee ? "PERSONAL WORKSPACE" : "EXECUTIVE OVERVIEW"}
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {isEmployee ? "我的工作台" : "人事工作台"}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            早安，{currentUser.name}。
            {isEmployee
              ? "以下为您的个人在职状态、本月出勤与快捷自助服务入口。"
              : "以下是当前组织架构健康度与核心人事待办摘要。"}
          </p>
        </div>

        {isHr && (
          <div className="flex items-center gap-2.5">
            <AppleActionButton
              icon={Users}
              onClick={() => onNavigate("employees")}
            >
              管理员工档案
            </AppleActionButton>
            <AppleActionButton
              variant="primary"
              icon={Plus}
              onClick={onOpenNewModal}
            >
              快速办理入职
            </AppleActionButton>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => !isEmployee && onNavigate("employees")}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>{isEmployee ? "当前在职状态" : "在编总人数"}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-3 tabular-nums">
            {isEmployee ? currentUser.status : `${activeEmps.length} 人`}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1.5">
            {isEmployee
              ? `${currentUser.department} · ${currentUser.role}`
              : `含试用期 ${probationCount} 人`}
          </div>
        </div>

        <div
          onClick={() => onNavigate(isEmployee ? "self-service" : "lifecycle")}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>{isEmployee ? "剩余法定年假" : "待处理入转调离"}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#0071E3] mt-3 tabular-nums">
            {isEmployee
              ? `${annualLeaveDays} 天`
              : `${pendingOnboardingCount + pendingLifecycleCount} 项`}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1.5">
            {isEmployee
              ? `可用调休余额 ${compensatoryHours.toFixed(1)} 小时`
              : "点击进入入职与转调离审批"}
          </div>
        </div>

        <div
          onClick={() => onNavigate("contracts")}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>{isEmployee ? "我的合同到期日" : "30天内合同到期"}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#D97706] mt-3 tabular-nums">
            {isEmployee ? currentUser.contractEnd : `${expiringCount} 份`}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1.5">
            {isEmployee
              ? currentUser.contractEntity
              : "建议提前发起电子续签沟通"}
          </div>
        </div>

        <div
          onClick={() => onNavigate("attendance")}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>本月出勤合规率</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#248A3D] mt-3 tabular-nums">
            {attendanceCompliance}%
          </div>
          <div className="text-[11px] text-[#86868B] mt-1.5">
            全员考勤异常 {pendingAppeals} 条待申诉
          </div>
        </div>
      </div>

      {!isEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1D1D1F]">
                部门在职人数分布
              </h2>
              {isHr && (
                <AppleActionButton
                  size="xs"
                  onClick={() => onNavigate("employees")}
                >
                  查看完整花名册
                </AppleActionButton>
              )}
            </div>
            <div className="space-y-3.5">
              {deptList.map((dept) => {
                const count = activeEmps.filter(
                  (e) => e.department === dept,
                ).length;
                const pct = activeEmps.length
                  ? Math.round((count / activeEmps.length) * 100)
                  : 0;
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1D1D1F]">
                        {dept}
                      </span>
                      <span className="text-[#6E6E73] font-mono">
                        {count} 人 ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F5F5F7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1D1D1F] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-[#1D1D1F]">
              高频人事快捷办理
            </h2>
            <div className="space-y-2.5">
              {[
                {
                  title: "查看全员员工花名册",
                  sub: `共 ${employees.length} 名伙伴完整建档`,
                  target: "employees",
                  show: isHr,
                },
                {
                  title: "办理新员工入职核验",
                  sub: `${waitingOnboardingCount} 项待报到入职记录`,
                  target: "onboarding",
                  show: isHr,
                },
                {
                  title: "审批入转调离流程",
                  sub: `${pendingLifecycleCount} 项待审批异动流程`,
                  target: "lifecycle",
                  show: true,
                },
                {
                  title: "一键生成证明文件",
                  sub: "支持导出无章版 PDF 与 Word",
                  target: "certificates",
                  show: isHr,
                },
              ]
                .filter((x) => x.show)
                .map((item) => (
                  <button
                    key={item.title}
                    onClick={() => onNavigate(item.target)}
                    className="w-full p-3.5 rounded-xl bg-[#FAFAFC] hover:bg-[#F5F5F7] border border-black/[0.05] flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1D1D1F]">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#86868B] mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#86868B]" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
