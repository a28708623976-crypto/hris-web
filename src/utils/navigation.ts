/** Accept only root-relative, same-origin paths, including after URL decoding. */
export function isInternalPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const decoded = decodeURIComponent(value);
    for (const path of [value, decoded]) {
      if (
        !path.startsWith("/") ||
        path.startsWith("//") ||
        /[\\\u0000-\u0020\u007f]/.test(path)
      )
        return false;
      const url = new URL(path, "https://internal.invalid");
      if (
        url.origin !== "https://internal.invalid" ||
        url.pathname.startsWith("//")
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
}
