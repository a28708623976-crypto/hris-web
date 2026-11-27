import { useEmployeeDraft } from "../store/employeeDraft";
import { useAuthStore } from "../store/auth";
import { useStore, createInitialState } from "../store";
import { usePageStore } from "../store/pageState";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: { field: string; message: string }[] = [],
  ) {
    super(message);
  }
}
export function clearSession() {
  useEmployeeDraft.setState({
    onboarding: null,
    creationKey: null,
    busy: false,
    writeId: null,
  });
  useAuthStore.setState({ user: null, status: "anonymous", error: "" });
  useStore.setState({ ...createInitialState(), employees: [] });
  usePageStore.setState({ values: {} });
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const actor = useAuthStore.getState().user?.id;
  let response: Response;
  try {
    response = await fetch("/api" + path, {
      credentials: "same-origin",
      ...init,
      headers: {
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, "无法连接本地服务，请检查服务是否正在运行");
  }
  const body = await response
    .json()
    .catch(() => ({ error: "服务返回了无效响应" }));
  if (!response.ok) {
    if (response.status === 401 && useAuthStore.getState().user?.id === actor)
      clearSession();
    throw new ApiError(
      response.status,
      body.error || "请求失败",
      body.fields || [],
    );
  }
  return body;
}
export const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.fields.length
      ? error.fields
          .map((field) => `${field.field}：${field.message}`)
          .join("；")
      : error.message
    : error instanceof Error
      ? error.message
      : "保存失败，请重试";
