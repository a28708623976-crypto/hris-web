import { Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function Progress() {
  const {
    atsAnonymousMode,
    atsProgressView,
    setAtsProgressView,
    selectedAtsJobId,
    setSelectedAtsJobId,
    jobs,
    candidates,
    setActiveCandidateDrawer,
    onUpdateCandidateStage,
    progressSearch,
    setProgressSearch,
    onlyMine,
    setOnlyMine,
    setRejectModalCand,
  } = useOutletContext<AtsWorkspace>();
  const currentJob = jobs.find((j) => j.id === selectedAtsJobId) || jobs[0];
  const lanes = [
    { key: "初试筛选", label: "新投递 / 初筛" },
    { key: "专业复试中", label: "专业复试中" },
    { key: "终面通过", label: "终面通过" },
    { key: "Offer 待确认", label: "Offer 沟通中" },
    { key: "已录用转入职", label: "已录用" },
  ];
  const visibleCands = candidates.filter((c) => {
    if (c.jobId !== currentJob.id && c.jobTitle !== currentJob.title)
      return false;
    if (onlyMine && c.interviewer !== "李明" && c.interviewer !== "陈嘉宁")
      return false;
    if (
      progressSearch &&
      !c.name.includes(progressSearch) &&
      !c.jobTitle.includes(progressSearch)
    ) {
      return false;
    }
    return true;
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
            RECRUITMENT PROGRESS
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            招聘进度
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            支持「单职位流转看板」与「全局职位进度表」双视角切换，卡片停留超 3
            天自动预警。
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[#E8E8ED]">
          <button
            type="button"
            onClick={() => setAtsProgressView("kanban")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              atsProgressView === "kanban"
                ? "bg-white text-[#1D1D1F] shadow-2xs"
                : "text-[#515154]"
            }`}
          >
            单职位看板视图
          </button>
          <button
            type="button"
            onClick={() => setAtsProgressView("list")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              atsProgressView === "list"
                ? "bg-white text-[#1D1D1F] shadow-2xs"
                : "text-[#515154]"
            }`}
          >
            全局职位列表视图
          </button>
        </div>
      </div>

      {/* 顶部全局筛选栏 */}
      <div className="bg-white rounded-2xl p-3.5 border border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedAtsJobId}
            onChange={(e) => setSelectedAtsJobId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] outline-none"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}（{j.department}）
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索候选人或职位..."
              value={progressSearch}
              onChange={(e) => setProgressSearch(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl bg-[#F5F5F7] text-xs outline-none"
            />
          </div>
          <label className="inline-flex items-center gap-1.5 text-xs text-[#515154] cursor-pointer px-2">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="accent-[#0071E3]"
            />
            <span>仅看我负责的</span>
          </label>
        </div>
        <div className="text-xs text-[#86868B]">
          当前聚焦：
          <span className="font-bold text-[#1D1D1F]">{currentJob.title}</span>
        </div>
      </div>

      {atsProgressView === "kanban" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {lanes.map((lane) => {
              const laneCards = visibleCands.filter(
                (c) => c.stage === lane.key,
              );
              return (
                <div
                  key={lane.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const draggedId = e.dataTransfer.getData("text/plain");
                    if (draggedId) onUpdateCandidateStage(draggedId, lane.key);
                  }}
                  className="bg-[#FAFAFC] rounded-2xl p-3 border border-black/[0.06] min-h-[380px] flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between px-1 py-1">
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      {lane.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-black/[0.06] text-[11px] font-bold text-[#0071E3]">
                      {laneCards.length}
                    </span>
                  </div>

                  {laneCards.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-10 text-[11px] text-[#86868B]">
                      暂无候选人
                    </div>
                  ) : (
                    laneCards.map((c, idx) => {
                      const stayDays =
                        idx === 0 && lane.key === "初试筛选" ? 4 : 2;
                      const isOverdue = stayDays > 3;
                      return (
                        <div
                          key={c.id}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("text/plain", c.id)
                          }
                          onClick={() => setActiveCandidateDrawer(c)}
                          className="bg-white rounded-xl p-3.5 border border-black/[0.06] shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-bold text-[#1D1D1F]">
                              {atsAnonymousMode ? `候选人 #${c.id}` : c.name}
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-[#EBF5FF] text-[#0071E3] text-[10px] font-bold">
                              {Math.round(Number(c.score) * 19)}% 匹配
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6E6E73]">
                            {c.exp}
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-black/[0.04]">
                            <span
                              className={
                                isOverdue
                                  ? "text-[#D70015] font-bold"
                                  : "text-[#86868B]"
                              }
                            >
                              停留 {stayDays} 天 {isOverdue ? "· 超期预警" : ""}
                            </span>
                            <span className="text-[#0071E3] font-semibold">
                              {lane.key === "初试筛选"
                                ? "待安排面试"
                                : "评价已齐"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {/* 底部拖入淘汰专区 */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const draggedId = e.dataTransfer.getData("text/plain");
              const found = candidates.find((x) => x.id === draggedId);
              if (found) setRejectModalCand(found);
            }}
            className="p-3.5 rounded-2xl border border-dashed border-[#FF3B30]/40 bg-[#FFF2F2]/40 text-center text-xs text-[#D70015] font-medium"
          >
            将候选人卡片拖拽至此区域，或点击卡片进入详情执行「淘汰归档」
          </div>
        </div>
      ) : (
        /* 视角 B：全局职位进度表（管理者视角） */
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                <th className="py-3.5 px-5">职位名称与部门</th>
                <th className="py-3.5 px-4">招聘负责人</th>
                <th className="py-3.5 px-4">HC 编制进度</th>
                <th className="py-3.5 px-4">漏斗分布（投递 / 面试 / Offer）</th>
                <th className="py-3.5 px-4">平均招聘周期</th>
                <th className="py-3.5 px-5 text-right">当前状态预警</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {jobs.map((j) => (
                <tr
                  key={j.id}
                  onClick={() => {
                    setSelectedAtsJobId(j.id);
                    setAtsProgressView("kanban");
                  }}
                  className="hover:bg-[#FAFAFC] cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#1D1D1F]">{j.title}</div>
                    <div className="text-[11px] text-[#86868B]">
                      {j.department} · {j.id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#515154]">李明</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#0071E3]">
                    已录用 {j.offers} / 需求 {j.headcount}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                    {j.applicants} / {j.interviewing} / {j.offers}
                  </td>
                  <td className="py-3.5 px-4 font-mono">15.5 天</td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-[11px] font-semibold">
                      正常推进中
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
