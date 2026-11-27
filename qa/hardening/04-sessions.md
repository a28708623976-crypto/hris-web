# 会话期限与全部设备注销

hr_lead 新会话的 Cookie Max-Age 和 D1 expires_at 都为 24 小时，其他角色为 7 天。每次鉴权同时检查 created_at 的角色上限，已有七天 HR 会话也不能在 24 小时后继续使用。

新增 POST /api/auth/logout-all，通过当前会话识别用户，只删除该用户全部 sessions，并清除 Cookie；不信任请求体 user_id，不增加前端按钮。

构建及全部 30 组后端测试通过，含三个角色期限、旧长效 HR 会话、同用户多设备注销、其他用户会话保留及未登录 401。
