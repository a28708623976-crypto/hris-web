export interface User {
  id: string;
  email: string;
  role: "hr_lead" | "dept_head" | "employee";
  employee_id: string;
}
export interface Env {
  DB: D1Database;
  ATTACHMENTS: R2Bucket;
  ASSETS: Fetcher;
  ENV: string;
  AUTH_SECRET: string;
  ENCRYPTION_KEY: string;
  EMAIL_FROM?: string;
  EMAIL: {
    send(message: {
      to: string;
      from: string;
      subject: string;
      text: string;
    }): Promise<unknown>;
  };
}
export type AppEnv = {
  Bindings: Env;
  Variables: { user: User; tokenHash: string };
};
