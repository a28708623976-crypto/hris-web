import { readFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export function checkProductionConfig({
  configPath = resolve(root, "worker/wrangler.production.jsonc"),
  strict = false,
} = {}) {
  const source = readFileSync(configPath, "utf8");
  const parsed = ts.parseConfigFileTextToJson(configPath, source);
  if (parsed.error) throw new Error("生产配置 JSONC 格式错误");
  const config = parsed.config;
  if (config?.vars?.ENV !== "production")
    throw new Error("生产配置 ENV 必须为 production");
  function inspect(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (key === "remote" && child === false)
        throw new Error("生产配置不得包含 remote:false");
      if (["AUTH_SECRET", "ENCRYPTION_KEY"].includes(key))
        throw new Error("密钥必须使用 Worker secrets，不得写入配置");
      inspect(child);
    }
  }
  inspect(config);
  if (strict && /REPLACE_WITH/.test(source))
    throw new Error("生产配置仍含 REPLACE_WITH 占位符，请先替换域名和 D1 ID");
  if (config?.assets?.directory !== "../dist")
    throw new Error("生产静态资源目录必须为 ../dist");
  const dist = resolve(dirname(configPath), config.assets.directory);
  if (
    !statSync(dist, { throwIfNoEntry: false })?.isDirectory() ||
    !statSync(resolve(dist, "index.html"), { throwIfNoEntry: false })?.isFile()
  )
    throw new Error("dist/index.html 不存在，请先运行 npm run build");
  return { strict, dist };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== "--strict"))
      throw new Error("仅支持 --strict 参数");
    const { strict } = checkProductionConfig({
      strict: args.includes("--strict"),
    });
    console.log(
      `生产配置检查通过（${strict ? "严格" : "模板"}模式，仅本地检查，未部署）。`,
    );
  } catch (error) {
    console.error("生产配置检查失败：" + error.message);
    process.exitCode = 1;
  }
}
