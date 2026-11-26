# 证明文件验收

2026-11-26，以只读原型为视觉和交互基准。

- `npm run build`、`npm test`、`npm run check:certificates` 通过；证明模块 6 项状态检查、11 组浏览器场景，浏览器错误 0。
- 员工选择、纯文字类型按钮组、用途输入、右侧预览、收入锁定、离职日期必填、非 HR 路由限制均核对原型 DOM 和控件值。
- 修复原型下载内容是纯文本却使用 PDF/Word 扩展名的问题。三类证明分别下载真正的 PDF 和可编辑 DOCX，校验文件签名、PDF 页数和 DOCX 中文正文。
- PDFKit 渲染三份 PDF、Quick Look 渲染三份 Word，逐份查看：中文清晰、无裁切、均一页。标准 Word 渲染脚本因本机缺少 pdf2image 无法运行，采用 macOS 原生渲染替代。
- PDF 使用高清画布嵌入，中文不依赖外部字体服务，但文本不可搜索；Word 使用现代 DOCX 格式。页面布局、按钮和文案保持原型。
- 证据输出在忽略目录 `qa/artifacts/`；可用 `qa/render-certificates.swift` 重新渲染 PDF。
