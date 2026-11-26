import { Check, TrendingUp, X } from "lucide-react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Workspace } from "../hooks/useWorkspace";
import { usePageState as useState } from "../store/pageState";
import type { Employee, PerformanceRecord } from "../types";
export function PerformanceModuleView({
  records,
  onCalibrateGrade,
  onSyncPayroll,
  isSelfOnly = false,
  currentUser,
}: {
  records: PerformanceRecord[];
  onCalibrateGrade: Workspace["handleCalibrateGrade"];
  onSyncPayroll: () => void;
  isSelfOnly?: boolean;
  currentUser: Employee;
}) {
  const [selectedRecord, setSelectedRecord] =
    useState<PerformanceRecord | null>(null);
  const [gradeValue, setGradeValue] = useState("S (4.9)");
  const [commentValue, setCommentValue] = useState("");

  const openCalibrateModal = (rec: PerformanceRecord) => {
    setSelectedRecord(rec);
    setGradeValue(rec.grade === "待评定" ? "A (4.6)" : rec.grade);
    setCommentValue(rec.managerComment);
  };

  if (isSelfOnly) {
    const myPerf = records.find((r) => r.id === currentUser.id) || records[0];
    return (
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            MY PERFORMANCE
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            我的绩效
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            查看本人 2026 Q4 季度 OKR 关键结果达成度与主管校准等级结果。
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold text-[#1D1D1F]">
                {myPerf.name} · {myPerf.department}（{myPerf.role}）
              </div>
              <div className="text-xs text-[#86868B] mt-1">
                考核周期：2026 年 Q4 季度
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-xs font-bold">
                校准等级：{myPerf.grade}
              </span>
              <StatusBadge status={myPerf.status} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>季度 OKR 关键结果总达成度</span>
              <span>{myPerf.okrProgress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#F5F5F7] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1D1D1F]"
                style={{ width: `${myPerf.okrProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.05]">
              <div className="font-bold text-[#1D1D1F] mb-1.5">
                本季度 OKR 关键成果自评
              </div>
              <p className="text-[#515154] leading-relaxed">
                {myPerf.okrSummary}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.05]">
              <div className="font-bold text-[#1D1D1F] mb-1.5">
                直属主管校准评语
              </div>
              <p className="text-[#515154] leading-relaxed">
                {myPerf.managerComment}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            OKR & PERFORMANCE
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            绩效考核
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            季度 OKR
            关键结果达成度与主管绩效等级校准看板，点击查看详情进行安全校准。
          </p>
        </div>
        <AppleActionButton
          variant="primary"
          icon={TrendingUp}
          onClick={onSyncPayroll}
        >
          同步结果至算薪引擎
        </AppleActionButton>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">被评估人</th>
              <th className="py-3.5 px-4">所属部门</th>
              <th className="py-3.5 px-4">岗位名称</th>
              <th className="py-3.5 px-4">OKR 完成度</th>
              <th className="py-3.5 px-4">员工自评</th>
              <th className="py-3.5 px-4">校准等级</th>
              <th className="py-3.5 px-4">当前阶段</th>
              <th className="py-3.5 px-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-[#FAFAFC]">
                <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                  {rec.name}{" "}
                  <span className="font-mono text-[#86868B] font-normal">
                    {rec.id}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#1D1D1F]">{rec.department}</td>
                <td className="py-3.5 px-4 text-[#6E6E73]">{rec.role}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-20 h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1D1D1F]"
                        style={{ width: `${rec.okrProgress}%` }}
                      />
                    </div>
                    <span className="font-mono font-semibold">
                      {rec.okrProgress}%
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-[#6E6E73]">{rec.selfEval}</td>
                <td className="py-3.5 px-4 font-bold text-[#0071E3]">
                  {rec.grade}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={rec.status} />
                </td>
                <td className="py-3.5 px-5 text-right">
                  <AppleActionButton
                    size="xs"
                    onClick={() => openCalibrateModal(rec)}
                  >
                    查看详情
                  </AppleActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 绩效详情与等级校准弹窗（防误触） */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  季度绩效详情与等级校准
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  {selectedRecord.name}（{selectedRecord.id} ·{" "}
                  {selectedRecord.department}）
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-1.5">
                <div className="font-bold text-[#1D1D1F]">
                  OKR 关键结果完成度：{selectedRecord.okrProgress}%
                </div>
                <p className="text-[#515154] leading-relaxed">
                  {selectedRecord.okrSummary}
                </p>
              </div>

              <div>
                <label className="block font-medium text-[#6E6E73] mb-1.5">
                  校准绩效等级
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["S (4.9)", "A (4.6)", "B+ (4.2)", "B (3.8)"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGradeValue(g)}
                      className={`py-2 rounded-xl font-bold border cursor-pointer ${
                        gradeValue === g
                          ? "bg-[#0071E3] text-white border-[#0071E3]"
                          : "bg-[#F5F5F7] text-[#515154] border-transparent"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#6E6E73] mb-1.5">
                  主管校准评语
                </label>
                <textarea
                  rows={3}
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex justify-end gap-2">
              <AppleActionButton
                variant="secondary"
                onClick={() => setSelectedRecord(null)}
              >
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="primary"
                icon={Check}
                onClick={() => {
                  onCalibrateGrade(selectedRecord.id, gradeValue, commentValue);
                  setSelectedRecord(null);
                }}
              >
                确认保存校准结果
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
