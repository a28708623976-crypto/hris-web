import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { decrypt } from "../src/encryption";
import { employeeFieldErrors } from "../../shared/employees";
// @ts-expect-error Local CLI exports its offline generation functions.
import { bootstrapSQL, writeBootstrap } from "../scripts/prod-bootstrap.mjs";

const credentials = () => ({
  AUTH_SECRET: randomBytes(32).toString("hex"),
  ENCRYPTION_KEY: randomBytes(32).toString("base64"),
});
const account = () => ({
  email: randomUUID() + "@example.invalid",
  name: "测试 O'Connor",
});

test("bootstrap SQL imports exactly one validated encrypted employee and one HR account in real local D1", async () => {
  const env = credentials(),
    person = account();
  const sql = await bootstrapSQL({ ...person, env });
  assert.ok(!sql.includes(env.AUTH_SECRET));
  assert.ok(!sql.includes(env.ENCRYPTION_KEY));
  assert.doesNotMatch(sql, /DELETE |DROP |REPLACE INTO |INSERT INTO sessions/i);
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
  try {
    const db = await mf.getD1Database("DB");
    for (const name of readdirSync("worker/migrations").sort())
      await db.exec(
        readFileSync("worker/migrations/" + name, "utf8").replace(/\n/g, " "),
      );
    // Remove SQL comments before joining lines for D1's exec interface.
    await db.exec(
      sql
        .split("\n")
        .filter((line: string) => !line.startsWith("--"))
        .join(" "),
    );
    assert.equal(
      (await db.prepare("SELECT count(*) AS n FROM employees").first())!.n,
      1,
    );
    assert.equal(
      (await db.prepare("SELECT count(*) AS n FROM users").first())!.n,
      1,
    );
    assert.equal(
      (await db.prepare("SELECT next_number FROM employee_sequence").first())!
        .next_number,
      2,
    );
    const user = await db.prepare("SELECT * FROM users").first();
    assert.equal(user!.email, person.email);
    assert.equal(user!.role, "hr_lead");
    assert.equal(user!.employee_id, "EMP001");
    const row = (await db.prepare("SELECT * FROM employees").first())!;
    const salary = await decrypt(
      row.salary_cipher as string,
      env.ENCRYPTION_KEY,
      "EMP001:salaries",
    );
    const bankCards = await decrypt(
      row.bank_cards_cipher as string,
      env.ENCRYPTION_KEY,
      "EMP001:bankCards",
    );
    const idDocs = await decrypt(
      row.id_docs_cipher as string,
      env.ENCRYPTION_KEY,
      "EMP001:idDocs",
    );
    assert.deepEqual(bankCards, []);
    assert.deepEqual(idDocs, []);
    assert.equal((salary as Record<string, number>).baseSalary, 0);
    assert.ok(!String(row.public_json).includes("baseSalary"));
    const employee = {
      ...JSON.parse(row.public_json as string),
      ...(salary as object),
      bankCards,
      idDocs,
    };
    assert.equal(employee.name, person.name);
    assert.deepEqual(employeeFieldErrors(employee).errors, []);
    assert.ok(employee.contractEnd > employee.hireDate);
    assert.ok(employee.probationEndDate > employee.hireDate);
    await assert.rejects(
      decrypt(
        row.salary_cipher as string,
        credentials().ENCRYPTION_KEY,
        "EMP001:salaries",
      ),
    );
    await assert.rejects(
      db.exec(
        sql
          .split("\n")
          .filter((line: string) => !line.startsWith("--"))
          .join(" "),
      ),
    );
  } finally {
    await mf.dispose();
  }
});

test("bootstrap validates arguments and both environment secrets before writing", async () => {
  const valid = { ...account(), env: credentials() };
  for (const change of [
    { email: "bad" },
    { name: "" },
    { name: "a\nb" },
    { env: {} },
    { env: { ...valid.env, AUTH_SECRET: "short" } },
    { env: { ...valid.env, ENCRYPTION_KEY: "bad" } },
  ])
    await assert.rejects(bootstrapSQL({ ...valid, ...change }));
  await assert.rejects(
    writeBootstrap({ ...valid, output: "/tmp/forbidden-production.sql" }),
    /worker\/\.local/,
  );
});

test("bootstrap CLI only writes ignored private SQL and refuses overwriting", async () => {
  const file = `worker/.local/bootstrap-test-${randomUUID()}.sql`;
  const person = account(),
    env = credentials();
  try {
    const result = spawnSync(
      process.execPath,
      [
        "worker/scripts/prod-bootstrap.mjs",
        "--email",
        person.email,
        "--name",
        person.name,
        "--output",
        file,
      ],
      { env: { ...process.env, ...env }, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(statSync(file).mode & 0o777, 0o600);
    const sql = readFileSync(file, "utf8");
    assert.equal(spawnSync("git", ["check-ignore", "-q", file]).status, 0);
    for (const privateValue of [
      person.email,
      env.AUTH_SECRET,
      env.ENCRYPTION_KEY,
    ])
      assert.ok(!(result.stdout + result.stderr).includes(privateValue));
    await assert.rejects(
      writeBootstrap({ ...person, env, output: file }),
      /已存在/,
    );
    assert.equal(readFileSync(file, "utf8"), sql);
    const missing = spawnSync(
      process.execPath,
      ["worker/scripts/prod-bootstrap.mjs"],
      { env: { ...process.env, ...env }, encoding: "utf8" },
    );
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /--email/);
  } finally {
    if (existsSync(file)) unlinkSync(file);
  }
});
