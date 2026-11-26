import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1120 },
  reducedMotion: "reduce",
});
const errors = [],
  checks = [];
let activeCase = "startup";
page.on("pageerror", (error) => errors.push(error.message));
mkdirSync("qa/artifacts", { recursive: true });
const form = () => page.locator("main form");
const type = () => page.getByRole("combobox", { name: "申请业务类型" });
const history = () =>
  page
    .getByRole("heading", { name: "我的申请记录", exact: true })
    .locator("..")
    .locator("..");
const submit = () =>
  form().getByRole("button", { name: "提交审批申请", exact: true }).click();
async function choose(labels) {
  activeCase = "choose " + labels.join("/");
  if ((await type().getAttribute("aria-expanded")) !== "true")
    await type().click();
  for (const label of labels)
    await page.getByRole("menuitem", { name: label, exact: true }).click();
  assert.equal((await type().innerText()).trim(), labels.join(" / "));
  assert.equal(
    await page.getByRole("menu").count(),
    0,
    "only leaf selection closes popup",
  );
}
function pass(label) {
  checks.push(label);
  console.log("PASS " + label);
}
try {
  await page.goto(base + "/self-service");
  await page.getByRole("heading", { name: "员工自助", exact: true }).waitFor();
  assert.equal(await form().locator("input,textarea,select").count(), 0);
  await submit();
  assert.ok((await form().innerText()).includes("请选择最末级申请事项"));
  await type().click();
  assert.equal(await page.getByRole("menu").count(), 1);
  await page.getByRole("menuitem", { name: "假勤申请", exact: true }).click();
  assert.equal(await page.getByRole("menu").count(), 2);
  assert.equal((await type().innerText()).trim(), "请选择申请事项");
  await page.getByRole("menuitem", { name: "休假申请", exact: true }).click();
  assert.equal(await page.getByRole("menu").count(), 3);
  assert.equal(await form().locator("input").count(), 0);
  await page.getByRole("menuitem", { name: "年假申请", exact: true }).click();
  assert.equal(
    (await type().innerText()).trim(),
    "假勤申请 / 休假申请 / 年假申请",
  );
  await page.screenshot({
    path: "qa/artifacts/self-service-leave.png",
    fullPage: true,
  });
  for (const label of [
    "开始日期",
    "结束日期",
    "请假天数",
    "工作交接人",
    "请假事由",
  ])
    assert.equal(await page.getByLabel(label).count(), 1);
  await submit();
  assert.equal(await form().getByRole("alert").count(), 5);
  assert.ok((await history().innerText()).includes("共 3 条记录"));
  pass("leaf-only selection, full path and all required leave fields");
  await page.getByLabel("开始日期").fill("2026-12-02");
  await page.getByLabel("结束日期").fill("2026-12-01");
  await page.getByLabel("请假天数").fill("0");
  await page.getByLabel("工作交接人").fill(" ");
  await page.getByLabel("请假事由").fill("休假");
  await submit();
  assert.ok((await form().innerText()).includes("结束日期不能早于开始日期"));
  assert.equal(await form().getByRole("alert").count(), 3);
  await page.getByLabel("结束日期").fill("2026-12-03");
  await page.getByLabel("请假天数").fill("1.5");
  await page.getByLabel("工作交接人").fill("陈嘉宁");
  await submit();
  assert.ok((await history().innerText()).includes("共 4 条记录"));
  assert.ok(
    (await history().innerText()).includes("假勤申请 / 休假申请 / 年假申请"),
  );
  assert.ok((await history().innerText()).includes("工作交接人：陈嘉宁"));
  assert.equal(await page.getByLabel("工作交接人").inputValue(), "");
  await submit();
  assert.ok((await history().innerText()).includes("共 4 条记录"));
  pass(
    "validation blocks invalid dates/numbers/blank text; successful leave creates a full-path record",
  );
  await page.getByLabel("工作交接人").fill("不应保留的字段");
  await choose(["资产申领", "电脑与外设", "办公电脑申领"]);
  assert.equal(await page.getByLabel("工作交接人").count(), 0);
  assert.equal(await page.getByLabel("电脑型号 / 配置要求").count(), 1);
  await page.getByLabel("电脑型号 / 配置要求").fill("MacBook Pro 14");
  await page.getByLabel("申领数量").fill("2");
  await page.getByLabel("期望领用日期").fill("2026-12-04");
  await page.getByLabel("申领用途").fill("研发环境");
  await submit();
  assert.ok((await history().innerText()).includes("共 5 条记录"));
  assert.ok((await history().innerText()).includes("MacBook Pro 14"));
  await choose(["假勤申请", "休假申请", "年假申请"]);
  assert.equal(await page.getByLabel("工作交接人").inputValue(), "");
  pass(
    "asset-specific fields, numeric quantity and clean state after switching request types",
  );
  await choose(["费用报销", "日常费用", "办公采购报销"]);
  await submit();
  assert.ok((await form().innerText()).includes("请上传发票"));
  await page.getByLabel("费用发生日期").fill("2026-12-01");
  await page.getByLabel("报销金额（元）").fill("123.45");
  await page.getByLabel("费用归属部门").selectOption("技术部");
  await page.getByLabel("采购明细及用途").fill("采购办公配件");
  await page.getByLabel("发票上传").setInputFiles([
    {
      name: "invoice-a.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 qa"),
    },
    {
      name: "invoice-b.png",
      mimeType: "image/png",
      buffer: Buffer.from("qa image"),
    },
  ]);
  await submit();
  assert.ok((await history().innerText()).includes("共 6 条记录"));
  assert.ok(
    (await history().innerText()).includes(
      "费用报销 / 日常费用 / 办公采购报销",
    ),
  );
  for (const value of ["123.45", "invoice-a.pdf", "invoice-b.png", "技术部"])
    assert.ok((await history().innerText()).includes(value));
  assert.equal(await page.getByLabel("发票上传").inputValue(), "");
  assert.equal(
    await page.getByLabel("发票上传").evaluate((input) => input.files.length),
    0,
  );
  pass(
    "reimbursement amount, invoices, cost owner, record details and file input reset",
  );
  await page.getByLabel("发票上传").setInputFiles({
    name: "unsaved.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("qa"),
  });
  await choose(["综合行政", "用印管理", "公章用印"]);
  for (const label of [
    "用印文件",
    "用印用途",
    "用印份数",
    "计划用印日期",
    "经办人",
  ])
    assert.equal(await page.getByLabel(label).count(), 1);
  assert.equal(await page.getByLabel("发票上传").count(), 0);
  await page.getByLabel("用印文件").setInputFiles({
    name: "用印申请.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF qa"),
  });
  await page.getByLabel("用印用途").fill("签署合作协议");
  await page.getByLabel("用印份数").fill("3");
  await page.getByLabel("计划用印日期").fill("2026-12-05");
  await page.getByLabel("经办人").fill("李明");
  await submit();
  assert.ok((await history().innerText()).includes("共 7 条记录"));
  assert.ok(
    (await history().innerText()).includes("综合行政 / 用印管理 / 公章用印"),
  );
  assert.ok(!(await history().innerText()).includes("unsaved.pdf"));
  await choose(["费用报销", "日常费用", "办公采购报销"]);
  assert.equal(
    await page.getByLabel("发票上传").evaluate((input) => input.files.length),
    0,
  );
  pass("seal document upload, purpose, copies and cross-type file isolation");
  await type().click();
  await page.keyboard.press("Escape");
  assert.equal(await type().getAttribute("aria-expanded"), "false");
  await type().click();
  await page.getByRole("heading", { name: "员工自助", exact: true }).click();
  assert.equal(await type().getAttribute("aria-expanded"), "false");
  pass("Escape and outside-click dismissal");
  for (const role of ["部门负责人", "普通员工"]) {
    await page.goto(base + "/self-service");
    await page.locator("header select").selectOption(role);
    await choose(["资产申领", "电脑与外设", "显示器申领"]);
    await submit();
    assert.ok((await form().innerText()).includes("请填写显示器型号 / 尺寸"));
    assert.equal(
      await page
        .getByRole("heading", { name: "员工自助", exact: true })
        .count(),
      1,
    );
  }
  pass("all three roles can use the new request form");
  activeCase = "six-level keyboard cascader";
  await page.goto(base + "/qa/cascader-fixture.html");
  await type().press("ArrowDown");
  for (let index = 0; index < 5; index++)
    await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.getByTestId("selected-path").innerText(),
    "[]",
    "intermediate levels never commit a value",
  );
  await page.keyboard.press("Enter");
  assert.equal(
    await page.getByTestId("selected-path").innerText(),
    JSON.stringify(
      Array.from({ length: 6 }, (_, index) => `depth-${index + 1}`),
    ),
  );
  assert.equal(
    (await type().innerText()).trim(),
    Array.from({ length: 6 }, (_, index) => `第${index + 1}级`).join(" / "),
  );
  await type().click();
  await page.getByRole("menuitem", { name: "直接事项", exact: true }).click();
  assert.equal(
    await page.getByTestId("selected-path").innerText(),
    '["direct"]',
  );
  pass("six levels via keyboard and mixed-depth leaf paths");
  assert.deepEqual(errors, []);
  writeFileSync(
    "qa/artifacts/self-service-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(
    `PASS ${checks.length} self-service browser scenarios; dynamic forms, files and arbitrary-depth cascader; 0 runtime errors.`,
  );
} catch (error) {
  console.error(
    "FAILED SELF-SERVICE CASE",
    activeCase,
    "URL",
    page.url(),
    "ERRORS",
    errors,
  );
  await page.screenshot({
    path: "qa/artifacts/self-service-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
}
