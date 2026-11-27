import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
if (existsSync("worker/.dev.vars")) {
  console.log("本地配置已存在，保留原密钥和账号。");
  process.exit(0);
}
const test = process.argv.includes("--test");
const rl = test ? null : createInterface({ input: stdin, output: stdout });
const emails = [];
try {
  for (const [index, key] of [
    "SEED_HR_EMAIL",
    "SEED_DEPT_EMAIL",
    "SEED_EMP_EMAIL",
  ].entries()) {
    const role = ["HR 主管", "部门负责人", "普通员工"][index];
    const email =
      process.env[key] ||
      (test
        ? `${randomUUID()}@example.invalid`
        : await rl.question(`请输入${role}的测试邮箱：`));
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("邮箱格式无效，请重试");
    emails.push(email.trim().toLowerCase());
  }
  if (new Set(emails).size !== 3) throw new Error("请使用三个不同的测试邮箱");
  const vars = [
    "ENV=dev",
    "AUTH_SECRET=" + randomBytes(32).toString("hex"),
    "ENCRYPTION_KEY=" + randomBytes(32).toString("base64"),
    ...["SEED_HR_EMAIL", "SEED_DEPT_EMAIL", "SEED_EMP_EMAIL"].map(
      (key, i) => `${key}=${emails[i]}`,
    ),
  ];
  writeFileSync("worker/.dev.vars", vars.join("\n") + "\n", {
    mode: 0o600,
    flag: "wx",
  });
  console.log("已创建忽略提交的 worker/.dev.vars。本地开发不发送邮件。");
} finally {
  rl?.close();
}
