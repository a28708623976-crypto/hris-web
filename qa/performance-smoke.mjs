import assert from "node:assert/strict";
import { moduleHarness } from "./module-harness.mjs";
const h = await moduleHarness("performance");
const { app, both, open, same, modal, navigate } = h;
const row = (page) =>
  page.locator("main tbody tr").filter({ hasText: "EMP005" });
try {
  await open("/performance");
  await same("HR performance table and progress bars", true);
  assert.equal(await app.locator("main th").count(), 8);
  assert.equal(await app.locator("main tbody tr").count(), 7);
  await both((page) =>
    row(page).getByRole("button", { name: "查看详情", exact: true }).click(),
  );
  await same("centered calibration details", true);
  await both((page) =>
    modal(page).getByRole("button", { name: "B+ (4.2)", exact: true }).click(),
  );
  await both((page) =>
    modal(page)
      .locator("textarea")
      .fill("跨团队交付达标，建议继续提升复盘质量。"),
  );
  await same("editable grade and manager comment");
  await both((page) =>
    modal(page).getByRole("button", { name: "取消", exact: true }).click(),
  );
  await same("cancel preserves original grade");
  assert.ok((await row(app).innerText()).includes("S (4.9)"));
  await both((page) =>
    row(page).getByRole("button", { name: "查看详情", exact: true }).click(),
  );
  await both((page) =>
    modal(page).getByRole("button", { name: "B+ (4.2)", exact: true }).click(),
  );
  await both((page) =>
    modal(page)
      .locator("textarea")
      .fill("跨团队交付达标，建议继续提升复盘质量。"),
  );
  await both((page) =>
    modal(page)
      .getByRole("button", { name: "确认保存校准结果", exact: true })
      .click(),
  );
  await same("save updates row and toast");
  assert.ok((await row(app).innerText()).includes("B+ (4.2)"));
  await both((page) =>
    page
      .getByRole("button", { name: "同步结果至算薪引擎", exact: true })
      .click(),
  );
  await same("payroll synchronization notice");
  await both((page) => page.locator("header select").selectOption("普通员工"));
  await same("employee sees own updated grade and comment", true);
  const text = await app.locator("main").innerText();
  assert.ok(
    text.includes("李明") &&
      text.includes("B+ (4.2)") &&
      text.includes("跨团队交付达标"),
  );
  assert.equal(await app.locator("main table").count(), 0);
  assert.equal(
    await app
      .getByRole("button", { name: "同步结果至算薪引擎", exact: true })
      .count(),
    0,
  );
  await navigate("我的考勤");
  await same("employee calendar remains unchanged after synchronization");
  await open("/performance", "部门负责人");
  await same("department lead calibration access matches prototype", true);
  await both((page) =>
    row(page).getByRole("button", { name: "查看详情", exact: true }).click(),
  );
  await both((page) => modal(page).locator("button").first().click());
  await same("close leaves records unchanged");
  await h.finish();
} catch (error) {
  await h.fail(error);
} finally {
  await h.browser.close();
}
