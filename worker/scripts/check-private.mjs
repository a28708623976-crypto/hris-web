import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { parseEnv } from "node:util";
import assert from "node:assert/strict";
const git = (args) => execFileSync("git", args, { encoding: "utf8" });
for (const path of [
  "worker/.dev.vars",
  "worker/.local/seed.sql",
  "worker/.test/browser.log",
])
  assert.equal(git(["check-ignore", path]).trim(), path);
const tracked = git(["ls-files", "--cached", "-z"]).split("\0").filter(Boolean);
assert.ok(
  tracked.every(
    (path) =>
      !/(^|\/)\.dev\.vars($|\.)|(^|\/)\.env($|\.)|\.sqlite($|-)|^worker\/\.(local|test|build)\//.test(
        path,
      ),
  ),
  "private files must not be tracked",
);
const vars = parseEnv(readFileSync("worker/.dev.vars", "utf8"));
const privateValues = [
  "AUTH_SECRET",
  "ENCRYPTION_KEY",
  "SEED_HR_EMAIL",
  "SEED_DEPT_EMAIL",
  "SEED_EMP_EMAIL",
]
  .map((key) => vars[key])
  .filter(Boolean);
const scan = (path) => {
  const bytes = readFileSync(path);
  for (const value of privateValues)
    assert.ok(
      !bytes.includes(Buffer.from(value)),
      `private configuration value found in ${path}`,
    );
};
for (const path of tracked) scan(path);
const walk = (directory) => {
  for (const name of readdirSync(directory)) {
    const path = directory + "/" + name;
    statSync(path).isDirectory() ? walk(path) : scan(path);
  }
};
walk("dist");
const config = JSON.parse(
  readFileSync("worker/wrangler.jsonc", "utf8").replace(/,\s*([}\]])/g, "$1"),
);
assert.equal(config.account_id, undefined);
assert.equal(config.vars.ENV, "dev");
assert.equal(config.send_metrics, false);
for (const resource of [
  ...config.d1_databases,
  ...config.r2_buckets,
  ...config.send_email,
])
  assert.equal(resource.remote, false);
console.log(
  "PASS private files ignored, no local keys or seed emails in tracked files/frontend bundle; every binding is local, no account ID.",
);
