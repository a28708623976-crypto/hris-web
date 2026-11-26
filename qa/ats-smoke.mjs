import assert from "node:assert/strict";
import { moduleHarness } from "./module-harness.mjs";
import { analyticsStructure } from "./analytics-structure.mjs";
const h = await moduleHarness("ats");
const {
  app,
  reference,
  base,
  both,
  open,
  same,
  modal,
  field,
  navigate,
  checks,
} = h;
const drawer = (page) =>
  page
    .locator("div.fixed.inset-0")
    .filter({ has: page.locator('[class*="w-[80%]"]') });
const closeDrawer = () =>
  both((page) => drawer(page).locator('[class*="w-[20%]"]').click());
const offerRow = (page, name) =>
  page.locator("main tbody tr").filter({ hasText: name });
const offerOpen = (name) =>
  both((page) =>
    offerRow(page, name)
      .getByRole("button", { name: "查看", exact: true })
      .click(),
  );
const closeOffer = () =>
  both((page) => modal(page).locator("button").first().click());
const button = (name) =>
  both((page) => page.getByRole("button", { name, exact: true }).click());
async function sameOffer(label) {
  const normalize = (html) =>
    html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  assert.equal(
    normalize(await modal(app).innerHTML()),
    normalize(await modal(reference).innerHTML()),
    label,
  );
  const controls = (page) =>
    modal(page)
      .locator("input,select,textarea")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({ value: node.value, disabled: node.disabled })),
      );
  assert.deepEqual(
    await controls(app),
    await controls(reference),
    label + " controls",
  );
  checks.push(
    label + " (modal; underlying candidate amounts independently verified)",
  );
}
try {
  for (const route of [
    "/ats/home",
    "/ats/jobs",
    "/ats/jobs/new",
    "/ats/progress",
    "/ats/candidates",
    "/ats/talent",
    "/ats/offers",
  ]) {
    await open(route);
    await same("initial " + route, true);
  }
  await open("/ats/jobs");
  await button("海外全局模式 (Global)");
  await same("global job salary bands", true);
  await navigate("候选人库");
  await same("global candidate currency and authorization", true);
  await both((page) =>
    page
      .getByText("匿名盲筛模式", { exact: true })
      .locator("..")
      .locator("input")
      .check(),
  );
  await same("anonymous candidate table", true);
  await both((page) =>
    page.getByRole("button", { name: "审阅详情", exact: true }).first().click(),
  );
  await same("anonymous 80 percent drawer", true);
  const bounds = await app.locator('[class*="w-[80%]"]').boundingBox();
  assert.ok(Math.abs(bounds.width - 1440 * 0.8) < 1);
  assert.ok(!(await drawer(app).locator("h3").innerText()).includes("唐子昂"));
  await closeDrawer();
  await open("/ats/candidates");
  await both((page) =>
    page.getByRole("button", { name: "审阅详情", exact: true }).first().click(),
  );
  for (const tab of [
    "原始简历预览 (PDF)",
    "历史投递记录",
    "结构化简历档案",
    "沟通记录 (Email/SMS)",
    "动态与评价 (Scorecards)",
  ]) {
    await both((page) =>
      drawer(page).getByRole("button", { name: tab, exact: true }).click(),
    );
    await same("drawer " + tab);
  }
  await both((page) =>
    drawer(page)
      .getByPlaceholder("输入内部协同备注，支持 @同事 发送通知...")
      .fill("请关注大型动画项目交付经验"),
  );
  await both((page) =>
    drawer(page).getByRole("button", { name: "发送", exact: true }).click(),
  );
  await same("candidate collaboration note");
  await both((page) =>
    drawer(page)
      .getByRole("button", { name: "填写面试评价表", exact: true })
      .click(),
  );
  await same("centered scorecard with left and right panes", true);
  assert.equal(
    await modal(app, "结构化面试评价表 · 唐子昂")
      .locator('[class*="md:w-[42%]"]')
      .count(),
    1,
  );
  await both((page) =>
    page
      .getByPlaceholder("请列举候选人最突出的亮点...")
      .fill("能够独立推进跨团队项目"),
  );
  await both((page) =>
    page
      .getByPlaceholder("如有需下一轮重点验证的疑点请注明...")
      .fill("需验证高并发环境经验"),
  );
  await button("Yes 同意录用");
  await button("提交面试评价");
  await same("scorecard saved to candidate activity");
  await closeDrawer();
  await open("/ats/progress");
  await button("全局职位列表视图");
  await same("global pipeline table", true);
  await button("单职位看板视图");
  await both((page) =>
    page.getByPlaceholder("搜索候选人或职位...").fill("不存在"),
  );
  await same("pipeline search empty result");
  await both((page) => page.getByPlaceholder("搜索候选人或职位...").fill(""));
  await both((page) => page.locator("main select").selectOption("JOB-104"));
  await same("job selection and overdue card", true);
  await both((page) =>
    page
      .getByText("仅看我负责的", { exact: true })
      .locator("..")
      .locator("input")
      .check(),
  );
  await same("my pipeline filter");
  await open("/ats/jobs/new");
  assert.equal(
    await app
      .getByRole("button", { name: "确认发布", exact: true })
      .isDisabled(),
    true,
  );
  await both((page) =>
    page.getByPlaceholder("例如：高级 AIGC 算法架构师").fill("资深全栈工程师"),
  );
  await button("全远程 Remote");
  await button("确认发布");
  await same("published job appears in management", true);
  assert.ok((await app.locator("main").innerText()).includes("JOB-105"));
  await open("/ats/candidates");
  await both((page) =>
    offerRow(page, "韩牧野")
      .getByRole("button", { name: "审阅详情", exact: true })
      .click(),
  );
  await both((page) =>
    drawer(page).getByRole("button", { name: "淘汰", exact: true }).click(),
  );
  await both((page) =>
    modal(page).locator("select").selectOption("进入人才库作为银牌储备候选人"),
  );
  await same("centered rejection dialog");
  await button("确认淘汰归档");
  await navigate("人才库");
  await same("rejected candidate enters talent pool");
  assert.ok((await app.locator("main tbody").innerText()).includes("韩牧野"));
  await open("/ats/offers");
  await offerOpen("唐子昂");
  await same("Offer sent and locked", true);
  assert.equal(await field(app, "基本月薪 (元)").isDisabled(), true);
  await button("确认候选人已电子签署");
  await same("acceptance creates HRIS onboarding", true);
  await button("重新转入");
  await same("repeat acceptance links existing onboarding");
  assert.ok(
    (
      await app
        .getByRole("button", { name: /查看 HRIS 待入职队列/ })
        .innerText()
    ).includes("(3)"),
  );
  await offerOpen("宋清欢");
  await same("separate candidate draft");
  await both((page) => field(page, "基本月薪 (元)").fill("41000"));
  await both((page) => field(page, "绩效奖金基数 (元)").fill("7000"));
  await both((page) => field(page, "预计入职日期").fill("2026-12-20"));
  await sameOffer("offer preview updates from salary and date");
  await button("提交审批");
  await sameOffer("approval locks offer");
  await button("发送电子签 Offer");
  await sameOffer("send transitions candidate");
  await button("确认候选人已电子签署");
  await sameOffer("existing candidate links seeded HRIS onboarding");
  await button("重新转入");
  // Per-candidate salary values intentionally correct the original shared-form bug.
  assert.ok((await offerRow(app, "唐子昂").innerText()).includes("32,000"));
  assert.ok((await offerRow(app, "宋清欢").innerText()).includes("41,000"));
  checks.push("Offer amounts are isolated by candidate");
  await app.getByRole("button", { name: /查看 HRIS 待入职队列/ }).click();
  assert.ok((await modal(app).innerText()).includes("OB-2026-002"));
  assert.ok((await modal(app).innerText()).includes("2026-12-20"));
  await modal(app)
    .getByRole("button", { name: "前往 HRIS 办理建档", exact: true })
    .click();
  assert.equal(new URL(app.url()).pathname, "/onboarding");
  assert.equal(await app.locator("main div.p-5").count(), 3);
  checks.push("Offer handoff opens actual HRIS queue without duplicate order");
  // Keep this store while returning through the real app switcher.
  await app
    .getByRole("button", { name: "核心人事 (HRIS)", exact: true })
    .click();
  await app.getByRole("button", { name: /^招聘管理 \(ATS\)/ }).click();
  await app
    .locator("aside nav")
    .getByRole("button", { name: /^招聘报表/ })
    .click();
  const report = await app.locator("main").innerText();
  assert.ok(report.includes("3 份发出 · 2 份确认签署"));
  assert.ok(report.includes("66.7%") && report.includes("40.0%"));
  checks.push(
    "recruiting report aggregates live offers acceptances and headcount",
  );
  await app.screenshot({
    path: "qa/artifacts/ats-analytics-live.png",
    fullPage: true,
  });
  await open("/ats/analytics");
  assert.equal(
    analyticsStructure(await app.locator("#root").innerHTML()),
    analyticsStructure(await reference.locator("#root").innerHTML()),
  );
  assert.ok((await app.locator("main").innerText()).includes("未标记来源"));
  checks.push(
    "report keeps prototype structure and shows missing source facts",
  );
  for (const role of ["部门负责人", "普通员工"]) {
    await app.goto(base + "/ats/home");
    await app.locator("header select").selectOption(role);
    await app.waitForURL((url) => !url.pathname.startsWith("/ats/"));
    assert.equal(
      await app
        .getByRole("button", { name: /^(招聘管理 \(ATS\)|核心人事 \(HRIS\))$/ })
        .count(),
      0,
    );
    checks.push(role + " cannot access ATS or app switcher");
  }
  await h.finish();
} catch (error) {
  await h.fail(error);
} finally {
  await h.browser.close();
}
