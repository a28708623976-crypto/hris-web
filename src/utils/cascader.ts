import type { CascaderOption } from "../types";

export function resolveCascaderPath<T extends CascaderOption>(
  options: readonly T[],
  ids: readonly string[],
): CascaderOption[] {
  const path: CascaderOption[] = [];
  let level: readonly CascaderOption[] = options;
  for (const id of ids) {
    const node = level.find((node) => node.id === id);
    if (!node) return [];
    path.push(node);
    level = node.children ?? [];
  }
  return path;
}
