import type { SelfRequest } from "../types";
export const INITIAL_SELF_REQUESTS: SelfRequest[] = [
  {
    id: "REQ-01",
    bizType: "假勤申请 / 休假申请 / 年假申请",
    effectiveDate: "2026-10-08 ~ 2026-10-09 (2天)",
    reason: "个人年度休假安排",
    status: "已批准",
  },
  {
    id: "REQ-02",
    bizType: "资产申领 / 电脑与外设 / 显示器申领",
    effectiveDate: "2026-11-12",
    reason: "4K 外接显示器及人体工学支架",
    status: "已批准",
  },
  {
    id: "REQ-03",
    bizType: "费用报销 / 差旅费用 / 差旅报销",
    effectiveDate: "2026-11-18",
    reason: "¥ 1,280.00 · 华东业务交流差旅报销",
    status: "审批中",
  },
];
