# PeopleOS 生产部署手册（供之后手动执行）

本次工作只准备文件，**没有登录 Cloudflare、部署或创建线上资源**。下面标为「线上」的步骤将访问或修改你的 Cloudflare 账号，只有你决定正式上线后才执行。不要把整篇文档一次性粘贴到终端；按编号逐步操作。

适用环境：Mac 默认的终端 / zsh、Node.js 24、项目已下载到本机。每段代码复制后按回车；命令成功后再进入下一步。所有命令从项目根目录执行。生产配置是 `worker/wrangler.production.jsonc`，本地配置是 `worker/wrangler.jsonc`，不要混用。

本次可上线的真实后端只有登录、权限、员工档案和私有附件；合同、考勤、绩效、ATS 等仍保留现有模拟业务数据。首个账号仅有自己的测试档案，上线后需要替换测试资料。

## 1. 打开项目并完成本地检查（离线）

**做什么：** 打开「终端」，进入项目并安装锁定版本的依赖。如果项目放在别处，请调整第一行路径。

**复制命令：**

```sh
cd "/Users/acheng/Documents/Codex/HRIS Web"
npm ci
npm run deploy:check
```

**成功时：** 看到 Vite 构建完成，以及「生产配置检查通过（模板模式，仅本地检查，未部署）」。构建的包大小警告不代表构建失败。

**失败怎么办：** `node: command not found` 时先安装 Node.js 24 再重开终端；`ENOENT package.json` 表示进入了错误目录；其他红色报错先解决再继续，不要跳过检查。此时生产配置仍有占位符是正常的，模板模式允许它们。

## 2. 登录 Cloudflare（线上，只在决定上线后做）

**做什么：** 让 Wrangler 获得你的账号授权。选择持有目标域名的账号。

**复制命令：**

```sh
npx wrangler login
```

**成功时：** 浏览器出现授权页，确认后终端提示已成功登录。

**失败怎么办：** 浏览器没打开时，复制终端给出的授权链接到自己的浏览器。授权失败先核对账号；不要把授权链接、令牌或登录后的配置发给别人。多账号场景在后续命令出现账号选择时始终选择同一个账号，不要凭猜测继续。

## 3. 创建 D1 数据库和私有 R2 桶（线上）

**做什么：** 创建全新的生产存储。这里不使用本地种子数据库，也不导入 12 名示例员工。

**复制命令：**

```sh
npx wrangler d1 create peopleos-hris --config worker/wrangler.production.jsonc --update-config=false
npx wrangler r2 bucket create peopleos-hris-attachments --config worker/wrangler.production.jsonc
```

**成功时：** 第一条显示数据库已创建，并输出 `database_id`；把这串 ID 暂存，下一步会填入配置。第二条显示桶创建成功。若询问是否自动修改配置，选择不修改，按第 4 步手动填写。

**失败怎么办：** 提示同名资源已存在时，停止并到控制台确认它确实是本项目、此账号下的目标资源，不能删掉重建。R2 要求开通服务或账单时，先在控制台处理；权限不足则检查账号权限。**不要开启 R2 的 r2.dev 公网访问，也不要给桶配置公开域名。**

## 4. 填写生产配置（离线编辑）

**做什么：** 用代码编辑器打开 `worker/wrangler.production.jsonc`，填写三处信息。

| 当前内容                                     | 替换成什么                                        |
| -------------------------------------------- | ------------------------------------------------- |
| `database_id` 的 `REPLACE_WITH_D1_ID`        | 第 3 步输出的数据库 ID                            |
| `routes[0].pattern` 的 `REPLACE_WITH_DOMAIN` | HRIS 访问域名，只填主机名，不带 `https://` 或 `/` |
| `EMAIL_FROM` 的 `login@REPLACE_WITH_DOMAIN`  | 自己已验证发信域名下的发件地址，验证见第 5 步     |

访问域名可以是专用子域名，发信域名可以是你验证的另一子域或根域，二者不必相同。不要把域名替换成实际的 HR 收信邮箱。保留 `ENV: "production"`、资源绑定名、`custom_domain: true` 和静态资源设置。不要添加 `remote: false`，不要把 `AUTH_SECRET`、`ENCRYPTION_KEY` 写到这个文件。

**复制命令（保存后检查）：**

```sh
npm run deploy:check -- --strict
```

**成功时：** 显示「生产配置检查通过（严格模式，仅本地检查，未部署）」。注意 `-- --strict` 中两个 `--` 都要保留。

**失败怎么办：** 提示占位符时，查找整个配置中的 `REPLACE_WITH` 并替换；提示 ENV 或 remote 时，恢复上面的要求；提示 JSONC 格式错误时检查引号、括号。检查只验证本地配置和构建产物，**不会验证真实 ID、域名归属或线上权限**。

## 5. 验证 Cloudflare Email Sending 发信域名（线上）

**做什么：** 在 Cloudflare 控制台进入 **Compute → Email Service → Email Sending → Onboard Domain**，选择自己使用 Cloudflare DNS 的域名。按照控制台提示核对并添加发信验证 DNS 记录，等待域名验证完成。使用 Email Sending，不是仅配置收信转发。

**复制命令（域名验证完成、EMAIL_FROM 保存后）：**

```sh
npm run deploy:check -- --strict
```

**成功时：** 控制台的域名已通过验证，本地严格检查通过。`send_email` 的绑定名保持 `EMAIL`，`EMAIL_FROM` 的地址必须属于已接入的发信域名。若使用 Workers Free，先在 Email Service 中添加并验证将作为 HR 账号的收件地址，套餐的收件人限制以控制台为准。

**失败怎么办：** DNS 未验证时等待解析并核对控制台要求的记录，避免覆盖公司已有邮件记录；账号没有 Email Sending 入口、未开通或套餐限制发送时先解决开通/额度问题。不要改成 `ENV=dev`，生产环境不会把验证码打印出来。严格检查通过也不代表邮件已经能送达，部署后必须测试真实收信。

参考：[官方发信入门](https://developers.cloudflare.com/email-service/get-started/send-emails/)、[发信绑定与地址限制](https://developers.cloudflare.com/email-service/configuration/send-bindings/)。

## 6. 生成并独立备份两把生产密钥（离线）

**做什么：** 生成全新的生产密钥，不复用 `worker/.dev.vars`。下面整段只创建受保护的本地文件，不显示密钥、不访问线上；文件已在 Git 忽略范围内。

**复制命令（整段一起复制）：**

```sh
node --input-type=module <<'NODE'
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('worker/.local', { recursive: true, mode: 0o700 });
const text = 'AUTH_SECRET=' + randomBytes(32).toString('hex') + '\n'
  + 'ENCRYPTION_KEY=' + randomBytes(32).toString('base64') + '\n';
writeFileSync('worker/.local/production-secrets.env', text, { flag: 'wx', mode: 0o600 });
console.log('密钥文件已生成。请先独立安全备份；没有显示密钥，也没有设置线上密钥。');
NODE
```

**成功时：** 显示「密钥文件已生成」。通过自己信任的本地编辑器打开 `worker/.local/production-secrets.env`，将两把密钥保存到独立的密码管理器加密保险库或加密离线备份，确认备份可读后再继续。不要用会分享内容的协作编辑器。

**失败怎么办：** `EEXIST` 表示文件已存在，不会覆盖；先确认这是不是已经使用的生产密钥。**已使用的密钥不要重新生成或覆盖**。若仅是首次生成失败留下的未使用文件，也应先安全移走再重试。

**ENCRYPTION_KEY 一旦丢失，加密数据永久无法解密。Cloudflare 的数据库备份、Time Travel 和 SQL 导出都不能替你找回它。必须单独备份到安全的地方，且不要发给任何人，包括聊天、邮件、截图或问题反馈。** 不要提交密钥文件、SQL 文件、真实 HR 邮箱或其他私有资料到 Git。本地明文文件权限为 600，但它本身不是独立备份。

`AUTH_SECRET` 同样应保管；更换会使未完成的验证码无法校验。更换 `ENCRYPTION_KEY` 需要数据迁移，不能简单生成新值再覆盖。

## 7. 把同一组密钥设置到 Worker（线上）

**做什么：** 先将第 6 步的密钥加载到当前终端环境，再通过 stdin 设置 Worker secrets，避免把密钥写入命令历史。此后生成首个账号 SQL 也必须使用这一组密钥。

**复制命令：**

```sh
set -a
source worker/.local/production-secrets.env
set +a
printf '%s' "$AUTH_SECRET" | npx wrangler secret put AUTH_SECRET --config worker/wrangler.production.jsonc
printf '%s' "$ENCRYPTION_KEY" | npx wrangler secret put ENCRYPTION_KEY --config worker/wrangler.production.jsonc
```

**成功时：** 两条分别提示 secret 上传成功。首次没有名为 `peopleos-hris` 的 Worker 时，Wrangler 可能询问是否创建该 Worker；确认账号和名称正确后输入 `y`。这一步会写入线上配置，业务代码仍需第 10 步部署。密钥值不应显示在命令输出中。

**失败怎么办：** 检查配置里的 Worker 名称、账号权限和密钥文件路径；不要把报错时的终端环境变量或整个密钥文件发给别人。若重开终端，先重新运行上面的三行加载命令，再继续第 9 步。不要从开发用的 `.dev.vars` 加载值，也不要在密钥文件里添加 `ENV=dev`。

## 8. 执行线上数据库迁移（线上）

**做什么：** 在第 3 步创建的空库建立表结构。这里明确使用生产配置和 `--remote`。

**复制命令：**

```sh
npx wrangler d1 migrations apply DB --config worker/wrangler.production.jsonc --remote
```

**成功时：** 显示待执行迁移列表；确认数据库确实是 `peopleos-hris` 后接受提示，最后迁移全部成功。目前为 0001 至 0006。以后若已有业务数据，执行任何新迁移前先按第 13 步备份。

**失败怎么办：** ID 不存在时回到第 4 步核对；权限失败检查账号；SQL 失败保留迁移名和错误，不要删除数据库或随意删迁移记录，不要用本地 `db:reset` / `db:seed` 替代此步骤。

## 9. 生成并导入首个 HR 账号（先离线生成，再线上导入）

**做什么：** 输入自己能收信的 HR 邮箱和姓名，生成 SQL。下面输入的资料只保存到忽略的本地 SQL，不写进项目源代码。此脚本**不会**连接数据库、发邮件或执行线上命令。

**复制命令：**

```sh
printf '请输入 HR 登录邮箱：'
read -r HR_EMAIL
printf '请输入 HR 姓名：'
read -r HR_NAME
node worker/scripts/prod-bootstrap.mjs --email "$HR_EMAIL" --name "$HR_NAME"
```

**成功时：** 显示 SQL 路径 `worker/.local/prod-bootstrap.sql`，以及「未连接数据库或线上服务」。文件只含一条员工档案 `EMP001`、对应的 `hr_lead` 账号和工号序列推进，下次新建员工从 `EMP002` 开始。除邮箱姓名外是测试资料，薪资为 0，证件/银行卡为空，需在登录后补正。密钥不写进 SQL，敏感字段按现有 AES-GCM 逻辑加密。

**失败怎么办：** 提示密钥缺失时回到第 7 步重新加载环境；参数错误时重新输入有效邮箱和姓名；文件已存在时不会覆盖，先确认旧文件是否已导入，再安全移走未使用的旧文件或用 `--output worker/.local/新的文件名.sql` 生成。不要重新生成生产密钥来解决此类错误。

**接着确认线上库为空，复制命令：**

```sh
npx wrangler d1 execute DB --config worker/wrangler.production.jsonc --remote --command "SELECT (SELECT COUNT(*) FROM employees) AS employees, (SELECT COUNT(*) FROM users) AS users;"
```

**成功时：** `employees`、`users` 都为 `0` 才能进行下面导入。如果不是 0，停止：这不是全新初始化，不要重复导入，也不要删数据清空。

**失败怎么办：** 表不存在先完成第 8 步；账号或数据库错误先核对生产配置。

**仅在两个计数都为 0 时复制：**

```sh
npx wrangler d1 execute DB --config worker/wrangler.production.jsonc --remote --file worker/.local/prod-bootstrap.sql
npx wrangler d1 execute DB --config worker/wrangler.production.jsonc --remote --command "SELECT (SELECT COUNT(*) FROM employees) AS employees, (SELECT COUNT(*) FROM users WHERE role='hr_lead') AS hr_leads;"
```

**成功时：** 导入成功，第二条查询显示 `employees=1`、`hr_leads=1`。这些是唯一业务记录，没有导入 12 人示例。SQL 不是幂等脚本，只执行一次，不会覆盖已有账号。

**失败怎么办：** 重复工号/账号冲突先停止并检查计数，不要改成 `INSERT OR REPLACE`。若出现部分执行或不确定是否成功，先查计数和当前库状态再处理，不要盲目重跑。后续解密失败通常是生成 SQL 与 Worker 的 `ENCRYPTION_KEY` 不同，需找回原密钥，不能靠生成新密钥修复。

## 10. 部署应用（线上）

**做什么：** 发布当前前端静态页面和 Worker API，配置中的自定义域名也会随部署创建/更新。

**复制命令：**

```sh
npm run deploy
```

**成功时：** 先看到构建完成、严格配置检查通过，再看到 Wrangler 发布 `peopleos-hris` 和对应域名的提示。严格检查失败时，后面的部署不会执行。

**失败怎么办：** 本地检查失败回到第 4 步；Cloudflare 权限、绑定或域名冲突按明确错误处理。不要绕过检查直接执行 `wrangler deploy`，不要为了通过检查把生产配置改成开发模式。

## 11. 确认自定义域名与 HTTPS（线上）

**做什么：** 在 Cloudflare 的 **Workers & Pages → peopleos-hris → Settings → Domains & Routes**，确认第 4 步填写的自定义域名存在。它是 `custom_domain: true`，由部署配置管理，无需再添加带 `/*` 的路由。如果需要在控制台手动添加，选择 Add → Custom domain，并把同一个主机名保持在生产配置中，避免下次部署覆盖设置。域名必须属于当前账号管理的 Cloudflare zone。

**复制命令（先在自己终端输入访问域名）：**

```sh
printf '请输入 HRIS 访问域名（不带 https://）：'
read -r HRIS_DOMAIN
curl -I "https://$HRIS_DOMAIN/"
```

**成功时：** HTTPS 返回 200，浏览器打开 `https://你的域名` 能看到登录页。`workers_dev` 已关闭，以自定义域名访问为准。

**失败怎么办：** 域名不在列表先检查部署是否成功；证书处理中先等待；同名 DNS 已用于其他服务时不要直接删除，先确认不会影响现有服务，必要时换一个专用子域名并修改生产配置后重做严格检查与部署。TLS/域名错误先解决再做登录测试。

参考：[官方 Custom Domains 配置](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)。

## 12. 部署后的逐项验证（浏览器操作与只读检查）

**做什么：** 验证线上环境和真实邮件，不能只以「部署成功」当作验收。

**复制命令（退出登录后运行，无需 Cookie）：**

```sh
curl -i "https://$HRIS_DOMAIN/api/auth/me"
curl -i "https://$HRIS_DOMAIN/api/employees"
```

**成功时：** 两条未登录请求都返回 `401`。然后在浏览器按下表逐项操作。

| 操作                                         | 成功时应该看到什么                           | 失败怎么办                                                                                                                    |
| -------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 输入第 9 步 HR 邮箱申请验证码                | 收到真实邮件，10 分钟内可用                  | 查垃圾邮件、EMAIL_FROM、域名验证、收件人套餐限制及账号拼写；请求成功响应不代表已有账号或送达。等待至少 1 分钟再申请，避免限流 |
| 输入验证码登录                               | 进入 HR 页面，没有右上角角色切换器           | 核对使用最新验证码；同码不可复用，五次输错作废；不要连续重试刷限流                                                            |
| 员工档案列表及详情                           | 仅一条首个 HR 档案，详情可打开，测试薪资为 0 | 出现解密错误先核对密钥来源和备份，不要覆盖线上 ENCRYPTION_KEY                                                                 |
| 编辑首个档案并刷新页面                       | 修改仍保留                                   | 查看页面错误提示、账号权限与字段校验；暂不添加真实敏感数据，先完成验收                                                        |
| 在档案资料附件中上传小型测试 PDF/PNG，再下载 | 上传成功，刷新后仍可下载                     | 核对 R2 绑定、文件格式和 50MB 限制；不要开放桶公网权限解决问题                                                                |
| 复制附件鉴权接口地址，在未登录的隐私窗口打开 | 返回 401，不能下载                           | 立即暂停使用并排查鉴权，不能把附件公网链接当替代方案                                                                          |
| 点击退出，再打开档案页                       | 回到登录页，未登录接口返回 401               | 清理旧页面后重新确认 Cookie 和退出接口；不能仅凭前端跳转判断注销成功                                                          |

**失败怎么办：** 任一权限、持久化或附件私有性验证失败，先停止导入真实员工资料。反馈错误时不要附密钥、完整 Cookie、验证码、员工敏感资料或整份 SQL。生产代码不会打印验证码；Cloudflare 日志可查通用发送错误，但不要尝试开启开发打印。

## 13. 备份：D1 导出、恢复点和 R2 附件（线上只读导出）

**做什么：** 每次迁移/升级前保存 D1 导出和当前 Time Travel bookmark。导出文件虽然包含加密字段，仍有未加密的姓名/邮箱等资料，也必须安全保存。文件名自动带时间，避免覆盖。

**复制命令：**

```sh
mkdir -p worker/.local/backups
npx wrangler d1 export DB --config worker/wrangler.production.jsonc --remote --output "worker/.local/backups/d1-$(date +%Y%m%d-%H%M%S).sql"
npx wrangler d1 time-travel info DB --config worker/wrangler.production.jsonc
```

**成功时：** 显示导出成功，备份文件非空；第二条输出当前 bookmark，把它和此次代码提交号、备份时间、使用的密钥版本保存在自己的安全运维记录里，不能记录密钥值。将 SQL 复制到独立加密备份位置，定期在隔离环境演练恢复，不要只留本机一份。

**失败怎么办：** 导出失败不得把空文件当备份；先核对空间、权限和数据库。Time Travel 的历史窗口取决于套餐（目前 Free 7 天、Paid 30 天），超出窗口不能依靠它恢复，需长期保留独立备份。D1 导出和 Time Travel **不包含 R2 文件和 Worker secrets**；附件原文件也需要单独安全备份，少量验收附件可通过登录后的档案下载留存，后续正式使用前另行建立私有 R2 备份流程。

参考：[D1 导出命令](https://developers.cloudflare.com/d1/wrangler-commands/)、[Time Travel 官方说明](https://developers.cloudflare.com/d1/reference/time-travel/)。

## 14. 回滚：先确认影响，再恢复（线上，会覆盖数据）

**做什么：** 仅代码问题优先在 **Workers & Pages → peopleos-hris → Deployments** 选择上一版稳定部署回滚；先确认旧代码兼容当前数据库结构。代码回滚不会撤销数据库迁移。数据库误改则先停止业务写入，按第 13 步导出当前状态、记录当前 bookmark，再选择明确的旧恢复点。

**复制命令（先查询，不恢复）：**

```sh
npx wrangler d1 time-travel info DB --config worker/wrangler.production.jsonc
```

**成功时：** 显示当前 bookmark；妥善保存，可用于撤销一次不正确的恢复。接下来输入之前保存、确定要恢复到的旧 bookmark：

```sh
printf '请输入要恢复到的旧 bookmark（会覆盖当前数据库）：'
read -r RESTORE_BOOKMARK
npx wrangler d1 time-travel restore DB --config worker/wrangler.production.jsonc --bookmark "$RESTORE_BOOKMARK"
```

**成功时：** Wrangler 明确提示会覆盖整个数据库；确认目标数据库、时间点和业务影响后才输入 `y`。完成后显示恢复成功和可撤销本次恢复的 bookmark。重新做第 12 步验证；必要时用恢复前保存的 bookmark 撤销错误回滚。

**失败怎么办：** 恢复点已过期、权限错误或目标时间不确定时停止，不要猜测 bookmark。需要从 SQL 长期备份恢复时，先在隔离的新 D1 验证表结构、记录数量、加密解密和附件索引，再制定切换方案，不要直接把包含建表语句的完整导出灌进当前生产库。Time Travel 会取消在途查询，也不会找回已删除/替换的 R2 附件；R2 必须从独立附件备份恢复。没有对应的 ENCRYPTION_KEY，任何数据库恢复都无法恢复敏感明文。

## 本次尚未验证的线上条件

这份手册依据当前项目与官方文档编写，没有连接你的账号。真实 D1 ID、域名归属、Cloudflare 账号权限/套餐、Email Sending 开通及收信限制、DNS 验证、真实邮件送达、线上迁移/部署/回滚均需你之后按步骤验证。本地构建和自动化测试不能替代这些线上验收。
