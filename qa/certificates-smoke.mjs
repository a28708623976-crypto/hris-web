import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PDFDocument } from "pdf-lib";
import { moduleHarness } from "./module-harness.mjs";
const h = await moduleHarness("certificates");
const { app, reference, both, open, same, navigate, checks } = h;
const button = (page, format) =>
  page.getByRole("button", { name: `生成文件 (${format})`, exact: true });
const outputs = [];
async function download(type, tag, expected) {
  for (const format of ["PDF", "Word"]) {
    const event = app.waitForEvent("download");
    await button(app, format).click();
    const file = await event;
    const bytes = readFileSync(await file.path());
    const path = `qa/artifacts/certificate-${tag}.${format === "PDF" ? "pdf" : "docx"}`;
    writeFileSync(path, bytes);
    outputs.push(path);
    assert.ok(
      file.suggestedFilename().endsWith(format === "PDF" ? ".pdf" : ".docx"),
    );
    if (format === "PDF") {
      assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
      const pdf = await PDFDocument.load(bytes);
      assert.equal(pdf.getPageCount(), 1);
      assert.equal(pdf.getTitle(), type);
    } else {
      assert.equal(bytes.subarray(0, 2).toString(), "PK");
      const xml = execFileSync("unzip", [
        "-p",
        path,
        "word/document.xml",
      ]).toString();
      for (const text of [type, ...expected])
        assert.ok(xml.includes(text), text + " in editable Word content");
    }
  }
  checks.push(type + " valid PDF/OOXML Word downloads");
}
try {
  await open("/certificates");
  await same("initial preview", true);
  for (const type of ["在职证明", "收入证明", "离职证明"])
    assert.equal(
      await app
        .getByRole("button", { name: type, exact: true })
        .locator("svg,input")
        .count(),
      0,
    );
  assert.equal(await app.locator("input[type=radio]").count(), 0);
  await both((page) => page.locator("main select").selectOption("EMP002"));
  await both((page) =>
    page.locator("main input[type=text]").fill("申请居住证"),
  );
  await same("employee and purpose update preview", true);
  await download("在职证明", "employment", ["张伟", "申请居住证"]);
  await open("/certificates");
  await both((page) =>
    page.getByRole("button", { name: "收入证明", exact: true }).click(),
  );
  assert.equal(await button(app, "PDF").isDisabled(), true);
  assert.equal(await button(app, "Word").isDisabled(), true);
  assert.ok(
    (await app.locator("main").innerText()).includes(
      "请先在考勤薪资页解锁薪资明细",
    ),
  );
  assert.ok(!(await app.locator("main").innerText()).includes("27,000"));
  await same("locked income masks and blocks export", true);
  await navigate("考勤薪资");
  await both((page) =>
    page.getByRole("button", { name: "解锁薪资明细", exact: true }).click(),
  );
  await navigate("证明文件");
  await both((page) =>
    page.getByRole("button", { name: "收入证明", exact: true }).click(),
  );
  assert.equal(await button(app, "PDF").isEnabled(), true);
  assert.ok((await app.locator("main").innerText()).includes("27,000"));
  await same("salary lock shared with income proof", true);
  await download("收入证明", "income", ["林晓梅", "27,000"]);
  await open("/certificates");
  await both((page) =>
    page.getByRole("button", { name: "离职证明", exact: true }).click(),
  );
  assert.equal(await button(app, "PDF").isDisabled(), true);
  assert.ok(
    (await app.locator("main").innerText()).includes("请先选择离职日期"),
  );
  await same("resignation date required", true);
  await both((page) =>
    page.locator("main input[type=date]").fill("2026-12-07"),
  );
  assert.equal(await button(app, "PDF").isEnabled(), true);
  assert.ok((await app.locator("main").innerText()).includes("2026年12月7日"));
  await same("resignation preview and export enabled", true);
  await download("离职证明", "resignation", ["林晓梅", "2026年12月7日"]);
  for (const role of ["部门负责人", "普通员工"]) {
    await open("/certificates", role);
    await app.waitForURL("**/dashboard");
    assert.equal(
      await app
        .locator("main")
        .getByRole("heading", { name: "证明文件", exact: true })
        .count(),
      0,
    );
    await same(role + " no certificate access");
  }
  writeFileSync(
    "qa/artifacts/certificates-downloads.json",
    JSON.stringify(outputs, null, 2),
  );
  await h.finish();
} catch (error) {
  await h.fail(error);
} finally {
  await h.browser.close();
}
