# 登录阶段

只新增本地 Worker、迁移和测试，现有页面未改。Hono / D1 / Email Service 绑定；静态文件由同一 Worker 提供。

`npm run build` 与 `npm run test:worker` 通过。7 组本地 D1 测试覆盖：未知邮箱相同响应、不返回验证码、验证码过期/复用/五次错误失效、并发兑换单次成功、七天 Cookie 属性、会话哈希/过期/注销、邮箱与 IP 限流、跨来源写入拒绝、生产 Email 绑定调用与失败作废。生产发送使用测试替身；没有发送真实邮件。

Wrangler 本地迁移只使用 `--local`，没有账号 ID 或远程资源绑定。所有凭证、环境文件、本地数据库已忽略。依赖当前 Miniflare 5 的兼容转换器运行真实本地 SQLite/D1，未使用假数据库。
