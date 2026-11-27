import { HTTPException } from "hono/http-exception";
import { attachments } from "./attachments";
import { employees } from "./employees";
import { employeeAccess } from "./permissions";
import { Hono } from "hono";
import { auth, requireSession } from "./auth";
import type { AppEnv } from "./env";
export const app = new Hono<AppEnv>();
app.use("*", async (c, next) => {
  const raw = new URL(c.req.url).pathname;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return c.json({ error: "接口不存在" }, 404);
  }
  if (
    /^\/+api(?:\/|$)/i.test(decoded) &&
    (raw !== decoded || !raw.startsWith("/api/") || raw.includes("//"))
  )
    return c.json({ error: "接口不存在" }, 404);
  await next();
});
app.use("/api/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  c.header("X-Content-Type-Options", "nosniff");
  const origin = c.req.header("Origin");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(c.req.method) &&
    origin &&
    origin !== new URL(c.req.url).origin
  )
    return c.json({ error: "来源不被允许" }, 403);
  await next();
});
app.route("/api/auth", auth);
app.use("/api/*", requireSession);
app.use("/api/employees", employeeAccess);
app.use("/api/employees/*", employeeAccess);
app.route("/api/employees", attachments);
app.route("/api/employees", employees);
app.all("/api/*", (c) => c.json({ error: "接口不存在" }, 404));
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));
app.onError((error, c) => {
  if (error instanceof HTTPException)
    return c.json({ error: error.message }, error.status);
  console.error("API request failed", error.name);
  return c.json({ error: "服务暂不可用，请稍后重试" }, 500);
});
export default app;
