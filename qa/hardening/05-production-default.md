# 生产默认与本地开发双条件

wrangler.jsonc 默认 ENV=production。npm run dev / dev:worker 显式 --var ENV:dev；开发配置生成器不再写 ENV，并会清理旧 .dev.vars 的 ENV 行，保留密钥和邮箱。浏览器 QA 同样显式传开发参数。

auth.ts 只有 ENV=dev 且 URL hostname 为 localhost 或 127.0.0.1 才打印；不信任 Host/X-Forwarded-Host。其余请求都进入 EMAIL 发送路径（测试使用替身，不实发）。

构建及全部 31 组后端测试通过：直接读取生产配置，验证本地主机也不打印；开发环境的外部域、相似域、尾点域、IPv6 及伪造 Host 不打印，仅两个允许的本地主机打印。check:private 检查生产默认、开发参数及本地无 ENV 覆盖。

显式开发参数的真实 Wrangler 浏览器回归 68 项通过；本地 D1 已应用新增审计迁移，保留现有员工和日志，无线上操作。
