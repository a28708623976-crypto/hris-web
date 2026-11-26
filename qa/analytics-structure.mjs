// Reports must use live data, so numeric sample literals are not a parity target.
// Preserve all structural tags/classes and static copy outside the declared metric cells.
export function analyticsStructure(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<div class="text-3xl[^\"]*">[\s\S]*?<\/div>/g, (match) =>
      match.replace(/>[\s\S]*<\/div>$/, ">@metric</div>"),
    )
    .replace(/<div class="text-\[11px\][^\"]*mt-1">[\s\S]*?<\/div>/g, (match) =>
      match.replace(/>[\s\S]*<\/div>$/, ">@metric-caption</div>"),
    )
    .replace(/<tbody[^>]*>[\s\S]*?<\/tbody>/g, (body) => {
      const row = body.match(/<tr\b[\s\S]*?<\/tr>/)?.[0] ?? "";
      const shape = row.replace(/>([^<>]+)</g, ">@cell<");
      return body.replace(/>[\s\S]*<\/tbody>$/, ">" + shape + "</tbody>");
    })
    .replace(/style="width:[^\"]*"/g, 'style="width:@metric"')
    .replace(/环节转化 [\d.]+%/g, "环节转化 @metric")
    .replace(/>\s*\d+ 人\s*</g, ">@people<")
    .replace(
      /已录用 \d+\/\d+ HC · 周期 [^<]+/g,
      "已录用 @metric HC · 周期 @metric",
    )
    .replace(
      /当前在招 HC 已全部锁定 Offer|持续推进面试安排与候选人跟进/g,
      "@diagnosis",
    )
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}
