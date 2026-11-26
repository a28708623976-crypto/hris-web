import type { Candidate, Job } from "../types";

const percentage = (part: number, total: number) =>
  total ? `${((part / total) * 100).toFixed(1)}%` : "0.0%";
const averageDays = (list: readonly Candidate[]) => {
  const values = list.flatMap((candidate) => {
    if (!candidate.appliedDate || !candidate.acceptedDate) return [];
    const days =
      (Date.parse(candidate.acceptedDate) - Date.parse(candidate.appliedDate)) /
      86400000;
    return Number.isFinite(days) && days >= 0 ? [days] : [];
  });
  return values.length
    ? `${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)} 天`
    : "—";
};
const costPerHire = (
  list: readonly Candidate[],
  hired: number,
  overseas: boolean,
) => {
  const costs = list.map((candidate) =>
    overseas ? candidate.recruitingCostUsd : candidate.recruitingCostCny,
  );
  if (!hired || !costs.some((cost) => cost !== undefined)) return "—";
  const cost =
    costs.reduce<number>((total, value) => total + (value ?? 0), 0) / hired;
  return `${overseas ? "$" : "¥ "}${Math.round(cost).toLocaleString()}`;
};
export function recruitingSummary(
  jobs: readonly Job[],
  candidates: readonly Candidate[],
  region = "domestic",
) {
  const jobIds = new Set(jobs.map((job) => job.id));
  const current = candidates.filter((candidate) => jobIds.has(candidate.jobId));
  const hired = current.filter(
    (candidate) => candidate.stage === "已录用转入职",
  );
  const totalApplicants = Math.max(
    current.length,
    jobs.reduce((sum, job) => sum + job.applicants, 0),
  );
  const totalInterviewing = jobs.reduce(
    (sum, job) => sum + job.interviewing,
    0,
  );
  const totalOffers = jobs.reduce((sum, job) => sum + job.offers, 0);
  const target = jobs.reduce((sum, job) => sum + job.headcount, 0);
  const departments = [...new Set(jobs.map((job) => job.department))];
  // Preserve the prototype order; include newly published departments automatically.
  const order = ["技术部", "内容创作部", "视觉设计部", "运营部"];
  const deptProgressList = [
    ...new Set([
      ...order.filter((dept) => departments.includes(dept)),
      ...departments,
    ]),
  ].map((dept) => {
    const deptJobs = jobs.filter((job) => job.department === dept);
    const target = deptJobs.reduce((sum, job) => sum + job.headcount, 0);
    const accepted = hired.filter((candidate) => candidate.department === dept);
    return {
      dept,
      hired: accepted.length,
      target,
      avgDays: averageDays(accepted),
      bottleneck:
        accepted.length >= target && target > 0
          ? "当前在招 HC 已全部锁定 Offer"
          : "持续推进面试安排与候选人跟进",
    };
  });
  const overseas = region === "overseas";
  const sources = [
    "员工内部推荐",
    overseas ? "LinkedIn Talent" : "Boss直聘企业版",
    "企业招聘官网直投",
  ];
  const channelMetrics = sources.map((channel) => {
    const list = current.filter(
      (candidate) => candidate.sourceChannel === channel,
    );
    const offers = list.filter(
      (candidate) =>
        candidate.offerSent ||
        ["Offer 待确认", "已录用转入职"].includes(candidate.stage),
    ).length;
    const accepted = list.filter(
      (candidate) => candidate.stage === "已录用转入职",
    );
    return {
      channel,
      leads: list.length,
      interviewRate: percentage(
        list.filter(
          (candidate) =>
            candidate.stage !== "初试筛选" && candidate.stage !== "已淘汰归档",
        ).length,
        list.length,
      ),
      offers,
      avgDays: averageDays(accepted),
      costPerHire: costPerHire(list, accepted.length, overseas),
      roiTag:
        costPerHire(list, accepted.length, overseas) === "—"
          ? "数据待完善"
          : "已关联渠道数据",
    };
  });
  const known = channelMetrics.reduce((sum, channel) => sum + channel.leads, 0);
  if (totalApplicants > known)
    channelMetrics.push({
      channel: "未标记来源",
      leads: totalApplicants - known,
      interviewRate: "—",
      offers: Math.max(
        0,
        totalOffers -
          channelMetrics.reduce((sum, channel) => sum + channel.offers, 0),
      ),
      avgDays: "—",
      costPerHire: "—",
      roiTag: "待补充渠道数据",
    });
  return {
    totalApplicants,
    totalInterviewing,
    totalOffers,
    totalHired: hired.length,
    target,
    acceptanceRate: percentage(hired.length, totalOffers),
    headcountRate: percentage(hired.length, target),
    averageHireDays: averageDays(hired),
    costPerHire: costPerHire(current, hired.length, overseas),
    deptProgressList,
    channelMetrics,
  };
}
