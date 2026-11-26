import { DollarSign, Lock, Unlock } from "lucide-react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import type { Workspace } from "../hooks/useWorkspace";
import { usePageState as useState } from "../store/pageState";
import type { Employee, Role, Setter } from "../types";
export function AttendancePayrollView({
  employees,
  role,
  currentUser,
  onTriggerToast,
  unlocked,
  setUnlocked,
}: {
  employees: Employee[];
  role: Role;
  currentUser: Employee;
  onTriggerToast: Workspace["triggerToast"];
  unlocked: boolean;
  setUnlocked: Setter<boolean>;
}) {
  const isEmployee = role === "普通员工";
  const isHrLead = role === "HR 主管";
  const [scopeTab, setScopeTab] = useState("team"); // 'team' | 'personal'

  // 普通员工专属：2026年11月个人考勤日历视图
  if (isEmployee || scopeTab === "personal") {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
              PERSONAL ATTENDANCE
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
              2026年11月考勤数据
            </h1>
            <p className="text-[13px] text-[#6E6E73] mt-1">
              {currentUser.name}（{currentUser.department}）·
              月度每日上下班打卡记录与出勤日历。
            </p>
          </div>
          {!isEmployee && (
            <div className="inline-flex p-1 rounded-xl bg-[#E8E8ED]">
              <button
                onClick={() => setScopeTab("team")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#515154] cursor-pointer"
              >
                团队考勤与算薪
              </button>
              <button
                onClick={() => setScopeTab("personal")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1D1D1F] shadow-2xs cursor-pointer"
              >
                个人考勤日历
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-[#1D1D1F]">
              2026 年 11 月出勤日历（应出勤 22 天 · 实出勤 22 天）
            </span>
            <div className="flex items-center gap-4 text-xs text-[#6E6E73]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34C759]" /> 正常出勤
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D1D1D6]" /> 周末公休
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["周日", "周一", "周二", "周三", "周四", "周五", "周六"].map(
              (w) => (
                <div key={w} className="py-2 font-semibold text-[#86868B]">
                  {w}
                </div>
              ),
            )}
            {days.map((d) => {
              const weekday = d % 7;
              const isWeekend = weekday === 1 || weekday === 0;
              return (
                <div
                  key={d}
                  className={`p-3 rounded-xl border text-left ${
                    isWeekend
                      ? "bg-[#FAFAFC] border-black/[0.04] text-[#86868B]"
                      : "bg-[#F2FBF4]/60 border-[#34C759]/20 text-[#1D1D1F]"
                  }`}
                >
                  <div className="font-bold font-mono">{d} 日</div>
                  <div className="text-[10px] mt-1">
                    {isWeekend ? "公休日" : "09:26 - 18:40"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeList = employees.filter((e) => e.status !== "已离职");
  const totalGross = activeList.reduce(
    (acc, e) => acc + (e.baseSalary || 0) + (e.perfSalary || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            ATTENDANCE & PAYROLL
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            考勤薪资
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            月度考勤工时汇总与自动算薪台账，默认开启敏感薪资保护锁。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-1 rounded-xl bg-[#E8E8ED]">
            <button
              onClick={() => setScopeTab("team")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1D1D1F] shadow-2xs cursor-pointer"
            >
              团队考勤
            </button>
            <button
              onClick={() => setScopeTab("personal")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#515154] cursor-pointer"
            >
              个人考勤
            </button>
          </div>

          <AppleActionButton
            variant="secondary"
            icon={unlocked ? Lock : Unlock}
            onClick={() => setUnlocked(!unlocked)}
          >
            {unlocked ? "锁定薪资明细" : "解锁薪资明细"}
          </AppleActionButton>

          {isHrLead && (
            <AppleActionButton
              variant="primary"
              icon={DollarSign}
              onClick={() =>
                onTriggerToast(
                  "2026年11月电子工资条已发放",
                  `已向 ${activeList.length} 名在职伙伴推送加密薪资单`,
                )
              }
            >
              一键发放工资条
            </AppleActionButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">本期计薪在编人数</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2">
            {activeList.length} 人
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            全勤标准 22 个工作日（176 小时）
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">本月税前应发总额</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2 font-mono">
            {unlocked ? `¥ ${totalGross.toLocaleString()}` : "¥ ***,***"}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            含基本薪资与月度绩效奖金
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">五险一金缴纳状态</div>
          <div className="text-3xl font-bold text-[#248A3D] mt-2">
            已核准申报
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            本月无新增增减员漏报异常
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">员工</th>
              <th className="py-3.5 px-4">出勤天数</th>
              <th className="py-3.5 px-4">基本月薪</th>
              <th className="py-3.5 px-4">绩效奖金</th>
              <th className="py-3.5 px-4">税前应发合计</th>
              <th className="py-3.5 px-5 text-right">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {activeList.map((emp) => {
              const gross = (emp.baseSalary || 0) + (emp.perfSalary || 0);
              return (
                <tr key={emp.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                    {emp.name}{" "}
                    <span className="font-normal text-[#86868B]">
                      （{emp.department}）
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">22.0 天（全勤）</td>
                  <td className="py-3.5 px-4 font-mono">
                    {unlocked
                      ? `¥ ${(emp.baseSalary || 0).toLocaleString()}`
                      : "¥ **,***"}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {unlocked
                      ? `¥ ${(emp.perfSalary || 0).toLocaleString()}`
                      : "¥ *,***"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1D1D1F]">
                    {unlocked ? `¥ ${gross.toLocaleString()}` : "¥ **,***"}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                      已核算
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
