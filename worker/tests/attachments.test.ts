import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { PDFDocument } from "pdf-lib";
import { Document, Packer, Paragraph } from "docx";
import { hash, randomToken } from "../src/crypto";
import { encodeEmployee } from "../src/employee-repository";
import { seedEmployees } from "../scripts/seed-data";
import type { Env } from "../src/env";
let mf: Miniflare, env: Env;
const cookies: Record<string, string> = {};
let pdf: Uint8Array;
before(async () => {
  const bundle = await build({
    entryPoints: ["worker/src/index.ts"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    target: "es2022",
  });
  const secret = randomToken(),
    key = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
    );
  mf = new Miniflare({
    ...convertV4MiniflareOptions({
      modules: true,
      script: bundle.outputFiles[0].text,
      compatibilityDate: "2026-11-26",
      d1Databases: ["DB"],
      r2Buckets: ["ATTACHMENTS"],
      serviceBindings: {
        ASSETS: () => new Response("Not found", { status: 404 }),
      },
      bindings: { ENV: "dev", AUTH_SECRET: secret, ENCRYPTION_KEY: key },
    }),
    telemetry: { enabled: false },
    cf: false,
  });
  const DB = await mf.getD1Database("DB");
  env = { DB, ENCRYPTION_KEY: key } as Env;
  for (const name of readdirSync("worker/migrations").sort())
    await DB.exec(
      readFileSync("worker/migrations/" + name, "utf8").replace(/\n/g, " "),
    );
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
  const employee = seedEmployees()[0],
    enc = await encodeEmployee(employee, env);
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
      enc.publicJson,
      enc.bank,
      enc.docs,
      enc.pay,
      Date.now(),
    )
    .run();
  const doc = await PDFDocument.create();
  doc.addPage();
  pdf = await doc.save();
});
after(() => mf.dispose());
const url = "/api/employees/EMP001/attachments/idFront";
const get = (path = url, role = "hr_lead") =>
  mf.dispatchFetch("https://local.test" + path, {
    headers: { cookie: cookies[role] || "" },
  });
const upload = (
  name: string,
  data: Uint8Array,
  size = data.length,
  role = "hr_lead",
  extra: Record<string, string> = {},
) =>
  mf.dispatchFetch("https://local.test" + url, {
    method: "POST",
    headers: {
      cookie: cookies[role] || "",
      "X-File-Name": encodeURIComponent(name),
      "X-File-Size": String(size),
      "Content-Type": "application/octet-stream",
      ...extra,
    },
    body: data,
  });
test("private R2 upload/download through real workerd with role and owner checks", async () => {
  assert.equal((await get(url, "none")).status, 401);
  assert.equal(
    (await upload("test.pdf", pdf, pdf.length, "employee")).status,
    403,
  );
  assert.equal(
    (await upload("test.pdf", pdf, pdf.length, "dept_head")).status,
    403,
  );
  const saved = await upload("测试证明.pdf", pdf);
  assert.equal(saved.status, 201);
  assert.equal((await saved.json()).attachment.filename, "测试证明.pdf");
  const own = await get(url, "employee");
  assert.equal(own.status, 200);
  assert.deepEqual(new Uint8Array(await own.arrayBuffer()), pdf);
  assert.match(own.headers.get("Content-Disposition")!, /^attachment;/);
  assert.match(own.headers.get("Cache-Control")!, /no-store/);
  assert.equal(
    (await get("/api/employees/EMP002/attachments/idFront", "employee")).status,
    403,
  );
  assert.equal((await get(url, "dept_head")).status, 403);
  const row = await env.DB.prepare("SELECT object_key FROM attachments").first<{
    object_key: string;
  }>();
  const bucket = await mf.getR2Bucket("ATTACHMENTS");
  assert.ok(await bucket.head(row!.object_key));
  assert.equal((await get("/" + row!.object_key, "none")).status, 404);
});
test("invalid extension, magic, size, empty body and stale version rejected without changing archive", async () => {
  for (const [name, data, size, status] of [
    ["bad.exe", pdf, pdf.length, 415],
    ["fake.pdf", new TextEncoder().encode("not a PDF"), 9, 415],
    ["large.pdf", pdf, 50 * 1024 * 1024 + 1, 413],
    ["zero.pdf", new Uint8Array(), 0, 411],
    ["short.pdf", pdf, pdf.length + 1, 400],
  ] as const) {
    assert.equal((await upload(name, data, size)).status, status, name);
  }
  assert.equal(
    (
      await upload("stale.pdf", pdf, pdf.length, "hr_lead", {
        "If-Match": "999",
      })
    ).status,
    409,
  );
  const row = await env.DB.prepare("SELECT filename FROM attachments").first<{
    filename: string;
  }>();
  assert.equal(row?.filename, "测试证明.pdf");
  assert.deepEqual(new Uint8Array(await (await get()).arrayBuffer()), pdf);
});
test("replacement removes old private object and only new metadata is exposed", async () => {
  const old = await env.DB.prepare("SELECT object_key FROM attachments").first<{
    object_key: string;
  }>();
  const response = await upload("替换.pdf", pdf);
  assert.equal(response.status, 201);
  const bucket = await mf.getR2Bucket("ATTACHMENTS");
  assert.equal(await bucket.head(old!.object_key), null);
  const employee = await mf.dispatchFetch(
    "https://local.test/api/employees/EMP001",
    { headers: { cookie: cookies.hr_lead } },
  );
  const body = (await employee.json()) as {
    employee: { attachments: Record<string, string> };
  };
  assert.equal(body.employee.attachments.idFront, "替换.pdf");
  assert.ok(!JSON.stringify(body).includes("object_key"));
});
test("OOXML DOCX accepted and renamed arbitrary ZIP refused", async () => {
  const word = await Packer.toBuffer(
    new Document({ sections: [{ children: [new Paragraph("本地测试证明")] }] }),
  );
  assert.equal((await upload("测试.docx", word)).status, 201);
  const invalid = new TextEncoder().encode(
    "PK\x03\x04[Content_Types].xml word/document.xml",
  );
  assert.equal((await upload("fake.docx", invalid)).status, 415);
});
test("attachment sensitive reads and writes are audited without content or filename", async () => {
  const result = await env.DB.prepare(
    "SELECT * FROM audit_logs WHERE action LIKE 'attachment_%'",
  ).all<{ action: string; sensitive_fields: string }>();
  assert.ok(result.results.some((row) => row.action === "attachment_upload"));
  assert.ok(result.results.some((row) => row.action === "attachment_download"));
  assert.ok(
    result.results.every(
      (row) => row.sensitive_fields === '["attachments.idFront"]',
    ),
  );
});
test("exact 50MB stream is accepted without buffering the whole upload in Worker", async () => {
  const data = new Uint8Array(50 * 1024 * 1024).fill(32);
  data.set(pdf);
  data.set(new TextEncoder().encode("\n%%EOF\n"), data.length - 7);
  const result = await upload("boundary.pdf", data);
  assert.equal(result.status, 201);
  assert.equal((await result.json()).attachment.size, 50 * 1024 * 1024);
  const row = await env.DB.prepare(
    "SELECT size,object_key FROM attachments",
  ).first<{ size: number; object_key: string }>();
  assert.equal(row?.size, data.length);
  assert.equal(
    (await (await mf.getR2Bucket("ATTACHMENTS")).head(row!.object_key))?.size,
    data.length,
  );
});
