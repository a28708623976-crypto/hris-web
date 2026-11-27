import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { tsImport } from "tsx/esm/api";
import { z } from "zod";

const localDirectory = fileURLToPath(new URL("../.local/", import.meta.url));
const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";

export async function bootstrapSQL({ email, name, env = process.env }) {
  const account = z
    .object({
      email: z.email().max(254),
      name: z
        .string()
        .min(1)
        .max(100)
        .refine((v) => !/[\u0000-\u001f\u007f]/.test(v)),
    })
    .safeParse({ email: email?.trim().toLowerCase(), name: name?.trim() });
  if (!account.success)
    throw new Error(
      "请提供有效的 --email 和 --name（姓名限 1–100 字，不含控制字符）",
    );
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32)
    throw new Error("请通过环境变量提供 AUTH_SECRET（至少 32 字符）");
  if (
    !env.ENCRYPTION_KEY ||
    !/^[A-Za-z0-9+/]{43}=$/.test(env.ENCRYPTION_KEY) ||
    Buffer.from(env.ENCRYPTION_KEY, "base64").length !== 32
  )
    throw new Error(
      "请通过环境变量提供 ENCRYPTION_KEY（32 字节的标准 base64）",
    );
  const { createEmptyEmployeeForm } = await tsImport(
    "../../src/utils/index.ts",
    import.meta.url,
  );
  const { employeeFieldErrors, normaliseEmployeeDates } = await tsImport(
    "../../shared/employees.ts",
    import.meta.url,
  );
  const { encodeEmployee, salaryFields } = await tsImport(
    "../src/employee-repository.ts",
    import.meta.url,
  );
  const hireDate = new Date().toISOString().slice(0, 10);
  const input = normaliseEmployeeDates(
    createEmptyEmployeeForm({
      name: account.data.name,
      email: account.data.email,
      alias: "首个管理员（测试资料，请更新）",
      gender: "女",
      phone: "00000000000",
      birthDate: "1990-01-01",
      ethnicity: "汉族",
      householdType: "本市城镇",
      maritalStatus: "未婚",
      firstWorkDate: "2012-01-01",
      hireDate,
      department: "人力资源部",
      role: "HR 主管",
      manager: "",
      level: "",
      status: "正式员工",
      type: "全职",
      contractEntity: "测试签约主体（请更新）",
      bankCards: [],
      idDocs: [],
      educations: [],
      emergencyContacts: [],
      familyMembers: [
        {
          name: "测试家属（请更新）",
          relation: "母亲",
          gender: "",
          phone: "",
          birthDate: "",
        },
      ],
      ...Object.fromEntries(salaryFields.map((field) => [field, 0])),
      attachments: {},
    }),
  );
  const validated = employeeFieldErrors(input);
  if (!validated.data)
    throw new Error(
      "初始测试档案未通过共用校验：" +
        validated.errors.map((e) => e.field).join(", "),
    );
  const employee = { ...validated.data, id: "EMP001" };
  const enc = await encodeEmployee(employee, {
    ENCRYPTION_KEY: env.ENCRYPTION_KEY,
  });
  return [
    "-- 仅用于已迁移的全新空数据库；非幂等，请勿重复导入。测试资料上线后请更新。",
    "-- 仅两个业务记录；序列推进至 2，确保下次建档分配 EMP002。",
    `INSERT INTO employees(id,department,status,hire_date,name,role,phone,public_json,bank_cards_cipher,id_docs_cipher,salary_cipher,updated_at) VALUES(${[employee.id, employee.department, employee.status, employee.hireDate, employee.name, employee.role, employee.phone, enc.publicJson, enc.bank, enc.docs, enc.pay].map(quote).join(",")},${Date.now()});`,
    `INSERT INTO users(id,email,role,employee_id) VALUES(${["bootstrap-hr", account.data.email, "hr_lead", employee.id].map(quote).join(",")});`,
    "UPDATE employee_sequence SET next_number=MAX(next_number,2) WHERE id=1;",
    "",
  ].join("\n");
}

export async function writeBootstrap({
  email,
  name,
  output,
  env = process.env,
}) {
  const target = resolve(
    output || resolve(localDirectory, "prod-bootstrap.sql"),
  );
  const within = relative(localDirectory, target);
  if (
    !within ||
    within.startsWith("..") ||
    isAbsolute(within) ||
    !target.endsWith(".sql")
  )
    throw new Error("输出必须是 worker/.local/ 内的 .sql 文件");
  const sql = await bootstrapSQL({ email, name, env });
  mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
  try {
    writeFileSync(target, sql, { flag: "wx", mode: 0o600 });
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error(
        "SQL 文件已存在；请先安全移走旧文件，或用 --output 指定 worker/.local/ 内的新文件名。不会覆盖旧文件。",
      );
    throw error;
  }
  return target;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const { values } = parseArgs({
      options: {
        email: { type: "string" },
        name: { type: "string" },
        output: { type: "string" },
      },
    });
    const output = await writeBootstrap(values);
    console.log(
      "已生成 SQL：" +
        output +
        "\n仅 1 条测试员工档案、1 个 HR 主管账号及工号序列推进；未连接数据库或线上服务。文件不含密钥，请妥善保管。",
    );
  } catch (error) {
    console.error("首个账号 SQL 生成失败：" + error.message);
    process.exitCode = 1;
  }
}
