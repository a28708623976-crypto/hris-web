import { employeeBatch } from "./employee-batch";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { AppEnv } from "./env";
import type { Employee, EmployeeForm } from "../../src/types";
import {
  employeeFieldErrors,
  normaliseEmployeeDates,
} from "../../shared/employees";
import {
  calcAge,
  calcTenure,
  calcContractEndDate,
  calcProbationEndDate,
} from "../../shared/dates";
import {
  decodeEmployee,
  decodeEmployeeSummary,
  employeeSummary,
  employeeUpdateInput,
  encodeEmployee,
  type EmployeeRow,
} from "./employee-repository";
import { auditStatement, listAuditStatement } from "./audit";
import { keyedHash } from "./crypto";
export const employees = new Hono<AppEnv>();
employees.use(
  "*",
  bodyLimit({
    maxSize: 1024 * 1024,
    onError: (c) => c.json({ error: "档案数据过大" }, 413),
  }),
);
employees.route("/", employeeBatch);
const derived = (
  employee: Pick<EmployeeForm, "birthDate" | "firstWorkDate">,
) => ({
  age: calcAge(employee.birthDate),
  tenure: calcTenure(employee.firstWorkDate),
});
employees.get("/", async (c) => {
  const conditions: string[] = [],
    values: (string | number)[] = [];
  const user = c.get("user");
  if (user.role === "employee") {
    conditions.push("id=?");
    values.push(user.employee_id);
  }
  const { department, status, hireMonth, keyword } = c.req.query();
  for (const [field, value] of [
    ["department", department],
    ["status", status],
  ] as const)
    if (value) {
      conditions.push(field + "=?");
      values.push(value);
    }
  if (hireMonth) {
    if (!/^\d{4}-\d{2}$/.test(hireMonth))
      return c.json({ error: "入职年月格式应为 YYYY-MM" }, 400);
    conditions.push("substr(hire_date,1,7)=?");
    values.push(hireMonth);
  }
  if (keyword) {
    conditions.push(
      "(instr(name,?)>0 OR instr(id,?)>0 OR instr(role,?)>0 OR instr(phone,?)>0)",
    );
    values.push(...Array(4).fill(keyword));
  }
  const rows = await c.env.DB.prepare(
    "SELECT * FROM employees" +
      (conditions.length ? " WHERE " + conditions.join(" AND ") : "") +
      " ORDER BY id",
  )
    .bind(...values)
    .all<EmployeeRow>();
  const result = await Promise.all(
    rows.results.map((row) => decodeEmployeeSummary(row, c.env, user)),
  );
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries({
    department,
    status,
    hireMonth,
    keyword,
  }))
    if (value !== undefined) filters[key] = value;
  await listAuditStatement(c.env, user, filters).run();
  return c.json({ employees: result.map((e) => ({ ...e, ...derived(e) })) });
});
employees.get("/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM employees WHERE id=?")
    .bind(c.req.param("id"))
    .first<EmployeeRow>();
  if (!row) return c.json({ error: "员工不存在" }, 404);
  const employee = await decodeEmployee(row, c.env, c.get("user"));
  await auditStatement(c.env, c.get("user"), row.id, "read").run();
  return c.json({ employee: { ...employee, ...derived(employee) } });
});
employees.post("/", async (c) => {
  const body = await c.req.json().catch(() => null),
    parsed = employeeFieldErrors(body);
  if (!parsed.data)
    return c.json({ error: "员工字段校验未通过", fields: parsed.errors }, 422);
  const form = normaliseEmployeeDates(parsed.data);
  const source = c.req.header("Idempotency-Key");
  if (source && source.length > 200)
    return c.json({ error: "请求标识过长" }, 400);
  const sourceHash = await keyedHash(
    c.env.AUTH_SECRET,
    "employee-create:" + JSON.stringify(form),
  );
  if (source) {
    const existing = await c.env.DB.prepare(
      "SELECT * FROM employees WHERE source_key=?",
    )
      .bind(source)
      .first<EmployeeRow>();
    if (existing) {
      if (existing.source_hash !== sourceHash)
        return c.json({ error: "同一请求已使用不同数据提交" }, 409);
      await auditStatement(c.env, c.get("user"), existing.id, "read").run();
      return c.json({
        employee: employeeSummary(
          await decodeEmployee(existing, c.env, c.get("user")),
        ),
      });
    }
  }
  const seq = await c.env.DB.prepare(
    "UPDATE employee_sequence SET next_number=next_number+1 WHERE id=1 RETURNING next_number-1 AS number",
  ).first<{ number: number }>();
  if (!seq) throw new Error("Employee sequence missing");
  const employee: Employee = {
    ...form,
    id: "EMP" + String(seq.number).padStart(3, "0"),
    attachments: {},
  };
  const enc = await encodeEmployee(employee, c.env);
  try {
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO employees(id,department,status,hire_date,name,role,phone,public_json,bank_cards_cipher,id_docs_cipher,salary_cipher,source_key,source_hash,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).bind(
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
        source || null,
        sourceHash,
        Date.now(),
      ),
      auditStatement(c.env, c.get("user"), employee.id, "create"),
    ]);
  } catch (error) {
    if (source) {
      const row = await c.env.DB.prepare(
        "SELECT * FROM employees WHERE source_key=?",
      )
        .bind(source)
        .first<EmployeeRow>();
      if (row) {
        if (row.source_hash !== sourceHash)
          return c.json({ error: "请求数据冲突" }, 409);
        return c.json({
          employee: employeeSummary(
            await decodeEmployee(row, c.env, c.get("user")),
          ),
        });
      }
    }
    throw error;
  }
  return c.json(
    {
      employee: employeeSummary({
        ...employee,
        version: 1,
        ...derived(employee),
      }),
    },
    201,
  );
});
employees.put("/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare("SELECT * FROM employees WHERE id=?")
    .bind(id)
    .first<EmployeeRow>();
  if (!row) return c.json({ error: "员工不存在" }, 404);
  const body = await c.req.json().catch(() => null),
    parsed = employeeFieldErrors(await employeeUpdateInput(body, row, c.env));
  if (!parsed.data)
    return c.json({ error: "员工字段校验未通过", fields: parsed.errors }, 422);
  if (!Number.isInteger(body.version) || body.version !== row.version)
    return c.json({ error: "档案已被更新，请重新加载后再保存" }, 409);
  const original = JSON.parse(row.public_json);
  const employee: Employee = {
    ...normaliseEmployeeDates(parsed.data, original),
    id,
    attachments: original.attachments || {},
  };
  const enc = await encodeEmployee(employee, c.env);
  // A conditional audit INSERT and compare-and-swap update share the same D1 transaction.
  const update = await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO audit_logs(actor_id,employee_id,action,sensitive_fields,created_at) SELECT ?,?,'update',?,? WHERE EXISTS(SELECT 1 FROM employees WHERE id=? AND version=?)`,
    ).bind(
      c.get("user").id,
      id,
      JSON.stringify(["bankCards", "idDocs", "salaries"]),
      Date.now(),
      id,
      row.version,
    ),
    c.env.DB.prepare(
      `UPDATE employees SET department=?,status=?,hire_date=?,name=?,role=?,phone=?,public_json=?,bank_cards_cipher=?,id_docs_cipher=?,salary_cipher=?,version=version+1,updated_at=? WHERE id=? AND version=?`,
    ).bind(
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
      id,
      row.version,
    ),
  ]);
  if (!update[1].meta.changes)
    return c.json({ error: "档案已被更新，请重新加载后再保存" }, 409);
  return c.json({
    employee: employeeSummary({
      ...employee,
      version: row.version + 1,
      ...derived(employee),
    }),
  });
});
