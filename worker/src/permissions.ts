import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import type { AppEnv, User } from "./env";
export function canReadEmployee(user: User, employeeId: string) {
  return (
    user.role === "hr_lead" ||
    (user.role === "employee" && user.employee_id === employeeId)
  );
}
export function assertCanAccessEmployee(
  user: User | undefined,
  employeeId: string,
): asserts user is User {
  if (!user) throw new HTTPException(401, { message: "请先登录" });
  if (!/^EMP\d{3,}$/.test(employeeId))
    throw new HTTPException(404, { message: "员工不存在" });
  if (!canReadEmployee(user, employeeId))
    throw new HTTPException(403, { message: "无员工档案权限" });
}
export function assertHrLead(user: User | undefined): asserts user is User {
  if (!user) throw new HTTPException(401, { message: "请先登录" });
  if (user.role !== "hr_lead")
    throw new HTTPException(403, { message: "无员工档案修改权限" });
}
export const employeeAccess = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  if (user.role === "dept_head")
    return c.json({ error: "无员工档案权限" }, 403);
  if (user.role !== "hr_lead") {
    const id = c.req.path.split("/")[3];
    if (c.req.method !== "GET" || (id && id !== user.employee_id))
      return c.json({ error: "只能查看本人档案" }, 403);
  }
  await next();
});
