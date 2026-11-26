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
  SelfRequest,
} from "../types";
import {
  calcContractEndDate,
  calcProbationEndDate,
  createEmptyEmployeeForm,
} from "../utils/index";
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
    setPerfRecords,
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
    const task = onboardingTasks.find((t) => t.id === taskId);
    if (!task) return;
    const pendingLabel =
      isPendingMaterials && pendingMeta?.deadline
        ? `材料待补 · 截止 ${pendingMeta.deadline}`
        : "材料待补全";
    setOnboardingTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              checklist,
              stage: isPendingMaterials ? pendingLabel : "已完成入职建档",
              remark:
                isPendingMaterials && pendingMeta
                  ? `${t.remark}（先办入职原因：${pendingMeta.reason} · 补交截止：${pendingMeta.deadline}）`
                  : t.remark,
            }
          : t,
      ),
    );

    const maxNum = employees.reduce((m, e) => {
      const n = parseInt(e.id.replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const nextId = `EMP${String(maxNum + 1).padStart(3, "0")}`;
    const probRatio = (task.probationRatio || 80) / 100;
    const newEmp = createEmptyEmployeeForm({
      id: nextId,
      name: task.candidateName,
      phone: task.phone || "",
      email: task.email || "",
      department: task.department,
      role: task.role,
      manager: task.manager || "陈嘉宁",
      level: task.level || "P5",
      type: task.type || "全职",
      status: "试用期",
      hireDate: task.expectedDate,
      contractEnd: calcContractEndDate(task.expectedDate, 3),
      probationPeriod: "3个月",
      probationEndDate: calcProbationEndDate(task.expectedDate, "3个月"),
      probationBaseSalary: Math.round((task.baseSalary || 0) * probRatio),
      probationPerfSalary: task.perfSalary || 0,
      baseSalary: task.baseSalary || 0,
      perfSalary: task.perfSalary || 0,
    });
    setEmployees((prev) => [newEmp, ...prev]);
    triggerToast(
      isPendingMaterials
        ? `已办理先行入职（${pendingLabel}）`
        : "入职材料核验通过并完成建档",
      `${task.candidateName} 已分配工号 ${nextId} 并同步至花名册`,
    );
  };

  const handleApproveLifecycle = (taskId: string) => {
    const task = lifecycleTasks.find((t) => t.id === taskId);
    setLifecycleTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, stage: "已生效归档" } : t)),
    );
    if (task) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id !== task.employeeId && emp.name !== task.employeeName)
            return emp;
          if (task.type === "转正评估") return { ...emp, status: "正式员工" };
          if (task.type === "离职办理") return { ...emp, status: "已离职" };
          if (task.type === "内部调岗")
            return { ...emp, role: task.role, department: task.department };
          return emp;
        }),
      );
      triggerToast(
        "审批已办结并同步花名册",
        `${task.employeeName} 的「${task.type}」已生效`,
      );
    }
  };

  const handleRejectLifecycle = (taskId: string, reason: string) => {
    setLifecycleTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              stage: "已驳回",
              detail: `${t.detail}（驳回原因：${reason}）`,
            }
          : t,
      ),
    );
    triggerToast("流程已驳回退回", `单号 ${taskId} 已退回发起人修改`);
  };

  const handleCreateLifecycleTask = (form: LifecycleForm) => {
    const maxSeq = lifecycleTasks.reduce((m, t) => {
      const parts = t.id.split("-");
      const n = parseInt(parts[parts.length - 1], 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const newId = `LC-2026-${String(maxSeq + 1).padStart(3, "0")}`;
    const newTask = {
      id: newId,
      type: form.type,
      employeeName: form.employeeName,
      employeeId: form.employeeId,
      department: form.department,
      role: form.role,
      detail:
        form.detail || `申请办理 ${form.employeeName} 的「${form.type}」流程。`,
      stage: "待 HR 终审",
      effectiveDate: form.effectiveDate,
      approver: "李明（HR 主管）",
    };
    setLifecycleTasks((prev) => [newTask, ...prev]);
    triggerToast(
      `已发起「${form.type}」审批流`,
      `单号 ${newId} 已推送至审批节点`,
    );
  };

  const handleRenewContract = (
    empId: string,
    newEndDate: string,
    newRoleName: string,
    clauseMode: string,
    clauseNotes: string,
  ) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === empId
          ? {
              ...emp,
              contractEnd: newEndDate,
              role: newRoleName || emp.role,
              renewalStatus: "normal",
            }
          : emp,
      ),
    );
    triggerToast(
      "劳动合同电子续签已生效",
      `合同到期日已更新至 ${newEndDate}（${
        clauseMode === "modified" && clauseNotes
          ? "已附补充条款"
          : "按原条款顺延"
      }）`,
    );
  };

  const handleTerminateRenewal = (empId: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === empId ? { ...emp, renewalStatus: "terminated" } : emp,
      ),
    );
    triggerToast("已标记到期不再续签", "系统已将该合同纳入到期终止提醒清单");
  };

  const handlePublishJob = (jobForm: JobForm) => {
    const maxNum = jobs.reduce((m, j) => {
      const n = parseInt(j.id.replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 100);
    const newJob = {
      id: `JOB-${maxNum + 1}`,
      title: jobForm.title,
      department: jobForm.department,
      headcount: jobForm.headcount || 1,
      location: jobForm.location || "总部 · 现场办公",
      salaryRange: jobForm.salaryRange || "25K - 35K · 14薪",
      applicants: 0,
      interviewing: 0,
      offers: 0,
      priority: "新发布",
    };
    setJobs((prev) => [newJob, ...prev]);
    triggerToast("新招聘职位已发布上线", `「${newJob.title}」已同步至在招看板`);
  };

  const handleUpdateCandidateStage = (
    candId: string,
    nextStage: string,
    offerDetails: OfferDetails | null = null,
  ) => {
    const cand = candidates.find((c) => c.id === candId);
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, stage: nextStage } : c)),
    );
    if (cand && nextStage === "已录用转入职") {
      const expectedDate =
        offerDetails?.startDate ||
        (cand.availableDate === "随时到岗" ? "2026-12-01" : cand.availableDate);
      const baseSalary = offerDetails?.baseMonthly ?? 25000;
      const perfSalary = offerDetails?.perfMonthly ?? 5000;
      const probationRatio = offerDetails?.probationRatio ?? 80;
      const manager = offerDetails?.manager || "陈嘉宁";
      const level = offerDetails?.level || "P6";

      const existingOb = onboardingTasks.find((ob) => {
        const nameMatch = ob.candidateName === cand.name;
        const roleMatch = ob.role === cand.jobTitle;
        const phoneMatch =
          cand.phone && ob.phone ? cand.phone === ob.phone : true;
        return nameMatch && roleMatch && phoneMatch;
      });

      if (existingOb) {
        setOnboardingTasks((prev) =>
          prev.map((ob) =>
            ob.id === existingOb.id
              ? {
                  ...ob,
                  department: cand.department,
                  expectedDate,
                  baseSalary,
                  perfSalary,
                  probationRatio,
                  manager,
                  level,
                  phone: cand.phone || ob.phone || "",
                  email: cand.email || ob.email || "",
                  remark: `已关联更新 Offer 定薪（基本月薪 ¥${baseSalary.toLocaleString()} + 绩效 ¥${perfSalary.toLocaleString()} · 试用期 ${probationRatio}%）。`,
                }
              : ob,
          ),
        );
        triggerToast(
          `已关联到现有入职单 ${existingOb.id}`,
          `${cand.name} 的 Offer 薪资、入职日期与职级已同步更新，未重复建单`,
        );
      } else {
        const newObId = `OB-2026-${String(onboardingTasks.length + 1).padStart(3, "0")}`;
        const newOb = {
          id: newObId,
          candidateName: cand.name,
          phone: cand.phone || "",
          email: cand.email || "",
          department: cand.department,
          role: cand.jobTitle,
          manager,
          level,
          type: "全职",
          expectedDate,
          baseSalary,
          perfSalary,
          probationRatio,
          stage: "待核验入职材料",
          checklist: {
            idCard: true,
            diploma: true,
            resignationCert: false,
            bankCard: false,
            medicalReport: false,
          },
          remark: `由 ATS 招聘工作台录用同步转入（定薪：底薪 ¥${baseSalary.toLocaleString()} + 绩效 ¥${perfSalary.toLocaleString()} · 试用期 ${probationRatio}%）。`,
        };
        setOnboardingTasks((prev) => [newOb, ...prev]);
        triggerToast(
          `已自动转入 HRIS 入职管理（${newObId}）`,
          `${cand.name} 的定薪、入职日期与职级已同步带入待入职列表`,
        );
      }
    } else if (cand) {
      triggerToast(
        "候选人招聘节点已更新",
        `${cand.name} 当前处于「${nextStage}」`,
      );
    }
  };

  const handleSubmitSelfRequest = ({
    bizType,
    effectiveDate,
    reason,
  }: Pick<SelfRequest, "bizType" | "effectiveDate" | "reason">) => {
    const newReq = {
      id: `REQ-${Date.now()}`,
      bizType,
      effectiveDate,
      reason,
      status: "审批中",
    };
    setSelfRequests((prev) => [newReq, ...prev]);
    triggerToast("自助申请已提交", `「${bizType}」已推送至直属上级审批`);
  };

  const handleCalibrateGrade = (
    empId: string,
    grade: string,
    comment: string,
  ) => {
    setPerfRecords((prev) =>
      prev.map((r) =>
        r.id === empId
          ? { ...r, grade, managerComment: comment, status: "已校准" }
          : r,
      ),
    );
    triggerToast(
      "绩效等级校准已保存",
      `员工 ${empId} 季度校准等级已更新为 ${grade}`,
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
    setPerfRecords,
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
  };
}
export type Workspace = ReturnType<typeof useWorkspace>;
