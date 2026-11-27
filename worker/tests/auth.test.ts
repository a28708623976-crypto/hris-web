import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { app } from "../src/index";
import { hash, keyedHash } from "../src/crypto";
import type { Env } from "../src/env";
const email =
  process.env.SEED_HR_EMAIL || `auth-${crypto.randomUUID()}@example.invalid`;
const secret = crypto.randomUUID() + crypto.randomUUID();
const mf = new Miniflare(
  convertV4MiniflareOptions({
    workers: [
      {
        name: "auth-test",
        modules: true,
        script: 'export default {fetch(){return new Response("test")}}',
        compatibilityDate: "2026-11-26",
        d1Databases: ["DB"],
      },
    ],
  }),
);
let env: Env;
before(async () => {
  const DB = await mf.getD1Database("DB");
  await DB.exec(
    readFileSync("worker/migrations/0001_auth.sql", "utf8").replace(/\n/g, " "),
  );
  env = { DB, ENV: "dev", AUTH_SECRET: secret } as Env;
  await DB.prepare("INSERT INTO users VALUES(?,?,?,?,1)")
    .bind("u-hr", email, "hr_lead", "EMP005")
    .run();
});
after(() => mf.dispose());
const call = (path: string, body?: unknown, cookie?: string) =>
  app.request(
    "https://local.test/api" + path,
    {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
    env,
  );
async function code() {
  await env.DB.exec("DELETE FROM auth_rate_events");
  let value = "";
  const log = console.log;
  console.log = (line: unknown) => {
    value = String(line).match(/code=(\d{6})/)?.[1] || value;
  };
  try {
    assert.equal((await call("/auth/request-code", { email })).status, 200);
  } finally {
    console.log = log;
  }
  assert.match(value, /^\d{6}$/);
  return value;
}
test("unauthenticated and identical request-code responses", async () => {
  assert.equal((await call("/auth/me")).status, 401);
  const c = await code();
  const known = await call("/auth/request-code", {
    email: "unknown-" + crypto.randomUUID() + "@example.invalid",
  });
  assert.equal(known.status, 200);
  assert.deepEqual(await known.json(), {
    success: true,
    message: "如该邮箱已开通账号，验证码将发送至邮箱。",
  });
  const row = await env.DB.prepare("SELECT code_hash FROM auth_codes").first<{
    code_hash: string;
  }>();
  assert.notEqual(row?.code_hash, c);
});
test("expiry, fifth failure and one use", async () => {
  let c = await code();
  await env.DB.exec("UPDATE auth_codes SET expires_at=0");
  assert.equal((await call("/auth/verify", { email, code: c })).status, 400);
  c = await code();
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await call("/auth/verify", {
          email,
          code: c === "000000" ? "111111" : "000000",
        })
      ).status,
      400,
    );
  assert.equal((await call("/auth/verify", { email, code: c })).status, 400);
  c = await code();
  const response = await call("/auth/verify", { email, code: c });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=604800/);
  assert.equal((await call("/auth/verify", { email, code: c })).status, 400);
  const session = await env.DB.prepare(
    "SELECT token_hash FROM sessions",
  ).first<{ token_hash: string }>();
  const token = cookie.match(/=([^;]+)/)![1];
  assert.equal(session?.token_hash, await hash(token));
  assert.notEqual(session?.token_hash, token);
  assert.equal((await call("/auth/me", undefined, cookie)).status, 200);
  assert.equal((await call("/auth/logout", {}, cookie)).status, 200);
  assert.equal((await call("/auth/me", undefined, cookie)).status, 401);
});
test("email minute/hour and IP hour limits (database time windows)", async () => {
  await code();
  assert.equal((await call("/auth/request-code", { email })).status, 429);
  await env.DB.exec("DELETE FROM auth_rate_events");
  const eh = await keyedHash(secret, "email:" + email),
    ip = await keyedHash(secret, "ip:local");
  for (let i = 0; i < 5; i++)
    await env.DB.prepare(
      "INSERT INTO auth_rate_events(email_hash,ip_hash,created_at) VALUES(?,?,?)",
    )
      .bind(eh, ip, Date.now() - 120000 - i * 60000)
      .run();
  assert.equal((await call("/auth/request-code", { email })).status, 429);
  await env.DB.exec("DELETE FROM auth_rate_events");
  for (let i = 0; i < 20; i++)
    await env.DB.prepare(
      "INSERT INTO auth_rate_events(email_hash,ip_hash,created_at) VALUES(?,?,?)",
    )
      .bind("different" + i, ip, Date.now() - 120000)
      .run();
  assert.equal((await call("/auth/request-code", { email })).status, 429);
});
test("production must call EMAIL and never log code; failed send invalidates code", async () => {
  await env.DB.exec("DELETE FROM auth_rate_events");
  let sent = 0,
    log = "";
  const old = console.log;
  console.log = (v: unknown) => {
    log += String(v);
  };
  env.ENV = "production";
  env.EMAIL_FROM = process.env.EMAIL_FROM || "sender@example.invalid";
  env.EMAIL = {
    send: async (message) => {
      assert.equal(message.to, email);
      assert.match(message.text, /\d{6}/);
      sent++;
    },
  };
  try {
    assert.equal((await call("/auth/request-code", { email })).status, 200);
    assert.equal(sent, 1);
    assert.equal(log, "");
  } finally {
    console.log = old;
    env.ENV = "dev";
  }
});
test("cross-origin mutation rejected", async () => {
  const r = await app.request(
    "https://local.test/api/auth/request-code",
    {
      method: "POST",
      headers: {
        origin: "https://other.test",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
    env,
  );
  assert.equal(r.status, 403);
});
test("concurrent code redemption has one winner and session expiry is enforced", async () => {
  const c = await code();
  const results = await Promise.all([
    call("/auth/verify", { email, code: c }),
    call("/auth/verify", { email, code: c }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
  const cookie = results
    .find((r) => r.status === 200)!
    .headers.get("set-cookie")!;
  await env.DB.exec("UPDATE sessions SET expires_at=0");
  assert.equal((await call("/auth/me", undefined, cookie)).status, 401);
});
test("production delivery failure never returns a code or leaves it valid", async () => {
  await env.DB.exec("DELETE FROM auth_rate_events");
  env.ENV = "production";
  env.EMAIL = {
    send: async () => {
      throw new Error("simulated");
    },
  };
  const old = console.error;
  let messages = "";
  console.error = (v: unknown) => {
    messages += String(v);
  };
  try {
    const r = await call("/auth/request-code", { email });
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), {
      success: true,
      message: "如该邮箱已开通账号，验证码将发送至邮箱。",
    });
    assert.equal(messages, "Email Service delivery failed");
    assert.ok(
      (
        await env.DB.prepare("SELECT used_at FROM auth_codes").first<{
          used_at: number;
        }>()
      )?.used_at,
    );
  } finally {
    console.error = old;
    env.ENV = "dev";
  }
});
