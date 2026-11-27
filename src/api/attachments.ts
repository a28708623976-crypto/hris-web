import { clearSession, ApiError } from "./client";
export async function downloadAttachment(
  employeeId: string,
  slot: string,
  filename: string,
) {
  const response = await fetch(
    `/api/employees/${encodeURIComponent(employeeId)}/attachments/${encodeURIComponent(slot)}`,
    { credentials: "same-origin" },
  );
  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new ApiError(
      response.status,
      (await response.json().catch(() => ({ error: "附件下载失败" }))).error,
    );
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
