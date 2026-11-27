export const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;
export const ATTACHMENT_EXTENSIONS = [
  "jpeg",
  "jpg",
  "png",
  "pdf",
  "doc",
  "docx",
] as const;
export function attachmentExtension(name: string) {
  return name.split(".").at(-1)?.toLowerCase() || "";
}
export function attachmentError(file: { name: string; size: number }) {
  if (
    !(ATTACHMENT_EXTENSIONS as readonly string[]).includes(
      attachmentExtension(file.name),
    )
  )
    return "仅支持 JPEG、JPG、PNG、PDF、DOC、DOCX 文件";
  if (!file.size) return "不能上传空文件";
  if (file.size > MAX_ATTACHMENT_SIZE) return "单个附件不能超过 50MB";
  return null;
}
