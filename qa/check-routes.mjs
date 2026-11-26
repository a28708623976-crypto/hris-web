import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { unlinkSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { prepareReference } from "./prototype-reference.mjs";
const digest = () =>
  createHash("sha256")
    .update(readFileSync("prototype/peopleos_hris_pro.tsx"))
    .digest("hex");
assert.equal(
  digest(),
  "929d2b9c30dd33e31a9771805c5bb34cd3ce64c5012787adc9d088c5a9c4976f",
  "The authoritative prototype must not be modified",
);
prepareReference();
const outfile = fileURLToPath(new URL("./.render-routes.cjs", import.meta.url));
try {
  await build({
    entryPoints: ["qa/render-routes.tsx"],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    outfile,
    jsx: "automatic",
  });
  execFileSync(process.execPath, [outfile], { stdio: "inherit" });
} finally {
  try {
    unlinkSync(outfile);
  } catch {}
}
