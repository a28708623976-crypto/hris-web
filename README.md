# PeopleOS · HRIS Pro

视觉、布局、交互和文案的唯一基准是 [高保真原型](prototype/peopleos_hris_pro.tsx)。该文件保留原样。旧版《HRIS Web App 前端 Spec.md》仅作历史参考；本阶段只迁移底座和原型已有功能。

React 18 + TypeScript strict + Tailwind CSS v4（官方 Vite 插件）+ lucide-react + React Router 6 + Zustand 5。

```sh
npm install
npm run dev
```

默认进入 `/employees`。开发服务器地址为 http://127.0.0.1:5173。

- `src/constants/`：部门、字典、省市、银行、编制选项等常量。
- `src/utils/`：原型的日期、年龄、工龄、试用期、合同及空白表单辅助函数；保留原型的固定基准日期和计算规则。
- `src/mock/`：员工、入职、转调离、职位、候选人、绩效、人才库、自助申请和候选人活动初始数据。
- `src/types.ts`：业务实体、表单、角色、状态和 Setter 基础类型。
- `src/store/`：共享业务数据及框架状态；页面和表单的临时状态也放在 Zustand，组件卸载时按原型重置。无 localStorage 持久化，刷新恢复初始数据。
- `src/hooks/`：路由导航适配，以及保留原型业务处理逻辑的 HRIS / ATS 上下文。
- `src/components/ui/`：AppleActionButton、StatusBadge、TwoLevelCascader。
- `src/components/layout/`：Sidebar、TopBar（子应用/视角切换与搜索入口）、Spotlight、Toast、弹窗和共享框架。
- `src/pages/`：HRIS 模块；`src/pages/ats/` 为 ATS 各独立页面。原型保留的旧版 RecruitingModuleView 仍保留其组件代码，但原型未挂载此组件，导航使用完整 ATS 工作台。

HRIS 独立路由：`/dashboard`、`/employees`、`/onboarding`、`/lifecycle`、`/contracts`、`/attendance`、`/certificates`、`/self-service`、`/performance`。

ATS 独立路由：`/ats/home`、`/ats/jobs`、`/ats/jobs/new`、`/ats/progress`、`/ats/candidates`、`/ats/talent`、`/ats/offers`、`/ats/analytics`。

三角色完全依照原型：HR 主管可访问全部页面；部门负责人可访问工作台、转调离、本人合同、考勤薪资、员工自助和绩效；普通员工可访问本人工作台、档案、合同、考勤、自助和绩效。身份映射同原型：部门负责人 EMP004，其他视角 EMP005。数据过滤、薪资锁和操作按钮按原型保留。URL 直达受相同导航规则约束；浏览器前进、后退和刷新可用。

模拟审批、招聘、下载等行为沿用原型，本次未扩展成真实后端服务。证明文件下载的原型行为也保持原样。

```sh
npm run build
npm test
npm run check:routes
# 保持 npm run dev 运行，然后：
npm run check:browser
npm run check:employees
npm run check:workflows
```

`qa/` 使用只读原型生成临时验收副本，检查原型哈希、计算/数据一致性、29 组可访问角色页面的 DOM 与样式类、51 组浏览器路由角色组合、截图、Tailwind v4 实际样式和关键交互。截图与报告位于忽略提交的 `qa/artifacts/`。详情见 [验收记录](qa/VERIFICATION.md)。

员工档案逐项验收见 [员工档案专项记录](qa/EMPLOYEES_VERIFICATION.md)。本人数据范围切换会重置列表临时状态，避免沿用 HR 的隐藏筛选；新增和编辑共用原型校验函数。

入职与转调离逐项验收见 [流程专项记录](qa/WORKFLOWS_VERIFICATION.md)。`src/store/workflows.ts` 统一处理原型流程状态、建档防重、员工工号绑定与部门范围检查。
