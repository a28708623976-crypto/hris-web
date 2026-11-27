import assert from "node:assert/strict";
import { isInternalPath } from "../src/utils/navigation";

for (const target of [
  undefined,
  null,
  123,
  {},
  "",
  "employees",
  "//evil.com",
  "\\\\evil.com",
  "/\\evil.com",
  "https://evil.com",
  "http://evil.com/employees",
  "javascript:alert(1)",
  "data:text/html,evil",
  " https://evil.com",
  " /employees",
  "/\n/evil.com",
  "/\t/evil.com",
  "/%2fevil.com",
  "/%5cevil.com",
  "/%0a/evil.com",
  "/../\\evil.com",
  "/.//evil.com",
  "/%2e//evil.com",
  "/invalid%escape",
]) {
  assert.equal(isInternalPath(target), false, JSON.stringify(target));
}

for (const target of [
  "/",
  "/dashboard",
  "/employees",
  "/ats/jobs/new",
  "/self-service?type=leave#form",
  "/employees?q=%E5%BC%A0",
]) {
  assert.equal(isInternalPath(target), true, target);
}

console.log("PASS internal navigation rejects external and malformed targets.");
