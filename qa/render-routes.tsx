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
    assert.equal(
      normalize(html),
      normalize(reference),
      `${role} ${route} must match the authoritative prototype`,
    );
    count++;
  }
}
console.log(
  `PASS ${count} accessible route/role combinations: markup, copy, classes and data scopes match the prototype.`,
);
