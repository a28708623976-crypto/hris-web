import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { unlinkSync } from "node:fs";
import { prepareReference } from "./prototype-reference.mjs";
prepareReference();
try {
  await build({
    entryPoints: ["qa/state-and-utils.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    outfile: "qa/.state-and-utils.cjs",
  });
  execFileSync(process.execPath, ["qa/.state-and-utils.cjs"], {
    stdio: "inherit",
  });
} finally {
  try {
    unlinkSync("qa/.state-and-utils.cjs");
  } catch {}
}
