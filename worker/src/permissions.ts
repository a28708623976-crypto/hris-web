import { createMiddleware } from "hono/factory";
import type { AppEnv, User } from "./env";
export function canReadEmployee(user: User, employeeId: string) {
  return (
    user.role === "hr_lead" ||
    (user.role === "employee" && user.employee_id === employeeId)
  );
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
