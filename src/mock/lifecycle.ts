import type { LifecycleTask } from "../types";
export const INITIAL_LIFECYCLE_TASKS: LifecycleTask[] = [
  {
    id: "LC-2026-001",
    type: "转正评估",
    employeeName: "张伟",
    employeeId: "EMP002",
    department: "技术部",
    role: "AI 视效工程师",
    detail:
      "试用期阶段性项目交付达标（渲染管线提效 22%），直属上级陈嘉宁已完成初评，等待 HR 终审确认。",
    stage: "待 HR 终审",
    effectiveDate: "2026-12-01",
    approver: "李明（HR 主管）",
  },
  {
    id: "LC-2026-002",
    type: "转正评估",
    employeeName: "刘雨桐",
    employeeId: "EMP006",
    department: "内容创作部",
    role: "分镜导演",
    detail:
      "主导完成 3 支 AIGC 短片动态分镜交付，直属上级已审批通过，等待 HR 归档生效。",
    stage: "待 HR 终审",
    effectiveDate: "2026-12-01",
    approver: "李明（HR 主管）",
  },
  {
    id: "LC-2026-004",
    type: "内部调岗",
    employeeName: "周予安",
    employeeId: "EMP007",
    department: "技术部",
    role: "前端架构组长",
    detail: "由「前端工程师」晋升调整为「前端架构组长」，薪资档位同步调整。",
    stage: "已生效归档",
    effectiveDate: "2026-11-15",
    approver: "李明（HR 主管）",
  },
];
