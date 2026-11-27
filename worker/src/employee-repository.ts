import type { Employee } from "../../src/types";
import type { Env, User } from "./env";
import { decrypt, encrypt } from "./encryption";
import { canReadEmployee } from "./permissions";
export const salaryFields = [
  "internDailyRate",
  "partTimePayRate",
  "probationBaseSalary",
  "probationPerfSalary",
  "baseSalary",
  "perfSalary",
] as const;
export interface EmployeeRow {
  id: string;
  public_json: string;
  bank_cards_cipher: string;
  id_docs_cipher: string;
  salary_cipher: string;
  version: number;
  source_hash: string | null;
}
export async function encodeEmployee(employee: Employee, env: Env) {
  const { bankCards, idDocs, ...base } = employee;
  const publicData = { ...base } as Record<string, unknown>;
  const salary: Record<string, number> = {};
  for (const field of salaryFields) {
    salary[field] = employee[field];
    delete publicData[field];
  }
  const [bank, docs, pay] = await Promise.all([
    encrypt(bankCards, env.ENCRYPTION_KEY, employee.id + ":bankCards"),
    encrypt(idDocs, env.ENCRYPTION_KEY, employee.id + ":idDocs"),
    encrypt(salary, env.ENCRYPTION_KEY, employee.id + ":salaries"),
  ]);
  return { publicJson: JSON.stringify(publicData), bank, docs, pay };
}
export async function decodeEmployee(
  row: EmployeeRow,
  env: Env,
  user: User,
): Promise<Employee & { version: number }> {
  if (!canReadEmployee(user, row.id))
    throw new Error("Sensitive data access denied");
  const [bankCards, idDocs, salary] = await Promise.all([
    decrypt(row.bank_cards_cipher, env.ENCRYPTION_KEY, row.id + ":bankCards"),
    decrypt<Employee["idDocs"]>(
      row.id_docs_cipher,
      env.ENCRYPTION_KEY,
      row.id + ":idDocs",
    ),
    decrypt(row.salary_cipher, env.ENCRYPTION_KEY, row.id + ":salaries"),
  ]);
  return {
    ...JSON.parse(row.public_json),
    ...(salary as object),
    bankCards,
    idDocs,
    id: row.id,
    version: row.version,
  };
}
