import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { app } from "../src/index";
import { hash, randomToken } from "../src/crypto";
import { seedEmployees } from "../scripts/seed-data";
import { encodeEmployee } from "../src/employee-repository";
import { createEmptyEmployeeForm } from "../../src/utils";
import type { Employee } from "../../src/types";
import type { Env } from "../src/env";
const mf = new Miniflare({
  ...convertV4MiniflareOptions({
    modules: true,
    script: 'export default{fetch(){return new Response("test")}}',
    compatibilityDate: "2026-11-26",
    d1Databases: ["DB"],
  }),
  telemetry: { enabled: false },
  cf: false,
});
let env: Env;
const cookies: Record<string, string> = {};
let sample: Employee & { version: number };
before(async () => {
  const DB = await mf.getD1Database("DB");
  for (const name of readdirSync("worker/migrations").sort())
    await DB.exec(
      readFileSync("worker/migrations/" + name, "utf8").replace(/\n/g, " "),
    );
  env = {
    DB,
    ENV: "dev",
    AUTH_SECRET: randomToken(),
    ENCRYPTION_KEY: btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
    ),
  } as Env;
  for (const role of ["hr_lead", "dept_head", "employee"]) {
    const token = randomToken();
    cookies[role] = "__Host-peopleos=" + token;
    await DB.prepare("INSERT INTO users VALUES(?,?,?,?,1)")
      .bind(
        role,
        randomToken() + "@example.invalid",
        role,
        role === "dept_head" ? "EMP004" : "EMP001",
      )
      .run();
    await DB.prepare("INSERT INTO sessions VALUES(?,?,?,?)")
      .bind(await hash(token), role, Date.now(), Date.now() + 86400000)
      .run();
  }
  for (const employee of seedEmployees()) {
    const e = await encodeEmployee(employee, env);
    await DB.prepare(
      "INSERT INTO employees(id,department,status,hire_date,name,role,phone,public_json,bank_cards_cipher,id_docs_cipher,salary_cipher,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
    )
      .bind(
        employee.id,
        employee.department,
        employee.status,
        employee.hireDate,
        employee.name,
        employee.role,
        employee.phone,
        e.publicJson,
        e.bank,
        e.docs,
        e.pay,
        Date.now(),
      )
      .run();
  }
  await DB.exec("UPDATE employee_sequence SET next_number=13");
});
after(() => mf.dispose());
const call = (
  path = "",
  method = "GET",
  body?: unknown,
  role = "hr_lead",
  headers: Record<string, string> = {},
) =>
  app.request(
    "https://local.test/api/employees" + path,
    {
      method,
      headers: {
        cookie: cookies[role] || "",
        "content-type": "application/json",
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
    env,
  );
test("401 and 403 boundaries omit other employee and salary data", async () => {
  assert.equal((await call("", "GET", undefined, "none")).status, 401);
  for (const path of ["", "/EMP001", "/EMP002"])
    assert.equal((await call(path, "GET", undefined, "dept_head")).status, 403);
  const denied = await call("/EMP002", "GET", undefined, "employee");
  assert.equal(denied.status, 403);
  assert.ok(!(await denied.text()).includes("baseSalary"));
  const own = await call("/EMP001", "GET", undefined, "employee");
  assert.equal(own.status, 200);
  sample = (await own.json()).employee;
  assert.equal(sample.baseSalary, 22000);
  assert.equal(sample.bankCards[0].cardNumber, "6225880139481024");
  const list = (await (await call("", "GET", undefined, "employee")).json())
    .employees;
  assert.deepEqual(
    list.map((e: Employee) => e.id),
    ["EMP001"],
  );
  assert.equal((await call("/EMP001", "PUT", sample, "employee")).status, 403);
  assert.equal((await call("", "POST", sample, "employee")).status, 403);
});
test("HR list, search, department, status, month filters and derived dates", async () => {
  assert.equal((await (await call()).json()).employees.length, 12);
  for (const query of [
    "?department=" + encodeURIComponent("技术部"),
    "?status=" + encodeURIComponent("试用期"),
    "?hireMonth=2026-09",
    "?keyword=" + encodeURIComponent("林晓梅"),
  ]) {
    const r = await call(query);
    assert.equal(r.status, 200);
    assert.ok((await r.json()).employees.length > 0);
  }
  assert.equal((await call("?hireMonth=bad")).status, 400);
  assert.equal((await call("/EMP999")).status, 404);
  assert.equal(sample.age, "30 岁");
});
test("shared required, phone, identity, bank, family, date and salary validation", async () => {
  const valid = { ...sample };
  for (const change of [
    { name: "" },
    { gender: "" },
    { phone: "123" },
    { birthDate: "" },
    { ethnicity: "" },
    { householdType: "" },
    { maritalStatus: "" },
    { firstWorkDate: "" },
    { role: "" },
    { familyMembers: [] },
    {
      idDocs: [
        { docType: "居民身份证", docNumber: "123", expiryDate: "2030-01-01" },
      ],
    },
    { bankCards: [{ ...valid.bankCards[0], reservedPhone: "123" }] },
    { bankCards: [{ ...valid.bankCards[0], holderIdNumber: "123" }] },
    { hireDate: "2026-02-31" },
    { baseSalary: -1 },
    { baseSalary: "not a number" },
  ]) {
    const r = await call("", "POST", { ...valid, ...change });
    assert.equal(r.status, 422, JSON.stringify(Object.keys(change)));
    const body = await r.json();
    assert.ok(body.fields.length > 0);
    assert.ok(body.fields[0].field);
  }
  const r = await call("", "POST", {});
  assert.equal(r.status, 422);
});
test("create allocates unique server IDs, calculates dates and is idempotent", async () => {
  const input = {
    ...sample,
    id: "EMP999",
    contractEnd: "",
    probationEndDate: "",
    hireDate: "2026-12-01",
    name: "本地测试新员工",
  };
  const a = await call("", "POST", input, "hr_lead", {
    "Idempotency-Key": "test-create",
  });
  assert.equal(a.status, 201);
  const created = (await a.json()).employee;
  assert.equal(created.id, "EMP013");
  assert.equal(created.contractEnd, "2029-12-01");
  assert.equal(created.probationEndDate, "2027-03-01");
  const b = await call("", "POST", input, "hr_lead", {
    "Idempotency-Key": "test-create",
  });
  assert.equal(b.status, 200);
  assert.equal((await b.json()).employee.id, created.id);
  assert.equal(
    (
      await call("", "POST", { ...input, name: "不同数据" }, "hr_lead", {
        "Idempotency-Key": "test-create",
      })
    ).status,
    409,
  );
  const concurrent = await Promise.all([
    call("", "POST", input),
    call("", "POST", input),
  ]);
  const ids = await Promise.all(
    concurrent.map(async (r) => (await r.json()).employee.id),
  );
  assert.equal(new Set(ids).size, 2);
});
test("update persists, rejects stale versions and ignores client attachment forgery", async () => {
  const r = await call("/EMP001", "PUT", {
    ...sample,
    name: "更新后的测试姓名",
    baseSalary: 23000,
    attachments: { idFront: "forged" },
  });
  assert.equal(r.status, 200);
  const value = (await r.json()).employee;
  assert.equal(value.version, 2);
  assert.equal(value.baseSalary, 23000);
  assert.deepEqual(value.attachments, {});
  assert.equal((await call("/EMP001", "PUT", sample)).status, 409);
  const saved = (await (await call("/EMP001")).json()).employee;
  assert.equal(saved.name, "更新后的测试姓名");
  assert.equal(saved.baseSalary, 23000);
});
test("direct D1 read proves encryption and read/write audit without values", async () => {
  const row = await env.DB.prepare("SELECT * FROM employees WHERE id=?")
    .bind("EMP001")
    .first<Record<string, unknown>>();
  assert.ok(row);
  const raw = JSON.stringify(row);
  for (const plain of [
    "6225880139481024",
    "110105199605124321",
    '"baseSalary":23000',
    '"baseSalary":22000',
  ])
    assert.ok(!raw.includes(plain), plain + " must not be stored in plaintext");
  const audit = await env.DB.prepare(
    "SELECT * FROM audit_logs WHERE employee_id=?",
  )
    .bind("EMP001")
    .all<{
      actor_id: string;
      action: string;
      sensitive_fields: string;
      created_at: number;
    }>();
  assert.ok(
    audit.results.some((a) => a.actor_id === "employee" && a.action === "read"),
  );
  assert.ok(audit.results.some((a) => a.action === "update"));
  assert.ok(
    audit.results.every(
      (a) => a.created_at > 0 && !a.sensitive_fields.includes("23000"),
    ),
  );
});
test("batch updates are all-or-nothing and ordinary accounts cannot invoke them", async () => {
  const current = (await (await call()).json()).employees;
  const a = current[0],
    b = current[1];
  const stale = await call("/batch", "POST", {
    employees: [
      { ...a, baseSalary: 99001 },
      { ...b, version: b.version + 1, baseSalary: 99002 },
    ],
  });
  assert.equal(stale.status, 409);
  assert.equal(
    (await (await call("/" + a.id)).json()).employee.baseSalary,
    a.baseSalary,
  );
  const saved = await call("/batch", "POST", {
    employees: [
      { ...a, baseSalary: 31000 },
      { ...b, baseSalary: 32000 },
    ],
  });
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).employees.length, 2);
  assert.equal(
    (await call("/batch", "POST", { employees: [a] }, "employee")).status,
    403,
  );
  assert.equal(
    (await call("/batch", "POST", { employees: [a] }, "dept_head")).status,
    403,
  );
});

test("backend recalculates derived probation and hire-date-linked contract dates", async () => {
  const original = (await (await call("/EMP002")).json()).employee;
  const r = await call("/EMP002", "PUT", {
    ...original,
    hireDate: "2027-01-31",
    probationPeriod: "1个月",
    probationEndDate: "2035-01-01",
  });
  assert.equal(r.status, 200);
  const employee = (await r.json()).employee;
  assert.equal(employee.probationEndDate, "2027-03-03");
  assert.equal(employee.contractEnd, "2030-01-31");
});
test("list omits bank/identity, retains salary and emits exactly one filter-scoped audit", async () => {
  const before = await env.DB.prepare(
    "SELECT count(*) AS count FROM audit_logs",
  ).first<{ count: number }>();
  const response = await call(
    "?department=" +
      encodeURIComponent("技术部") +
      "&keyword=" +
      encodeURIComponent("工程"),
  );
  assert.equal(response.status, 200);
  const list = (await response.json()).employees;
  assert.ok(list.length > 0);
  for (const record of list) {
    assert.equal(Object.hasOwn(record, "bankCards"), false);
    assert.equal(Object.hasOwn(record, "idDocs"), false);
    assert.equal(typeof record.baseSalary, "number");
  }
  const rows = await env.DB.prepare(
    "SELECT * FROM audit_logs ORDER BY id DESC LIMIT 1",
  ).all<{ action: string; employee_id: string | null; filters_json: string }>();
  assert.equal(rows.results[0].action, "list");
  assert.equal(rows.results[0].employee_id, null);
  assert.deepEqual(JSON.parse(rows.results[0].filters_json), {
    department: "技术部",
    keyword: "工程",
  });
  assert.equal(
    (await env.DB.prepare("SELECT count(*) AS count FROM audit_logs").first<{
      count: number;
    }>())!.count,
    before!.count + 1,
  );
  const summary = (await (await call("?keyword=EMP001")).json()).employees[0];
  const detailBefore = (await (await call("/EMP001")).json()).employee;
  const saved = await call("/EMP001", "PUT", { ...summary, baseSalary: 24000 });
  assert.equal(saved.status, 200);
  assert.equal(
    Object.hasOwn((await saved.json()).employee, "bankCards"),
    false,
  );
  const detailAfter = (await (await call("/EMP001")).json()).employee;
  assert.deepEqual(detailAfter.bankCards, detailBefore.bankCards);
  assert.deepEqual(detailAfter.idDocs, detailBefore.idDocs);
  assert.equal(
    (await env.DB.prepare(
      "SELECT action FROM audit_logs ORDER BY id DESC LIMIT 1",
    ).first<{ action: string }>())!.action,
    "read",
  );
  const emptyBefore = (await env.DB.prepare(
    "SELECT count(*) AS count FROM audit_logs",
  ).first<{ count: number }>())!.count;
  assert.equal(
    (await (await call("?keyword=no-matching-employee")).json()).employees
      .length,
    0,
  );
  assert.equal(
    (await env.DB.prepare("SELECT count(*) AS count FROM audit_logs").first<{
      count: number;
    }>())!.count,
    emptyBefore + 1,
  );
});
test("handler authorization works without the path middleware", async () => {
  const { Hono } = await import("hono");
  const { HTTPException } = await import("hono/http-exception");
  const { employees } = await import("../src/employees");
  const { attachments } = await import("../src/attachments");
  const direct = new Hono<import("../src/env").AppEnv>();
  direct.use("*", async (c, next) => {
    c.set("user", {
      id: "employee",
      email: "",
      role: "employee",
      employee_id: "EMP001",
    });
    await next();
  });
  direct.route("/api/employees", attachments);
  direct.route("/api/employees", employees);
  direct.onError((error, c) =>
    error instanceof HTTPException
      ? c.json({ error: error.message }, error.status)
      : c.json({ error: "unexpected" }, 500),
  );
  for (const [method, path] of [
    ["GET", "/EMP002"],
    ["PUT", "/EMP002"],
    ["PUT", "/EMP001"],
    ["POST", "/EMP002/attachments/idFront"],
    ["POST", "/EMP001/attachments/idFront"],
    ["GET", "/EMP002/attachments/idFront"],
    ["POST", "/batch"],
  ] as const) {
    const r = await direct.request(
      "https://local.test/api/employees" + path,
      {
        method,
        body: method === "GET" ? undefined : "{}",
        headers: { "content-type": "application/json" },
      },
      env,
    );
    assert.equal(r.status, 403, method + " " + path);
    assert.ok(!(await r.text()).includes("baseSalary"));
  }
  assert.equal(
    (await direct.request("https://local.test/api/employees/EMP001", {}, env))
      .status,
    200,
  );
});
test("abnormal employee paths cannot access another employee", async () => {
  const variants = [
    "/api/employees//EMP002",
    "//api/employees/EMP002",
    "/api/employees/EMP001/%2e%2e/EMP002",
    "/api/employees/%2e/EMP002",
    "/api/employees/%252e/EMP002",
    "/API/employees/EMP002",
    "/api/Employees/EMP002",
    "/api/employees/emp002",
    "/api/employees/EMP002/",
    "/api/employees/EMP002/attachments/idFront/",
    "/api/employees/%45MP002",
    "/api/employees/EMP001%2f..%2fEMP002",
  ];
  for (const path of variants)
    for (const method of ["GET", "PUT", "POST"]) {
      const r = await app.request(
        "https://local.test" + path,
        {
          method,
          headers: {
            cookie: cookies.employee,
            "content-type": "application/json",
          },
          ...(method === "GET" ? {} : { body: "{}" }),
        },
        env,
      );
      assert.ok(
        [403, 404].includes(r.status),
        `${method} ${path}: ${r.status}`,
      );
      assert.ok(!(await r.text()).includes("baseSalary"));
    }
});
