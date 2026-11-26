import type { JobForm, OfferDetails, ToastMessage } from "../types";
import { useStore } from "./index";

const stages = [
  "初试筛选",
  "专业复试中",
  "终面通过",
  "Offer 待确认",
  "已录用转入职",
  "已淘汰归档",
];
export function publishJob(form: JobForm): ToastMessage | null {
  let toast: ToastMessage | null = null;
  useStore.setState((state) => {
    if (state.role !== "HR 主管" || !form.title.trim()) return state;
    const max = state.jobs.reduce(
      (n, job) => Math.max(n, Number(job.id.replace(/\D/g, "")) || 100),
      100,
    );
    const job = {
      ...form,
      id: `JOB-${max + 1}`,
      headcount: form.headcount || 1,
      location: form.location || "总部 · 现场办公",
      salaryRange: form.salaryRange || "25K - 35K · 14薪",
      applicants: 0,
      interviewing: 0,
      offers: 0,
      priority: "新发布",
    };
    toast = {
      title: "新招聘职位已发布上线",
      message: `「${job.title}」已同步至在招看板`,
    };
    return { jobs: [job, ...state.jobs] };
  });
  return toast;
}

export function updateCandidateStage(
  id: string,
  stage: string,
  details: OfferDetails | null = null,
): ToastMessage | null {
  let toast: ToastMessage | null = null;
  useStore.setState((state) => {
    const candidate = state.candidates.find((item) => item.id === id);
    if (state.role !== "HR 主管" || !candidate || !stages.includes(stage))
      return state;
    const alreadyOffered =
      candidate.offerSent ||
      ["Offer 待确认", "已录用转入职"].includes(candidate.stage);
    const nowOffered = ["Offer 待确认", "已录用转入职"].includes(stage);
    const alreadyInterviewed =
      candidate.interviewEntered ||
      ["专业复试中", "终面通过", "Offer 待确认", "已录用转入职"].includes(
        candidate.stage,
      );
    const nowInterviewed = [
      "专业复试中",
      "终面通过",
      "Offer 待确认",
      "已录用转入职",
    ].includes(stage);
    const candidates = state.candidates.map((item) =>
      item.id === id
        ? {
            ...item,
            stage,
            offerSent: alreadyOffered || nowOffered,
            interviewEntered: alreadyInterviewed || nowInterviewed,
            ...(stage === "已录用转入职"
              ? {
                  acceptedDate:
                    item.acceptedDate || new Date().toISOString().slice(0, 10),
                }
              : {}),
            ...(details ? { offerDetails: details } : {}),
          }
        : item,
    );
    const jobs = state.jobs.map((job) =>
      job.id === candidate.jobId
        ? {
            ...job,
            offers: job.offers + (nowOffered && !alreadyOffered ? 1 : 0),
            interviewing:
              job.interviewing +
              (nowInterviewed && !alreadyInterviewed ? 1 : 0),
          }
        : job,
    );
    toast = {
      title: "候选人招聘节点已更新",
      message: `${candidate.name} 当前处于「${stage}」`,
    };
    if (stage !== "已录用转入职") return { candidates, jobs };
    const saved = details ?? candidate.offerDetails;
    const expectedDate =
      saved?.startDate ||
      (candidate.availableDate === "随时到岗"
        ? "2026-12-01"
        : candidate.availableDate);
    const baseSalary = saved?.baseMonthly ?? 25000,
      perfSalary = saved?.perfMonthly ?? 5000;
    const probationRatio = saved?.probationRatio ?? 80,
      manager = saved?.manager || "陈嘉宁",
      level = saved?.level || "P6";
    const existing = state.onboardingTasks.find(
      (task) =>
        task.candidateId === id ||
        (!task.candidateId &&
          task.candidateName === candidate.name &&
          task.role === candidate.jobTitle &&
          (!candidate.phone || !task.phone || candidate.phone === task.phone)),
    );
    const patch = {
      candidateId: id,
      role: candidate.jobTitle,
      department: candidate.department,
      expectedDate,
      baseSalary,
      perfSalary,
      probationRatio,
      manager,
      level,
      phone: candidate.phone || existing?.phone || "",
      email: candidate.email || existing?.email || "",
    };
    if (existing) {
      toast = {
        title: `已关联到现有入职单 ${existing.id}`,
        message: `${candidate.name} 的 Offer 薪资、入职日期与职级已同步更新，未重复建单`,
      };
      return {
        candidates,
        jobs,
        onboardingTasks: state.onboardingTasks.map((task) =>
          task.id === existing.id
            ? {
                ...task,
                ...patch,
                remark: `已关联更新 Offer 定薪（基本月薪 ¥${baseSalary.toLocaleString()} + 绩效 ¥${perfSalary.toLocaleString()} · 试用期 ${probationRatio}%）。`,
              }
            : task,
        ),
      };
    }
    const max = state.onboardingTasks.reduce(
      (n, task) => Math.max(n, Number(task.id.match(/(\d+)$/)?.[1]) || 0),
      0,
    );
    const newId = `OB-2026-${String(max + 1).padStart(3, "0")}`;
    toast = {
      title: `已自动转入 HRIS 入职管理（${newId}）`,
      message: `${candidate.name} 的定薪、入职日期与职级已同步带入待入职列表`,
    };
    return {
      candidates,
      jobs,
      onboardingTasks: [
        {
          ...patch,
          id: newId,
          candidateName: candidate.name,
          role: candidate.jobTitle,
          type: "全职",
          stage: "待核验入职材料",
          checklist: {
            idCard: true,
            diploma: true,
            resignationCert: false,
            bankCard: false,
            medicalReport: false,
          },
          remark: `由 ATS 招聘工作台录用同步转入（定薪：底薪 ¥${baseSalary.toLocaleString()} + 绩效 ¥${perfSalary.toLocaleString()} · 试用期 ${probationRatio}%）。`,
        },
        ...state.onboardingTasks,
      ],
    };
  });
  return toast;
}
