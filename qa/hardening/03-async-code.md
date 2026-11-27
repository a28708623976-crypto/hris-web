# 验证码后台发送

邮箱/IP 限流之后，所有请求均通过 c.executionCtx.waitUntil 调度同一后台任务；账号查询、随机码、哈希落库和发信都不进入响应等待路径。未知邮箱同样调度，后台确认未开通后结束。发送失败仍只作废对应 nonce 的验证码，不输出生产验证码。

构建、全部 27 组后端测试通过。延迟邮件测试在发送 Promise 未解除时，已开通/未开通请求均先返回 200 且内容相等，只有已开通邮箱实际调用邮件绑定。

参考：https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil 。
