# 本地 Worker 后端

首次启动、验证码位置、账号切换和附件测试的逐步说明见 [项目 README](../README.md)。

## 接口

- `POST /api/auth/request-code`：JSON `{email}`。仅已有且启用的账号发码；未知邮箱返回相同成功响应。邮箱每分钟 1 次/每小时 5 次，同一可信 IP 每小时 20 次，滑动窗口在 D1 原子判断。验证码只存带服务端密钥的 HMAC-SHA256，10 分钟过期、五次错误作废、单次消费。
- `POST /api/auth/verify`：JSON `{email,code}`。会话 Cookie 为 HttpOnly、Secure、SameSite=Lax；HR 主管 24 小时，其他角色七天（旧 HR 会话同样按创建时间限制），随机令牌仅保存 SHA256。
- `POST /api/auth/logout-all`：撤销当前用户全部设备会话并清除 Cookie，不增加前端按钮。
- `GET /api/auth/me` / `POST /api/auth/logout`：真实会话身份/注销；未登录返回 401。
- `GET /api/employees`：可选 query `department`、`status`、`hireMonth=YYYY-MM`、`keyword`。仅返回列表所需资料及薪资，不返回 bankCards/idDocs，写入一条无具体员工的 list 筛选审计。
- `GET /api/employees/:id`：完整权限范围内的档案、版本及年龄/工龄计算值。
- `POST /api/employees`：共享表单 JSON，服务端分配 EMP 工号；可传 `Idempotency-Key`，相同请求返回同一员工，不同数据返回 409。
- `PUT /api/employees/:id`：共享表单 JSON，并携带上次读取的 `version`，并发冲突返回 409。字段校验失败为 422，`fields` 为 `{field,message}[]`。
- `POST /api/employees/batch`：HR 原子保存 1–50 条员工记录，JSON `{employees:[...]}`。用于绩效同步等多员工变更；D1 事务先校验所有版本，再一起保存和审计。
- `POST /api/employees/:id/attachments/:slot`：HR 上传原始文件字节。头部 `X-File-Name` 使用 encodeURIComponent 文件名，`X-File-Size` 为字节数，编辑表单同时传 `If-Match` 员工版本。接受 JPEG/JPG/PNG/PDF/DOC/DOCX，最大 50MB，验证内容签名和 DOCX 结构。流式写入 R2，不把整份文件读入 Worker 内存；D1 索引提交前不显示为已归档。失败不替换旧附件，版本冲突清理临时对象。
- `GET /api/employees/:id/attachments/:slot`：HR 或员工本人鉴权下载。返回强制下载、nosniff、private/no-store，不返回 R2 key 或公开 URL。

## 权限与存储

`hr_lead` 全员可读写；`employee` 只能 GET 本人（含薪资），列表限制为本人；`dept_head` 所有员工接口均为 403。错误响应不包含其他人的敏感字段。前端按钮和路由只负责展示，不是权限边界。

基础字段和结构化关联资料在 D1；银行卡、证件、六项薪资字段分别以 AES-256-GCM 密文保存，每次随机 IV，以员工工号/字段组绑定认证数据，拒绝密文互换。密钥为 `ENCRYPTION_KEY`，本地保存在忽略文件，生产将由 Worker Secret 提供。

单人敏感读取/创建/修改、附件上传/下载审计包含 actor、目标员工、时间、动作、字段名称，不保存敏感值。列表仅记一条 list，employee_id=NULL，filters_json 保存筛选条件，不记人员结果。员工更新和审计同事务，读取审计失败时不返回敏感内容。附件保持私有 R2，数据库只保存索引和员工表中的文件名。

`shared/employees.ts` 和 `shared/dates.ts` 是唯一校验及计算来源；年龄和工龄按原型固定基准日保留。后端重新计算试用期结束日，入职日变化时更新未手改的合同日期；允许原型的手工合同到期日/续签。入职缺失必填资料时复用新增表单，不伪造真实人员资料。

合同、考勤、绩效、ATS 等没有后端业务表和接口，引用的员工资料共享员工 API；本阶段不持久化它们的其余模拟记录。部门负责人在这些模块看到的既有样例仍是 mock，不会向该角色提供真实员工 API 数据。

## 本地边界与邮件

本地开发与验收脚本固定 `--local`，本地 D1 使用占位 ID，无账号 ID，所有本地绑定 `remote:false`，关闭遥测。另备有独立的生产配置、离线检查和部署入口，供未来手动上线使用，详见 [生产部署手册](DEPLOY.md)；本次没有执行部署或连接线上账号。D1/R2 日常状态在 `worker/.local/`；自动验收用 `worker/.test/`，全部忽略提交。种子账号只从环境变量 `SEED_HR_EMAIL`、`SEED_DEPT_EMAIL`、`SEED_EMP_EMAIL` 读取；本地交互配置把它们保存到 `worker/.dev.vars`。原型空缺必填项只在种子里补测试值；原型附件名不是实际文件，不冒充已上传。

配置默认 `ENV=production`；`npm run dev` 通过 `--var ENV:dev` 显式进入开发模式，`.dev.vars` 不再保存 ENV。只有 `ENV=dev` 且 URL hostname 为 localhost 或 127.0.0.1 才输出 Wrangler 控制台验证码；其他情况一律调用邮件绑定，不信任 Host/X-Forwarded-Host 覆盖。账号查询、验证码保存和发信统一由 `ctx.waitUntil` 执行，已开通与未开通邮箱的响应路径和内容一致，不等待邮件完成。生产分支调用 Cloudflare Email Service 的 `env.EMAIL.send({to,from,subject,text})`，要求 `EMAIL_FROM` 和邮件绑定；发送失败作废验证码，不降级输出生产验证码。生产发信域名配置和真实送达尚未联调，本阶段禁止连接线上账号。

参考：[Email Sending Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)、[Email 本地开发](https://developers.cloudflare.com/email-service/observability/local-development/sending/)。
