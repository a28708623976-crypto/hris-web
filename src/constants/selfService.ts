import type { RequestField, RequestTypeNode } from "../types";
import { DEPARTMENTS } from "./index";

const required = (
  name: string,
  label: string,
  type: RequestField["type"],
  extra: Partial<RequestField> = {},
): RequestField => ({ name, label, type, required: true, ...extra });
const optional = (
  name: string,
  label: string,
  type: RequestField["type"],
): RequestField => ({ name, label, type, required: false });
const dateRange = [
  required("startDate", "开始日期", "date"),
  required("endDate", "结束日期", "date", { afterField: "startDate" }),
];
const invoices = required("invoices", "发票上传", "file", {
  accept: ".pdf,.jpg,.jpeg,.png",
  multiple: true,
});
const costOwner = required("costOwner", "费用归属部门", "select", {
  options: DEPARTMENTS.filter((department) => department !== "全部部门"),
});
const leaveFields = (reasonLabel: string): RequestField[] => [
  ...dateRange,
  required("days", "请假天数", "number", { min: 0.5, step: 0.5 }),
  required("handover", "工作交接人", "text"),
  required("reason", reasonLabel, "textarea"),
];
const assetFields = (modelLabel: string): RequestField[] => [
  required("model", modelLabel, "text"),
  required("quantity", "申领数量", "number", { min: 1, step: 1 }),
  required("neededBy", "期望领用日期", "date"),
  required("purpose", "申领用途", "textarea"),
];
const reimbursementFields = (purposeLabel: string): RequestField[] => [
  required("expenseDate", "费用发生日期", "date"),
  required("amount", "报销金额（元）", "number", { min: 0.01, step: 0.01 }),
  invoices,
  costOwner,
  required("purpose", purposeLabel, "textarea"),
];
const sealFields = (label: string): RequestField[] => [
  required("documents", label, "file", {
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    multiple: true,
  }),
  required("purpose", "用印用途", "textarea"),
  required("copies", "用印份数", "number", { min: 1, step: 1 }),
  required("useDate", "计划用印日期", "date"),
  required("handler", "经办人", "text"),
];

// Add children at any depth. Only leaves define and submit their own form.
export const SELF_SERVICE_REQUEST_TYPES: readonly RequestTypeNode[] = [
  {
    id: "leave",
    label: "假勤申请",
    children: [
      {
        id: "leave-vacation",
        label: "休假申请",
        children: [
          {
            id: "annual-leave",
            label: "年假申请",
            fields: leaveFields("请假事由"),
          },
          {
            id: "sick-leave",
            label: "病假申请",
            fields: [
              ...leaveFields("病假说明"),
              optional("medicalProof", "就诊材料说明", "textarea"),
            ],
          },
        ],
      },
      {
        id: "leave-time",
        label: "加班与调休",
        children: [
          {
            id: "time-off",
            label: "调休申请",
            fields: [
              ...dateRange,
              required("hours", "调休小时数", "number", {
                min: 0.5,
                step: 0.5,
              }),
              required("handover", "工作交接人", "text"),
              required("reason", "调休事由", "textarea"),
            ],
          },
          {
            id: "overtime",
            label: "加班申报",
            fields: [
              required("workDate", "加班日期", "date"),
              required("hours", "加班小时数", "number", {
                min: 0.5,
                step: 0.5,
              }),
              required("project", "所属项目", "text"),
              required("workContent", "加班工作内容", "textarea"),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "assets",
    label: "资产申领",
    children: [
      {
        id: "assets-hardware",
        label: "电脑与外设",
        children: [
          {
            id: "computer",
            label: "办公电脑申领",
            fields: [
              ...assetFields("电脑型号 / 配置要求"),
              optional("software", "预装软件要求", "textarea"),
            ],
          },
          {
            id: "monitor",
            label: "显示器申领",
            fields: assetFields("显示器型号 / 尺寸"),
          },
        ],
      },
      {
        id: "assets-software",
        label: "软件与账号",
        children: [
          {
            id: "software-license",
            label: "软件许可申领",
            fields: assetFields("软件名称 / 版本"),
          },
          {
            id: "ai-account",
            label: "AI 算力账号申领",
            fields: [
              ...assetFields("服务平台 / 套餐"),
              required("budget", "月度预算（元）", "number", {
                min: 0.01,
                step: 0.01,
              }),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "expenses",
    label: "费用报销",
    children: [
      {
        id: "expenses-travel",
        label: "差旅费用",
        children: [
          {
            id: "travel-expense",
            label: "差旅报销",
            fields: [
              ...reimbursementFields("出差事由"),
              required("destination", "出差目的地", "text"),
            ],
          },
          {
            id: "travel-allowance",
            label: "出差补贴",
            fields: [
              ...dateRange,
              required("days", "出差天数", "number", { min: 1, step: 1 }),
              required("amount", "申请补贴金额（元）", "number", {
                min: 0.01,
                step: 0.01,
              }),
              costOwner,
              required("purpose", "出差任务说明", "textarea"),
            ],
          },
        ],
      },
      {
        id: "expenses-daily",
        label: "日常费用",
        children: [
          {
            id: "office-expense",
            label: "办公采购报销",
            fields: reimbursementFields("采购明细及用途"),
          },
          {
            id: "entertainment-expense",
            label: "业务招待报销",
            fields: [
              ...reimbursementFields("招待事由"),
              required("guests", "招待对象 / 人数", "text"),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "admin",
    label: "综合行政",
    children: [
      {
        id: "admin-seal",
        label: "用印管理",
        children: [
          {
            id: "company-seal",
            label: "公章用印",
            fields: sealFields("用印文件"),
          },
          {
            id: "contract-seal",
            label: "合同用印",
            fields: [
              ...sealFields("合同文件"),
              required("counterparty", "合同相对方", "text"),
            ],
          },
        ],
      },
      {
        id: "admin-personal",
        label: "个人行政",
        children: [
          {
            id: "access-card",
            label: "门禁权限申请",
            fields: [
              required("area", "申请开通区域", "text"),
              required("startDate", "权限生效日期", "date"),
              required("reason", "开通事由", "textarea"),
            ],
          },
          {
            id: "business-card",
            label: "名片印制",
            fields: [
              required("displayName", "名片姓名", "text"),
              required("jobTitle", "名片职务", "text"),
              required("phone", "联系电话", "text"),
              required("quantity", "印制数量", "number", { min: 1, step: 1 }),
              required("neededBy", "期望领取日期", "date"),
              optional("note", "补充说明", "textarea"),
            ],
          },
        ],
      },
    ],
  },
];
