import type { Env, User } from "./env";
export const sensitiveFields = [
  "bankCards",
  "idDocs",
  "internDailyRate",
  "partTimePayRate",
  "probationBaseSalary",
  "probationPerfSalary",
  "baseSalary",
  "perfSalary",
];
export function auditStatement(
  env: Env,
  user: User,
  id: string,
  action:
    "read" | "update" | "create" | "attachment_upload" | "attachment_download",
  fields: readonly string[] = sensitiveFields,
) {
  return env.DB.prepare(
    "INSERT INTO audit_logs(actor_id,employee_id,action,sensitive_fields,created_at) VALUES(?,?,?,?,?)",
  ).bind(user.id, id, action, JSON.stringify(fields), Date.now());
}
