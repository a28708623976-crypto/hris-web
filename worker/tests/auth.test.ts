import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { app } from "../src/index";
import { hash, keyedHash, randomToken } from "../src/crypto";
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
const call = (path: string, body?: unknown, cookie?: string) => {
  const tasks: Promise<unknown>[] = [];
  const context = {
    waitUntil(task: Promise<unknown>) {
      tasks.push(task);
    },
    passThroughOnException() {},
    props: {},
  };
  return (async () => {
    const response = await app.request(
      "https://localhost/api" + path,
      {
        method: body === undefined ? "GET" : "POST",
        headers: {
          "content-type": "application/json",
          ...(cookie ? { cookie } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
      env,
      context,
    );
    await Promise.all(tasks);
    return response;
  })();
};
async function code(address = email) {
  await env.DB.exec("DELETE FROM auth_rate_events");
  let value = "";
  const log = console.log;
  console.log = (line: unknown) => {
    value = String(line).match(/code=(\d{6})/)?.[1] || value;
  };
  try {
    assert.equal(
      (await call("/auth/request-code", { email: address })).status,
      200,
    );
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
  assert.match(cookie, /Max-Age=86400/);
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
  env.EMAIL_FROM = process.env.EMAIL_FROM || randomToken() + "@example.invalid";
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

test("known and unknown request-code responses do not wait for mail delivery", async () => {
  await env.DB.exec("DELETE FROM auth_rate_events");
  let release!: (value: unknown) => void,
    started!: () => void,
    delivered = false,
    sends = 0;
  const startedPromise = new Promise<void>((resolve) => {
    started = resolve;
  });
  const delivery = new Promise((resolve) => {
    release = resolve;
  });
  env.ENV = "production";
  env.EMAIL_FROM = randomToken() + "@example.invalid";
  env.EMAIL = {
    send: async () => {
      sends++;
      started();
      await delivery;
      delivered = true;
    },
  };
  const tasks: Promise<unknown>[] = [];
  const context = {
    waitUntil(task: Promise<unknown>) {
      tasks.push(task);
    },
    passThroughOnException() {},
    props: {},
  };
  const request = (address: string) =>
    app.request(
      "https://local.test/api/auth/request-code",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: address }),
      },
      env,
      context,
    );
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const responses = await Promise.race([
      Promise.all([
        request(email),
        request(randomToken() + "@example.invalid"),
      ]),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("response waited for pending mail")),
          3000,
        );
      }),
    ]);
    assert.deepEqual(
      responses.map((response) => response.status),
      [200, 200],
    );
    assert.deepEqual(await responses[0].json(), await responses[1].json());
    assert.equal(tasks.length, 2);
    await startedPromise;
    assert.equal(delivered, false);
    assert.equal(sends, 1);
  } finally {
    if (timer) clearTimeout(timer);
    release(undefined);
    await Promise.all(tasks);
    env.ENV = "dev";
  }
});

test("session cookie and stored expiry are 24h for HR and 7d for other roles", async () => {
  for (const role of ["hr_lead", "dept_head", "employee"] as const) {
    const address =
      role === "hr_lead" ? email : randomToken() + "@example.invalid";
    if (role !== "hr_lead")
      await env.DB.prepare("INSERT INTO users VALUES(?,?,?,?,1)")
        .bind(role, address, role, role === "employee" ? "EMP001" : "EMP004")
        .run();
    const value = await code(address);
    const response = await call("/auth/verify", {
      email: address,
      code: value,
    });
    assert.equal(response.status, 200);
    const cookie = response.headers.get("set-cookie")!;
    const seconds = role === "hr_lead" ? 86400 : 604800;
    assert.ok(cookie.includes("Max-Age=" + seconds));
    const token = cookie.match(/=([^;]+)/)![1];
    const row = await env.DB.prepare(
      "SELECT created_at,expires_at FROM sessions WHERE token_hash=?",
    )
      .bind(await hash(token))
      .first<{ created_at: number; expires_at: number }>();
    assert.equal(row!.expires_at - row!.created_at, seconds * 1000);
  }
});
test("pre-existing long HR sessions are capped at 24h without affecting 7d users", async () => {
  for (const [id, status] of [
    ["u-hr", 401],
    ["employee", 200],
  ] as const) {
    const token = randomToken();
    await env.DB.prepare("INSERT INTO sessions VALUES(?,?,?,?)")
      .bind(
        await hash(token),
        id,
        Date.now() - 25 * 3600000,
        Date.now() + 6 * 86400000,
      )
      .run();
    assert.equal(
      (await call("/auth/me", undefined, "__Host-peopleos=" + token)).status,
      status,
    );
  }
});
test("logout-all revokes every current-user device and leaves another user's sessions", async () => {
  const tokens = [randomToken(), randomToken(), randomToken()];
  for (const [i, token] of tokens.entries())
    await env.DB.prepare("INSERT INTO sessions VALUES(?,?,?,?)")
      .bind(
        await hash(token),
        i === 2 ? "employee" : "u-hr",
        Date.now(),
        Date.now() + 86400000,
      )
      .run();
  const cookies = tokens.map((token) => "__Host-peopleos=" + token);
  const response = await call(
    "/auth/logout-all",
    { user_id: "employee" },
    cookies[0],
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie")!, /Max-Age=0/);
  assert.equal(
    (await env.DB.prepare(
      "SELECT count(*) AS count FROM sessions WHERE user_id='u-hr'",
    ).first<{ count: number }>())!.count,
    0,
  );
  assert.equal((await call("/auth/me", undefined, cookies[0])).status, 401);
  assert.equal((await call("/auth/me", undefined, cookies[1])).status, 401);
  assert.equal((await call("/auth/me", undefined, cookies[2])).status, 200);
  assert.equal((await call("/auth/logout-all", {})).status, 401);
});

test("production configuration and non-loopback dev hosts never print codes", async () => {
  const config = JSON.parse(
    readFileSync("worker/wrangler.jsonc", "utf8").replace(/,\s*([}\]])/g, "$1"),
  );
  assert.equal(config.vars.ENV, "production");
  const old = console.log;
  let lines: string[] = [],
    sends = 0;
  env.EMAIL_FROM = randomToken() + "@example.invalid";
  env.EMAIL = {
    send: async () => {
      sends++;
    },
  };
  console.log = (value: unknown) => {
    lines.push(String(value));
  };
  const cases = [
    [config.vars.ENV, "https://localhost", false],
    [config.vars.ENV, "https://127.0.0.1", false],
    [config.vars.ENV, "https://production.test", false],
    ["dev", "https://production.test", false],
    ["dev", "https://localhost.evil.test", false],
    ["dev", "https://127.0.0.1.evil.test", false],
    ["dev", "https://[::1]", false],
    ["dev", "https://localhost.", false],
    ["dev", "https://localhost", true],
    ["dev", "https://127.0.0.1", true],
  ] as const;
  try {
    for (const [mode, origin, prints] of cases) {
      await env.DB.exec("DELETE FROM auth_rate_events");
      env.ENV = mode;
      lines = [];
      const before = sends;
      const tasks: Promise<unknown>[] = [];
      const context = {
        waitUntil(task: Promise<unknown>) {
          tasks.push(task);
        },
        passThroughOnException() {},
        props: {},
      };
      const response = await app.request(
        origin + "/api/auth/request-code",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "localhost",
            "x-forwarded-host": "localhost",
          },
          body: JSON.stringify({ email }),
        },
        env,
        context,
      );
      assert.equal(response.status, 200);
      await Promise.all(tasks);
      assert.equal(lines.length, prints ? 1 : 0, mode + " " + origin);
      assert.equal(sends - before, prints ? 0 : 1, mode + " " + origin);
    }
  } finally {
    console.log = old;
    env.ENV = "dev";
  }
});
