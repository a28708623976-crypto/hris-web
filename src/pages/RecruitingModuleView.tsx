import { Ban, Check, Plus, X } from "lucide-react";
import { useMemo } from "react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DEPARTMENTS } from "../constants/index";
import { usePageState as useState } from "../store/pageState";
import type { Candidate } from "../types";
export function RecruitingModuleView({
  jobs,
  candidates,
  onPublishJob,
  onUpdateCandidateStage,
  atsSubNav = "ats-funnel",
}: {
  jobs: import("../types").Job[];
  candidates: import("../types").Candidate[];
  onPublishJob: import("../hooks/useWorkspace").Workspace["handlePublishJob"];
  onUpdateCandidateStage: import("../hooks/useWorkspace").Workspace["handleUpdateCandidateStage"];
  onTriggerToast: import("../hooks/useWorkspace").Workspace["triggerToast"];
  atsSubNav?: string;
}) {
  const [stageFilter, setStageFilter] = useState("全部阶段");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "技术部",
    headcount: 1,
    location: "总部 · 现场办公",
    salaryRange: "25K - 35K · 14薪",
  });

  const stages = [
    "全部阶段",
    "初试筛选",
    "专业复试中",
    "终面通过",
    "Offer 待确认",
    "已录用转入职",
    "已淘汰归档",
  ];

  const filteredCandidates = useMemo(() => {
    if (stageFilter === "全部阶段") return candidates;
    return candidates.filter((c) => c.stage === stageFilter);
  }, [candidates, stageFilter]);

  const nextStageMap = {
    初试筛选: "专业复试中",
    专业复试中: "终面通过",
    终面通过: "Offer 待确认",
    "Offer 待确认": "已录用转入职",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
            TALENT ACQUISITION · ATS STUDIO
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {atsSubNav === "ats-jobs"
              ? "在招职位管理"
              : atsSubNav === "ats-talent"
                ? "企业人才库"
                : "招聘漏斗与职位看板"}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            在招岗位需求看板与核心候选人面试漏斗实时流转，确认录用后自动推送至
            HRIS 入职管理。
          </p>
        </div>
        <AppleActionButton
          variant="blue"
          icon={Plus}
          onClick={() => setShowNewJobModal(true)}
        >
          发布新招聘职位
        </AppleActionButton>
      </div>

      {/* 在招职位看板 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#0071E3]">
                  {job.department}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#EAF8EE] text-[#1E7E34] font-semibold">
                  招聘中 · {job.headcount} HC
                </span>
              </div>
              <div className="text-sm font-bold text-[#1D1D1F] mt-2">
                {job.title}
              </div>
              <div className="text-[11px] text-[#86868B] mt-1">
                {job.location} · {job.salaryRange}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
              <span className="text-[#6E6E73]">新简历 {job.applicants}</span>
              <span className="text-[#6E6E73]">面试中 {job.interviewing}</span>
              <span className="font-bold text-[#1D1D1F]">
                Offer {job.offers}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 重点候选人面试漏斗（带完整表头 + 仅保留查看详情按钮防误触） */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {stages.map((st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                  stageFilter === st
                    ? "bg-[#0071E3] text-white"
                    : "bg-[#F5F5F7] text-[#515154] hover:bg-[#EBEBF0]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#86868B]">
            点击查看详情可推进节点或淘汰归档
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                <th className="py-3.5 px-5">候选人姓名</th>
                <th className="py-3.5 px-4">应聘岗位</th>
                <th className="py-3.5 px-4">所属部门</th>
                <th className="py-3.5 px-4">期望薪酬</th>
                <th className="py-3.5 px-4">最快到岗日</th>
                <th className="py-3.5 px-4">当前招聘节点</th>
                <th className="py-3.5 px-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#1D1D1F]">{cand.name}</div>
                    <div className="text-[11px] text-[#86868B]">{cand.exp}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1D1D1F]">
                    {cand.jobTitle}
                  </td>
                  <td className="py-3.5 px-4 text-[#6E6E73]">
                    {cand.department}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#1D1D1F]">
                    {cand.expectedSalary}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                    {cand.availableDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={cand.stage} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <AppleActionButton
                      size="xs"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      查看详情
                    </AppleActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 候选人详情与面试流转弹窗 */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  候选人评估与招聘节点推进
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  {selectedCandidate.name} · 应聘「{selectedCandidate.jobTitle}
                  」
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">所属部门</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedCandidate.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">期望薪酬 / 最快到岗</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    {selectedCandidate.expectedSalary} ·{" "}
                    {selectedCandidate.availableDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">面试官与综合评分</span>
                  <span className="font-semibold text-[#0071E3]">
                    {selectedCandidate.interviewer} · {selectedCandidate.score}{" "}
                    / 5.0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">当前节点</span>
                  <StatusBadge status={selectedCandidate.stage} />
                </div>
              </div>

              <div>
                <div className="font-semibold text-[#6E6E73] mb-1.5">
                  面试评语摘要
                </div>
                <div className="p-3.5 rounded-2xl border border-black/[0.06] text-[#1D1D1F] leading-relaxed">
                  {selectedCandidate.evaluation}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {selectedCandidate.stage !== "已录用转入职" &&
              selectedCandidate.stage !== "已淘汰归档" ? (
                <>
                  <AppleActionButton
                    variant="danger"
                    icon={Ban}
                    onClick={() => {
                      onUpdateCandidateStage(
                        selectedCandidate.id,
                        "已淘汰归档",
                      );
                      setSelectedCandidate(null);
                    }}
                  >
                    淘汰归档
                  </AppleActionButton>
                  <AppleActionButton
                    variant="blue"
                    icon={Check}
                    onClick={() => {
                      const next =
                        nextStageMap[
                          selectedCandidate.stage as keyof typeof nextStageMap
                        ] || "已录用转入职";
                      onUpdateCandidateStage(selectedCandidate.id, next);
                      setSelectedCandidate(null);
                    }}
                  >
                    推进至「
                    {nextStageMap[
                      selectedCandidate.stage as keyof typeof nextStageMap
                    ] || "已录用转入职"}
                    」
                  </AppleActionButton>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <AppleActionButton onClick={() => setSelectedCandidate(null)}>
                    关闭
                  </AppleActionButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 发布新招聘职位弹窗 */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                发布新招聘职位
              </h3>
              <button
                onClick={() => setShowNewJobModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  职位名称 *
                </label>
                <input
                  type="text"
                  placeholder="例如：高级产品交互设计师"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1">
                    需求部门
                  </label>
                  <select
                    value={jobForm.department}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, department: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                  >
                    {DEPARTMENTS.filter((d) => d !== "全部部门").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1">
                    招聘名额 (HC)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.headcount}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        headcount: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  薪酬预算区间
                </label>
                <input
                  type="text"
                  value={jobForm.salaryRange}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, salaryRange: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex justify-end gap-2">
              <AppleActionButton
                variant="secondary"
                onClick={() => setShowNewJobModal(false)}
              >
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="blue"
                disabled={!jobForm.title.trim()}
                onClick={() => {
                  onPublishJob(jobForm);
                  setJobForm({ ...jobForm, title: "" });
                  setShowNewJobModal(false);
                }}
              >
                确认发布职位
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
