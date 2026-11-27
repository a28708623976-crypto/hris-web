export function calcAge(birthDate: string) {
  if (!birthDate) return "--";
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return "--";
  const now = new Date("2026-11-25");
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age >= 0 ? `${age} 岁` : "--";
}

export function calcTenure(firstWorkDate: string) {
  if (!firstWorkDate) return "--";
  const start = new Date(firstWorkDate);
  if (Number.isNaN(start.getTime())) return "--";
  const now = new Date("2026-11-25");
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (months < 0) return "0 年";
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return years > 0 ? `${years} 年 ${remMonths} 个月` : `${remMonths} 个月`;
}

export function calcProbationEndDate(startDate: string, periodLabel: string) {
  if (!startDate || !periodLabel) return "";
  const months = parseInt(periodLabel, 10);
  if (Number.isNaN(months)) return "";
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function calcContractEndDate(startDate: string, years = 3) {
  if (!startDate) return "";
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function addDaysToDate(dateStr: string, days: number) {
  if (!dateStr) return "2026-12-08";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "2026-12-08";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
