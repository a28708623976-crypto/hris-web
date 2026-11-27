import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import type { AppEnv, User } from "./env";
import { hash, keyedHash, newCode, randomToken } from "./crypto";
export const COOKIE = "__Host-peopleos";
const emailSchema = z.string().trim().toLowerCase().email().max(254);
const success = {
  success: true,
  message: "如该邮箱已开通账号，验证码将发送至邮箱。",
};
export const requireSession = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, COOKIE);
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return c.json({ error: "请先登录" }, 401);
  const tokenHash = await hash(token);
  const user = await c.env.DB.prepare(
    `SELECT u.id,u.email,u.role,u.employee_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1`,
  )
    .bind(tokenHash, Date.now())
    .first<User>();
  if (!user) return c.json({ error: "登录已过期，请重新登录" }, 401);
  c.set("user", user);
  c.set("tokenHash", tokenHash);
  await next();
});
export const auth = new Hono<AppEnv>();
auth.post("/request-code", async (c) => {
  const parsed = emailSchema.safeParse(
    (await c.req.json().catch(() => ({})))?.email,
  );
  if (!parsed.success) return c.json({ error: "请输入有效邮箱" }, 400);
  const email = parsed.data,
    now = Date.now();
  const emailHash = await keyedHash(c.env.AUTH_SECRET, "email:" + email);
  // CF-Connecting-IP is supplied by Cloudflare. Local requests share the loopback bucket.
  const ipHash = await keyedHash(
    c.env.AUTH_SECRET,
    "ip:" + (c.req.header("CF-Connecting-IP") || "local"),
  );
  const rate = await c.env.DB.prepare(
    `INSERT INTO auth_rate_events(email_hash,ip_hash,created_at)
    SELECT ?,?,? WHERE
    (SELECT COUNT(*) FROM auth_rate_events WHERE email_hash=? AND created_at>?)<1 AND
    (SELECT COUNT(*) FROM auth_rate_events WHERE email_hash=? AND created_at>?)<5 AND
    (SELECT COUNT(*) FROM auth_rate_events WHERE ip_hash=? AND created_at>?)<20`,
  )
    .bind(
      emailHash,
      ipHash,
      now,
      emailHash,
      now - 60000,
      emailHash,
      now - 3600000,
      ipHash,
      now - 3600000,
    )
    .run();
  if (!rate.meta.changes)
    return c.json({ error: "请求过于频繁，请稍后重试" }, 429);
  // Keep the foreground path identical: account lookup, code storage and mail
  // all run after scheduling for both existing and unknown addresses.
  c.executionCtx.waitUntil(
    (async () => {
      const user = await c.env.DB.prepare(
        "SELECT id FROM users WHERE email=? AND active=1",
      )
        .bind(email)
        .first();
      if (user) {
        const code = newCode(),
          nonce = randomToken();
        const codeHash = await keyedHash(
          c.env.AUTH_SECRET,
          `${emailHash}:${nonce}:${code}`,
        );
        await c.env.DB.prepare(
          `INSERT INTO auth_codes(email_hash,code_hash,nonce,expires_at) VALUES(?,?,?,?)
      ON CONFLICT(email_hash) DO UPDATE SET code_hash=excluded.code_hash,nonce=excluded.nonce,expires_at=excluded.expires_at,attempts=0,used_at=NULL`,
        )
          .bind(emailHash, codeHash, nonce, now + 600000)
          .run();
        if (c.env.ENV === "dev")
          console.log(`[DEV login] ${email} code=${code} (10 minutes)`);
        else {
          try {
            if (!c.env.EMAIL_FROM || !c.env.EMAIL)
              throw new Error("Email Service not configured");
            await c.env.EMAIL.send({
              to: email,
              from: c.env.EMAIL_FROM,
              subject: "PeopleOS 登录验证码",
              text: `您的验证码是 ${code}，10 分钟内有效。请勿向他人透露。`,
            });
          } catch {
            await c.env.DB.prepare(
              "UPDATE auth_codes SET used_at=? WHERE email_hash=? AND nonce=?",
            )
              .bind(Date.now(), emailHash, nonce)
              .run();
            // Keep the same response for existing and unknown users. Never log a production code/address.
            console.error("Email Service delivery failed");
          }
        }
      }
    })().catch(() => {
      console.error("Authentication delivery task failed");
    }),
  );
  return c.json(success);
});
auth.post("/verify", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (!body || typeof body !== "object")
    return c.json({ error: "验证码无效或已过期" }, 400);
  const email = emailSchema.safeParse(body.email);
  if (!email.success || typeof body.code !== "string")
    return c.json({ error: "验证码无效或已过期" }, 400);
  const emailHash = await keyedHash(c.env.AUTH_SECRET, "email:" + email.data),
    now = Date.now();
  const record = await c.env.DB.prepare(
    "SELECT nonce FROM auth_codes WHERE email_hash=?",
  )
    .bind(emailHash)
    .first<{ nonce: string }>();
  const codeHash = await keyedHash(
    c.env.AUTH_SECRET,
    `${emailHash}:${record?.nonce || ""}:${body.code}`,
  );
  const result = await c.env.DB.prepare(
    `UPDATE auth_codes SET attempts=attempts+1,
    used_at=CASE WHEN code_hash=? OR attempts+1>=5 THEN ? ELSE NULL END
    WHERE email_hash=? AND used_at IS NULL AND expires_at>? AND attempts<5 RETURNING code_hash`,
  )
    .bind(codeHash, now, emailHash, now)
    .first<{ code_hash: string }>();
  if (!result || result.code_hash !== codeHash || !/^\d{6}$/.test(body.code))
    return c.json({ error: "验证码无效或已过期" }, 400);
  const user = await c.env.DB.prepare(
    "SELECT id FROM users WHERE email=? AND active=1",
  )
    .bind(email.data)
    .first<{ id: string }>();
  if (!user) return c.json({ error: "验证码无效或已过期" }, 400);
  const token = randomToken();
  await c.env.DB.prepare(
    "INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)",
  )
    .bind(await hash(token), user.id, now, now + 7 * 86400000)
    .run();
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 86400,
  });
  return c.json({ success: true });
});
auth.use("*", requireSession);
auth.get("/me", (c) => c.json({ user: c.get("user") }));
auth.post("/logout", async (c) => {
  await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash=?")
    .bind(c.get("tokenHash"))
    .run();
  deleteCookie(c, COOKIE, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "Lax",
  });
  return c.json({ success: true });
});
