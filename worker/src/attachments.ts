import { Hono } from "hono";
import type { AppEnv } from "./env";
import { ATTACHMENT_SLOTS } from "../../src/constants";
import {
  attachmentError,
  attachmentExtension,
  MAX_ATTACHMENT_SIZE,
} from "../../shared/attachments";
export const attachments = new Hono<AppEnv>();
interface AttachmentRow {
  object_key: string;
  filename: string;
  mime_type: string;
  size: number;
}
const mime: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
function validMagic(ext: string, bytes: Uint8Array) {
  const starts = (values: number[]) =>
    values.every((value, index) => bytes[index] === value);
  if (ext === "jpg" || ext === "jpeg") return starts([255, 216, 255]);
  if (ext === "png") return starts([137, 80, 78, 71, 13, 10, 26, 10]);
  if (ext === "pdf") return starts([37, 80, 68, 70, 45]);
  if (ext === "doc") return starts([208, 207, 17, 224, 161, 177, 26, 225]);
  return starts([80, 75, 3, 4]);
}
attachments.post("/:id/attachments/:slot", async (c) => {
  const id = c.req.param("id"),
    slot = c.req.param("slot");
  if (!ATTACHMENT_SLOTS.some((item) => item.key === slot))
    return c.json({ error: "附件类别无效" }, 400);
  const employee = await c.env.DB.prepare(
    "SELECT version FROM employees WHERE id=?",
  )
    .bind(id)
    .first<{ version: number }>();
  if (!employee) return c.json({ error: "员工不存在" }, 404);
  const match = c.req.header("If-Match");
  if (match && match !== String(employee.version))
    return c.json({ error: "档案已被更新，请重新加载后再上传" }, 409);
  let filename: string;
  try {
    filename = decodeURIComponent(c.req.header("X-File-Name") || "");
  } catch {
    return c.json({ error: "文件名无效" }, 400);
  }
  if (!filename || filename.length > 255 || /[\x00-\x1f\x7f]/.test(filename))
    return c.json({ error: "文件名无效" }, 400);
  filename = filename.replaceAll("\\", "_").replaceAll("/", "_");
  const size = Number(
    c.req.header("X-File-Size") || c.req.header("Content-Length"),
  );
  if (!Number.isSafeInteger(size) || size < 1)
    return c.json({ error: "请提供有效文件大小" }, 411);
  const error = attachmentError({ name: filename, size });
  if (error) return c.json({ error }, size > MAX_ATTACHMENT_SIZE ? 413 : 415);
  if (!c.req.raw.body) return c.json({ error: "文件内容为空" }, 400);
  const ext = attachmentExtension(filename),
    reader = c.req.raw.body.getReader();
  const chunks: Uint8Array[] = [];
  let count = 0,
    ended = false;
  while (count < 8 && !ended) {
    const part = await reader.read();
    ended = part.done;
    if (part.value) {
      chunks.push(part.value);
      count += part.value.byteLength;
    }
  }
  const prefix = new Uint8Array(Math.min(count, 8));
  let offset = 0;
  for (const chunk of chunks) {
    const take = chunk.subarray(0, 8 - offset);
    prefix.set(take, offset);
    offset += take.byteLength;
    if (offset === 8) break;
  }
  if (!validMagic(ext, prefix)) {
    await reader.cancel();
    return c.json({ error: "文件内容与扩展名不符" }, 415);
  }
  const key = `${id}/${slot}/${crypto.randomUUID()}`;
  const old = await c.env.DB.prepare(
    "SELECT * FROM attachments WHERE employee_id=? AND slot=?",
  )
    .bind(id, slot)
    .first<AttachmentRow>();
  const stream = new FixedLengthStream(size),
    writer = stream.writable.getWriter();
  const stored = c.env.ATTACHMENTS.put(key, stream.readable, {
    httpMetadata: { contentType: mime[ext] },
    customMetadata: { employeeId: id, slot },
  });
  void stored.catch(() => {});
  try {
    if (count > size || count > MAX_ATTACHMENT_SIZE) throw new Error("size");
    for (const chunk of chunks) await writer.write(chunk);
    while (!ended) {
      const part = await reader.read();
      ended = part.done;
      if (part.value) {
        count += part.value.byteLength;
        if (count > size || count > MAX_ATTACHMENT_SIZE)
          throw new Error("size");
        await writer.write(part.value);
      }
    }
    if (count !== size) throw new Error("size");
    await writer.close();
    await stored;
  } catch {
    await writer.abort().catch(() => {});
    await reader.cancel().catch(() => {});
    await stored.catch(() => {});
    await c.env.ATTACHMENTS.delete(key).catch(() => {});
    return c.json(
      {
        error:
          count > MAX_ATTACHMENT_SIZE
            ? "单个附件不能超过 50MB"
            : "文件大小不符或上传中断",
      },
      count > MAX_ATTACHMENT_SIZE ? 413 : 400,
    );
  }
  if (ext === "docx") {
    const tail = await c.env.ATTACHMENTS.get(key, {
      range: { suffix: Math.min(size, 65557) },
    });
    const buffer = tail
      ? new Uint8Array(await tail.arrayBuffer())
      : new Uint8Array();
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );
    let centralStart = -1,
      centralSize = 0;
    for (let i = buffer.length - 22; i >= 0; i--) {
      if (
        view.getUint32(i, true) === 0x06054b50 &&
        i + 22 + view.getUint16(i + 20, true) === buffer.length
      ) {
        centralSize = view.getUint32(i + 12, true);
        centralStart = view.getUint32(i + 16, true);
        break;
      }
    }
    let types = false,
      document = false;
    if (
      centralStart >= 0 &&
      centralSize > 0 &&
      centralStart + centralSize <= size
    ) {
      const directory = await c.env.ATTACHMENTS.get(key, {
        range: { offset: centralStart, length: centralSize },
      });
      if (directory) {
        const reader = directory.body.getReader();
        const decoder = new TextDecoder();
        let overlap = "";
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          const text = overlap + decoder.decode(part.value, { stream: true });
          types ||= text.includes("[Content_Types].xml");
          document ||= text.includes("word/document.xml");
          overlap = text.slice(-256);
        }
      }
    }
    if (!types || !document) {
      await c.env.ATTACHMENTS.delete(key);
      return c.json({ error: "DOCX 文件结构无效" }, 415);
    }
  }
  const now = Date.now();
  try {
    const result = await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO audit_logs(actor_id,employee_id,action,sensitive_fields,created_at) SELECT ?,?,'attachment_upload',?,? WHERE EXISTS(SELECT 1 FROM employees WHERE id=? AND version=?)`,
      ).bind(
        c.get("user").id,
        id,
        JSON.stringify(["attachments." + slot]),
        now,
        id,
        employee.version,
      ),
      c.env.DB.prepare(
        `INSERT INTO attachments(employee_id,slot,object_key,filename,mime_type,size,uploaded_at) SELECT ?,?,?,?,?,?,? FROM employees WHERE id=? AND version=? ON CONFLICT(employee_id,slot) DO UPDATE SET object_key=excluded.object_key,filename=excluded.filename,mime_type=excluded.mime_type,size=excluded.size,uploaded_at=excluded.uploaded_at`,
      ).bind(
        id,
        slot,
        key,
        filename,
        mime[ext],
        size,
        now,
        id,
        employee.version,
      ),
      c.env.DB.prepare(
        `UPDATE employees SET public_json=json_set(public_json,?,?),version=version+1,updated_at=? WHERE id=? AND version=?`,
      ).bind("$.attachments." + slot, filename, now, id, employee.version),
    ]);
    if (!result[2].meta.changes) {
      await c.env.ATTACHMENTS.delete(key);
      return c.json({ error: "档案已被更新，请重新加载后再上传" }, 409);
    }
  } catch (error) {
    await c.env.ATTACHMENTS.delete(key);
    throw error;
  }
  if (old)
    await c.env.ATTACHMENTS.delete(old.object_key).catch(() => {
      console.warn("Old private attachment cleanup deferred");
    });
  return c.json(
    {
      attachment: { slot, filename, size, mime: mime[ext], uploadedAt: now },
      version: employee.version + 1,
    },
    201,
  );
});
attachments.get("/:id/attachments/:slot", async (c) => {
  const id = c.req.param("id"),
    slot = c.req.param("slot");
  const attachment = await c.env.DB.prepare(
    "SELECT * FROM attachments WHERE employee_id=? AND slot=?",
  )
    .bind(id, slot)
    .first<AttachmentRow>();
  if (!attachment) return c.json({ error: "附件不存在" }, 404);
  const object = await c.env.ATTACHMENTS.get(attachment.object_key);
  if (!object) return c.json({ error: "附件内容不存在" }, 404);
  await c.env.DB.prepare(
    "INSERT INTO audit_logs(actor_id,employee_id,action,sensitive_fields,created_at) VALUES(?,?,?,?,?)",
  )
    .bind(
      c.get("user").id,
      id,
      "attachment_download",
      JSON.stringify(["attachments." + slot]),
      Date.now(),
    )
    .run();
  const encoded = encodeURIComponent(attachment.filename).replace(
    /['()*]/g,
    (char) => "%" + char.charCodeAt(0).toString(16),
  );
  return new Response(object.body, {
    headers: {
      "Content-Type": attachment.mime_type,
      "Content-Length": String(attachment.size),
      "Content-Disposition": `attachment; filename="download.${attachmentExtension(attachment.filename)}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
