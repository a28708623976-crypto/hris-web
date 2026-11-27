import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
// @ts-expect-error Local executable also exports its offline checker for tests.
import { checkProductionConfig } from "../scripts/deploy-check.mjs";

test("offline deployment checker accepts JSONC and blocks unsafe configurations", () => {
  const dir = mkdtempSync(join(tmpdir(), "peopleos-deploy-"));
  try {
    mkdirSync(join(dir, "worker"));
    mkdirSync(join(dir, "dist"));
    writeFileSync(join(dir, "dist/index.html"), "test");
    const configPath = join(dir, "worker/config.jsonc");
    const base = {
      vars: { ENV: "production" },
      assets: { directory: "../dist" },
    };
    const check = (config: object, strict = false) => {
      writeFileSync(configPath, "// JSONC comment\n" + JSON.stringify(config));
      return () => checkProductionConfig({ configPath, strict });
    };
    assert.doesNotThrow(check(base, true));
    assert.throws(check({ ...base, vars: { ENV: "dev" } }), /ENV/);
    assert.throws(check({ assets: base.assets }), /ENV/);
    assert.throws(
      check({ ...base, bindings: [{ nested: { remote: false } }] }),
      /remote:false/,
    );
    assert.doesNotThrow(
      check({ ...base, url: "https://host.test/path", remote: true }),
    );
    for (const key of ["AUTH_SECRET", "ENCRYPTION_KEY"])
      assert.throws(
        check({ ...base, vars: { ...base.vars, [key]: "test" } }),
        /密钥/,
      );
    const template = { ...base, domain: "REPLACE_WITH_DOMAIN" };
    assert.doesNotThrow(check(template));
    assert.throws(check(template, true), /占位符/);
    writeFileSync(configPath, "{bad json");
    assert.throws(() => checkProductionConfig({ configPath }), /JSONC/);
    assert.throws(
      check({ ...base, assets: { directory: "../elsewhere" } }),
      /目录/,
    );
    rmSync(join(dir, "dist/index.html"));
    assert.throws(check(base), /dist/);
    rmSync(join(dir, "dist"), { recursive: true });
    assert.throws(check(base), /dist/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("npm deploy builds and strictly checks before invoking Wrangler", () => {
  const { scripts } = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(
    scripts["deploy:check"],
    "npm run build && node worker/scripts/deploy-check.mjs",
  );
  assert.equal(
    scripts.deploy,
    "npm run deploy:check -- --strict && wrangler deploy --config worker/wrangler.production.jsonc",
  );
});
