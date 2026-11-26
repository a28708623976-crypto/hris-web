import {
  Briefcase,
  Check,
  CheckCircle2,
  FileText,
  Lock,
  Plus,
  X,
} from "lucide-react";
import { Outlet, useOutletContext } from "react-router-dom";
import { useAtsWorkspace } from "../../hooks/useAtsWorkspace";
import type { Workspace } from "../../hooks/useWorkspace";
import { AppleActionButton } from "../ui/AppleActionButton";
import { StatusBadge } from "../ui/StatusBadge";
export function AtsLayout() {
  const workspace = useOutletContext<Workspace>();
  const context = useAtsWorkspace(workspace);
  const {
    setAtsViewMode,
    atsRegionMode,
    setAtsRegionMode,
    atsAnonymousMode,
    setAtsAnonymousMode,
    setTalentPool,
    employees,
    activeCandidateDrawer,
    setActiveCandidateDrawer,
    scorecardCandidate,
    setScorecardCandidate,
    offerCandidate,
    setOfferCandidate,
    onUpdateCandidateStage,
    onTriggerToast,
    onboardingTasks,
    onJumpToOnboarding,
    showHrisQueueModal,
    setShowHrisQueueModal,
    rejectModalCand,
    setRejectModalCand,
    rejectReasonText,
    setRejectReasonText,
    drawerLeftTab,
    setDrawerLeftTab,
    drawerRightTab,
    setDrawerRightTab,
    expandedScoreId,
    setExpandedScoreId,
    noteInput,
    setNoteInput,
    candidateLogs,
    setCandidateLogs,
    scForm,
    setScForm,
    offerForm,
    setOfferForm,
    isOfferLocked,
  } = context;
  if (workspace.atsViewMode === "job-create")
    return <Outlet context={context} />;
  return (
    <div className="space-y-5">
      <div className="px-4 py-2.5 rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-bold text-[#0071E3]">
            <Briefcase className="w-4 h-4" />
            ATS 招聘工作台
          </span>
          <div className="inline-flex p-0.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05]">
            <button
              type="button"
              onClick={() => setAtsRegionMode("domestic")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                atsRegionMode === "domestic"
                  ? "bg-white text-[#1D1D1F] shadow-2xs"
                  : "text-[#6E6E73]"
              }`}
            >
              国内标准模式
            </button>
            <button
              type="button"
              onClick={() => setAtsRegionMode("overseas")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                atsRegionMode === "overseas"
                  ? "bg-white text-[#0071E3] shadow-2xs"
                  : "text-[#6E6E73]"
              }`}
            >
              海外全局模式 (Global)
            </button>
          </div>
          <label className="inline-flex items-center gap-1.5 text-[11px] text-[#515154] cursor-pointer">
            <input
              type="checkbox"
              checked={atsAnonymousMode}
              onChange={(e) => setAtsAnonymousMode(e.target.checked)}
              className="accent-[#0071E3]"
            />
            <span>匿名盲筛模式</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <AppleActionButton
            size="xs"
            variant="secondary"
            onClick={() => setShowHrisQueueModal(true)}
          >
            查看 HRIS 待入职队列 ({onboardingTasks.length})
          </AppleActionButton>
          <AppleActionButton
            size="xs"
            variant="blue"
            icon={Plus}
            onClick={() => setAtsViewMode("job-create")}
          >
            发布新职位
          </AppleActionButton>
        </div>
      </div>
      <Outlet context={context} />

      {/* HRIS 待入职队列居中自适应预览弹窗（不再突兀跳出 ATS） */}
      {showHrisQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  HRIS 待入职同步队列（同源实时预览）
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  以下候选人已由 ATS
                  录用并自动写入核心人事「入职管理」待报到名单
                </p>
              </div>
              <button
                onClick={() => setShowHrisQueueModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 text-xs">
              {onboardingTasks.length === 0 ? (
                <div className="text-center py-8 text-[#86868B]">
                  当前暂无待报到入职记录
                </div>
              ) : (
                onboardingTasks.map((ob) => {
                  const checkedCount = Object.values(ob.checklist || {}).filter(
                    Boolean,
                  ).length;
                  return (
                    <div
                      key={ob.id}
                      className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1D1D1F]">
                            {ob.candidateName}
                          </span>
                          <span className="text-[#6E6E73]">
                            {ob.department} · {ob.role}
                          </span>
                          <StatusBadge status={ob.stage} />
                        </div>
                        <div className="text-[11px] text-[#86868B] font-mono">
                          单号：{ob.id} · 预计报到：{ob.expectedDate} ·
                          入职材料齐全度：{checkedCount}/5 项
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0071E3] shrink-0">
                        已同步至 Core HR
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-[#86868B]">
                如需核验身份证/体检报告原件并分配正式工号，可前往 HRIS 入职管理
              </span>
              <div className="flex items-center gap-2">
                <AppleActionButton
                  variant="secondary"
                  onClick={() => setShowHrisQueueModal(false)}
                >
                  关闭弹窗
                </AppleActionButton>
                <AppleActionButton
                  variant="primary"
                  onClick={() => {
                    setShowHrisQueueModal(false);
                    onJumpToOnboarding();
                  }}
                >
                  前往 HRIS 办理建档
                </AppleActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 淘汰原因轻量弹窗 */}
      {rejectModalCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] space-y-4">
            <h3 className="text-base font-bold text-[#1D1D1F]">
              淘汰归档 · {rejectModalCand.name}
            </h3>
            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">
                选择淘汰归因
              </label>
              <select
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-xs outline-none"
              >
                <option value="专业技术深度与当前职级匹配度略低">
                  专业技术深度与当前职级匹配度略低
                </option>
                <option value="期望薪酬超出岗位预算上限">
                  期望薪酬超出岗位预算上限
                </option>
                <option value="到岗时间与业务项目排期冲突">
                  到岗时间与业务项目排期冲突
                </option>
                <option value="进入人才库作为银牌储备候选人">
                  进入人才库作为银牌储备候选人
                </option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <AppleActionButton
                variant="secondary"
                onClick={() => setRejectModalCand(null)}
              >
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="danger"
                onClick={() => {
                  if (rejectReasonText === "进入人才库作为银牌储备候选人") {
                    setTalentPool((prev) => [
                      {
                        id: `TP-${Date.now()}`,
                        name: rejectModalCand.name,
                        role: rejectModalCand.jobTitle,
                        company: rejectModalCand.exp,
                        tag: "银牌储备候选人",
                        score: rejectModalCand.score,
                        lastActive: "2026-11-25",
                      },
                      ...prev,
                    ]);
                  }
                  onUpdateCandidateStage(rejectModalCand.id, "已淘汰归档");
                  setRejectModalCand(null);
                }}
              >
                确认淘汰归档
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}

      {/* 3. 候选人详情页：右侧宽抽屉（Slide-over Drawer，宽度占屏幕 80%，保留左侧 20% 遮罩点击关闭） */}
      {activeCandidateDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
          <div
            className="w-[20%] h-full"
            onClick={() => setActiveCandidateDrawer(null)}
          />
          <div className="w-[80%] h-full bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.16)] border-l border-black/[0.08] flex flex-col">
            {/* 顶部固定操作头 (Sticky Header) */}
            <div className="px-6 py-4 border-b border-black/[0.06] bg-[#FAFAFC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF5FF] text-[#0071E3] flex items-center justify-center text-xs font-bold">
                  {atsAnonymousMode
                    ? "盲筛"
                    : activeCandidateDrawer.name.slice(-2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1D1D1F]">
                      {atsAnonymousMode
                        ? `匿名候选人 #${activeCandidateDrawer.id}`
                        : activeCandidateDrawer.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#F5F5F7] text-xs font-semibold text-[#515154]">
                      {activeCandidateDrawer.jobTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                      员工内推渠道
                    </span>
                  </div>
                  <div className="text-[11px] text-[#86868B] mt-0.5">
                    {activeCandidateDrawer.exp}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={activeCandidateDrawer.stage}
                  onChange={(e) => {
                    const next = e.target.value;
                    onUpdateCandidateStage(activeCandidateDrawer.id, next);
                    setActiveCandidateDrawer({
                      ...activeCandidateDrawer,
                      stage: next,
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-semibold outline-none"
                >
                  {[
                    "初试筛选",
                    "专业复试中",
                    "终面通过",
                    "Offer 待确认",
                    "已录用转入职",
                    "已淘汰归档",
                  ].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <AppleActionButton
                  size="xs"
                  variant="secondary"
                  onClick={() => setScorecardCandidate(activeCandidateDrawer)}
                >
                  填写面试评价表
                </AppleActionButton>
                <AppleActionButton
                  size="xs"
                  variant="blue"
                  onClick={() => {
                    setOfferCandidate(activeCandidateDrawer);
                    setActiveCandidateDrawer(null);
                  }}
                >
                  拟定 / 确认 Offer
                </AppleActionButton>
                <AppleActionButton
                  size="xs"
                  variant="danger"
                  onClick={() => {
                    setRejectModalCand(activeCandidateDrawer);
                    setActiveCandidateDrawer(null);
                  }}
                >
                  淘汰
                </AppleActionButton>
                <button
                  onClick={() => setActiveCandidateDrawer(null)}
                  className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 左右双栏分屏：左侧主内容 60% + 右侧协同记录 40% */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* 左侧 60% */}
              <div className="w-full lg:w-[60%] border-b lg:border-b-0 lg:border-r border-black/[0.06] p-6 overflow-y-auto space-y-5">
                <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
                  {[
                    { id: "structured", label: "结构化简历档案" },
                    { id: "resume", label: "原始简历预览 (PDF)" },
                    { id: "history", label: "历史投递记录" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDrawerLeftTab(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        drawerLeftTab === t.id
                          ? "bg-[#1D1D1F] text-white"
                          : "text-[#6E6E73] hover:bg-[#F5F5F7]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* 核心信息卡片（按国内 / 海外模式自动切换高亮字段） */}
                <div className="p-4 rounded-2xl bg-[#F5F5F7]/90 border border-black/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {atsRegionMode === "domestic" ? (
                    <>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          年龄 / 学历
                        </div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5">
                          28 岁 · 硕士
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          期望薪资
                        </div>
                        <div className="font-bold text-[#0071E3] mt-0.5 font-mono">
                          {activeCandidateDrawer.expectedSalary}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          当前状态
                        </div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5">
                          在职 · 考虑机会
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          最快到岗时间
                        </div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5 font-mono">
                          {activeCandidateDrawer.availableDate}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          Work Authorization
                        </div>
                        <div className="font-bold text-[#248A3D] mt-0.5">
                          Authorized / No Visa Req
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          Expected Annual
                        </div>
                        <div className="font-bold text-[#0071E3] mt-0.5 font-mono">
                          $115K - $135K
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          LinkedIn Profile
                        </div>
                        <div className="font-bold text-[#0071E3] mt-0.5 underline">
                          linkedin.com/in/pro
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">
                          Local Timezone
                        </div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5">
                          UTC+8 / PST Overlap
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {drawerLeftTab === "structured" && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl border border-black/[0.06] space-y-2">
                      <div className="font-bold text-[#1D1D1F]">
                        核心项目与工作经历
                      </div>
                      <p className="text-[#515154] leading-relaxed">
                        主导新一代多模态内容生成管线设计，结合 ComfyUI
                        自定义节点与实时渲染调度引擎，将单集视频制作周期由 5
                        天压缩至 14 小时。
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl border border-black/[0.06] space-y-2">
                      <div className="font-bold text-[#1D1D1F]">
                        面试官初评摘要
                      </div>
                      <p className="text-[#515154] leading-relaxed">
                        {activeCandidateDrawer.evaluation}
                      </p>
                    </div>
                  </div>
                )}

                {drawerLeftTab === "resume" && (
                  <div className="p-8 rounded-2xl border border-black/[0.08] bg-[#FAFAFC] text-center space-y-2 text-xs">
                    <FileText className="w-8 h-8 text-[#0071E3] mx-auto" />
                    <div className="font-bold text-[#1D1D1F]">
                      {atsAnonymousMode
                        ? `匿名简历附件_${activeCandidateDrawer.id}.pdf`
                        : `${activeCandidateDrawer.name}_个人简历_2026.pdf`}
                    </div>
                    <p className="text-[#86868B]">
                      原始 PDF 渲染预览已就绪 · 支持关键词高亮检索
                    </p>
                  </div>
                )}

                {drawerLeftTab === "history" && (
                  <div className="p-4 rounded-2xl border border-black/[0.06] text-xs text-[#6E6E73]">
                    首次投递该岗位 · 暂无历史重复投递记录。
                  </div>
                )}
              </div>

              {/* 右侧协同记录区 40% */}
              <div className="w-full lg:w-[40%] flex flex-col bg-[#FAFAFC]/70">
                <div className="px-5 py-3 border-b border-black/[0.06] flex items-center gap-2">
                  {[
                    { id: "activity", label: "动态与评价 (Scorecards)" },
                    { id: "comms", label: "沟通记录 (Email/SMS)" },
                  ].map((rt) => (
                    <button
                      key={rt.id}
                      onClick={() => setDrawerRightTab(rt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        drawerRightTab === rt.id
                          ? "bg-white text-[#1D1D1F] shadow-2xs"
                          : "text-[#6E6E73]"
                      }`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-3 text-xs">
                  {drawerRightTab === "activity" ? (
                    (
                      candidateLogs[activeCandidateDrawer.id] ||
                      candidateLogs["CAN-01"]
                    ).map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-white border border-black/[0.06] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1D1D1F]">
                            {log.author} ·{" "}
                            <span className="font-normal text-[#86868B]">
                              {log.role}
                            </span>
                          </span>
                          <span className="text-[10px] font-mono text-[#86868B]">
                            {log.time}
                          </span>
                        </div>
                        {log.isScorecard ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-bold">
                                {log.verdict}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedScoreId(
                                    expandedScoreId === log.id ? null : log.id,
                                  )
                                }
                                className="text-[#0071E3] font-semibold cursor-pointer"
                              >
                                {expandedScoreId === log.id
                                  ? "收起明细"
                                  : "展开评价明细"}
                              </button>
                            </div>
                            {expandedScoreId === log.id && (
                              <div className="pt-2 border-t border-black/[0.05] text-[#515154] space-y-1">
                                <div>
                                  <span className="font-semibold text-[#1D1D1F]">
                                    核心优势：
                                  </span>
                                  {log.strengths}
                                </div>
                                <div>
                                  <span className="font-semibold text-[#1D1D1F]">
                                    潜在顾虑：
                                  </span>
                                  {log.concerns}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[#515154]">{log.text}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-1.5">
                      <div className="font-bold text-[#1D1D1F]">
                        面试邀请邮件已发送
                      </div>
                      <div className="text-[#6E6E73]">
                        已向候选人发送线上视频会议链接与面试日程确认函。
                      </div>
                    </div>
                  )}
                </div>

                {/* 底部固定 @ 同事协作输入框 */}
                <div className="p-4 bg-white border-t border-black/[0.06] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="输入内部协同备注，支持 @同事 发送通知..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#F5F5F7] text-xs outline-none"
                  />
                  <AppleActionButton
                    size="xs"
                    variant="blue"
                    disabled={!noteInput.trim()}
                    onClick={() => {
                      const cid = activeCandidateDrawer.id;
                      const prevList =
                        candidateLogs[cid] || candidateLogs["CAN-01"];
                      setCandidateLogs({
                        ...candidateLogs,
                        [cid]: [
                          {
                            id: `NOTE-${Date.now()}`,
                            time: "刚刚",
                            author: "李明",
                            role: "HR 主管",
                            text: noteInput,
                            isScorecard: false,
                          },
                          ...prevList,
                        ],
                      });
                      setNoteInput("");
                      onTriggerToast("内部备注已发布", "已通知相关协同面试官");
                    }}
                  >
                    发送
                  </AppleActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 面试评价表（Interview Scorecard — 左右对照分屏弹窗） */}
      {scorecardCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  结构化面试评价表 · {scorecardCandidate.name}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  应聘岗位：{scorecardCandidate.jobTitle} · 4
                  档互斥评估体系（杜绝骑墙分）
                </p>
              </div>
              <button
                onClick={() => setScorecardCandidate(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row max-h-[68vh] overflow-y-auto">
              {/* 左侧 45% 参考区 */}
              <div className="w-full md:w-[42%] bg-[#FAFAFC] p-6 border-b md:border-b-0 md:border-r border-black/[0.06] space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-2">
                  <div className="font-bold text-[#0071E3]">
                    HR 预设本轮重点考察项
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[#515154]">
                    <li>复杂 AIGC 工程或创意项目的独立架构与交付深度</li>
                    <li>跨职能团队协作中的结构化表达与推进力</li>
                    <li>对快速迭代与高标准产出的文化契合度</li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-1.5">
                  <div className="font-bold text-[#1D1D1F]">
                    候选人简历核心摘要
                  </div>
                  <p className="text-[#6E6E73] leading-relaxed">
                    {scorecardCandidate.exp}
                  </p>
                  <p className="text-[#515154] leading-relaxed">
                    {scorecardCandidate.evaluation}
                  </p>
                </div>
              </div>

              {/* 右侧 55% 评分表单区 */}
              <div className="flex-1 p-6 space-y-5 text-xs">
                <div className="space-y-3">
                  <div className="font-bold text-[#1D1D1F]">
                    区块一：分项维度评分（4 档明确互斥）
                  </div>
                  {[
                    { key: "techScore", label: "专业技术 / 业务核心能力" },
                    { key: "commScore", label: "逻辑思维与结构化沟通" },
                    { key: "cultureScore", label: "文化价值观与自驱力匹配" },
                  ].map((dim) => (
                    <div key={dim.key} className="space-y-1.5">
                      <div className="font-medium text-[#515154]">
                        {dim.label}
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {["强烈不推荐", "不推荐", "推荐", "强烈推荐"].map(
                          (opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setScForm({ ...scForm, [dim.key]: opt })
                              }
                              className={`py-1.5 rounded-lg font-semibold border text-[11px] cursor-pointer ${
                                scForm[dim.key as keyof typeof scForm] === opt
                                  ? opt.includes("不推荐")
                                    ? "bg-[#D70015] text-white border-[#D70015]"
                                    : "bg-[#0071E3] text-white border-[#0071E3]"
                                  : "bg-[#F5F5F7] text-[#515154] border-transparent"
                              }`}
                            >
                              {opt}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1D1D1F] mb-1">
                      核心优势 (Strengths)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="请列举候选人最突出的亮点..."
                      value={scForm.strengths}
                      onChange={(e) =>
                        setScForm({ ...scForm, strengths: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1D1D1F] mb-1">
                      潜在风险 / 顾虑 (Concerns)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="如有需下一轮重点验证的疑点请注明..."
                      value={scForm.concerns}
                      onChange={(e) =>
                        setScForm({ ...scForm, concerns: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-[#1D1D1F]">
                    区块三：最终录用结论（必填） *
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "Strong Yes", desc: "强力录用" },
                      { id: "Yes", desc: "同意录用" },
                      { id: "No", desc: "不予录用" },
                      { id: "Strong No", desc: "坚决淘汰" },
                    ].map((v) => {
                      const active = scForm.finalVerdict === v.id;
                      const isNo = v.id.includes("No");
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() =>
                            setScForm({ ...scForm, finalVerdict: v.id })
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? isNo
                                ? "bg-[#FFF2F2] border-[#D70015] text-[#D70015]"
                                : "bg-[#EBF5FF] border-[#0071E3] text-[#0071E3]"
                              : "bg-[#FAFAFC] border-black/[0.06] text-[#1D1D1F]"
                          }`}
                        >
                          <div className="font-bold">{v.id}</div>
                          <div className="text-[11px] opacity-80">{v.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#86868B] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                防偏见提示：提交评价后，您才能查看本轮其他面试官的评价内容
              </span>
              <div className="flex items-center gap-2">
                <AppleActionButton
                  variant="secondary"
                  onClick={() => setScorecardCandidate(null)}
                >
                  取消
                </AppleActionButton>
                <AppleActionButton
                  variant="blue"
                  icon={Check}
                  onClick={() => {
                    const cid = scorecardCandidate.id;
                    const prevList =
                      candidateLogs[cid] || candidateLogs["CAN-01"];
                    setCandidateLogs({
                      ...candidateLogs,
                      [cid]: [
                        {
                          id: `SC-${Date.now()}`,
                          time: "刚刚",
                          author: "李明",
                          role: "面试官",
                          score: "4.9",
                          verdict: scForm.finalVerdict,
                          strengths:
                            scForm.strengths || "综合能力优秀，匹配岗位预期",
                          concerns: scForm.concerns || "无明显短板",
                          isScorecard: true,
                        },
                        ...prevList,
                      ],
                    });
                    onTriggerToast(
                      "结构化面试评价表已提交",
                      `已解锁本轮其他面试官评价记录（结论：${scForm.finalVerdict}）`,
                    );
                    setScorecardCandidate(null);
                  }}
                >
                  提交面试评价
                </AppleActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Offer 确认与入职衔接双栏工作台（Offer & Onboarding Handoff） */}
      {offerCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  Offer 确认与入职衔接工作台 · {offerCandidate.name}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  左侧配置薪酬包与审批流，右侧实时渲染 Offer 函并支持一键转入
                  Core HR 待入职名单
                </p>
              </div>
              <button
                onClick={() => setOfferCandidate(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row max-h-[72vh] overflow-y-auto">
              {/* 左侧 45%：Offer 参数配置区 */}
              <div className="w-full lg:w-[45%] p-6 border-b lg:border-b-0 lg:border-r border-black/[0.06] space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#1D1D1F]">
                    1. 入职基本信息
                  </div>
                  {isOfferLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: "draft" });
                        onTriggerToast(
                          "Offer 已撤回为待审批",
                          "现在可以重新编辑薪资与入职参数",
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FFF5E6] text-[#B25E00] text-[11px] font-semibold hover:bg-[#FFE8C2] cursor-pointer"
                    >
                      撤回并重新审批
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">
                      入职职位（自动锁定）
                    </label>
                    <input
                      type="text"
                      disabled
                      value={offerCandidate.jobTitle}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">
                      汇报对象（读取 Core HR）
                    </label>
                    <select
                      disabled={isOfferLocked}
                      value={offerForm.manager}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, manager: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                    >
                      {employees.slice(0, 6).map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}（{emp.role}）
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">
                      预计入职日期
                    </label>
                    <input
                      type="date"
                      disabled={isOfferLocked}
                      value={offerForm.startDate}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">
                      工作地点
                    </label>
                    <input
                      type="text"
                      disabled={isOfferLocked}
                      value={offerForm.location}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, location: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="font-bold text-[#1D1D1F] pt-2">
                  2. 薪酬包配置（
                  {atsRegionMode === "domestic"
                    ? "国内标准模板"
                    : "海外全局模板"}
                  ）
                </div>
                {atsRegionMode === "domestic" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        基本月薪 (元)
                      </label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.baseMonthly}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            baseMonthly: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        绩效奖金基数 (元)
                      </label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.perfMonthly}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            perfMonthly: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        薪资月数
                      </label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.months}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            months: Number(e.target.value) || 12,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        试用期薪资比例 (%)
                      </label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.probationRatio}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            probationRatio: Number(e.target.value) || 80,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        Base Annual Salary
                      </label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.annualBaseUsd}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            annualBaseUsd: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        Currency
                      </label>
                      <select
                        disabled={isOfferLocked}
                        value={offerForm.currency}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            currency: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="SGD">SGD (S$)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        Sign-on Bonus
                      </label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.signOnBonus}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            signOnBonus: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">
                        RSU / Option Grants
                      </label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.rsuShares}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            rsuShares: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* 合规校验条：对比 Core HR 薪酬带宽 */}
                {offerForm.baseMonthly > 35000 &&
                atsRegionMode === "domestic" ? (
                  <div className="p-3 rounded-xl bg-[#FFF5E6] border border-[#FF9500]/30 text-[#B25E00] text-[11px] font-medium">
                    薪酬带宽预警：当前基本月薪超出岗位标准带宽上限（35,000
                    元），已自动追加「HRD + 财务BP」特批节点。
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-medium">
                    合规校验通过：定薪处于 Core HR 对应职级标准薪酬带宽内。
                  </div>
                )}

                <div className="text-[11px] text-[#86868B]">
                  审批链路预览：用人总监（{offerForm.manager}） → HR
                  主管（李明） →{" "}
                  {offerForm.baseMonthly > 35000
                    ? "财务 BP 特批"
                    : "自动归档发函"}
                </div>
              </div>

              {/* 右侧 55%：Offer 函实时预览与状态流转 */}
              <div className="w-full lg:w-[55%] p-6 bg-[#FAFAFC] flex flex-col justify-between space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {["审批通过", "已发送候选人", "候选人已接受"].map(
                        (step, i) => {
                          const activeStep =
                            (i === 0 && offerForm.status !== "draft") ||
                            (i === 1 &&
                              (offerForm.status === "sent" ||
                                offerForm.status === "accepted")) ||
                            (i === 2 && offerForm.status === "accepted");
                          return (
                            <span
                              key={step}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                activeStep
                                  ? "bg-[#0071E3] text-white"
                                  : "bg-white text-[#86868B] border border-black/[0.06]"
                              }`}
                            >
                              {i + 1}. {step}
                            </span>
                          );
                        },
                      )}
                    </div>
                    <div className="inline-flex p-0.5 rounded-lg bg-white border border-black/[0.06]">
                      <button
                        type="button"
                        onClick={() =>
                          setOfferForm({ ...offerForm, lang: "zh" })
                        }
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                          offerForm.lang === "zh"
                            ? "bg-[#1D1D1F] text-white"
                            : "text-[#6E6E73]"
                        }`}
                      >
                        中文函
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOfferForm({ ...offerForm, lang: "en" })
                        }
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                          offerForm.lang === "en"
                            ? "bg-[#1D1D1F] text-white"
                            : "text-[#6E6E73]"
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* 正式 Offer 文档预览卡片 */}
                  <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-3 leading-6">
                    <div className="text-center font-bold text-base text-[#1D1D1F]">
                      {offerForm.lang === "zh"
                        ? "录用通知书 (OFFER LETTER)"
                        : "OFFICIAL OFFER OF EMPLOYMENT"}
                    </div>
                    <p>
                      {offerForm.lang === "zh"
                        ? `尊敬的 ${offerCandidate.name}：`
                        : `Dear ${offerCandidate.name},`}
                    </p>
                    <p className="text-[#515154]">
                      {offerForm.lang === "zh"
                        ? `我们非常荣幸地通知您，您已通过我司全部面试评估，正式邀请您加入「${offerCandidate.department}」担任「${offerCandidate.jobTitle}」一职，汇报对象为 ${offerForm.manager}，预计入职日期为 ${offerForm.startDate}。`
                        : `We are pleased to offer you the position of ${offerCandidate.jobTitle} in ${offerCandidate.department}, reporting to ${offerForm.manager}, with an anticipated start date of ${offerForm.startDate}.`}
                    </p>
                    <div className="p-3 rounded-xl bg-[#F5F5F7] font-mono text-[11px] text-[#1D1D1F]">
                      {atsRegionMode === "domestic"
                        ? `薪酬结构：基本月薪 ¥${offerForm.baseMonthly.toLocaleString()} + 绩效基数 ¥${offerForm.perfMonthly.toLocaleString()}（全年 ${offerForm.months} 薪，试用期按 ${offerForm.probationRatio}% 发放）`
                        : `Compensation: ${offerForm.currency} ${offerForm.annualBaseUsd.toLocaleString()}/yr Base + ${offerForm.signOnBonus.toLocaleString()} Sign-on + ${offerForm.rsuShares} RSUs`}
                    </div>
                  </div>
                </div>

                {/* 状态推进与最终转入 Core HR 待入职闭环按钮 */}
                <div className="pt-3 border-t border-black/[0.06] flex flex-wrap items-center justify-end gap-2">
                  {offerForm.status === "draft" && (
                    <AppleActionButton
                      variant="primary"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: "approved" });
                        onTriggerToast(
                          "Offer 审批已通过",
                          "配置已锁定，可立即发送电子签 Offer",
                        );
                      }}
                    >
                      提交审批
                    </AppleActionButton>
                  )}
                  {offerForm.status === "approved" && (
                    <AppleActionButton
                      variant="blue"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: "sent" });
                        onUpdateCandidateStage(
                          offerCandidate.id,
                          "Offer 待确认",
                        );
                        onTriggerToast(
                          "电子签 Offer 已发送",
                          "已推送至候选人邮箱与短信签署链接",
                        );
                      }}
                    >
                      发送电子签 Offer
                    </AppleActionButton>
                  )}
                  {offerForm.status === "sent" && (
                    <AppleActionButton
                      variant="secondary"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: "accepted" });
                        onUpdateCandidateStage(
                          offerCandidate.id,
                          "已录用转入职",
                          {
                            startDate: offerForm.startDate,
                            baseMonthly: offerForm.baseMonthly,
                            perfMonthly: offerForm.perfMonthly,
                            probationRatio: offerForm.probationRatio,
                            manager: offerForm.manager,
                            level: "P6",
                          },
                        );
                      }}
                    >
                      确认候选人已电子签署
                    </AppleActionButton>
                  )}
                  {offerForm.status === "accepted" && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateCandidateStage(
                          offerCandidate.id,
                          "已录用转入职",
                          {
                            startDate: offerForm.startDate,
                            baseMonthly: offerForm.baseMonthly,
                            perfMonthly: offerForm.perfMonthly,
                            probationRatio: offerForm.probationRatio,
                            manager: offerForm.manager,
                            level: "P6",
                          },
                        );
                        setOfferCandidate(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#248A3D] hover:bg-[#1E7E34] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      重新转入
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
