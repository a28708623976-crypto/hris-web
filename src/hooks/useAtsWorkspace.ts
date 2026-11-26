import { HC_OPTIONS } from "../constants";
import { INITIAL_CANDIDATE_LOGS } from "../mock/candidateLogs";
import { usePageState as useState } from "../store/pageState";
import type { Candidate, CandidateLog } from "../types";
import type { Workspace } from "./useWorkspace";
export function useAtsWorkspace(workspace: Workspace) {
  const {
    setActiveApp,
    setActiveNav,
    atsActiveNav,
    setAtsActiveNav,
    employees,
    onboardingTasks,
    jobs,
    setJobs,
    candidates,
    setCandidates,
    atsViewMode,
    setAtsViewMode,
    atsRegionMode,
    setAtsRegionMode,
    atsAnonymousMode,
    setAtsAnonymousMode,
    atsProgressView,
    setAtsProgressView,
    selectedAtsJobId,
    setSelectedAtsJobId,
    activeCandidateDrawer,
    setActiveCandidateDrawer,
    scorecardCandidate,
    setScorecardCandidate,
    offerCandidate,
    setOfferCandidate: setRawOfferCandidate,
    talentPool,
    setTalentPool,
    triggerToast,
    handlePublishJob,
    handleUpdateCandidateStage,
  } = workspace;
  const onUpdateCandidateStage = handleUpdateCandidateStage;
  const onPublishJob = handlePublishJob;
  const onTriggerToast = triggerToast;
  const onJumpToOnboarding = () => {
    setActiveApp("hris");
    setActiveNav("onboarding");
  };
  const [jobAnchor, setJobAnchor] = useState("basic");
  const [showHrisQueueModal, setShowHrisQueueModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    department: "技术部",
    hcCode: "HC-2026-TECH-08",
    title: "",
    level: "P6",
    salaryBand: "28K - 38K · 15薪",
    locations: ["总部 · 现场办公"],
    remoteTag: "支持混合办公",
    empType: "全职",
    jdContent:
      "【岗位职责】\n1. 负责核心业务系统的架构设计与高可用演进；\n2. 主导生成式 AI 工作流与工程化效能提升。\n\n【任职要求】\n1. 3年以上相关研发或业务落地经验，具备扎实的代码功底；\n2. 良好的跨团队沟通与结果导向意识。",
    internalNote: "核心战略业务线，团队扁平氛围好，汇报给技术部负责人周予安。",
    stages: ["新投递", "初筛通过", "一面", "二面", "Offer"],
    recruiter: "李明",
    hiringManager: "周予安",
    interviewers: ["周予安", "陆泽宇"],
    careerSite: true,
    internalReferral: true,
    externalChannels: ["Boss直聘", "猎聘", "LinkedIn"],
    eeoStatement: true,
    gdprConsent: true,
  });
  const [progressSearch, setProgressSearch] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [rejectModalCand, setRejectModalCand] = useState<Candidate | null>(
    null,
  );
  const [rejectReasonText, setRejectReasonText] =
    useState("专业技术深度与当前职级匹配度略低");
  const [drawerLeftTab, setDrawerLeftTab] = useState("structured");
  const [drawerRightTab, setDrawerRightTab] = useState("activity");
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [candidateLogs, setCandidateLogs] = useState<
    Record<string, CandidateLog[]>
  >(INITIAL_CANDIDATE_LOGS);
  const [scForm, setScForm] = useState({
    techScore: "强烈推荐",
    commScore: "推荐",
    cultureScore: "强烈推荐",
    strengths: "",
    concerns: "",
    finalVerdict: "Strong Yes",
  });
  const defaultOfferForm = {
    manager: "陈嘉宁",
    startDate: "2026-12-08",
    location: "总部 · 创新研发中心",
    baseMonthly: 32000,
    perfMonthly: 6000,
    months: 14,
    probationMonths: 3,
    probationRatio: 80,
    socialBase: 25000,
    annualBaseUsd: 120000,
    currency: "USD",
    signOnBonus: 10000,
    bonusPct: 15,
    rsuShares: 2000,
    lang: "zh",
    status: "draft", // 'draft' | 'approved' | 'sent' | 'accepted'
  };
  const [offerForm, setOfferForm] = useState(defaultOfferForm);
  const [offerDrafts, setOfferDrafts] = useState<
    Record<string, typeof defaultOfferForm>
  >({});
  const setOfferCandidate = (candidate: Candidate | null) => {
    if (offerCandidate)
      setOfferDrafts((previous) => ({
        ...previous,
        [offerCandidate.id]: offerForm,
      }));
    if (candidate) {
      const details = candidate.offerDetails;
      setOfferForm(
        offerDrafts[candidate.id] ?? {
          ...defaultOfferForm,
          ...(details
            ? {
                startDate: details.startDate,
                baseMonthly: details.baseMonthly,
                perfMonthly: details.perfMonthly,
                probationRatio: details.probationRatio,
                manager: details.manager,
              }
            : {}),
          status:
            candidate.stage === "已录用转入职"
              ? "accepted"
              : candidate.stage === "Offer 待确认"
                ? "sent"
                : "draft",
        },
      );
    }
    setRawOfferCandidate(candidate);
  };
  const isOfferLocked = offerForm.status !== "draft";

  return {
    atsActiveNav,
    setAtsActiveNav,
    atsViewMode,
    setAtsViewMode,
    atsRegionMode,
    setAtsRegionMode,
    atsAnonymousMode,
    setAtsAnonymousMode,
    atsProgressView,
    setAtsProgressView,
    selectedAtsJobId,
    setSelectedAtsJobId,
    jobs,
    setJobs,
    candidates,
    setCandidates,
    talentPool,
    setTalentPool,
    employees,
    activeCandidateDrawer,
    setActiveCandidateDrawer,
    scorecardCandidate,
    setScorecardCandidate,
    offerCandidate,
    setOfferCandidate,
    onUpdateCandidateStage,
    onPublishJob,
    onTriggerToast,
    onboardingTasks,
    onJumpToOnboarding,
    jobAnchor,
    setJobAnchor,
    showHrisQueueModal,
    setShowHrisQueueModal,
    newJobForm,
    setNewJobForm,
    progressSearch,
    setProgressSearch,
    onlyMine,
    setOnlyMine,
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
    HC_OPTIONS,
  };
}
export type AtsWorkspace = ReturnType<typeof useAtsWorkspace>;
