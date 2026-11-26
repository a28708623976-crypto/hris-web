import { Plus } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AppleActionButton } from "../../components/ui/AppleActionButton";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function Jobs() {
  const {
    setAtsActiveNav,
    setAtsViewMode,
    atsRegionMode,
    setSelectedAtsJobId,
    jobs,
  } = useOutletContext<AtsWorkspace>();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
            JOB REQUISITIONS
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            职位管理
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            在招 / 草稿 / 已关闭职位全生命周期管理，支持关联 Core HR 编制 HC
            池。
          </p>
        </div>
        <AppleActionButton
          variant="blue"
          icon={Plus}
          onClick={() => setAtsViewMode("job-create")}
        >
          发布新招聘职位
        </AppleActionButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0071E3]">
                  {job.department} · {job.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                  招聘中 · {job.headcount} HC
                </span>
              </div>
              <div className="text-base font-bold text-[#1D1D1F] mt-2">
                {job.title}
              </div>
              <div className="text-xs text-[#6E6E73] mt-1">
                {atsRegionMode === "overseas"
                  ? `Global Remote / Singapore · Band: $120K - $155K / yr (USD)`
                  : `${job.location} · 薪酬带宽：${job.salaryRange}`}
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-[#6E6E73]">
                <span>新简历 {job.applicants}</span>
                <span>面试中 {job.interviewing}</span>
                <span className="font-bold text-[#1D1D1F]">
                  Offer {job.offers}
                </span>
              </div>
              <AppleActionButton
                size="xs"
                onClick={() => {
                  setSelectedAtsJobId(job.id);
                  setAtsActiveNav("ats-progress");
                }}
              >
                查看该职位看板
              </AppleActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
