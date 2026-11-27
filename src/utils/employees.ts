import type { EmployeeForm } from "../types";
import { employeeFieldErrors } from "../../shared/employees";
export const validateEmployeeForm = (form: EmployeeForm) =>
  employeeFieldErrors(form).errors[0]?.message ?? null;
