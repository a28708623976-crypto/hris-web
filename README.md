# PeopleOS · HRIS Pro

本阶段已实现本地后端：邮箱验证码登录、三角色权限、加密员工档案和私有附件。一个 Cloudflare Worker 同时提供前端页面和 `/api/*`，使用 Hono、本地 D1、本地 R2。没有部署或创建线上资源。

视觉基准仍为 [只读原型](prototype/peopleos_hris_pro.tsx)，员工自助多级表单保留此前授权的例外。合同、考勤、绩效、ATS 等没有新增业务后端；其中涉及员工变更的动作会调用员工接口，其余业务记录继续使用 mock。

## 第一次在本机启动

1. 打开 Mac「终端」，复制这一行后按回车：

   ```sh
   cd "/Users/acheng/Documents/Codex/HRIS Web"
   ```

2. 安装依赖（本机已安装过也可以执行）：

   ```sh
   npm install
   ```

3. 配置三个测试账号：

   ```sh
   npm run local:accounts
   ```

   终端会依次询问 HR 主管、部门负责人、普通员工的测试邮箱。每填一个按一次回车，三者使用不同邮箱。配置和随机密钥只保存在忽略提交的 `worker/.dev.vars` 中；更换账号时保留现有加密密钥。

4. 初始化本地测试数据：

   ```sh
   npm run db:reset
   ```

   这一步会清空**本地测试 D1**，写入原型的 12 名测试员工和三个账号。已有本地修改会被清除，日常启动不必重复执行。员工附件索引也随员工删除；不会操作线上数据库或桶。

5. 启动本地网站：

   ```sh
   npm run dev
   ```

   等待终端出现 `Ready` 或本地地址。保持这个终端窗口运行，在浏览器打开 **http://localhost:8787**。`npm run dev:worker` 是相同的启动方式。若 8787 被占用，以终端实际显示的本地地址为准。

   本地验收使用 Chrome，建议也用 Chrome 打开上述地址。

6. 登录：输入第 3 步设置的任一邮箱，点击「获取验证码」。回到正在运行服务的终端，找到 `[DEV login]` 行，把 `code=` 后面的六位数字复制到网页，点击「验证并登录」。**本地不发送真实邮件**，无需检查收件箱。只有已配置账号会打印验证码；同一邮箱一分钟只能申请一次。

7. 测试员工权限：HR 主管账号可以新增/编辑；普通员工只看到自己的档案和薪资；部门负责人没有员工档案菜单，员工 API 全部返回 403。使用右上角「退出登录」后，可以换另一个账号测试。

8. 测试附件：先保存员工档案，再打开详情 → 编辑档案资料 → 资料附件。支持 JPEG/JPG/PNG/PDF/DOC/DOCX、单文件至多 50MB；点击已归档文件名会经鉴权下载。普通员工可以下载本人附件，不能上传或修改。

以后启动只需要第 1、5、6 步。停止服务：回到终端按 **Control+C**。不要删除或随意更换 `worker/.dev.vars` 中的加密密钥，否则旧密文无法读取；本地测试库确需重新开始时再执行第 4 步。

## 测试与记录

```sh
npm run build
npm test
npm run test:worker
npm run check:routes
npm run check:browser
npm run check:private
```

浏览器脚本自行启动独立的本地 Worker/D1/R2 测试实例，无需另外运行 Vite；测试数据库在忽略目录 `worker/.test/`，不会重置日常开发用的 `worker/.local/`。需要本机 Chrome；检查脚本使用单独的浏览器配置。

- [本阶段完整验收](qa/backend/VERIFICATION.md)
- [Worker 接口、存储和安全说明](worker/README.md)
- [历史前端原型验收索引](qa/VERIFICATION.md)

`shared/` 保存前后端共用的 Zod 校验、日期与附件规则。`worker/migrations/` 管理 D1 结构，`worker/scripts/` 提供固定使用 `--local` 的初始化脚本。项目没有部署脚本，请勿执行 Wrangler login、deploy、资源 create 或 `--remote` 命令。
