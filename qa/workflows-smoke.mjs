import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { prepareReference } from "./prototype-reference.mjs";
import { canAccess, referenceState } from "./routes.mjs";

prepareReference();
const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1120 },
  reducedMotion: "reduce",
});
const app = await context.newPage(),
  reference = await context.newPage();
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
const both = async (action) => {
  await Promise.all([action(app), action(reference)]);
};
const modal = (page) =>
  page
    .locator("div.fixed.inset-0.z-50")
    .filter({ has: page.locator("h3") })
    .first();
const pending = (page) =>
  page.locator("div.fixed.inset-0").filter({
    has: page.getByRole("heading", {
      name: "确认材料待补全先行入职",
      exact: true,
    }),
  });
const queueRow = (page, id) =>
  page.locator("main div.p-5").filter({ hasText: id });
const employeeRow = (page, id) =>
  page.locator("main tbody tr").filter({ hasText: id });
function field(page, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return modal(page)
    .locator("label")
    .filter({ hasText: new RegExp("^\\s*" + escaped) })
    .first()
    .locator(
      "xpath=ancestor::div[./input or ./select or ./textarea or ./div/input][1]",
    )
    .locator("input,select,textarea")
    .first();
}
async function open(route = "/onboarding", role = "HR 主管") {
  activeCase = `open ${route} ${role}`;
  await Promise.all([
    app.goto(base + route),
    reference.goto(
      base +
        "/qa/reference.html?state=" +
        encodeURIComponent(JSON.stringify(referenceState(role, route))),
    ),
  ]);
  await app.locator("header select").selectOption(role);
  const path = canAccess(role, route) ? route : "/dashboard";
  await app.waitForURL((url) => url.pathname === path);
  await both((page) => page.locator("main h1").waitFor());
}
async function same(label, screenshot = false) {
  activeCase = label;
  await both((page) => page.mouse.move(0, 0));
  await app.waitForTimeout(80);
  const [actual, expected] = await Promise.all([
    app.locator("#root").innerHTML(),
    reference.locator("#root").innerHTML(),
  ]);
  if (normalize(actual) !== normalize(expected)) {
    writeFileSync("qa/artifacts/workflows-actual.html", actual);
    writeFileSync("qa/artifacts/workflows-reference.html", expected);
    assert.fail(
      label + ": DOM/copy/classes differ from prototype; see qa/artifacts",
    );
  }
  const controls = (page) =>
    page
      .locator("#root input,#root select,#root textarea")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          type: node.type,
          value: node.value,
          disabled: node.disabled,
          checked: node.checked,
        })),
      );
  assert.deepEqual(
    await controls(app),
    await controls(reference),
    label + ": control values, checkmarks and editability",
  );
  if (screenshot) {
    const [a, b] = await Promise.all([
      app.screenshot({ animations: "disabled", fullPage: true }),
      reference.screenshot({ animations: "disabled", fullPage: true }),
    ]);
    const x = PNG.sync.read(a),
      y = PNG.sync.read(b);
    const difference =
      x.width === y.width && x.height === y.height
        ? pixelmatch(x.data, y.data, null, x.width, x.height, {
            threshold: 0.1,
            includeAA: false,
          })
        : Infinity;
    if (difference) {
      writeFileSync("qa/artifacts/workflows-actual.png", a);
      writeFileSync("qa/artifacts/workflows-reference.png", b);
    }
    assert.equal(difference, 0, label + ": prototype screenshot");
  }
  checks.push(label);
}
async function navigate(name) {
  await both((page) =>
    page
      .locator("aside nav")
      .getByRole("button", { name: new RegExp("^" + name) })
      .click(),
  );
  await both((page) => page.locator("main h1").waitFor());
}
async function verify(id, button = "核验材料并办理") {
  await both((page) =>
    queueRow(page, id)
      .getByRole("button", { name: button, exact: true })
      .click(),
  );
}
async function detail(id) {
  await both((page) =>
    queueRow(page, id)
      .getByRole("button", { name: "查看详情", exact: true })
      .click(),
  );
}
async function employeeDates(
  id,
  name,
  hireDate,
  probationEnd,
  contractEnd,
  salary,
) {
  await navigate("员工档案");
  const row = employeeRow(app, id);
  assert.ok((await row.innerText()).includes(name));
  assert.ok((await row.innerText()).includes("试用期"));
  assert.equal(await row.locator("td").nth(6).innerText(), hireDate);
  assert.equal(await row.locator("td").nth(7).innerText(), contractEnd);
  await both((page) =>
    employeeRow(page, id)
      .getByRole("button", { name: "查看详情", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: /^岗位与薪酬/ })
      .click(),
  );
  assert.equal(await field(app, "劳动合同开始时间").inputValue(), hireDate);
  assert.equal(await field(app, "劳动合同结束时间").inputValue(), contractEnd);
  assert.equal(await field(app, "试用期结束时间").inputValue(), probationEnd);
  assert.equal(await field(app, "转正底薪").inputValue(), String(salary));
  await same("new employee dates " + name, true);
  await both((page) =>
    modal(page).getByRole("button", { name: "关闭", exact: true }).click(),
  );
}
async function newFlow(
  page,
  {
    name = "张伟",
    type = "内部调岗",
    department = "技术部",
    position = "验收岗位",
  } = {},
) {
  await page
    .getByRole("button", { name: "发起人事异动流程", exact: true })
    .click();
  await field(page, "异动类型").selectOption(type);
  await field(page, "员工姓名").fill(name);
  await field(page, "目标部门").selectOption(department);
  await field(page, "目标岗位").fill(position);
}
try {
  await open();
  await same("onboarding queue", true);
  for (const [id, name, date, ratio] of [
    ["OB-2026-001", "许知远", "2026-12-01", "4/5"],
    ["OB-2026-002", "宋清欢", "2026-12-08", "5/5"],
  ]) {
    const text = await queueRow(app, id).innerText();
    for (const value of [id, name, date, ratio])
      assert.ok(text.includes(value), value);
  }
  await verify("OB-2026-001");
  assert.equal(await modal(app).locator("input[type=checkbox]").count(), 5);
  assert.equal(await modal(app).locator("input:checked").count(), 4);
  for (const text of [
    "内容创作部 · AI 剧本策划",
    "2026-12-01",
    "底薪 ¥20,000 + 绩效 ¥4,500",
  ])
    assert.ok((await modal(app).innerText()).includes(text));
  await same("material verification modal", true);
  await both((page) =>
    modal(page).locator("input[type=checkbox]").nth(2).check(),
  );
  assert.equal(
    await modal(app)
      .getByRole("button", { name: "核验通过并建档", exact: true })
      .count(),
    1,
  );
  await same("all five materials checked", true);
  await both((page) =>
    modal(page).locator("input[type=checkbox]").nth(2).uncheck(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "材料待补全（先办入职）", exact: true })
      .click(),
  );
  assert.equal(
    await pending(app).locator("input[type=date]").inputValue(),
    "2026-12-08",
  );
  assert.ok((await pending(app).innerText()).includes("上家单位离职证明原件"));
  assert.deepEqual(
    await pending(app).locator("select option").allTextContents(),
    ["材料稍后补交", "特批入职", "其他"],
  );
  await same("pending secondary confirmation", true);
  await both((page) => pending(page).locator("select").selectOption("其他"));
  assert.equal(
    await pending(app)
      .getByRole("button", { name: "确认建档", exact: true })
      .isDisabled(),
    true,
  );
  await both((page) =>
    pending(page).getByPlaceholder("请填写具体原因备注...").fill(" "),
  );
  assert.equal(
    await pending(app)
      .getByRole("button", { name: "确认建档", exact: true })
      .isDisabled(),
    true,
  );
  await same("other reason requires nonblank note");
  await both((page) =>
    pending(page)
      .getByPlaceholder("请填写具体原因备注...")
      .fill("原件将由前司邮寄"),
  );
  await both((page) => pending(page).locator("input[type=date]").fill(""));
  assert.equal(
    await pending(app)
      .getByRole("button", { name: "确认建档", exact: true })
      .isDisabled(),
    true,
  );
  await same("pending deadline required");
  await both((page) =>
    pending(page).getByRole("button", { name: "取消", exact: true }).click(),
  );
  await both((page) =>
    modal(page).locator("input[type=checkbox]").nth(4).uncheck(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "材料待补全（先办入职）", exact: true })
      .click(),
  );
  assert.ok((await pending(app).innerText()).includes("还缺 2 项"));
  await same("missing material summary updates", true);
  await both((page) =>
    pending(page).locator("input[type=date]").fill("2026-12-10"),
  );
  await both((page) =>
    pending(page)
      .getByRole("button", { name: "确认建档", exact: true })
      .click(),
  );
  assert.ok(
    (await queueRow(app, "OB-2026-001").innerText()).includes(
      "材料待补 · 截止 2026-12-10",
    ),
  );
  assert.ok(
    (await queueRow(app, "OB-2026-001").innerText()).includes(
      "原件将由前司邮寄",
    ),
  );
  await same("pending onboarding creates employee", true);
  for (let i = 0; i < 2; i++) {
    await verify("OB-2026-001", "查看建档记录");
    assert.equal(
      await modal(app)
        .getByRole("button", { name: /核验通过并建档|材料待补全/ })
        .count(),
      0,
    );
    await same("pending record cannot create again " + i);
    await both((page) =>
      modal(page).getByRole("button", { name: "关闭", exact: true }).click(),
    );
  }
  await employeeDates(
    "EMP013",
    "许知远",
    "2026-12-01",
    "2027-03-01",
    "2029-12-01",
    20000,
  );
  assert.equal(await app.locator("main tbody tr").count(), 13);
  await open();
  await verify("OB-2026-002");
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "核验通过并建档", exact: true })
      .click(),
  );
  assert.ok(
    (await queueRow(app, "OB-2026-002").innerText()).includes("已完成入职建档"),
  );
  await same("all-materials onboarding completes", true);
  await verify("OB-2026-002", "查看建档记录");
  assert.equal(
    await modal(app)
      .getByRole("button", { name: /核验通过并建档|材料待补全/ })
      .count(),
    0,
  );
  await same("completed record cannot create again");
  await both((page) =>
    modal(page).getByRole("button", { name: "关闭", exact: true }).click(),
  );
  await employeeDates(
    "EMP013",
    "宋清欢",
    "2026-12-08",
    "2027-03-08",
    "2029-12-08",
    28000,
  );
  await navigate("入职管理");
  await verify("OB-2026-001");
  await both((page) =>
    modal(page).locator("input[type=checkbox]").nth(2).check(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "核验通过并建档", exact: true })
      .click(),
  );
  await employeeDates(
    "EMP014",
    "许知远",
    "2026-12-01",
    "2027-03-01",
    "2029-12-01",
    20000,
  );
  assert.equal(await app.locator("main tbody tr").count(), 14);
  checks.push("successive onboarding allocates distinct employee IDs");
  for (const reason of ["材料稍后补交", "特批入职"]) {
    await open();
    await verify("OB-2026-001");
    await both((page) =>
      modal(page)
        .getByRole("button", { name: "材料待补全（先办入职）", exact: true })
        .click(),
    );
    await both((page) => pending(page).locator("select").selectOption(reason));
    await both((page) =>
      pending(page)
        .getByRole("button", { name: "确认建档", exact: true })
        .click(),
    );
    assert.ok(
      (await queueRow(app, "OB-2026-001").innerText()).includes(reason),
    );
    await same("pending reason " + reason);
  }
  await open();
  await both((page) =>
    page.getByRole("button", { name: "直接新建员工建档", exact: true }).click(),
  );
  assert.equal(
    await modal(app)
      .getByRole("button", { name: /^岗位与薪酬/ })
      .count(),
    1,
  );
  await same("onboarding reuses employee creation form", true);
  await both((page) =>
    modal(page).getByRole("button", { name: "取消", exact: true }).click(),
  );
  console.log(
    "PASS onboarding queue, material checklist, both completion paths, secondary confirmation, dates, salary and duplicate protection",
  );

  await open("/lifecycle");
  await same("lifecycle list", true);
  for (const [name, count] of [
    ["全部类型", 3],
    ["转正评估", 2],
    ["内部调岗", 1],
    ["离职办理", 0],
  ]) {
    await both((page) =>
      page
        .locator("main")
        .getByRole("button", { name: new RegExp("^" + name) })
        .click(),
    );
    assert.equal(
      await app
        .locator("main")
        .getByRole("button", { name: "查看详情", exact: true })
        .count(),
      count,
    );
    await same("lifecycle type " + name);
  }
  await both((page) =>
    page
      .locator("main")
      .getByRole("button", { name: "全部类型", exact: true })
      .click(),
  );
  await detail("LC-2026-001");
  for (const text of [
    "张伟（EMP002）",
    "技术部 · AI 视效工程师",
    "2026-12-01",
    "李明（HR 主管）",
  ])
    assert.ok((await modal(app).innerText()).includes(text));
  await same("lifecycle detail", true);
  await both((page) =>
    modal(page).getByRole("button", { name: "驳回申请", exact: true }).click(),
  );
  assert.equal(
    await modal(app)
      .getByRole("button", { name: "确认驳回退回", exact: true })
      .isDisabled(),
    true,
  );
  await both((page) => modal(page).locator("textarea").fill(" "));
  assert.equal(
    await modal(app)
      .getByRole("button", { name: "确认驳回退回", exact: true })
      .isDisabled(),
    true,
  );
  await same("rejection requires reason", true);
  await both((page) =>
    modal(page).locator("textarea").fill("  需补充考核材料  "),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "确认驳回退回", exact: true })
      .click(),
  );
  assert.ok(
    (await queueRow(app, "LC-2026-001").innerText()).includes(
      "（驳回原因：需补充考核材料）",
    ),
  );
  await same("rejection archives reason");
  await detail("LC-2026-001");
  assert.equal(
    await modal(app)
      .getByRole("button", { name: /同意并归档|驳回申请|确认驳回/ })
      .count(),
    0,
  );
  await same("rejected task is terminal");
  await both((page) =>
    modal(page).getByRole("button", { name: "关闭", exact: true }).click(),
  );
  await navigate("员工档案");
  assert.ok((await employeeRow(app, "EMP002").innerText()).includes("试用期"));
  await same("rejection leaves employee unchanged");
  await open("/lifecycle");
  await detail("LC-2026-001");
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "同意并归档生效", exact: true })
      .click(),
  );
  await same("confirmation approved");
  await navigate("员工档案");
  assert.ok(
    (await employeeRow(app, "EMP002").innerText()).includes("正式员工"),
  );
  assert.ok((await employeeRow(app, "EMP006").innerText()).includes("试用期"));
  await same("confirmation changes one employee");
  await open("/lifecycle");
  await detail("LC-2026-004");
  assert.equal(
    await modal(app)
      .getByRole("button", { name: /同意并归档|驳回申请/ })
      .count(),
    0,
  );
  await same("archived lifecycle is readonly", true);

  await open("/lifecycle");
  await both((page) =>
    page.getByRole("button", { name: "发起人事异动流程", exact: true }).click(),
  );
  assert.equal(
    await modal(app)
      .getByRole("button", { name: "提交审批流程", exact: true })
      .isDisabled(),
    true,
  );
  assert.deepEqual(
    await field(app, "异动类型").locator("option").allTextContents(),
    ["转正评估", "内部调岗", "离职办理"],
  );
  await same("new lifecycle form", true);
  await both((page) => field(page, "异动类型").selectOption("内部调岗"));
  await both((page) => field(page, "员工姓名").fill("张伟"));
  assert.equal(
    await modal(app)
      .getByRole("button", { name: "提交审批流程", exact: true })
      .isDisabled(),
    true,
  );
  await both((page) => field(page, "目标部门").selectOption("视觉设计部"));
  await both((page) => field(page, "目标岗位").fill("视效组长"));
  await both((page) => field(page, "预计生效日期").fill("2026-12-12"));
  await both((page) => field(page, "申请说明与评估意见").fill("内部岗位调整"));
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "提交审批流程", exact: true })
      .click(),
  );
  await same("manual lifecycle creation for 张伟");
  await detail("LC-2026-005");
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "同意并归档生效", exact: true })
      .click(),
  );
  await navigate("员工档案");
  assert.equal(
    await employeeRow(app, "EMP002").locator("td").nth(1).innerText(),
    "视觉设计部",
  );
  assert.equal(
    await employeeRow(app, "EMP002").locator("td").nth(2).innerText(),
    "视效组长",
  );
  await same("transfer updates employee department and position");

  for (const [id, action, type] of [
    ["EMP002", "发起转正流程", "转正评估"],
    ["EMP001", "发起离职流程", "离职办理"],
  ]) {
    await open("/employees");
    await both((page) =>
      employeeRow(page, id)
        .getByRole("button", { name: "查看详情", exact: true })
        .click(),
    );
    await both((page) =>
      modal(page).getByRole("button", { name: action, exact: true }).click(),
    );
    assert.equal(new URL(app.url()).pathname, "/lifecycle");
    assert.equal(await field(app, "异动类型").inputValue(), type);
    assert.equal(
      await field(app, "员工姓名").inputValue(),
      id === "EMP001" ? "林晓梅" : "张伟",
    );
    await same("employee-detail prefill " + type, true);
    if (type === "离职办理") {
      await both((page) =>
        modal(page)
          .getByRole("button", { name: "提交审批流程", exact: true })
          .click(),
      );
      await detail("LC-2026-005");
      await both((page) =>
        modal(page)
          .getByRole("button", { name: "同意并归档生效", exact: true })
          .click(),
      );
      await navigate("员工档案");
      assert.ok(
        (await employeeRow(app, "EMP001").innerText()).includes("已离职"),
      );
      assert.ok(
        (await employeeRow(app, "EMP002").innerText()).includes("试用期"),
      );
      await same("resignation updates only prefilled employee");
    }
  }
  await open("/lifecycle", "部门负责人");
  assert.equal(
    await app
      .locator("main")
      .getByRole("button", { name: "查看详情", exact: true })
      .count(),
    0,
  );
  await same("department lead only sees local tasks", true);
  await both((page) =>
    page
      .getByRole("button", { name: "发起本部门内部调岗", exact: true })
      .click(),
  );
  assert.equal(await field(app, "异动类型").inputValue(), "内部调岗");
  assert.equal(await field(app, "异动类型").isDisabled(), true);
  assert.equal(await field(app, "目标部门").inputValue(), "运营部");
  assert.equal(await field(app, "目标部门").isDisabled(), true);
  await same("department lead can initiate only local transfer", true);
  for (const [route, role] of [
    ["/onboarding", "部门负责人"],
    ["/onboarding", "普通员工"],
    ["/lifecycle", "普通员工"],
  ]) {
    await open(route, role);
    await same("permission redirect " + route + " " + role);
    assert.equal(
      await app
        .locator("aside nav")
        .getByRole("button", {
          name: route === "/onboarding" ? "入职管理" : "转调离管理",
          exact: true,
        })
        .count(),
      0,
    );
  }
  console.log(
    "PASS lifecycle filters, details, approve/reject, terminal stages, prefilled forms, employee linkage and role navigation",
  );

  // Correct the prototype's unrelated EMP002 placeholder per the user's explicit
  // employee-linkage requirement. Keep the reference unchanged and assert these
  // identity/department regressions independently.
  activeCase = "manual transfer identity regression";
  await app.goto(base + "/employees");
  const beforeRows = await app.locator("main tbody tr").allTextContents();
  await app
    .locator("aside nav")
    .getByRole("button", { name: /^转调离管理/ })
    .click();
  await newFlow(app, {
    name: "林晓梅",
    department: "运营部",
    position: "验收调岗",
  });
  await modal(app)
    .getByRole("button", { name: "提交审批流程", exact: true })
    .click();
  assert.ok(
    (await queueRow(app, "LC-2026-005").innerText()).includes("EMP001"),
  );
  await queueRow(app, "LC-2026-005")
    .getByRole("button", { name: "查看详情", exact: true })
    .click();
  await modal(app)
    .getByRole("button", { name: "同意并归档生效", exact: true })
    .click();
  await app
    .locator("aside nav")
    .getByRole("button", { name: "员工档案", exact: true })
    .click();
  const afterRows = await app.locator("main tbody tr").allTextContents();
  assert.deepEqual(afterRows.slice(1), beforeRows.slice(1));
  assert.equal(
    await employeeRow(app, "EMP001").locator("td").nth(1).innerText(),
    "运营部",
  );
  assert.equal(
    await employeeRow(app, "EMP002").locator("td").nth(1).innerText(),
    "技术部",
  );
  checks.push("manual transfer binds EMP001 and never alters unrelated EMP002");
  await app.goto(base + "/lifecycle");
  await newFlow(app, {
    name: "顾北辰",
    department: "运营部",
    position: "运营组长",
  });
  await modal(app)
    .getByRole("button", { name: "提交审批流程", exact: true })
    .click();
  await newFlow(app, {
    name: "林晓梅",
    department: "内容创作部",
    position: "编剧组长",
  });
  await modal(app)
    .getByRole("button", { name: "提交审批流程", exact: true })
    .click();
  await app.locator("header select").selectOption("部门负责人");
  assert.equal(
    await app
      .locator("main")
      .getByRole("button", { name: "查看详情", exact: true })
      .count(),
    1,
  );
  assert.ok((await app.locator("main").innerText()).includes("顾北辰"));
  assert.ok(!(await app.locator("main").innerText()).includes("林晓梅"));
  await queueRow(app, "LC-2026-005")
    .getByRole("button", { name: "查看详情", exact: true })
    .click();
  await modal(app)
    .getByRole("button", { name: "同意并归档生效", exact: true })
    .click();
  await app
    .getByRole("button", { name: "发起本部门内部调岗", exact: true })
    .click();
  await field(app, "员工姓名").fill("顾北辰");
  await field(app, "目标岗位").fill("运营顾问");
  await modal(app)
    .getByRole("button", { name: "提交审批流程", exact: true })
    .click();
  assert.ok(
    (await queueRow(app, "LC-2026-007").innerText()).includes("EMP011"),
  );
  await app.locator("header select").selectOption("HR 主管");
  await app
    .locator("aside nav")
    .getByRole("button", { name: "员工档案", exact: true })
    .click();
  assert.equal(
    await employeeRow(app, "EMP011").locator("td").nth(2).innerText(),
    "运营组长",
  );
  assert.equal(
    await employeeRow(app, "EMP002").locator("td").nth(1).innerText(),
    "技术部",
  );
  checks.push(
    "department lead sees only own department and binds local transfer to EMP011",
  );
  assert.deepEqual(errors, []);
  writeFileSync(
    "qa/artifacts/workflows-results.json",
    JSON.stringify(
      {
        checks,
        errors,
        regressions:
          "Task/employee identity binding and duplicate/permission guards are tested independently of the unchanged prototype.",
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS ${checks.length} onboarding/lifecycle browser checks; prototype DOM, controls and screenshots matched; identity/scope regressions passed; 0 runtime errors.`,
  );
} catch (error) {
  console.error(
    "FAILED WORKFLOW CASE",
    activeCase,
    "URL",
    app.url(),
    "ERRORS",
    errors,
  );
  await app.screenshot({
    path: "qa/artifacts/workflows-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
}
