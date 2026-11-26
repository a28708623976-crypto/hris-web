import assert from "node:assert/strict";
import { moduleHarness } from "./module-harness.mjs";
const h = await moduleHarness("contracts");
const {
  app,
  reference,
  base,
  both,
  modal,
  field,
  open,
  same,
  navigate,
  checks,
} = h;
const row = (page, id) => page.locator("main tbody tr").filter({ hasText: id });
async function detail(id) {
  await both((page) =>
    row(page, id)
      .getByRole("button", { name: "查看详情", exact: true })
      .click(),
  );
}
async function save() {
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "保存条款并办理电子续签", exact: true })
      .click(),
  );
}
try {
  await open("/contracts");
  await same("ledger", true);
  assert.deepEqual(await app.locator("main thead th").allTextContents(), [
    "签署人",
    "所属部门",
    "岗位名称",
    "签约主体",
    "入职起始日",
    "合同到期日",
    "合同状态",
    "操作",
  ]);
  assert.equal(await app.locator("main tbody tr").count(), 11);
  assert.equal(await row(app, "EMP012").count(), 0);
  for (const id of ["EMP001", "EMP005"]) {
    assert.ok((await row(app, id).innerText()).includes("即将到期"));
    assert.equal(
      await row(app, id)
        .locator("td")
        .nth(5)
        .evaluate((node) => getComputedStyle(node).color),
      "rgb(217, 119, 6)",
    );
  }
  assert.ok((await row(app, "EMP004").innerText()).includes("正常履行中"));
  await both((page) =>
    page.getByRole("button", { name: "仅看即将到期预警", exact: true }).click(),
  );
  assert.equal(await app.locator("main tbody tr").count(), 2);
  await same("warning toggle", true);
  await both((page) =>
    page.getByRole("button", { name: "显示全部合同", exact: true }).click(),
  );
  await same("all contracts restored");
  await detail("EMP001");
  for (const text of [
    "林晓梅（EMP001）",
    "内容创作部 · AI 编剧",
    "2024-03-01 至 2026-12-12",
  ])
    assert.ok((await modal(app).innerText()).includes(text));
  await same("centered detail", true);
  for (const [years, end] of [
    [1, "2027-12-12"],
    [3, "2029-12-12"],
    [5, "2031-12-12"],
  ]) {
    await both((page) =>
      modal(page)
        .getByRole("button", { name: `续签 ${years} 年`, exact: true })
        .click(),
    );
    assert.equal(await field(app, "新合同到期日期").inputValue(), end);
    await same("renew " + years + " years");
  }
  await both((page) => field(page, "新合同到期日期").fill("2033-06-30"));
  await same("manual date");
  await both((page) =>
    modal(page).getByRole("button", { name: "续签 1 年", exact: true }).click(),
  );
  assert.equal(await field(app, "新合同到期日期").inputValue(), "2027-12-12");
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "需修改补充条款", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page).locator("textarea").fill("工作地点调整为杭州"),
  );
  await same("supplement editor", true);
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "无修改（按原条款顺延）", exact: true })
      .click(),
  );
  assert.equal(await modal(app).locator("textarea").count(), 0);
  await same("unchanged clause mode");
  await both((page) =>
    modal(page).getByRole("button", { name: "取消", exact: true }).click(),
  );
  assert.equal(
    await row(app, "EMP001").locator("td").nth(5).innerText(),
    "2026-12-12",
  );
  await detail("EMP001");
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "到期不再续签", exact: true })
      .click(),
  );
  assert.ok((await row(app, "EMP001").innerText()).includes("不再续签"));
  await same("non-renewal toast and priority", true);
  await detail("EMP001");
  await both((page) =>
    modal(page).getByRole("button", { name: "续签 5 年", exact: true }).click(),
  );
  await both((page) => field(page, "续签后岗位名称").fill("AI 编剧组长"));
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "需修改补充条款", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page).locator("textarea").fill("补充工作地点约定"),
  );
  await save();
  assert.ok((await row(app, "EMP001").innerText()).includes("正常履行中"));
  assert.equal(
    await row(app, "EMP001").locator("td").nth(5).innerText(),
    "2031-12-12",
  );
  await same("renewal resets termination flag", true);
  await navigate("员工档案");
  assert.equal(
    await row(app, "EMP001").locator("td").nth(7).innerText(),
    "2031-12-12",
  );
  assert.equal(
    await row(app, "EMP001").locator("td").nth(2).innerText(),
    "AI 编剧组长",
  );
  await same("employee date and position linked");
  await navigate("工作台");
  assert.ok(
    (
      await app
        .getByText("30天内合同到期", { exact: true })
        .locator("..")
        .locator("..")
        .innerText()
    ).includes("1 份"),
  );
  await same("dashboard warning count linked");
  await open("/contracts");
  await detail("EMP005");
  await both((page) => field(page, "新合同到期日期").fill("2035-12-12"));
  await save();
  await both((page) => page.locator("header select").selectOption("普通员工"));
  await navigate("我的工作台");
  assert.ok((await app.locator("main").innerText()).includes("2035-12-12"));
  await same("personal dashboard date linked");
  await open("/contracts");
  await detail("EMP001");
  await both((page) => field(page, "新合同到期日期").fill("2026-12-31"));
  await save();
  assert.ok((await row(app, "EMP001").innerText()).includes("即将到期"));
  await same("inclusive deadline boundary");
  await detail("EMP001");
  await both((page) => field(page, "新合同到期日期").fill("2027-01-01"));
  await save();
  assert.ok((await row(app, "EMP001").innerText()).includes("正常履行中"));
  await same("day after warning boundary");
  for (const [role, id] of [
    ["部门负责人", "EMP004"],
    ["普通员工", "EMP005"],
  ]) {
    await open("/contracts", role);
    assert.equal(
      await app.getByRole("heading", { name: "我的合同", exact: true }).count(),
      1,
    );
    assert.equal(await app.locator("main tbody tr").count(), 1);
    assert.ok((await app.locator("main tbody").innerText()).includes(id));
    assert.equal(
      await app
        .getByRole("button", { name: "仅看即将到期预警", exact: true })
        .count(),
      0,
    );
    await same(role + " own ledger", true);
    await detail(id);
    assert.equal(await modal(app).locator("input,select,textarea").count(), 0);
    assert.equal(
      await modal(app)
        .getByRole("button", { name: /续签|取消/ })
        .count(),
      0,
    );
    assert.equal(
      await modal(app)
        .getByRole("button", { name: "关闭", exact: true })
        .count(),
      1,
    );
    await same(role + " readonly detail", true);
  }
  await app.goto(base + "/contracts");
  await app
    .getByRole("button", { name: "仅看即将到期预警", exact: true })
    .click();
  await app.locator("header select").selectOption("部门负责人");
  assert.equal(await app.locator("main tbody tr").count(), 1);
  assert.ok((await app.locator("main tbody").innerText()).includes("EMP004"));
  checks.push("scope switch clears hidden HR warning filter");
  await app.goto(base + "/contracts");
  await row(app, "EMP001")
    .getByRole("button", { name: "查看详情", exact: true })
    .click();
  await app.locator("header select").selectOption("普通员工");
  assert.equal(await app.locator("div.fixed.inset-0").count(), 0);
  assert.ok((await app.locator("main tbody").innerText()).includes("EMP005"));
  checks.push("scope switch closes foreign contract editor");
  await h.finish();
} catch (error) {
  await h.fail(error);
} finally {
  await h.browser.close();
}
