import type { Employee } from "../types";
import { formatDateCn } from "./index";
export type CertificateType = "在职证明" | "收入证明" | "离职证明";
export interface CertificateContent {
  title: CertificateType;
  paragraphs: string[];
  documentNumber: string;
  generatedDate: string;
}
export function certificateContent(
  employee: Employee,
  type: CertificateType,
  purpose: string,
  resignDate: string,
  salaryUnlocked: boolean,
): CertificateContent | null {
  if (
    (type === "收入证明" && !salaryUnlocked) ||
    (type === "离职证明" && !resignDate)
  )
    return null;
  let body: string;
  if (type === "在职证明")
    body = `兹证明 ${employee.name}（员工工号：${employee.id}），自 ${formatDateCn(employee.hireDate)} 起加入我司并任职于 ${employee.department}，担任 ${employee.role} 一职，当前雇佣状态为「${employee.status}」。\n\n本证明仅限用于「${purpose}」，不作其他任何经济或法律担保用途。特此证明。`;
  else if (type === "收入证明")
    body = `兹证明 ${employee.name}（员工工号：${employee.id}），自 ${formatDateCn(employee.hireDate)} 起在我司 ${employee.department} 担任 ${employee.role} 一职，税前月综合收入为人民币 ¥${((employee.baseSalary || 0) + (employee.perfSalary || 0)).toLocaleString()} 元。\n\n本证明仅限用于「${purpose}」，不作任何经济担保用途。特此证明。`;
  else
    body = `兹证明 ${employee.name}（员工工号：${employee.id}），自 ${formatDateCn(employee.hireDate)} 起在我司任职于 ${employee.department}，担任 ${employee.role} 一职，于 ${formatDateCn(resignDate)} 离职，双方劳动合同已解除。特此证明。`;
  return {
    title: type,
    paragraphs: ["致相关单位：", ...body.split("\n\n")],
    documentNumber: `DOC-${employee.id}-20261125`,
    generatedDate: "2026年11月25日",
  };
}

export async function certificatePdf(
  content: CertificateContent,
): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  await document.fonts.ready;
  const pdf = await PDFDocument.create();
  pdf.setTitle(content.title);
  pdf.setSubject(content.documentNumber);
  const width = 1240,
    height = 1754,
    margin = 110,
    lineHeight = 54;
  let canvas!: HTMLCanvasElement,
    context!: CanvasRenderingContext2D,
    y = 0;
  const pages: HTMLCanvasElement[] = [];
  function newPage() {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d")!;
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#1D1D1F";
    context.textAlign = "center";
    context.font = 'bold 48px "Songti SC", "SimSun", serif';
    context.fillText(content.title, width / 2, 190);
    context.textAlign = "left";
    context.font = '30px "Songti SC", "SimSun", serif';
    y = 310;
    pages.push(canvas);
  }
  newPage();
  for (const [index, paragraph] of content.paragraphs.entries()) {
    let line = index === 0 ? "" : "　　";
    for (const char of paragraph) {
      if (context.measureText(line + char).width > width - 2 * margin) {
        if (y > height - 260) newPage();
        context.fillText(line, margin, y);
        y += lineHeight;
        line = "";
      }
      line += char;
    }
    if (line) {
      if (y > height - 260) newPage();
      context.fillText(line, margin, y);
      y += lineHeight;
    }
    y += 28;
  }
  for (const [index, pageCanvas] of pages.entries()) {
    const ctx = pageCanvas.getContext("2d")!;
    ctx.font = '22px "Songti SC", "SimSun", serif';
    ctx.fillStyle = "#6E6E73";
    ctx.fillText(
      `文档编号：${content.documentNumber}（无章版标准底稿）`,
      margin,
      height - 140,
    );
    ctx.fillText(`生成日期：${content.generatedDate}`, margin, height - 100);
    if (pages.length > 1)
      ctx.fillText(`${index + 1} / ${pages.length}`, width - 180, height - 100);
    const image = await pdf.embedPng(pageCanvas.toDataURL("image/png"));
    const page = pdf.addPage([595.28, 841.89]);
    page.drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });
}
export async function certificateWord(
  content: CertificateContent,
): Promise<Blob> {
  const {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Footer,
    Packer,
  } = await import("docx");
  const document = new Document({
    creator: "PeopleOS",
    title: content.title,
    styles: {
      default: {
        document: {
          run: { font: "宋体", size: 24, color: "1D1D1F" },
          paragraph: { spacing: { after: 240, line: 400 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `文档编号：${content.documentNumber}（无章版标准底稿）`,
                    size: 18,
                    color: "86868B",
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `生成日期：${content.generatedDate}`,
                    size: 18,
                    color: "86868B",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 720 },
            children: [
              new TextRun({
                text: content.title,
                bold: true,
                size: 36,
                color: "000000",
              }),
            ],
          }),
          ...content.paragraphs.map(
            (text, index) =>
              new Paragraph({
                text,
                indent: index ? { firstLine: 480 } : undefined,
              }),
          ),
        ],
      },
    ],
  });
  return Packer.toBlob(document);
}
export function downloadCertificate(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
