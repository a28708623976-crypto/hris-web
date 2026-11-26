export const roles = ["HR 主管", "部门负责人", "普通员工"];
export const hrisRoutes = [
  "dashboard",
  "employees",
  "onboarding",
  "lifecycle",
  "contracts",
  "attendance",
  "certificates",
  "self-service",
  "performance",
];
export const atsRoutes = [
  "home",
  "jobs",
  "jobs/new",
  "progress",
  "candidates",
  "talent",
  "offers",
  "analytics",
];
export const routes = [
  ...hrisRoutes.map((id) => "/" + id),
  ...atsRoutes.map((id) => "/ats/" + id),
];
export function canAccess(role, route) {
  if (role === "HR 主管") return true;
  const allowed =
    role === "普通员工"
      ? [
          "dashboard",
          "employees",
          "contracts",
          "attendance",
          "self-service",
          "performance",
        ]
      : [
          "dashboard",
          "lifecycle",
          "contracts",
          "attendance",
          "self-service",
          "performance",
        ];
  return allowed.includes(route.slice(1));
}
export function referenceState(role, route) {
  const ats = route.startsWith("/ats/");
  return {
    role,
    activeApp: ats ? "ats" : "hris",
    activeNav: ats ? "employees" : route.slice(1),
    atsActiveNav: ats ? "ats-" + route.split("/")[2] : "ats-funnel",
    atsViewMode: route.endsWith("/new") ? "job-create" : "dashboard",
  };
}
