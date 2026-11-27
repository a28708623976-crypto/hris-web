import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import {
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { parseEnv } from "node:util";
import { routes, canAccess } from "../routes.mjs";
export async function runBrowser(scope = "all") {
  mkdirSync("worker/.test", { recursive: true });
  mkdirSync("qa/artifacts", { recursive: true });
  const logPath = "worker/.test/browser.log",
    log = openSync(logPath, "w", 0o600);
  const environment = { ...process.env, WRANGLER_SEND_METRICS: "false" };
  const cli = "node_modules/.bin/wrangler",
    persist = "worker/.test/browser";
  const run = (command, args) =>
    execFileSync(command, args, {
      env: environment,
      stdio: ["ignore", log, log],
    });
  run(cli, [
    "d1",
    "migrations",
    "apply",
    "DB",
    "--config",
    "worker/wrangler.jsonc",
    "--local",
    "--persist-to",
    persist,
  ]);
  run("node", ["--import", "tsx", "worker/scripts/seed.ts"]);
  run(cli, [
    "d1",
    "execute",
    "DB",
    "--config",
    "worker/wrangler.jsonc",
    "--local",
    "--persist-to",
    persist,
    "--file",
    "worker/.local/seed.sql",
  ]);
  const child = spawn(
    cli,
    [
      "dev",
      "--config",
      "worker/wrangler.jsonc",
      "--local",
      "--persist-to",
      persist,
      "--ip",
      "127.0.0.1",
      "--port",
      "8790",
    ],
    { env: environment, stdio: ["ignore", log, log] },
  );
  let browser;
  let activePage,
    activeCase = "startup";
  const base = "http://127.0.0.1:8790",
    errors = [],
    checks = [];
  const vars = {
    ...parseEnv(readFileSync("worker/.dev.vars", "utf8")),
    ...process.env,
  };
  const timeout = async () =>
    new Promise((resolve) => setTimeout(resolve, 100));
  const modal = (page) =>
    page
      .locator("div.fixed.inset-0")
      .filter({ has: page.locator("h3") })
      .first();
  const field = (page, label) =>
    modal(page)
      .locator("label")
      .filter({
        hasText: new RegExp(
          "^\\s*" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        ),
      })
      .first()
      .locator(
        "xpath=ancestor::div[./input or ./select or ./textarea or ./div/input][1]",
      )
      .locator("input,select,textarea")
      .first();
  const tab = (page, label) =>
    modal(page)
      .getByRole("button", { name: new RegExp("^" + label) })
      .click();
  const employeeRow = (page, id) =>
    page.locator("main tbody tr").filter({ hasText: id });
  async function fillEmployee(page, name) {
    await tab(page, "个人信息");
    await page.getByPlaceholder("请输入真实姓名").fill(name);
    await field(page, "性别").selectOption("男");
    await field(page, "手机号码").fill("13800000001");
    await field(page, "出生日期").fill("1990-01-01");
    await field(page, "民族").selectOption("汉族");
    await field(page, "户口类型").selectOption("本市城镇");
    await field(page, "婚姻状况").selectOption("未婚");
    await field(page, "首次参加工作日期").fill("2015-01-01");
    await tab(page, "证件信息");
    await field(page, "证件号码").fill("990000199001010001");
    await tab(page, "家庭成员");
    await page.getByPlaceholder("请输入家庭成员姓名").fill("测试家属");
    await tab(page, "岗位与薪酬");
    await field(page, "岗位名称").fill("后端测试工程师");
  }
  try {
    let ready = false;
    for (let i = 0; i < 300; i++) {
      try {
        if ((await fetch(base)).ok) {
          ready = true;
          break;
        }
      } catch {}
      if (child.exitCode !== null)
        throw new Error("Local Worker failed to start; see ignored " + logPath);
      await timeout();
    }
    assert.ok(ready, "local Worker starts");
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const guest = await browser.newPage();
    await guest.goto(base + "/employees");
    await expect(guest).toHaveURL(/\/login$/);
    await expect(
      guest.getByRole("heading", { name: "登录 PeopleOS" }),
    ).toBeVisible();
    await guest.close();
    checks.push("unauthenticated UI redirects to login");
    const accounts = [
      ["HR 主管", "SEED_HR_EMAIL"],
      ["部门负责人", "SEED_DEPT_EMAIL"],
      ["普通员工", "SEED_EMP_EMAIL"],
    ];
    for (const [role, key] of accounts) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1120 },
      });
      const page = await context.newPage();
      activePage = page;
      activeCase = role + " login";
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base + "/employees");
      await expect(page).toHaveURL(/\/login$/);
      await page.getByLabel("工作邮箱").fill(vars[key]);
      await page
        .getByRole("button", { name: "获取验证码", exact: true })
        .click();
      await expect(page.getByLabel("6 位验证码")).toBeVisible();
      let code;
      for (let i = 0; i < 100; i++) {
        const lines = readFileSync(logPath, "utf8")
          .split("\n")
          .filter((line) =>
            line.includes("[DEV login] " + vars[key] + " code="),
          );
        code = lines.at(-1)?.match(/code=(\d{6})/)?.[1];
        if (code) break;
        await timeout();
      }
      assert.ok(code, "code is printed only in local Wrangler console");
      await page.getByLabel("6 位验证码").fill(code);
      await page
        .getByRole("button", { name: "验证并登录", exact: true })
        .click();
      await expect(page.locator("main h1").first()).toBeVisible();
      assert.equal(await page.locator("header select").count(), 0);
      const me = await (
        await context.request.get(base + "/api/auth/me")
      ).json();
      assert.ok(me.user.id);
      checks.push(role + " authentic login and immutable server identity");
      const selected =
        scope === "all"
          ? routes
          : scope === "workflows"
            ? ["/onboarding", "/lifecycle"]
            : scope === "ats"
              ? routes.filter((route) => route.startsWith("/ats/"))
              : ["/" + scope];
      for (const route of selected) {
        activeCase = role + " " + route;
        await page.goto(base + route);
        await expect(page.locator("main h1,main h2").first()).toBeVisible();
        assert.ok((await page.locator("main").innerText()).length > 20);
        if (canAccess(role, route)) await expect(page).toHaveURL(base + route);
        else
          assert.ok(
            !page.url().endsWith(route),
            "inaccessible route redirects",
          );
        checks.push(role + " " + route);
      }
      if (role === "普通员工") {
        await page.goto(base + "/employees");
        await expect(page.locator("main tbody tr")).toHaveCount(1);
        assert.ok(
          (await page.locator("main tbody").innerText()).includes(
            me.user.employee_id,
          ),
        );
        assert.equal(
          await page
            .getByRole("button", { name: "新增员工", exact: true })
            .count(),
          0,
        );
        const own = await context.request.get(
          base + "/api/employees/" + me.user.employee_id,
        );
        assert.equal(own.status(), 200);
        assert.equal(typeof (await own.json()).employee.baseSalary, "number");
        const denied = await context.request.get(
          base + "/api/employees/EMP002",
        );
        assert.equal(denied.status(), 403);
        assert.ok(!(await denied.text()).includes("baseSalary"));
        checks.push("employee own salary and forbidden other employees");
      }
      if (role === "部门负责人") {
        assert.equal(
          (await context.request.get(base + "/api/employees")).status(),
          403,
        );
        checks.push("department lead employee API forbidden");
      }
      if (
        role === "HR 主管" &&
        ["all", "employees", "workflows", "contracts", "performance"].includes(
          scope,
        )
      ) {
        await page.goto(base + "/employees");
        await expect(page.locator("main tbody tr")).toHaveCount(12);
        await employeeRow(page, "EMP001")
          .getByRole("button", { name: "查看详情", exact: true })
          .click();
        await expect(modal(page)).toBeVisible();
        for (const label of [
          "个人信息",
          "银行卡信息",
          "证件信息",
          "教育经历",
          "紧急联系人",
          "家庭成员",
          "资料附件",
          "岗位与薪酬",
        ]) {
          await tab(page, label);
          await expect(modal(page)).toBeVisible();
        }
        await modal(page)
          .getByRole("button", { name: "编辑档案资料", exact: true })
          .click();
        await tab(page, "岗位与薪酬");
        await field(page, "转正底薪").fill("23123");
        await modal(page)
          .getByRole("button", { name: "保存档案修改", exact: true })
          .click();
        await expect(
          modal(page).getByRole("button", {
            name: "编辑档案资料",
            exact: true,
          }),
        ).toBeVisible();
        await modal(page)
          .getByRole("button", { name: "关闭", exact: true })
          .click();
        await page.reload();
        await expect(page.locator("main tbody tr")).toHaveCount(12);
        assert.equal(
          (
            await (
              await context.request.get(base + "/api/employees/EMP001")
            ).json()
          ).employee.baseSalary,
          23123,
        );
        checks.push(
          "eight tabs, edit saved through API and persists after refresh",
        );
        // A real API error must retain edits and leave canonical employee data unchanged.
        await employeeRow(page, "EMP001")
          .getByRole("button", { name: "查看详情", exact: true })
          .click();
        await modal(page)
          .getByRole("button", { name: "编辑档案资料", exact: true })
          .click();
        await tab(page, "岗位与薪酬");
        await field(page, "转正底薪").fill("99999");
        await page.route("**/api/employees/EMP001", async (route) =>
          route.request().method() === "PUT"
            ? route.fulfill({
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({ error: "测试保存失败" }),
              })
            : route.continue(),
        );
        await modal(page)
          .getByRole("button", { name: "保存档案修改", exact: true })
          .click();
        await expect(
          page.getByText("测试保存失败", { exact: false }),
        ).toBeVisible();
        await expect(
          modal(page).getByRole("button", {
            name: "保存档案修改",
            exact: true,
          }),
        ).toBeVisible();
        assert.equal(
          (
            await (
              await context.request.get(base + "/api/employees/EMP001")
            ).json()
          ).employee.baseSalary,
          23123,
        );
        await page.unroute("**/api/employees/EMP001");
        await modal(page)
          .getByRole("button", { name: "关闭", exact: true })
          .click();
        checks.push(
          "failed API write rolls back canonical UI and retains editable form",
        );
        await page
          .getByRole("button", { name: "新增员工", exact: true })
          .click();
        await fillEmployee(page, "本地浏览器测试员工");
        await modal(page)
          .getByRole("button", { name: "确认创建完整档案", exact: true })
          .click();
        await expect(modal(page)).toHaveCount(0);
        await expect(page.locator("main tbody tr")).toHaveCount(13);
        await page.reload();
        await expect(page.locator("main tbody tr")).toHaveCount(13);
        assert.ok(
          (await page.locator("main tbody").innerText()).includes("EMP013"),
        );
        checks.push("new employee gets server ID and survives refresh");
        await page.goto(base + "/contracts");
        await employeeRow(page, "EMP001")
          .getByRole("button", { name: "查看详情", exact: true })
          .click();
        await field(page, "新合同到期日期").fill("2031-12-31");
        await modal(page)
          .getByRole("button", { name: "保存条款并办理电子续签", exact: true })
          .click();
        await expect(modal(page)).toHaveCount(0);
        await page.reload();
        await expect(employeeRow(page, "EMP001")).toContainText("2031-12-31");
        checks.push(
          "mock contract action persists employee change through API",
        );
        await page.goto(base + "/lifecycle");
        await page
          .locator("main div.p-5")
          .filter({ hasText: "LC-2026-001" })
          .getByRole("button", { name: "查看详情", exact: true })
          .click();
        await modal(page)
          .getByRole("button", { name: "同意并归档生效", exact: true })
          .click();
        await expect(modal(page)).toHaveCount(0);
        assert.equal(
          (
            await (
              await context.request.get(base + "/api/employees/EMP002")
            ).json()
          ).employee.status,
          "正式员工",
        );
        checks.push("mock lifecycle effect persists employee status");
        await page.goto(base + "/performance");
        await page
          .getByRole("button", { name: "同步结果至算薪引擎", exact: true })
          .click();
        await expect(
          page.getByText("全员绩效结果已同步", { exact: true }),
        ).toBeVisible();
        assert.ok(
          (
            await (
              await context.request.get(base + "/api/employees/EMP001")
            ).json()
          ).employee.payrollPerformance,
        );
        checks.push(
          "performance employee changes saved atomically through API",
        );
        await page.goto(base + "/onboarding");
        await page
          .locator("main div.p-5")
          .filter({ hasText: "OB-2026-002" })
          .getByRole("button", { name: "核验材料并办理", exact: true })
          .click();
        await modal(page)
          .getByRole("button", { name: "核验通过并建档", exact: true })
          .click();
        await expect(
          modal(page).getByRole("heading", { name: "新增员工入职登记与建档" }),
        ).toBeVisible();
        await fillEmployee(page, "入职补齐资料测试");
        await modal(page)
          .getByRole("button", { name: "确认创建完整档案", exact: true })
          .click();
        await expect(modal(page)).toHaveCount(0);
        await page.reload();
        await expect(
          page.locator("main div.p-5").filter({ hasText: "OB-2026-002" }),
        ).toContainText("已完成入职建档");
        assert.equal(
          (await (await context.request.get(base + "/api/employees")).json())
            .employees.length,
          14,
        );
        checks.push(
          "onboarding completion requires valid profile, persists and links without duplicates",
        );
      }
      await page.getByRole("button", { name: "退出登录", exact: true }).click();
      await expect(page).toHaveURL(/\/login$/);
      assert.equal(
        (await context.request.get(base + "/api/auth/me")).status(),
        401,
      );
      checks.push(role + " logout revokes server session");
      await context.close();
    }
    assert.deepEqual(errors, []);
    writeFileSync(
      "qa/artifacts/backend-" + scope + "-results.json",
      JSON.stringify({ scope, checks, errors }, null, 2),
    );
    console.log(
      `PASS backend frontend ${scope}: ${checks.length} checks, 0 runtime errors, real local Worker/D1 authentication and persistence.`,
    );
  } catch (error) {
    console.error(
      "FAILED",
      activeCase,
      activePage?.url(),
      "runtime errors",
      errors,
    );
    if (activePage && !activePage.isClosed())
      await activePage.screenshot({
        path: "qa/artifacts/backend-failure.png",
        fullPage: true,
      });
    throw error;
  } finally {
    await browser?.close();
    child.kill("SIGTERM");
    closeSync(log);
  }
}
if (import.meta.url === new URL(process.argv[1], "file:").href)
  await runBrowser(process.argv[2] || "all");
