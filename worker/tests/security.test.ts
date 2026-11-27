import { test } from "node:test";
import assert from "node:assert/strict";
import { Hono } from "hono";
import { employeeAccess, canReadEmployee } from "../src/permissions";
import { encrypt, decrypt } from "../src/encryption";
import type { AppEnv, User } from "../src/env";
const user = (role: User["role"]): User => ({
  id: "u",
  email: "",
  role,
  employee_id: "EMP005",
});
test("all employee operations enforced by role and owner", async () => {
  for (const role of ["hr_lead", "dept_head", "employee"] as const) {
    const app = new Hono<AppEnv>();
    app.use("*", async (c, next) => {
      c.set("user", user(role));
      await next();
    });
    app.use("*", employeeAccess);
    app.all("*", (c) => c.json({ ok: true }));
    for (const path of [
      "/api/employees",
      "/api/employees/EMP005",
      "/api/employees/EMP001",
    ])
      for (const method of ["GET", "POST", "PUT"]) {
        const allowed =
          role === "hr_lead" ||
          (role === "employee" && method === "GET" && !path.endsWith("EMP001"));
        assert.equal(
          (await app.request("https://local.test" + path, { method })).status,
          allowed ? 200 : 403,
          role + " " + method + " " + path,
        );
      }
  }
  assert.equal(canReadEmployee(user("dept_head"), "EMP005"), false);
  assert.equal(canReadEmployee(user("employee"), "EMP001"), false);
  assert.equal(canReadEmployee(user("employee"), "EMP005"), true);
});
test("AES-GCM randomized ciphertext, authenticated row/field binding and wrong-key rejection", async () => {
  const secret = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  );
  const value = {
    salary: 23000,
    id: "110105199605124321",
    bank: "6225880139481024",
  };
  const a = await encrypt(value, secret, "EMP005:salaries"),
    b = await encrypt(value, secret, "EMP005:salaries");
  assert.notEqual(a, b);
  assert.ok(
    !a.includes("23000") && !a.includes(value.id) && !a.includes(value.bank),
  );
  assert.deepEqual(await decrypt(a, secret, "EMP005:salaries"), value);
  await assert.rejects(decrypt(a, secret, "EMP001:salaries"));
  await assert.rejects(decrypt(a, secret, "EMP005:bankCards"));
  const raw = JSON.parse(a);
  raw.data = "AAAA" + raw.data.slice(4);
  await assert.rejects(decrypt(JSON.stringify(raw), secret, "EMP005:salaries"));
  await assert.rejects(
    decrypt(
      a,
      btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))),
      "EMP005:salaries",
    ),
  );
});
