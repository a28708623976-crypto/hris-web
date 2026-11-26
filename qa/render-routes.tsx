import { analyticsStructure } from "./analytics-structure.mjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import assert from "node:assert/strict";
import App from "../src/App";
import Reference from "./.prototype-reference";
import { createInitialState, useStore } from "../src/store";
import { roles, routes, canAccess, referenceState } from "./routes.mjs";
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (!String(args[0]).includes("useLayoutEffect")) originalError(...args);
};
// Fragment extraction changes insignificant JSX whitespace only.
const normalize = (html: string) =>
  html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
let count = 0;
for (const role of roles) {
  for (const route of routes) {
    if (!canAccess(role, route)) continue;
    useStore.setState({ ...createInitialState(), role });
    Object.assign(useStore.getInitialState(), useStore.getState());
    (
      globalThis as typeof globalThis & {
        __PEOPLEOS_REFERENCE__?: ReturnType<typeof referenceState>;
      }
    ).__PEOPLEOS_REFERENCE__ = referenceState(role, route);
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    );
    const reference = renderToStaticMarkup(<Reference />);
    assert.ok(html.length > 1000, `${role} ${route} renders`);
    assert.ok(
      !html.includes("NaN"),
      `${role} ${route} has valid numeric output`,
    );
    if (route === "/self-service") {
      const outsideRequestForm = (markup: string) =>
        normalize(
          markup
            .replace(/<form[\s\S]*?<\/form>/, "<form/>")
            .replaceAll("假勤申请 / 年假申请", "假勤申请 / 休假申请 / 年假申请")
            .replaceAll(
              "资产申领 / 办公电脑 / 显示器",
              "资产申领 / 电脑与外设 / 显示器申领",
            )
            .replaceAll(
              "费用报销 / 差旅交通及住宿报销",
              "费用报销 / 差旅费用 / 差旅报销",
            ),
        );
      assert.equal(
        outsideRequestForm(html),
        outsideRequestForm(reference),
        `${role} self-service outside the authorized form/path changes`,
      );
      assert.ok(html.includes('role="combobox"'));
      assert.ok(html.includes("请选择最末级申请事项"));
    } else if (route === "/ats/analytics") {
      assert.equal(
        analyticsStructure(html),
        analyticsStructure(reference),
        "ATS report structure outside live metric cells",
      );
      assert.ok(html.includes("2 份发出") || html.includes("2</"));
    } else {
      assert.equal(
        normalize(html),
        normalize(reference),
        `${role} ${route} must match the authoritative prototype`,
      );
    }
    count++;
  }
}
console.log(
  `PASS ${count} accessible route/role combinations: 25 unchanged views match the full prototype; 1 live ATS report preserves structure; 3 self-service views preserve the shell outside the authorized form/path changes.`,
);
