# PeopleOS 验收索引

最新完整验收：2026-11-27，见 [剩余模块原型对齐与完整回归](ALIGNMENT_VERIFICATION.md)。原型未修改；所有模块以 `prototype/peopleos_hris_pro.tsx` 为基准，员工自助保留明确授权的多级表单例外。

- [员工档案](EMPLOYEES_VERIFICATION.md)
- [入职与转调离](WORKFLOWS_VERIFICATION.md)
- [员工自助多级申请](SELF_SERVICE_VERIFICATION.md)
- [合同管理](CONTRACTS_VERIFICATION.md)
- [考勤薪资](ATTENDANCE_VERIFICATION.md)
- [证明文件](CERTIFICATES_VERIFICATION.md)
- [绩效考核](PERFORMANCE_VERIFICATION.md)
- [工作台](DASHBOARD_VERIFICATION.md)
- [ATS 招聘](ATS_VERIFICATION.md)

构建、状态测试、29 组可访问路由对照、17 路由×3 角色共 51 组浏览器检查、全部模块专项均通过。完整浏览器回归覆盖运行时异常和控制台错误，结果为 0。

本地复现：先 `npm run dev`，再执行 `npm run build`、`npm test`、`npm run check:routes`、`npm run check:browser`，以及 `package.json` 中各模块的 `check:*`。参考源由 QA 只读生成到忽略目录，不允许修改权威原型；截图/下载/JSON 结果在 `qa/artifacts/`。当前权限与业务动作仍是原型本地 Mock 前端，边界与明确差异见最新完整记录。
