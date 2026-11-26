import assert from "node:assert/strict";
import { createInitialState, useStore } from "../src/store";
import { publishJob, updateCandidateStage } from "../src/store/recruiting";
import { recruitingSummary } from "../src/utils/recruiting";
useStore.setState(createInitialState());
const report = () => {
  const s = useStore.getState();
  return recruitingSummary(s.jobs, s.candidates);
};
assert.equal(report().totalApplicants, 46);
assert.equal(report().totalInterviewing, 15);
assert.equal(report().totalOffers, 2);
assert.equal(report().totalHired, 0);
assert.equal(report().acceptanceRate, "0.0%");
assert.equal(report().target, 5);
assert.equal(
  report().channelMetrics.reduce((sum, c) => sum + c.leads, 0),
  46,
);
assert.equal(report().costPerHire, "—");
assert.equal(report().averageHireDays, "—");
const details = {
  startDate: "2026-12-20",
  baseMonthly: 41000,
  perfMonthly: 7000,
  probationRatio: 90,
  manager: "周予安",
  level: "P7",
};
updateCandidateStage("CAN-01", "已录用转入职", details);
updateCandidateStage("CAN-01", "已录用转入职", details);
assert.equal(useStore.getState().onboardingTasks.length, 3);
const linked = useStore.getState().onboardingTasks[0];
assert.equal(linked.candidateId, "CAN-01");
assert.equal(linked.baseSalary, 41000);
assert.equal(linked.expectedDate, "2026-12-20");
assert.equal(linked.level, "P7");
assert.equal(report().totalHired, 1);
assert.equal(report().totalOffers, 2);
assert.equal(report().acceptanceRate, "50.0%");
assert.equal(report().headcountRate, "20.0%");
updateCandidateStage("CAN-02", "已录用转入职", details);
assert.equal(useStore.getState().onboardingTasks.length, 3);
assert.equal(
  useStore.getState().onboardingTasks.find((t) => t.id === "OB-2026-002")
    ?.candidateId,
  "CAN-02",
);
useStore.setState((s) => ({
  onboardingTasks: s.onboardingTasks.map((t) =>
    t.candidateId === "CAN-01"
      ? { ...t, stage: "材料待补 · 截止 2026-12-27" }
      : t,
  ),
}));
updateCandidateStage("CAN-01", "已录用转入职", {
  ...details,
  baseMonthly: 42000,
});
assert.ok(useStore.getState().onboardingTasks[0].stage.startsWith("材料待补"));
assert.equal(useStore.getState().onboardingTasks[0].baseSalary, 42000);
updateCandidateStage("CAN-04", "专业复试中");
assert.equal(report().totalInterviewing, 16);
updateCandidateStage("CAN-04", "Offer 待确认");
assert.equal(report().totalOffers, 4);
updateCandidateStage("CAN-04", "专业复试中");
updateCandidateStage("CAN-04", "Offer 待确认");
assert.equal(report().totalOffers, 4);
assert.equal(report().totalInterviewing, 16);
// Sparse IDs must allocate from max, never list length.
useStore.setState((s) => ({
  onboardingTasks: [
    {
      ...s.onboardingTasks[0],
      id: "OB-2026-099",
      candidateName: "其他人",
      candidateId: "other",
    },
  ],
}));
updateCandidateStage("CAN-03", "已录用转入职", details);
assert.equal(useStore.getState().onboardingTasks[0].id, "OB-2026-100");
for (const role of ["部门负责人", "普通员工"] as const) {
  useStore.setState({ role });
  const before = useStore.getState();
  assert.equal(updateCandidateStage("CAN-01", "初试筛选"), null);
  assert.equal(
    publishJob({
      title: "x",
      department: "技术部",
      headcount: 1,
      location: "总部",
      salaryRange: "20k",
    }),
    null,
  );
  assert.equal(useStore.getState(), before);
}
useStore.setState(createInitialState());
publishJob({
  title: "招聘测试岗位",
  department: "创新部",
  headcount: 2,
  location: "总部",
  salaryRange: "20K",
});
assert.equal(report().target, 7);
assert.ok(report().deptProgressList.some((d) => d.dept === "创新部"));
assert.equal(
  publishJob({
    title: " ",
    department: "",
    headcount: 1,
    location: "",
    salaryRange: "",
  }),
  null,
);
const s = useStore.getState();
const known = recruitingSummary(s.jobs, [
  {
    ...s.candidates[0],
    stage: "已录用转入职",
    sourceChannel: "员工内部推荐",
    appliedDate: "2026-11-01",
    acceptedDate: "2026-11-21",
    recruitingCostCny: 3000,
    recruitingCostUsd: 420,
  },
]);
assert.equal(known.averageHireDays, "20.0 天");
assert.equal(known.costPerHire, "¥ 3,000");
assert.equal(known.channelMetrics[0].offers, 1);
assert.equal(
  recruitingSummary(
    s.jobs,
    [{ ...s.candidates[0], stage: "已录用转入职", recruitingCostUsd: 420 }],
    "overseas",
  ).costPerHire,
  "$420",
);
assert.equal(recruitingSummary([], []).headcountRate, "0.0%");
useStore.setState(createInitialState());
console.log(
  "PASS 41 recruiting state assertions: atomic handoff, dedupe, IDs, material stages, roles, historical funnel, live reports and missing facts.",
);
