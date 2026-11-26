import type { CandidateLog } from "../types";
export const INITIAL_CANDIDATE_LOGS: Record<string, CandidateLog[]> = {
  "CAN-01": [
    {
      id: "LOG-1",
      time: "2026-11-24 16:20",
      author: "陈嘉宁",
      role: "用人经理",
      score: "4.9",
      verdict: "Strong Yes（强力录用）",
      strengths: "AIGC 视觉镜头语言极具电影感，独立主导过千万级播放短剧。",
      concerns: "期望薪资处于带宽上限，建议 HR 沟通定薪弹性。",
      isScorecard: true,
    },
    {
      id: "LOG-2",
      time: "2026-11-22 10:15",
      author: "李明",
      role: "HR 主管",
      text: "已完成初筛并推进至「Offer 待确认」，同步发起定薪审批。",
      isScorecard: false,
    },
  ],
};
