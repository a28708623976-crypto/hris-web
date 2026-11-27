import { create } from "zustand";
export interface AuthUser {
  id: string;
  email: string;
  role: "hr_lead" | "dept_head" | "employee";
  employee_id: string;
}
export const useAuthStore = create<{
  user: AuthUser | null;
  status: "loading" | "authenticated" | "anonymous" | "error";
  error: string;
}>(() => ({ user: null, status: "loading", error: "" }));
