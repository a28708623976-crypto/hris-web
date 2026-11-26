import { Download } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AppleActionButton } from "../../components/ui/AppleActionButton";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function Analytics() {
  const { atsRegionMode, jobs, candidates, onTriggerToast } =
    useOutletContext<AtsWorkspace>();
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);
  const totalInterviewing = jobs.reduce(
    (sum, j) => sum + (j.interviewing || 0),
    0,
  );
  const totalOffers = jobs.reduce((sum, j) => sum + (j.offers || 0), 0);
  const totalHired = candidates.filter(
    (c) => c.stage === "已录用转入职",
  ).length;
  const funnelSteps = [
    { stage: "简历投递总计", count: totalApplicants, pct: 100, conv: "100%" },
    {
      stage: "初筛通过进入面试",
      count: totalInterviewing,
      pct: totalApplicants
        ? Math.round((totalInterviewing / totalApplicants) * 100)
        : 0,
      conv: totalApplicants
        ? `${((totalInterviewing / totalApplicants) * 100).toFixed(1)}%`
        : "0%",
    },
    {
      stage: "正式发放 Offer",
      count: totalOffers,
      pct: totalApplicants
        ? Math.round((totalOffers / totalApplicants) * 100)
        : 0,
      conv: totalInterviewing
        ? `${((totalOffers / totalInterviewing) * 100).toFixed(1)}%`
        : "0%",
    },
    {
      stage: "候选人接受并转入职",
      count: totalHired,
      pct: totalApplicants
        ? Math.round((totalHired / totalApplicants) * 100)
        : 0,
      conv: totalOffers
        ? `${((totalHired / totalOffers) * 100).toFixed(1)}%`
        : "0%",
    },
  ];
  const deptProgressList = ["技术部", "内容创作部", "视觉设计部", "运营部"].map(
    (dept) => {
      const deptJobs = jobs.filter((j) => j.department === dept);
      const target = deptJobs.reduce((s, j) => s + (j.headcount || 0), 0);
      const hired = deptJobs.reduce((s, j) => s + (j.offers || 0), 0);
      return {
        dept,
        hired,
        target,
        avgDays:
          dept === "技术部"
            ? "18.2 天"
            : dept === "内容创作部"
              ? "13.5 天"
              : "15.0 天",
        bottleneck:
          hired >= target && target > 0
            ? "当前在招 HC 已全部锁定 Offer"
            : "持续推进面试安排与候选人跟进",
      };
    },
  );
  const channelMetrics = [
    {
      channel: "员工内部推荐",
      leads: Math.round(totalApplicants * 0.35),
      interviewRate: "42.0%",
      offers: Math.max(1, totalOffers),
      avgDays: "11.5 天",
      costPerHire: atsRegionMode === "overseas" ? "$420" : "¥ 3,000",
      roiTag: "最高 ROI",
    },
    {
      channel:
        atsRegionMode === "overseas" ? "LinkedIn Talent" : "Boss直聘企业版",
      leads: Math.round(totalApplicants * 0.4),
      interviewRate: "31.5%",
      offers: 1,
      avgDays: "17.2 天",
      costPerHire: atsRegionMode === "overseas" ? "$890" : "¥ 6,200",
      roiTag: "主力渠道",
    },
    {
      channel: "企业招聘官网直投",
      leads:
        totalApplicants -
        Math.round(totalApplicants * 0.35) -
        Math.round(totalApplicants * 0.4),
      interviewRate: "25.0%",
      offers: 0,
      avgDays: "16.0 天",
      costPerHire: atsRegionMode === "overseas" ? "$150" : "¥ 800",
      roiTag: "低成本沉淀",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
            RECRUITING ANALYTICS & INSIGHTS
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            招聘报表
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            {atsRegionMode === "overseas"
              ? "Global Recruitment Funnel Conversion, Channel ROI & Time-to-Hire Metrics."
              : "漏斗各环节转化率、招聘渠道 ROI 投入产出比与各部门招聘周期（Time to Hire）分析。"}
          </p>
        </div>
        <AppleActionButton
          variant="secondary"
          icon={Download}
          onClick={() =>
            onTriggerToast(
              "招聘分析报告已导出",
              "已生成 2026 Q4 季度招聘漏斗与渠道 ROI 统计报表",
            )
          }
        >
          导出分析报表
        </AppleActionButton>
      </div>

      {/* 核心 4 项指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">
            平均招聘周期 (Time to Hire)
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2 tabular-nums">
            16.5 天
          </div>
          <div className="text-[11px] text-[#248A3D] mt-1">
            较上季度缩短 4.2 天
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">Offer 接受率</div>
          <div className="text-3xl font-bold text-[#0071E3] mt-2 tabular-nums">
            90.9%
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            11 份发出 · 10 份确认签署
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">单人平均招聘成本 (CPH)</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2 font-mono tabular-nums">
            {atsRegionMode === "overseas" ? "$740" : "¥ 5,320"}
          </div>
          <div className="text-[11px] text-[#248A3D] mt-1">
            较预算基准节约 18.4%
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">季度 HC 编制达成率</div>
          <div className="text-3xl font-bold text-[#248A3D] mt-2 tabular-nums">
            83.3%
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            目标 12 HC · 已锁定 10 HC
          </div>
        </div>
      </div>

      {/* 漏斗各环节转化率 + 部门招聘周期对照 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F]">
              招聘漏斗各环节转化率
            </h2>
            <span className="text-[11px] text-[#86868B]">
              统计周期：2026 Q4 季度
            </span>
          </div>
          <div className="space-y-3">
            {funnelSteps.map((step) => (
              <div key={step.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1D1D1F]">
                    {step.stage}
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#86868B]">环节转化 {step.conv}</span>
                    <span className="font-bold text-[#0071E3] w-12 text-right">
                      {step.count} 人
                    </span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0071E3] transition-all duration-300"
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F]">
              各部门招聘周期与 HC 进度
            </h2>
            <span className="text-[11px] text-[#86868B]">实时联动编制池</span>
          </div>
          <div className="space-y-3.5 text-xs">
            {deptProgressList.map((d) => (
              <div
                key={d.dept}
                className="p-3.5 rounded-xl bg-[#FAFAFC] border border-black/[0.05] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1D1D1F]">{d.dept}</span>
                  <span className="font-mono text-[#0071E3] font-semibold">
                    已录用 {d.hired}/{d.target} HC · 周期 {d.avgDays}
                  </span>
                </div>
                <div className="text-[11px] text-[#6E6E73]">
                  诊断建议：{d.bottleneck}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 招聘渠道 ROI 投入产出对比表 */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        <div className="p-5 border-b border-black/[0.05] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1D1D1F]">
            招聘渠道 ROI 与转化效能对比
          </h2>
          <span className="text-xs text-[#86868B]">
            按入职贡献与单人成本综合评估
          </span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">招聘渠道名称</th>
              <th className="py-3.5 px-4">累计投递简历数</th>
              <th className="py-3.5 px-4">初筛进入面试率</th>
              <th className="py-3.5 px-4">发放 Offer 数</th>
              <th className="py-3.5 px-4">平均到岗周期</th>
              <th className="py-3.5 px-4">单人招聘成本 (CPH)</th>
              <th className="py-3.5 px-5 text-right">效能评级</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {channelMetrics.map((ch) => (
              <tr key={ch.channel} className="hover:bg-[#FAFAFC]">
                <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                  {ch.channel}
                </td>
                <td className="py-3.5 px-4 font-mono">{ch.leads} 份</td>
                <td className="py-3.5 px-4 font-mono text-[#0071E3] font-semibold">
                  {ch.interviewRate}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold">
                  {ch.offers} 人
                </td>
                <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                  {ch.avgDays}
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-[#1D1D1F]">
                  {ch.costPerHire}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="px-2.5 py-1 rounded-full bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                    {ch.roiTag}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
