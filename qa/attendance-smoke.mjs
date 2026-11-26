import assert from "node:assert/strict";
import { moduleHarness } from "./module-harness.mjs";
const h = await moduleHarness("attendance");
const { app, both, modal, field, open, same, navigate, checks } = h;
const employeeRow = (page, id) =>
  page.locator("main tbody tr").filter({ hasText: id });
try {
  await open("/attendance");
  await same("locked team payroll", true);
  assert.deepEqual(await app.locator("main th").allTextContents(), [
    "员工",
    "出勤天数",
    "基本月薪",
    "绩效奖金",
    "税前应发合计",
    "状态",
  ]);
  assert.equal(await app.locator("main tbody tr").count(), 11);
  const amounts = await app
    .locator("main tbody tr")
    .first()
    .locator("td")
    .allTextContents();
  for (const index of [2, 3, 4]) assert.ok(amounts[index].includes("*"));
  await both((page) =>
    page.getByRole("button", { name: "解锁薪资明细", exact: true }).click(),
  );
  await same("unlocked payroll", true);
  assert.equal(
    await app.locator("main tbody tr").first().locator("td").nth(4).innerText(),
    "¥ 27,000",
  );
  await both((page) =>
    page.getByRole("button", { name: "一键发放工资条", exact: true }).click(),
  );
  assert.ok(
    (await app.locator("#root").innerText()).includes(
      "已向 11 名在职伙伴推送加密薪资单",
    ),
  );
  await same("salary slip notice counts current employees");
  await both((page) =>
    page.getByRole("button", { name: "锁定薪资明细", exact: true }).click(),
  );
  await same("relock masks amounts");
  await both((page) =>
    page.getByRole("button", { name: "个人考勤", exact: true }).click(),
  );
  await same("HR personal calendar", true);
  const cells = app.locator("main .grid-cols-7 > div");
  assert.equal(await cells.count(), 37);
  assert.deepEqual((await cells.allTextContents()).slice(0, 7), [
    "周日",
    "周一",
    "周二",
    "周三",
    "周四",
    "周五",
    "周六",
  ]);
  assert.ok((await cells.nth(7).innerText()).includes("公休日"));
  assert.ok((await cells.nth(8).innerText()).includes("09:26 - 18:40"));
  await both((page) =>
    page.getByRole("button", { name: "团队考勤与算薪", exact: true }).click(),
  );
  await same("HR returns to team");
  await open("/attendance", "普通员工");
  await same("employee directly sees personal calendar", true);
  assert.equal(await app.locator("main table").count(), 0);
  assert.ok((await app.locator("main").innerText()).includes("李明"));
  assert.equal(
    await app
      .getByRole("button", { name: "一键发放工资条", exact: true })
      .count(),
    0,
  );
  await open("/attendance", "部门负责人");
  await same("department lead matches prototype", true);
  assert.equal(
    await app
      .getByRole("button", { name: "一键发放工资条", exact: true })
      .count(),
    0,
  );
  await open("/employees");
  await both((page) =>
    employeeRow(page, "EMP001")
      .getByRole("button", { name: "查看详情", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "编辑档案资料", exact: true })
      .click(),
  );
  await both((page) => field(page, "民族").selectOption("汉族"));
  await both((page) => field(page, "户口类型").selectOption("本市城镇"));
  await both((page) => field(page, "婚姻状况").selectOption("未婚"));
  await both((page) => field(page, "首次参加工作日期").fill("2020-06-01"));
  await both((page) =>
    modal(page)
      .getByRole("button", { name: /^岗位与薪酬/ })
      .click(),
  );
  await both((page) => field(page, "转正底薪").fill("23000"));
  await both((page) => field(page, "转正绩效基数").fill("6000"));
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "保存档案修改", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page).getByRole("button", { name: "关闭", exact: true }).click(),
  );
  await navigate("考勤薪资");
  await both((page) =>
    page.getByRole("button", { name: "解锁薪资明细", exact: true }).click(),
  );
  assert.equal(
    await app.locator("main tbody tr").first().locator("td").nth(4).innerText(),
    "¥ 29,000",
  );
  await same("employee salary edits flow into payroll");
  await navigate("员工档案");
  await both((page) =>
    employeeRow(page, "EMP001")
      .getByRole("button", { name: "查看详情", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "发起离职流程", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "提交审批流程", exact: true })
      .click(),
  );
  await both((page) =>
    page
      .locator("main div.p-5")
      .filter({ hasText: "LC-2026-005" })
      .getByRole("button", { name: "查看详情", exact: true })
      .click(),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "同意并归档生效", exact: true })
      .click(),
  );
  await navigate("考勤薪资");
  assert.equal(await app.locator("main tbody tr").count(), 10);
  assert.ok(!(await app.locator("main tbody").innerText()).includes("林晓梅"));
  await same("resignation removes employee and payroll amount");
  await h.finish();
} catch (error) {
  await h.fail(error);
} finally {
  await h.browser.close();
}
