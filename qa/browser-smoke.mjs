import { analyticsStructure } from "./analytics-structure.mjs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { prepareReference } from "./prototype-reference.mjs";
import { roles, routes, canAccess, referenceState } from "./routes.mjs";
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
const referenceUrl = (role, route) =>
  base +
  "/qa/reference.html?state=" +
  encodeURIComponent(JSON.stringify(referenceState(role, route)));
const errors = [];
for (const page of [app, reference]) {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push("console: " + message.text());
  });
}
mkdirSync("qa/artifacts", { recursive: true });
const results = [];
let activeCase = "initialization";
async function settle(page) {
  await page.locator("main h1, main h2").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(230);
}
async function open(route, role = "HR 主管") {
  activeCase = `interaction ${role} ${route}`;

  await Promise.all([
    app.goto(base + route),
    reference.goto(referenceUrl(role, route)),
  ]);
  await app.locator("header select").selectOption(role);
  await Promise.all([settle(app), settle(reference)]);
}
async function same(label) {
  // Pixel comparison also covers arbitrary colors, typography, spacing, icons, shadows and blur.
  const [actual, expected] = await Promise.all([
    app.screenshot({ animations: "disabled", fullPage: true }),
    reference.screenshot({ animations: "disabled", fullPage: true }),
  ]);
  const a = PNG.sync.read(actual),
    b = PNG.sync.read(expected);
  const dimensionsMatch = a.width === b.width && a.height === b.height;
  // Standard perceptual comparison ignores edge antialiasing, while requiring
  // zero meaningful mismatched pixels. Exact classes/copy are checked separately.
  const changedPixels = dimensionsMatch
    ? pixelmatch(a.data, b.data, null, a.width, a.height, {
        threshold: 0.1,
        includeAA: false,
      })
    : Infinity;
  if (!dimensionsMatch || changedPixels > 0) {
    const name = label.replace(/[^a-z0-9-]/gi, "_");
    writeFileSync(`qa/artifacts/${name}-actual.png`, actual);
    writeFileSync(`qa/artifacts/${name}-reference.png`, expected);
    assert.fail(
      `Visual mismatch: ${label} (${changedPixels} perceptually different pixels); see qa/artifacts`,
    );
  }
}
async function both(action) {
  await Promise.all([action(app), action(reference)]);
  await app.waitForTimeout(230);
  await reference.waitForTimeout(230);
}
try {
  for (const role of roles) {
    for (const route of routes) {
      activeCase = `${role} ${route}`;
      await app.goto(base + route);
      await app.locator("header select").selectOption(role);
      await settle(app);
      assert.ok(
        (await app.locator("main").innerText()).length > 30,
        `${role} ${route} renders content`,
      );
      assert.equal(await app.locator(".vite-error-overlay").count(), 0);
      if (canAccess(role, route)) {
        assert.equal(new URL(app.url()).pathname, route);

        await reference.goto(referenceUrl(role, route));
        await settle(reference);
        if (route === "/self-service") {
          assert.equal(
            await app.getByRole("combobox", { name: "申请业务类型" }).count(),
            1,
          );
          for (const selector of ["aside", "header"])
            assert.equal(
              await app.locator(selector).innerHTML(),
              await reference.locator(selector).innerHTML(),
            );
        } else if (route === "/ats/analytics") {
          assert.equal(
            analyticsStructure(await app.locator("#root").innerHTML()),
            analyticsStructure(await reference.locator("#root").innerHTML()),
            "live ATS report retains prototype structure",
          );
          assert.ok(
            (await app.locator("main").innerText()).includes(
              "2 份发出 · 0 份确认签署",
            ),
          );
        } else await same(`${role}-${route}`);
      } else {
        assert.ok(
          ["/dashboard", "/employees"].includes(new URL(app.url()).pathname),
          `${role} ${route} safely redirects`,
        );
      }
      results.push({
        role,
        route,
        result: canAccess(role, route)
          ? route === "/self-service"
            ? "authorized form + unchanged shell"
            : route === "/ats/analytics"
              ? "live metrics + prototype structure"
              : "render + pixel parity"
          : "permission redirect",
      });
    }
  }
  console.log(
    "PASS 51 route/role combinations, including 25 prototype-matching views + 1 live report, 3 authorized self-service forms and 22 permission redirects.",
  );
  // Actual computed values verify the Tailwind v4 utilities requested by the user.
  await app.goto(base + "/employees");
  await settle(app);
  const styles = await app.evaluate(() => {
    const probe = document.createElement("div");
    probe.className =
      "shadow-2xs backdrop-blur-xs bg-[#0071E3] rounded-xl text-[13px]";
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const result = {
      shadow: style.boxShadow,
      blur: style.backdropFilter,
      background: style.backgroundColor,
      radius: style.borderRadius,
      fontSize: style.fontSize,
    };
    probe.remove();
    return result;
  });
  assert.notEqual(styles.shadow, "none");
  assert.equal(styles.blur, "blur(4px)");
  assert.equal(styles.background, "rgb(0, 113, 227)");
  assert.equal(styles.radius, "12px");
  assert.equal(styles.fontSize, "13px");
  console.log("PASS Tailwind v4 computed styles:", styles);

  await open("/employees");
  await both((p) => p.getByPlaceholder("搜索姓名、工号或岗位...").fill("张伟"));
  await same("directory-search");
  await both((p) =>
    p.getByRole("button", { name: "查看详情", exact: true }).click(),
  );
  await same("employee-detail");
  await both((p) =>
    p.getByRole("button", { name: "编辑档案资料", exact: true }).click(),
  );
  await both((p) =>
    p.getByRole("button", { name: "银行卡信息", exact: false }).click(),
  );
  await same("employee-edit-bank");
  await open("/employees");
  await both((p) =>
    p.getByRole("button", { name: "新增员工", exact: true }).click(),
  );
  await same("new-employee-modal");
  await both((p) =>
    p.getByRole("button", { name: "确认创建完整档案", exact: true }).click(),
  );
  await same("validation-toast");

  await open("/onboarding");
  await both((p) =>
    p
      .getByRole("button", { name: "核验材料并办理", exact: true })
      .first()
      .click(),
  );
  await same("onboarding-checklist");
  await open("/attendance");
  await both((p) =>
    p.getByRole("button", { name: "解锁薪资明细", exact: true }).click(),
  );
  await same("salary-unlocked");
  await open("/performance");
  await both((p) =>
    p.getByRole("button", { name: "查看详情", exact: true }).first().click(),
  );
  await same("performance-calibration");

  await app.goto(base + "/self-service");
  await app.getByRole("combobox", { name: "申请业务类型" }).click();
  await app.getByRole("menuitem", { name: "假勤申请", exact: true }).click();
  await app.getByRole("menuitem", { name: "休假申请", exact: true }).click();
  await app.getByRole("menuitem", { name: "年假申请", exact: true }).click();
  assert.ok(
    (
      await app.getByRole("combobox", { name: "申请业务类型" }).innerText()
    ).includes("假勤申请 / 休假申请 / 年假申请"),
  );
  assert.equal(await app.getByLabel("工作交接人").count(), 1);
  await open("/ats/progress");
  await both((p) =>
    p.getByRole("button", { name: "全局职位列表视图", exact: true }).click(),
  );
  await same("ats-progress-list");
  await open("/ats/home");
  await both((p) =>
    p.getByRole("button", { name: "发布新职位", exact: true }).first().click(),
  );
  await same("ats-job-create-from-home");
  assert.equal(new URL(app.url()).pathname, "/ats/jobs/new");
  await both((p) =>
    p.getByRole("button", { name: "返回职位列表", exact: true }).click(),
  );
  await same("ats-return-from-job-create");
  assert.equal(new URL(app.url()).pathname, "/ats/home");

  await open("/ats/candidates");
  await both((p) => p.getByRole("cell", { name: /唐子昂/ }).click());
  await same("ats-candidate-drawer");
  await open("/ats/offers");
  await both((p) =>
    p.getByRole("button", { name: "查看", exact: true }).first().click(),
  );
  await same("ats-offer-workbench");
  await both((p) =>
    p
      .getByRole("button", { name: "确认候选人已电子签署", exact: true })
      .click(),
  );
  await same("ats-offer-handoff");
  assert.match(
    await app.getByRole("button", { name: /查看 HRIS 待入职队列/ }).innerText(),
    /\(3\)/,
  );
  await both((p) =>
    p.getByRole("button", { name: "重新转入", exact: true }).click(),
  );
  await same("ats-handoff-idempotence");
  assert.match(
    await app.getByRole("button", { name: /查看 HRIS 待入职队列/ }).innerText(),
    /\(3\)/,
  );

  // URL history and reloads, app switcher, shortcut navigation, and page-state reset.
  await app.goto(base + "/employees");
  await app
    .locator("aside nav")
    .getByRole("button", { name: "合同管理", exact: true })
    .click();
  assert.equal(new URL(app.url()).pathname, "/contracts");
  await app.goBack();
  await settle(app);
  assert.equal(new URL(app.url()).pathname, "/employees");
  await app.goForward();
  await settle(app);
  assert.equal(new URL(app.url()).pathname, "/contracts");
  await app.reload();
  await settle(app);
  assert.equal(new URL(app.url()).pathname, "/contracts");
  await app.keyboard.press("Meta+k");
  await app
    .getByPlaceholder("输入模块名称或切换至 ATS 招聘工作台...")
    .fill("员工档案");
  await app
    .getByRole("button", { name: "员工档案", exact: true })
    .last()
    .click();
  assert.equal(new URL(app.url()).pathname, "/employees");
  await app.getByPlaceholder("搜索姓名、工号或岗位...").fill("张伟");
  await app
    .locator("aside nav")
    .getByRole("button", { name: "合同管理", exact: true })
    .click();
  await app
    .locator("aside nav")
    .getByRole("button", { name: "员工档案", exact: true })
    .click();
  assert.equal(
    await app.getByPlaceholder("搜索姓名、工号或岗位...").inputValue(),
    "",
  );
  await app
    .getByRole("button", { name: "核心人事 (HRIS)", exact: true })
    .click();
  await app.getByRole("button", { name: /招聘管理 \(ATS\).*职位 HC/ }).click();
  await settle(app);
  assert.equal(new URL(app.url()).pathname, "/ats/home");
  await app.locator("header select").selectOption("普通员工");
  await settle(app);
  assert.equal(new URL(app.url()).pathname, "/employees");
  assert.equal(await app.locator("main tbody tr").count(), 1);
  assert.ok((await app.locator("main").innerText()).includes("李明"));
  await app.setViewportSize({ width: 390, height: 844 });
  await reference.setViewportSize({ width: 390, height: 844 });
  await open("/employees");
  await same("mobile-prototype-parity");
  await app.screenshot({
    path: "qa/artifacts/employees-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, [], "No browser runtime errors");
  writeFileSync(
    "qa/artifacts/browser-results.json",
    JSON.stringify({ results, styles, interactions: "PASS", errors }, null, 2),
  );
  console.log(
    "PASS interaction parity, navigation history, reload, state reset, app/role switch, mobile parity, and zero browser runtime errors.",
  );
} catch (error) {
  console.error(
    "FAILED CASE",
    activeCase,
    "URL",
    app.url(),
    "PAGE ERRORS",
    errors,
  );
  await app.screenshot({ path: "qa/artifacts/failure.png", fullPage: true });
  throw error;
} finally {
  await browser.close();
}
