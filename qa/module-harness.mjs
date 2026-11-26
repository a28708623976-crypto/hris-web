import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { prepareReference } from "./prototype-reference.mjs";
import { referenceState } from "./routes.mjs";

export async function moduleHarness(suite) {
  prepareReference();
  const base = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1120 },
    reducedMotion: "reduce",
  });
  const app = await context.newPage(),
    reference = await context.newPage();
  const errors = [],
    checks = [];
  for (const page of [app, reference])
    page.on("pageerror", (error) => errors.push(error.message));
  await reference.addInitScript(() => {
    const raw = new URL(location.href).searchParams.get("state");
    if (raw) globalThis.__PEOPLEOS_REFERENCE__ = JSON.parse(raw);
  });
  mkdirSync("qa/artifacts", { recursive: true });
  const normalize = (text) =>
    text.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  const both = (action) => Promise.all([action(app), action(reference)]);
  const modal = (page, heading) =>
    page
      .locator("div.fixed.inset-0")
      .filter({
        has: heading
          ? page.getByRole("heading", { name: heading, exact: true })
          : page.locator("h3"),
      })
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
  async function open(route, role = "HR 主管") {
    await Promise.all([
      app.goto(base + route),
      reference.goto(
        base +
          "/qa/reference.html?state=" +
          encodeURIComponent(JSON.stringify(referenceState(role, route))),
      ),
    ]);
    await app.locator("header select").selectOption(role);
    await both((page) => page.locator("main h1,main h2").first().waitFor());
  }
  async function same(label, screenshot = false) {
    await both((page) => page.mouse.move(0, 0));
    await app.waitForTimeout(80);
    const [actual, expected] = await Promise.all([
      app.locator("#root").innerHTML(),
      reference.locator("#root").innerHTML(),
    ]);
    if (normalize(actual) !== normalize(expected)) {
      writeFileSync(`qa/artifacts/${suite}-actual.html`, actual);
      writeFileSync(`qa/artifacts/${suite}-reference.html`, expected);
      assert.fail(label + ": DOM/copy/classes mismatch");
    }
    const controls = (page) =>
      page
        .locator("#root input,#root select,#root textarea")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            type: node.type,
            value: node.type === "file" ? "" : node.value,
            checked: node.checked,
            disabled: node.disabled,
          })),
        );
    assert.deepEqual(
      await controls(app),
      await controls(reference),
      label + ": control values",
    );
    if (screenshot) {
      const [a, b] = await Promise.all([
        app.screenshot({ animations: "disabled", fullPage: true }),
        reference.screenshot({ animations: "disabled", fullPage: true }),
      ]);
      const x = PNG.sync.read(a),
        y = PNG.sync.read(b);
      const delta =
        x.width === y.width && x.height === y.height
          ? pixelmatch(x.data, y.data, null, x.width, x.height, {
              threshold: 0.1,
              includeAA: false,
            })
          : Infinity;
      if (delta) {
        writeFileSync(`qa/artifacts/${suite}-actual.png`, a);
        writeFileSync(`qa/artifacts/${suite}-reference.png`, b);
      }
      assert.equal(delta, 0, label + ": screenshot");
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
    await both((page) => page.locator("main h1,main h2").first().waitFor());
  }
  async function finish() {
    assert.deepEqual(errors, []);
    writeFileSync(
      `qa/artifacts/${suite}-results.json`,
      JSON.stringify({ checks, errors }, null, 2),
    );
    console.log(
      `PASS ${suite}: ${checks.length} browser scenarios, 0 runtime errors.`,
    );
  }
  async function fail(error) {
    console.error("FAILED", suite, "URL", app.url(), "ERRORS", errors);
    await app.screenshot({
      path: `qa/artifacts/${suite}-failure.png`,
      fullPage: true,
    });
    throw error;
  }
  return {
    base,
    browser,
    app,
    reference,
    errors,
    checks,
    both,
    modal,
    field,
    open,
    same,
    navigate,
    finish,
    fail,
  };
}
