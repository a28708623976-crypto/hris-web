import { useOutletContext } from "react-router";
import { AppleActionButton } from "../../components/ui/AppleActionButton";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function Home() {
  const {
    setAtsActiveNav,
    atsAnonymousMode,
    candidates,
    setActiveCandidateDrawer,
    setScorecardCandidate,
    setOfferCandidate,
  } = useOutletContext<AtsWorkspace>();
  const activeInterviewOrOfferCands = candidates.filter(
    (c) =>
      c.stage === "初试筛选" ||
      c.stage === "专业复试中" ||
      c.stage === "终面通过" ||
      c.stage === "Offer 待确认",
  );
  const tangCand = candidates.find((x) => x.id === "CAN-01");
  const songCand = candidates.find((x) => x.id === "CAN-02");
  const reminders = [
    tangCand &&
      tangCand.stage !== "已录用转入职" &&
      tangCand.stage !== "已淘汰归档" && {
        title: `${tangCand.name} · Offer 待候选人确认（已发送 48 小时）`,
        sub: `${tangCand.jobTitle} · 建议 HR 电话跟进签署意向`,
        action: () => setOfferCandidate(tangCand),
        btnText: "查看 Offer 中心",
      },
    songCand &&
      songCand.stage !== "已录用转入职" &&
      songCand.stage !== "已淘汰归档" && {
        title: `${songCand.name} · 终面已通过，待发起 Offer 审批`,
        sub: `${songCand.jobTitle} · 综合评分 ${songCand.score}`,
        action: () => setOfferCandidate(songCand),
        btnText: "立即拟定 Offer",
      },
  ].filter((item): item is Exclude<typeof item, false | undefined> =>
    Boolean(item),
  );
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
          RECRUITING HOME
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
          招聘工作台
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          今日面试日程、待填面试评价表与超时阶段催办提醒中心。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">
            今日待安排 / 进行中面试
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2 tabular-nums">
            {activeInterviewOrOfferCands.length} 场
          </div>
          <div className="text-[11px] text-[#0071E3] mt-1">
            14:00 叶知秋（专业复试）即将开始
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">
            待填写面试评价表
          </div>
          <div className="text-3xl font-bold text-[#D97706] mt-2 tabular-nums">
            2 份
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            提交评价后方可查看其他面试官打分
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">
            阶段停留超 3 天预警
          </div>
          <div className="text-3xl font-bold text-[#D70015] mt-2 tabular-nums">
            1 人
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            韩牧野（初试筛选停留 4 天）
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F]">
              今日面试与待填评价
            </h2>
            <AppleActionButton
              size="xs"
              onClick={() => setAtsActiveNav("ats-progress")}
            >
              进入招聘进度看板
            </AppleActionButton>
          </div>
          {activeInterviewOrOfferCands.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#86868B]">
              当前暂无待面试或待评价候选人
            </div>
          ) : (
            activeInterviewOrOfferCands.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-[#FAFAFC] border border-black/[0.05] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-[#1D1D1F]">
                    {atsAnonymousMode ? `候选人 #${c.id}` : c.name} ·{" "}
                    {c.jobTitle}
                  </div>
                  <div className="text-[11px] text-[#86868B] mt-0.5">
                    面试官：{c.interviewer} · 当前节点：{c.stage}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AppleActionButton
                    size="xs"
                    onClick={() => setScorecardCandidate(c)}
                  >
                    填写评价表
                  </AppleActionButton>
                  <AppleActionButton
                    size="xs"
                    variant="blue"
                    onClick={() => setActiveCandidateDrawer(c)}
                  >
                    审阅简历
                  </AppleActionButton>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
          <h2 className="text-sm font-bold text-[#1D1D1F]">智能催办提醒</h2>
          {reminders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#86868B]">
              所有待审批及待确认 Offer 均已处理完毕
            </div>
          ) : (
            reminders.map((item) => (
              <div
                key={item.title}
                className="p-3.5 rounded-xl bg-[#FFF8EB]/70 border border-[#FF9500]/20 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-[#1D1D1F]">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#6E6E73] mt-0.5">
                    {item.sub}
                  </div>
                </div>
                <AppleActionButton size="xs" onClick={item.action}>
                  {item.btnText}
                </AppleActionButton>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
