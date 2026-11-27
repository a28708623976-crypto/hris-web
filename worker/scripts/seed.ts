import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { parseEnv } from "node:util";
import { encodeEmployee } from "../src/employee-repository";
import { seedEmployees } from "./seed-data";
import type { Env } from "../src/env";
const vars = {
  ...parseEnv(readFileSync("worker/.dev.vars", "utf8")),
  ...process.env,
};
const emails = ["SEED_HR_EMAIL", "SEED_DEPT_EMAIL", "SEED_EMP_EMAIL"].map(
  (key) => {
    const value = vars[key]?.trim().toLowerCase();
    if (!value || !value.includes("@")) throw new Error("请先设置 " + key);
    return value;
  },
);
if (new Set(emails).size !== 3) throw new Error("三个测试账号必须使用不同邮箱");
const quote = (value: string) => "'" + value.replaceAll("'", "''") + "'";
const rows = seedEmployees();
const sql = [
  "PRAGMA foreign_keys=ON;",
  "DELETE FROM audit_logs;",
  "DELETE FROM sessions;",
  "DELETE FROM auth_codes;",
  "DELETE FROM auth_rate_events;",
  "DELETE FROM users;",
  "DELETE FROM employees;",
  "UPDATE employee_sequence SET next_number=13 WHERE id=1;",
];
for (const employee of rows) {
  const enc = await encodeEmployee(employee, {
    ENCRYPTION_KEY: vars.ENCRYPTION_KEY,
  } as Env);
  sql.push(
    `INSERT INTO employees(id,department,status,hire_date,name,role,phone,public_json,bank_cards_cipher,id_docs_cipher,salary_cipher,updated_at) VALUES(${[employee.id, employee.department, employee.status, employee.hireDate, employee.name, employee.role, employee.phone, enc.publicJson, enc.bank, enc.docs, enc.pay].map(quote).join(",")},${Date.now()});`,
  );
}
const roles = ["hr_lead", "dept_head", "employee"],
  ids = ["EMP005", "EMP004", "EMP001"];
emails.forEach((email, i) =>
  sql.push(
    `INSERT INTO users(id,email,role,employee_id) VALUES(${["test-" + roles[i], email, roles[i], ids[i]].map(quote).join(",")});`,
  ),
);
mkdirSync("worker/.local", { recursive: true });
writeFileSync("worker/.local/seed.sql", sql.join("\n"), { mode: 0o600 });
console.log(
  "已生成本地测试种子：12 名员工、3 个测试账号（未打印邮箱或敏感值）。",
);
