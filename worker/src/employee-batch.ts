import { assertCanAccessEmployee, assertHrLead } from "./permissions";
import { Hono } from "hono";
import type { AppEnv } from "./env";
import type { Employee } from "../../src/types";
import {
  employeeFieldErrors,
  normaliseEmployeeDates,
} from "../../shared/employees";
import {
  encodeEmployee,
  employeeUpdateInput,
  employeeSummary,
  type EmployeeRow,
} from "./employee-repository";
import { auditStatement } from "./audit";
export const employeeBatch = new Hono<AppEnv>();
employeeBatch.post("/batch", async (c) => {
  assertHrLead(c.get("user"));
  const body = await c.req.json().catch(() => null);
  if (
    !Array.isArray(body?.employees) ||
    !body.employees.length ||
    body.employees.length > 50
  )
    return c.json({ error: "批量保存需要 1 至 50 条员工记录" }, 422);
  const records: Employee[] = [];
  for (const item of body.employees) {
    if (!item || typeof item.id !== "string")
      return c.json({ error: "缺少员工工号" }, 422);
    assertCanAccessEmployee(c.get("user"), item.id);
    const existing = await c.env.DB.prepare(
      "SELECT * FROM employees WHERE id=?",
    )
      .bind(item.id)
      .first<EmployeeRow>();
    if (!existing) return c.json({ error: "员工不存在" }, 404);
    const parsed = employeeFieldErrors(
      await employeeUpdateInput(item, existing, c.env),
    );
    if (!parsed.data)
      return c.json(
        { error: "员工字段校验未通过", fields: parsed.errors },
        422,
      );
    if (typeof item.id !== "string" || !Number.isInteger(item.version))
      return c.json({ error: "缺少员工工号或版本" }, 422);
    records.push({ ...parsed.data, id: item.id, version: item.version });
  }
  if (new Set(records.map((e) => e.id)).size !== records.length)
    return c.json({ error: "批量工号不能重复" }, 422);
  const encoded: Awaited<ReturnType<typeof encodeEmployee>>[] = [];
  for (const record of records) {
    const original = await c.env.DB.prepare(
      "SELECT * FROM employees WHERE id=?",
    )
      .bind(record.id)
      .first<EmployeeRow>();
    if (!original) return c.json({ error: "员工不存在" }, 404);
    if (record.version !== original.version)
      return c.json({ error: "档案已被更新，请重新加载后再保存" }, 409);
    const previous = JSON.parse(original.public_json);
    Object.assign(record, normaliseEmployeeDates(record, previous));
    record.attachments = previous.attachments || {};
    encoded.push(await encodeEmployee(record, c.env));
  }
  const guard = crypto.randomUUID();
  const sql =
    "SELECT COUNT(*) FROM employees WHERE " +
    records.map(() => "(id=? AND version=?)").join(" OR ");
  const statements = [
    c.env.DB.prepare(
      `INSERT INTO employee_update_guards(id,valid) SELECT ?,CASE WHEN (${sql})=? THEN 1 ELSE 0 END`,
    ).bind(
      guard,
      ...records.flatMap((record) => [record.id, record.version!]),
      records.length,
    ),
  ];
  records.forEach((record, index) => {
    const enc = encoded[index];
    statements.push(
      c.env.DB.prepare(
        "UPDATE employees SET department=?,status=?,hire_date=?,name=?,role=?,phone=?,public_json=?,bank_cards_cipher=?,id_docs_cipher=?,salary_cipher=?,version=version+1,updated_at=? WHERE id=?",
      ).bind(
        record.department,
        record.status,
        record.hireDate,
        record.name,
        record.role,
        record.phone,
        enc.publicJson,
        enc.bank,
        enc.docs,
        enc.pay,
        Date.now(),
        record.id,
      ),
      auditStatement(c.env, c.get("user"), record.id, "update"),
    );
  });
  statements.push(
    c.env.DB.prepare("DELETE FROM employee_update_guards WHERE id=?").bind(
      guard,
    ),
  );
  try {
    await c.env.DB.batch(statements);
  } catch (error) {
    if (String(error).includes("CHECK constraint"))
      return c.json({ error: "档案已被更新，请重新加载后再保存" }, 409);
    throw error;
  }
  return c.json({
    employees: records.map((record) =>
      employeeSummary({
        ...record,
        version: record.version! + 1,
      }),
    ),
  });
});
