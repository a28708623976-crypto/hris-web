import { publishJob, updateCandidateStage } from "../store/recruiting";
import {
  calibratePerformance,
  syncPerformancePayroll,
} from "../store/performance";
import { renewContract, terminateRenewal } from "../store/contracts";
import { submitSelfRequest } from "../store/selfService";
import {
  completeOnboarding,
  approveLifecycle,
  rejectLifecycle,
  createLifecycleTask,
} from "../store/workflows";
import { validateEmployeeForm } from "../utils/employees";
import {
  Award,
  Briefcase,
  CalendarClock,
  FileSignature,
  Layers,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useStore } from "../store";
import type {
  Employee,
  JobForm,
  LifecycleForm,
  OfferDetails,
  OnboardingTask,
  PendingMaterials,
  RequestSubmission,
} from "../types";
import { createEmptyEmployeeForm } from "../utils/index";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";
export function useWorkspace() {
  const state = useStore();
  const {
    showAppSwitcher,
    setShowAppSwitcher,
    sidebarCollapsed,
    setSidebarCollapsed,
    role,
    setRole,
    employees,
    setEmployees,
    onboardingTasks,
    setOnboardingTasks,
    lifecycleTasks,
    setLifecycleTasks,
    jobs,
    setJobs,
    candidates,
    setCandidates,
    perfRecords,
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
    setOfferCandidate,
    talentPool,
    setTalentPool,
    selfRequests,
    setSelfRequests,
    showNewModal,
    setShowNewModal,
    newEmpForm,
    setNewEmpForm,
    selectedEmployee,
    setSelectedEmployee,
    editEmpForm,
    setEditEmpForm,
    isEditingEmp,
    setIsEditingEmp,
    prefillLifecycleModal,
    setPrefillLifecycleModal,
    salaryUnlocked,
    setSalaryUnlocked,
    showSpotlight,
    setShowSpotlight,
    spotlightQuery,
    setSpotlightQuery,
    toast,
    setToast,
  } = state;
  const {
    activeApp,
    activeNav,
    atsActiveNav,
    atsViewMode,
    setActiveApp,
    setActiveNav,
    setAtsActiveNav,
    setAtsViewMode,
  } = useWorkspaceNavigation();
  const triggerToast = (title: string, message?: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.title === title ? null : prev));
    }, 3600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSpotlight((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentUser = useMemo(() => {
    if (role === "部门负责人") {
      return employees.find((e) => e.id === "EMP004") || employees[0]; // 陈嘉宁 · 运营部负责人
    }
    return employees.find((e) => e.id === "EMP005") || employees[0]; // 李明
  }, [role, employees]);

  const isEmployeeRole = role === "普通员工";

  const navItems = useMemo(() => {
    if (activeApp === "ats" && role === "HR 主管") {
      return [
        { id: "ats-home", label: "招聘工作台", icon: LayoutGrid },
        {
          id: "ats-jobs",
          label: "职位管理",
          icon: Briefcase,
          badge: jobs.length,
        },
        {
          id: "ats-progress",
          label: "招聘进度",
          icon: Layers,
          badge: candidates.filter(
            (c) => c.stage !== "已录用转入职" && c.stage !== "已淘汰归档",
          ).length,
        },
        { id: "ats-candidates", label: "候选人库", icon: Users },
        {
          id: "ats-talent",
          label: "人才库",
          icon: Sparkles,
          badge: talentPool.length,
        },
        {
          id: "ats-offers",
          label: "Offer 中心",
          icon: Award,
          badge: candidates.filter(
            (c) => c.stage === "终面通过" || c.stage === "Offer 待确认",
          ).length,
        },
        { id: "ats-analytics", label: "招聘报表", icon: TrendingUp },
      ];
    }

    if (role === "普通员工") {
      return [
        { id: "dashboard", label: "我的工作台", icon: LayoutGrid },
        { id: "employees", label: "我的档案", icon: Users },
        { id: "contracts", label: "我的合同", icon: FileSignature },
        { id: "attendance", label: "我的考勤", icon: CalendarClock },
        { id: "self-service", label: "员工自助", icon: UserCircle },
        { id: "performance", label: "我的绩效", icon: TrendingUp },
      ];
    }

    if (role === "部门负责人") {
      return [
        { id: "dashboard", label: "工作台", icon: LayoutGrid },
        {
          id: "lifecycle",
          label: "转调离管理",
          icon: UserCheck,
          badge: lifecycleTasks.filter(
            (t) =>
              t.department === currentUser.department &&
              t.stage !== "已生效归档",
          ).length,
        },
        { id: "contracts", label: "我的合同", icon: FileSignature },
        { id: "attendance", label: "考勤薪资", icon: CalendarClock },
        { id: "self-service", label: "员工自助", icon: UserCircle },
        { id: "performance", label: "绩效考核", icon: TrendingUp },
      ];
    }

    return [
      { id: "dashboard", label: "工作台", icon: LayoutGrid },
      { id: "employees", label: "员工档案", icon: Users },
      {
        id: "onboarding",
        label: "入职管理",
        icon: UserPlus,
        badge: onboardingTasks.filter((t) => t.stage !== "已完成入职建档")
          .length,
      },
      {
        id: "lifecycle",
        label: "转调离管理",
        icon: UserCheck,
        badge: lifecycleTasks.filter((t) => t.stage !== "已生效归档").length,
      },
      { id: "contracts", label: "合同管理", icon: FileSignature },
      { id: "attendance", label: "考勤薪资", icon: CalendarClock },
      { id: "certificates", label: "证明文件", icon: Award },
      { id: "self-service", label: "员工自助", icon: UserCircle },
      { id: "performance", label: "绩效考核", icon: TrendingUp },
    ];
  }, [
    activeApp,
    role,
    onboardingTasks,
    lifecycleTasks,
    currentUser.department,
    jobs.length,
    candidates,
  ]);

  useEffect(() => {
    if (role !== "HR 主管" && activeApp === "ats") {
      setActiveApp("hris");
    }
  }, [role, activeApp]);

  useEffect(() => {
    const allowedIds = navItems.map((i) => i.id);
    if (activeApp === "ats") {
      if (!allowedIds.includes(atsActiveNav)) setAtsActiveNav("ats-home");
    } else {
      if (!allowedIds.includes(activeNav)) setActiveNav("dashboard");
    }
  }, [navItems, activeNav, atsActiveNav, activeApp]);

  const currentNavLabel = useMemo(() => {
    if (activeApp === "ats") {
      if (atsViewMode === "job-create") return "发布新职位";
      return navItems.find((i) => i.id === atsActiveNav)?.label || "招聘工作台";
    }
    return navItems.find((i) => i.id === activeNav)?.label || "工作台";
  }, [activeApp, atsViewMode, atsActiveNav, activeNav, navItems]);

  const handleExportCsv = () => {
    const headers = [
      "工号",
      "姓名",
      "部门",
      "岗位",
      "用工类型",
      "状态",
      "入职日期",
      "合同到期日",
    ];
    const rows = employees.map((e) => [
      e.id,
      e.name,
      e.department,
      e.role,
      e.type,
      e.status,
      e.hireDate,
      e.contractEnd,
    ]);
    const csv =
      "\uFEFF" + [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `员工花名册导出_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(
      "花名册 CSV 报表已导出",
      `共导出 ${employees.length} 条员工档案数据`,
    );
  };

  const handleCreateEmployee = () => {
    const err = validateEmployeeForm(newEmpForm);
    if (err) {
      triggerToast("表单校验未通过", err);
      return;
    }
    const maxNum = employees.reduce((m, e) => {
      const n = parseInt(e.id.replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const nextId = `EMP${String(maxNum + 1).padStart(3, "0")}`;
    const created = {
      ...newEmpForm,
      id: nextId,
      status: newEmpForm.type === "全职" ? "试用期" : "正式员工",
    };
    setEmployees((prev) => [created, ...prev]);
    setShowNewModal(false);
    setNewEmpForm(createEmptyEmployeeForm());
    triggerToast(
      `新员工 ${created.name}（${nextId}）建档成功`,
      "已同步写入花名册、合同台账与算薪引擎",
    );
  };

  const handleOpenEmployeeDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditEmpForm(JSON.parse(JSON.stringify(emp)));
    setIsEditingEmp(false);
  };

  const handleSaveEmployeeEdit = () => {
    if (!editEmpForm) return;
    const err = validateEmployeeForm(editEmpForm);
    if (err) {
      triggerToast("档案校验未通过", err);
      return;
    }
    setEmployees((prev) =>
      prev.map((e) => (e.id === editEmpForm.id ? editEmpForm : e)),
    );
    setSelectedEmployee(editEmpForm);
    setIsEditingEmp(false);
    triggerToast(
      "员工全息档案已保存",
      `${editEmpForm.name}（${editEmpForm.id}）最新资料已更新`,
    );
  };

  const handleCompleteOnboarding = (
    taskId: string,
    checklist: OnboardingTask["checklist"],
    isPendingMaterials: boolean,
    pendingMeta: PendingMaterials | null = null,
  ) => {
    const toast = completeOnboarding(
      taskId,
      checklist,
      isPendingMaterials,
      pendingMeta,
    );
    if (toast) triggerToast(toast.title, toast.message);
  };

  const handleApproveLifecycle = (taskId: string) => {
    const toast = approveLifecycle(taskId);
    if (toast) triggerToast(toast.title, toast.message);
  };

  const handleRejectLifecycle = (taskId: string, reason: string) => {
    const toast = rejectLifecycle(taskId, reason);
    if (toast) triggerToast(toast.title, toast.message);
  };

  const handleCreateLifecycleTask = (form: LifecycleForm) => {
    const toast = createLifecycleTask(form);
    if (toast) triggerToast(toast.title, toast.message);
  };

  const handleRenewContract = (
    empId: string,
    newEndDate: string,
    newRoleName: string,
    clauseMode: string,
    clauseNotes: string,
  ) => {
    const toast = renewContract(
      empId,
      newEndDate,
      newRoleName,
      clauseMode,
      clauseNotes,
    );
    if (toast) triggerToast(toast.title, toast.message);
  };

  const handleTerminateRenewal = (empId: string) => {
    const toast = terminateRenewal(empId);
    if (toast) triggerToast(toast.title, toast.message);
  };

  const handlePublishJob = (jobForm: JobForm) => {
    const toast = publishJob(jobForm);
    if (toast) triggerToast(toast.title, toast.message);
  };
  const handleUpdateCandidateStage = (
    id: string,
    stage: string,
    details: OfferDetails | null = null,
  ) => {
    const toast = updateCandidateStage(id, stage, details);
    if (toast) triggerToast(toast.title, toast.message);
  };

  const handleSubmitSelfRequest = (submission: RequestSubmission) => {
    const result = submitSelfRequest(submission);
    if (result.ok) {
      const request = useStore.getState().selfRequests[0];
      triggerToast(
        "自助申请已提交",
        `「${request.bizType}」已推送至直属上级审批`,
      );
    }
    return result;
  };

  const handleCalibrateGrade = (
    empId: string,
    grade: string,
    comment: string,
  ) => {
    if (!calibratePerformance(empId, grade, comment)) return;
    triggerToast(
      "绩效等级校准已保存",
      `员工 ${empId} 季度校准等级已更新为 ${grade}`,
    );
  };
  const handleSyncPerformancePayroll = () => {
    if (!syncPerformancePayroll()) return;
    triggerToast(
      "全员绩效结果已同步",
      "校准结果已自动关联至本月算薪绩效奖金基数",
    );
  };
  return {
    activeApp,
    setActiveApp,
    showAppSwitcher,
    setShowAppSwitcher,
    activeNav,
    setActiveNav,
    atsActiveNav,
    setAtsActiveNav,
    sidebarCollapsed,
    setSidebarCollapsed,
    role,
    setRole,
    employees,
    setEmployees,
    onboardingTasks,
    setOnboardingTasks,
    lifecycleTasks,
    setLifecycleTasks,
    jobs,
    setJobs,
    candidates,
    setCandidates,
    perfRecords,
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
    setOfferCandidate,
    talentPool,
    setTalentPool,
    selfRequests,
    setSelfRequests,
    showNewModal,
    setShowNewModal,
    newEmpForm,
    setNewEmpForm,
    selectedEmployee,
    setSelectedEmployee,
    editEmpForm,
    setEditEmpForm,
    isEditingEmp,
    setIsEditingEmp,
    prefillLifecycleModal,
    setPrefillLifecycleModal,
    salaryUnlocked,
    setSalaryUnlocked,
    showSpotlight,
    setShowSpotlight,
    spotlightQuery,
    setSpotlightQuery,
    toast,
    setToast,
    triggerToast,
    currentUser,
    isEmployeeRole,
    navItems,
    currentNavLabel,
    handleExportCsv,
    validateEmployeeForm,
    handleCreateEmployee,
    handleOpenEmployeeDetail,
    handleSaveEmployeeEdit,
    handleCompleteOnboarding,
    handleApproveLifecycle,
    handleRejectLifecycle,
    handleCreateLifecycleTask,
    handleRenewContract,
    handleTerminateRenewal,
    handlePublishJob,
    handleUpdateCandidateStage,
    handleSubmitSelfRequest,
    handleCalibrateGrade,
    handleSyncPerformancePayroll,
  };
}
export type Workspace = ReturnType<typeof useWorkspace>;
