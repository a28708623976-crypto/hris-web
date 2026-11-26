import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { prepareReference } from "./prototype-reference.mjs";
import { referenceState } from "./routes.mjs";

prepareReference();
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1120 },
  reducedMotion: "reduce",
});
const app = await context.newPage();
const reference = await context.newPage();
await reference.addInitScript(() => {
  const state = new URL(location.href).searchParams.get("state");
  if (state) globalThis.__PEOPLEOS_REFERENCE__ = JSON.parse(state);
});
const errors = [],
  checks = [];
let activeCase = "startup";
for (const page of [app, reference])
  page.on("pageerror", (error) => errors.push(error.message));
mkdirSync("qa/artifacts", { recursive: true });
const normalize = (html) =>
  html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
const dialog = (page) =>
  page
    .locator("div.fixed.inset-0.z-50")
    .filter({ has: page.locator("h3") })
    .first();
function field(page, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return dialog(page)
    .locator("label")
    .filter({ hasText: new RegExp("^\\s*" + escaped) })
    .first()
    .locator("xpath=ancestor::div[./input or ./select or ./div/input][1]")
    .locator("input, select")
    .first();
}
const tab = (page, name) =>
  dialog(page)
    .getByRole("button", { name: new RegExp("^" + name) })
    .click();
const both = async (action) => {
  await Promise.all([action(app), action(reference)]);
};
async function open(role = "HR 主管") {
  activeCase = `open ${role}`;
  await Promise.all([
    app.goto(base + "/employees"),
    reference.goto(
      base +
        "/qa/reference.html?state=" +
        encodeURIComponent(JSON.stringify(referenceState(role, "/employees"))),
    ),
  ]);
  await app.locator("header select").selectOption(role);
  await Promise.all([
    app.locator("main h1").waitFor(),
    reference.locator("main h1").waitFor(),
  ]);
}
async function same(label, screenshot = false) {
  activeCase = label;
  await both((page) => page.mouse.move(0, 0));
  await app.waitForTimeout(70);
  const [a, b] = await Promise.all([
    app.locator("#root").innerHTML(),
    reference.locator("#root").innerHTML(),
  ]);
  assert.equal(
    normalize(a),
    normalize(b),
    label + ": exact DOM, copy and classes",
  );
  const controls = (page) =>
    page
      .locator("#root input, #root select, #root textarea")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          tag: node.tagName,
          type: node.type,
          value: node.type === "file" ? "" : node.value,
          disabled: node.disabled,
        })),
      );
  assert.deepEqual(
    await controls(app),
    await controls(reference),
    label + ": field values and editability",
  );
  if (screenshot) {
    const [actual, expected] = await Promise.all([
      app.screenshot({ animations: "disabled", fullPage: true }),
      reference.screenshot({ animations: "disabled", fullPage: true }),
    ]);
    const x = PNG.sync.read(actual),
      y = PNG.sync.read(expected);
    const mismatch =
      x.width === y.width && x.height === y.height
        ? pixelmatch(x.data, y.data, null, x.width, x.height, {
            threshold: 0.1,
            includeAA: false,
          })
        : Infinity;
    if (mismatch) {
      writeFileSync("qa/artifacts/employees-actual.png", actual);
      writeFileSync("qa/artifacts/employees-reference.png", expected);
    }
    assert.equal(mismatch, 0, label + ": prototype screenshot");
  }
  checks.push(label);
}
async function inspectEmployee(id) {
  await both((page) =>
    page
      .locator("main tbody tr")
      .filter({ hasText: id })
      .getByRole("button", { name: "查看详情", exact: true })
      .click(),
  );
}
async function submitWithError(message) {
  await both((page) =>
    dialog(page)
      .getByRole("button", { name: "确认创建完整档案", exact: true })
      .click(),
  );
  assert.equal(
    await app.getByText(message, { exact: true }).count(),
    1,
    message,
  );
  await same("validation: " + message);
}
async function navigate(name) {
  await both((page) =>
    page
      .locator("aside nav")
      .getByRole("button", { name, exact: true })
      .click(),
  );
  await both((page) => page.locator("main h1").waitFor());
}
async function readonly() {
  assert.equal(
    await dialog(app)
      .locator("input:enabled, select:enabled, textarea:enabled")
      .count(),
    0,
    "View mode is readonly",
  );
}
try {
  await open();
  await same("employee-list", true);
  assert.deepEqual(await app.locator("main thead th").allTextContents(), [
    "员工",
    "所属部门",
    "岗位名称",
    "直属上级",
    "用工类型",
    "状态",
    "入职日期",
    "合同到期日",
    "操作",
  ]);
  for (const [name, count] of Object.entries({
    全部员工: 12,
    正式员工: 9,
    试用期: 2,
    兼职: 1,
    劳务: 1,
    实习生: 1,
    已离职: 1,
  })) {
    await both((page) =>
      page
        .locator("main")
        .getByRole("button", {
          name: new RegExp("^" + name + "\\s*" + count + "$"),
        })
        .click(),
    );
    assert.equal(
      await app.locator("main tbody tr").count(),
      count,
      name + " count",
    );
    await same("category " + name);
  }
  await both((page) =>
    page
      .locator("main")
      .getByRole("button", { name: /^全部员工\s*12$/ })
      .click(),
  );
  const dates = await app.locator("main tbody tr").evaluateAll((rows) =>
    rows.map((row) => ({
      date: row.cells[7].textContent,
      color: getComputedStyle(row.cells[7]).color,
    })),
  );
  for (const { date, color } of dates)
    assert.equal(
      color,
      date <= "2026-12-31" ? "rgb(217, 119, 6)" : "rgb(110, 110, 115)",
      date + " contract warning",
    );
  for (const [query, id] of [
    [" 张伟 ", "EMP002"],
    ["emp003", "EMP003"],
    ["AI 视效", "EMP002"],
  ]) {
    await both((page) =>
      page.getByPlaceholder("搜索姓名、工号或岗位...").fill(query),
    );
    assert.equal(await app.locator("main tbody tr").count(), 1);
    assert.ok((await app.locator("main tbody").innerText()).includes(id));
    await same("search " + query);
  }
  await both((page) =>
    page.getByPlaceholder("搜索姓名、工号或岗位...").fill(""),
  );
  for (const [index, value] of [
    [0, "技术部"],
    [1, "试用期"],
    [2, "2026-09"],
  ]) {
    await both((page) =>
      page.locator("main select").nth(index).selectOption(value),
    );
    await same("filter " + value);
  }
  assert.equal(await app.locator("main tbody tr").count(), 1);
  assert.ok((await app.locator("main tbody").innerText()).includes("张伟"));
  await both((page) =>
    page.getByPlaceholder("搜索姓名、工号或岗位...").fill("no-such-person"),
  );
  assert.equal(await app.locator("main tbody tr").count(), 0);
  await same("empty-filter-result");
  await open();
  await both((page) =>
    page
      .locator("main button")
      .filter({ has: page.locator("svg.lucide-layout-grid") })
      .click(),
  );
  assert.equal(await app.locator("main table").count(), 0);
  await same("employee-cards", true);
  await both((page) => page.getByText("林晓梅", { exact: true }).click());
  await same("card-opens-detail");
  await both((page) =>
    dialog(page).getByRole("button", { name: "关闭", exact: true }).click(),
  );
  await both((page) =>
    page
      .locator("main button")
      .filter({ has: page.locator("svg.lucide-list") })
      .click(),
  );
  assert.equal(await app.locator("main tbody tr").count(), 12);
  await same("return-to-table");
  await both((page) =>
    page.getByPlaceholder("搜索姓名、工号或岗位...").fill("张伟"),
  );
  const exports = await Promise.all(
    [app, reference].map(async (page) => {
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "导出报表", exact: true }).click();
      const result = await download;
      return {
        filename: result.suggestedFilename(),
        bytes: readFileSync(await result.path()),
      };
    }),
  );
  assert.equal(exports[0].filename, exports[1].filename);
  assert.deepEqual(
    exports[0].bytes,
    exports[1].bytes,
    "CSV content matches prototype including BOM and export-all scope",
  );
  assert.deepEqual([...exports[0].bytes.subarray(0, 3)], [239, 187, 191]);
  assert.equal(exports[0].bytes.toString("utf8").split("\n").length, 13);
  assert.equal(
    exports[0].bytes.toString("utf8").split("\n")[0],
    "\uFEFF工号,姓名,部门,岗位,用工类型,状态,入职日期,合同到期日",
  );
  checks.push(
    "CSV download: BOM, 8 prototype columns, 12 records despite active filter",
  );

  console.log(
    "PASS employee list: pills, filters, search, table/cards, warning colors and CSV",
  );
  await open();
  await inspectEmployee("EMP001");
  const tabs = [
    "个人信息",
    "银行卡信息",
    "证件信息",
    "教育经历",
    "紧急联系人",
    "家庭成员",
    "资料附件",
    "岗位与薪酬",
  ];
  for (const name of tabs) {
    await both((page) => tab(page, name));
    await readonly();
    await same("detail-view " + name, true);
  }
  await both((page) =>
    dialog(page)
      .getByRole("button", { name: "编辑档案资料", exact: true })
      .click(),
  );
  for (const name of tabs) {
    await both((page) => tab(page, name));
    await same("detail-edit " + name, true);
  }
  const repeaters = [
    ["银行卡信息", "添加银行卡"],
    ["证件信息", "添加证件信息"],
    ["教育经历", "添加教育经历"],
    ["紧急联系人", "添加紧急联系人"],
    ["家庭成员", "添加家庭成员"],
  ];
  for (const [name, add] of repeaters) {
    await both((page) => tab(page, name));
    await both((page) =>
      dialog(page).getByRole("button", { name: add, exact: true }).click(),
    );
    await same("add row " + name);
    await both((page) =>
      dialog(page)
        .getByRole("button", { name: "删除", exact: true })
        .last()
        .click(),
    );
    await same("remove row " + name);
  }
  await both((page) => tab(page, "资料附件"));
  await both((page) =>
    dialog(page)
      .locator("input[type=file]")
      .first()
      .setInputFiles({
        name: "qa-id-front.png",
        mimeType: "image/png",
        buffer: Buffer.from("qa-only"),
      }),
  );
  await same("attachment filename update");
  await both((page) => tab(page, "个人信息"));
  await both((page) => field(page, "别名 / 英文名").fill("尚未保存的别名"));
  await both((page) =>
    dialog(page).getByRole("button", { name: "关闭", exact: true }).click(),
  );
  await inspectEmployee("EMP001");
  assert.equal(await field(app, "别名 / 英文名").inputValue(), "May Lin");
  await same("unsaved edit does not mutate employee");
  console.log(
    "PASS employee detail: all 8 tabs in view/edit modes, repeatable rows and attachments",
  );

  await open();
  await both((page) =>
    page.getByRole("button", { name: "新增员工", exact: true }).click(),
  );
  await same("new-shared-form", true);
  await submitWithError("请填写员工真实姓名");
  await both((page) => field(page, "姓名").fill("专项验收员工"));
  await submitWithError("请选择性别");
  await both((page) => field(page, "性别").selectOption("女"));
  await both((page) => field(page, "手机号码").fill("1380013800"));
  await submitWithError("个人手机号码必须为 11 位纯数字");
  await both((page) => field(page, "手机号码").fill("13800138000"));
  await submitWithError("请选择出生日期");
  await both((page) => field(page, "出生日期").fill("1996-05-12"));
  assert.equal(await field(app, "年龄").inputValue(), "30 岁");
  await both((page) => field(page, "民族").selectOption("汉族"));
  await both((page) => field(page, "户口类型").selectOption("本市城镇"));
  await both((page) => field(page, "婚姻状况").selectOption("未婚"));
  await both((page) => field(page, "首次参加工作日期").fill("2020-06-01"));
  assert.equal(await field(app, "累计工龄").inputValue(), "6 年 5 个月");
  await submitWithError("请在「岗位与薪酬」中填写岗位名称");
  await both((page) => tab(page, "岗位与薪酬"));
  await both((page) => field(page, "岗位名称").fill("专项验收工程师"));
  for (const type of ["全职", "兼职", "劳务", "实习"]) {
    await both((page) =>
      dialog(page).getByRole("button", { name: type, exact: true }).click(),
    );
    const labels = await dialog(app).locator("label").allTextContents();
    assert.equal(
      labels.some((label) => label.includes("劳动合同开始时间")),
      type === "全职",
    );
    assert.equal(
      labels.some((label) => label.includes("实习期开始时间")),
      type === "实习",
    );
    assert.equal(
      labels.some((label) => label.includes("计薪标准模式")),
      type === "兼职" || type === "劳务",
    );
    await same("employment-fields " + type, true);
    if (type === "实习") {
      await both((page) => field(page, "实习补贴 / 实习报酬").fill("450"));
      await same("intern-pay edit");
    } else if (type === "兼职" || type === "劳务") {
      await both((page) =>
        field(page, "计薪标准模式").selectOption("按月计酬 (元/月)"),
      );
      await both((page) => field(page, "协议报酬金额").fill("12000"));
      await same(type + " pay edit");
    }
  }
  await both((page) =>
    dialog(page).getByRole("button", { name: "全职", exact: true }).click(),
  );
  await both((page) => field(page, "劳动合同开始时间").fill("2026-12-01"));
  assert.equal(await field(app, "劳动合同结束时间").inputValue(), "2029-12-01");
  for (const [period, end] of [
    ["1个月", "2027-01-01"],
    ["2个月", "2027-02-01"],
    ["3个月", "2027-03-01"],
    ["6个月", "2027-06-01"],
  ]) {
    await both((page) =>
      dialog(page).getByRole("button", { name: period, exact: true }).click(),
    );
    assert.equal(await field(app, "试用期结束时间").inputValue(), end);
    await same("probation automatic end " + period);
  }
  await both((page) => field(page, "劳动合同结束时间").fill("2026-12-31"));
  await both((page) => tab(page, "银行卡信息"));
  await both((page) => field(page, "持卡人身份证号").fill("11010519960512432"));
  await submitWithError("银行卡 1 的持卡人身份证号必须为 18 位纯数字");
  await both((page) =>
    field(page, "持卡人身份证号").fill("110105199605124321"),
  );
  await both((page) => field(page, "银行预留手机号").fill("1380013800"));
  await submitWithError("银行卡 1 的银行预留手机号必须为 11 位纯数字");
  await both((page) => field(page, "银行预留手机号").fill("13800138000"));
  await both((page) => tab(page, "证件信息"));
  await both((page) => field(page, "证件号码").fill("11010519960512432"));
  await submitWithError("证件信息 1 为居民身份证，必须填写 18 位纯数字");
  await both((page) => field(page, "证件号码").fill("110105199605124321"));
  await submitWithError(
    "请在「家庭成员」中至少填写一位直系亲属（父母/兄弟姐妹）姓名",
  );
  await both((page) => tab(page, "家庭成员"));
  await both((page) =>
    page.getByPlaceholder("请输入家庭成员姓名").fill("验收家属"),
  );
  await both((page) =>
    dialog(page)
      .getByRole("button", { name: "确认创建完整档案", exact: true })
      .click(),
  );
  await same("create complete employee");
  console.log(
    "PASS employee creation: field validation, four employment types and automatic dates",
  );
  assert.equal(await app.locator("main tbody tr").count(), 13);
  let row = app.locator("main tbody tr").filter({ hasText: "专项验收员工" });
  assert.ok((await row.innerText()).includes("EMP013"));
  assert.equal(
    await row
      .locator("td")
      .nth(7)
      .evaluate((node) => getComputedStyle(node).color),
    "rgb(217, 119, 6)",
    "Inclusive 2026-12-31 boundary",
  );
  await navigate("合同管理");
  await same("new employee contract linked");
  row = app.locator("main tbody tr").filter({ hasText: "专项验收员工" });
  assert.ok((await row.innerText()).includes("2026-12-31"));
  await navigate("工作台");
  await same("new employee dashboard linked");
  assert.ok(
    (
      await app
        .getByText("30天内合同到期", { exact: true })
        .locator("..")
        .locator("..")
        .innerText()
    ).includes("3 份"),
  );
  await navigate("员工档案");
  await inspectEmployee("EMP013");
  await both((page) =>
    dialog(page)
      .getByRole("button", { name: "编辑档案资料", exact: true })
      .click(),
  );
  await both((page) => tab(page, "岗位与薪酬"));
  await both((page) => field(page, "劳动合同结束时间").fill("2027-01-01"));
  await both((page) =>
    dialog(page)
      .getByRole("button", { name: "保存档案修改", exact: true })
      .click(),
  );
  await readonly();
  await same("save returns to view mode");
  await both((page) =>
    dialog(page).getByRole("button", { name: "关闭", exact: true }).click(),
  );
  row = app.locator("main tbody tr").filter({ hasText: "专项验收员工" });
  assert.equal(
    await row
      .locator("td")
      .nth(7)
      .evaluate((node) => getComputedStyle(node).color),
    "rgb(110, 110, 115)",
    "2027-01-01 is outside warning",
  );
  await navigate("合同管理");
  await same("edited contract date linked");
  assert.ok(
    (
      await app
        .locator("main tbody tr")
        .filter({ hasText: "专项验收员工" })
        .innerText()
    ).includes("2027-01-01"),
  );
  await navigate("工作台");
  await same("edited dashboard warning count linked");
  assert.ok(
    (
      await app
        .getByText("30天内合同到期", { exact: true })
        .locator("..")
        .locator("..")
        .innerText()
    ).includes("2 份"),
  );
  console.log(
    "PASS shared employee data: contract and dashboard update after create/edit",
  );
  for (const action of ["发起转正流程", "发起离职流程"]) {
    await open();
    await inspectEmployee("EMP002");
    await both((page) =>
      dialog(page).getByRole("button", { name: action, exact: true }).click(),
    );
    await same("HR " + action);
    assert.equal(new URL(app.url()).pathname, "/lifecycle");
  }
  await open();
  await inspectEmployee("EMP012");
  assert.equal(
    await dialog(app)
      .getByRole("button", { name: /发起转正|发起离职/ })
      .count(),
    0,
  );
  await same("former employee has no lifecycle actions");
  await open("普通员工");
  assert.equal(await app.locator("main tbody tr").count(), 1);
  assert.ok((await app.locator("main tbody").innerText()).includes("EMP005"));
  assert.equal(await app.locator("main select").count(), 0);
  assert.equal(
    await app
      .locator("main")
      .getByRole("button", { name: /新增员工|导出报表|全部员工/ })
      .count(),
    0,
  );
  await same("employee self-only list", true);
  await inspectEmployee("EMP005");
  for (const name of tabs) {
    await both((page) => tab(page, name));
    await readonly();
    await same("self readonly " + name);
  }
  assert.equal(
    await dialog(app)
      .getByRole("button", { name: /编辑档案|保存档案|发起转正|发起离职/ })
      .count(),
    0,
  );
  await open("部门负责人");
  await app.waitForURL("**/dashboard");
  await same("department lead cannot open employee directory");

  // Explicit user requirement: switching scope must show the current employee.
  // The original prototype retains HR filter state here; do not change the oracle.
  await app.goto(base + "/employees");
  await app.locator("main select").nth(0).selectOption("技术部");
  await app.locator("main select").nth(1).selectOption("试用期");
  await app.locator("main select").nth(2).selectOption("2026-09");
  await app.getByPlaceholder("搜索姓名、工号或岗位...").fill("张伟");
  await app.locator("header select").selectOption("普通员工");
  await app.getByRole("heading", { name: "我的档案", exact: true }).waitFor();
  assert.equal(
    await app.locator("main tbody tr").count(),
    1,
    "HR filters must not hide the current employee after switching roles",
  );
  assert.ok((await app.locator("main tbody").innerText()).includes("EMP005"));
  assert.equal(
    await app.getByPlaceholder("搜索姓名、工号或岗位...").inputValue(),
    "",
  );
  checks.push("role switch resets HR filters and shows only EMP005");
  assert.deepEqual(errors, []);
  writeFileSync(
    "qa/artifacts/employees-results.json",
    JSON.stringify(
      {
        checks,
        errors,
        prototypeOverride:
          "Only the explicit self-profile scope reset regression differs from the prototype.",
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS ${checks.length} employees checks: prototype DOM/fields/screenshots, CSV, all 8 tabs, 4 employment types, validation, create/edit, contract/dashboard linkage, and role scopes; 0 runtime errors.`,
  );
} catch (error) {
  console.error(
    "FAILED EMPLOYEES CASE:",
    activeCase,
    "URL:",
    app.url(),
    "ERRORS:",
    errors,
  );
  await app.screenshot({
    path: "qa/artifacts/employees-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
}
