# PeopleOS 本地后端

仅本地运行，无部署脚本，无 Cloudflare 账号 ID。D1 使用本地占位 ID，Wrangler 所有运行/迁移命令明确使用 `--local`，EMAIL 绑定 `remote:false`。不要执行 login、deploy、create 或 `--remote`。

登录：已有 users 邮箱才发验证码；开发模式只在 Wrangler 控制台打印。生产分支必须使用 Cloudflare Email Service 的 `env.EMAIL.send({to,from,subject,text})`，发送失败会作废验证码且保持相同公开响应，不能降级打印验证码。生产发信需要未来单独配置发信域名和 EMAIL_FROM，本阶段不连接或验证线上账号。

验证码以带服务端密钥的 HMAC-SHA256 保存，10 分钟、最多五次错误、单次消费。会话令牌使用 256 位随机值，只存 SHA256，HttpOnly/Secure/SameSite=Lax Cookie 有效七天。限流通过本地 D1 单条条件插入判断邮箱/可信 IP 的滑动窗口，未知邮箱使用相同限流和响应。

接口与静态文件同源。API 禁止跨来源写入并设置 no-store，不需要 CORS。`AUTH_SECRET`、`ENCRYPTION_KEY`、测试账号环境变量只能在忽略的 `worker/.dev.vars` 中；不得提交该文件或本地数据库。

Email Service 接口参考：https://developers.cloudflare.com/email-service/api/send-emails/workers-api/ 。本地绑定参考：https://developers.cloudflare.com/email-service/observability/local-development/sending/ 。
