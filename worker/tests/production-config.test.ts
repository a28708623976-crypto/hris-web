import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

test("production template retains assets and production-only bindings without secrets", () => {
  const read = (name: string) =>
    ts.parseConfigFileTextToJson(
      name,
      readFileSync(new URL(`../${name}`, import.meta.url), "utf8"),
    ).config;
  const config = read("wrangler.production.jsonc");
  assert.equal(config.name, "peopleos-hris");
  assert.equal(config.vars.ENV, "production");
  assert.deepEqual(config.assets, read("wrangler.jsonc").assets);
  assert.equal(config.d1_databases[0].binding, "DB");
  assert.equal(config.d1_databases[0].database_name, "peopleos-hris");
  assert.equal(config.r2_buckets[0].bucket_name, "peopleos-hris-attachments");
  assert.deepEqual(config.send_email, [{ name: "EMAIL" }]);
  assert.equal(config.routes[0].custom_domain, true);
  const json = JSON.stringify(config);
  assert.doesNotMatch(json, /"remote":false|AUTH_SECRET|ENCRYPTION_KEY/);
});
