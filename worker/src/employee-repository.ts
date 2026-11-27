import type { Employee } from "../../src/types";
import type { Env, User } from "./env";
import { decrypt, encrypt } from "./encryption";
import { assertCanAccessEmployee } from "./permissions";
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
  assertCanAccessEmployee(user, row.id);
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

export function employeeSummary<
  T extends { bankCards?: unknown; idDocs?: unknown },
>(employee: T): Omit<T, "bankCards" | "idDocs"> {
  const { bankCards: _bankCards, idDocs: _idDocs, ...summary } = employee;
  return summary;
}
export async function decodeEmployeeSummary(
  row: EmployeeRow,
  env: Env,
  user: User,
) {
  assertCanAccessEmployee(user, row.id);
  const salary = await decrypt<Record<string, number>>(
    row.salary_cipher,
    env.ENCRYPTION_KEY,
    row.id + ":salaries",
  );
  // Never decrypt the bank/identity columns for a list request.
  return employeeSummary({
    ...JSON.parse(row.public_json),
    ...salary,
    id: row.id,
    version: row.version,
  }) as Omit<Employee, "bankCards" | "idDocs"> & { version: number };
}
export async function employeeUpdateInput(
  body: unknown,
  row: EmployeeRow,
  env: Env,
) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const input = { ...body } as Record<string, unknown>;
  if (!Object.hasOwn(input, "bankCards"))
    input.bankCards = await decrypt(
      row.bank_cards_cipher,
      env.ENCRYPTION_KEY,
      row.id + ":bankCards",
    );
  if (!Object.hasOwn(input, "idDocs"))
    input.idDocs = await decrypt(
      row.id_docs_cipher,
      env.ENCRYPTION_KEY,
      row.id + ":idDocs",
    );
  return input;
}
