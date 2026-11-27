import { execFileSync } from "node:child_process";
// Fixed local-only commands; never forward caller arguments to Wrangler.
const run = (cmd, args) =>
  execFileSync(cmd, args, {
    stdio: "inherit",
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
run("node", ["worker/scripts/init-local.mjs"]);
run("node_modules/.bin/wrangler", [
  "d1",
  "migrations",
  "apply",
  "DB",
  "--config",
  "worker/wrangler.jsonc",
  "--local",
  "--persist-to",
  "worker/.local",
]);
run("node", ["--import", "tsx", "worker/scripts/seed.ts"]);
run("node_modules/.bin/wrangler", [
  "d1",
  "execute",
  "DB",
  "--config",
  "worker/wrangler.jsonc",
  "--local",
  "--persist-to",
  "worker/.local",
  "--file",
  "worker/.local/seed.sql",
]);
