import {
  Briefcase,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { Workspace } from "../../hooks/useWorkspace";
export function Sidebar({ workspace }: { workspace: Workspace }) {
  const {
    activeApp,
    activeNav,
    setActiveNav,
    atsActiveNav,
    setAtsActiveNav,
    sidebarCollapsed,
    setSidebarCollapsed,
    isEmployeeRole,
    navItems,
  } = workspace;
  return (
    <>
      <aside
        className={`${
          sidebarCollapsed ? "w-[76px]" : "w-[244px]"
        } bg-[#FAFAFC]/90 backdrop-blur-xl border-r border-black/[0.06] flex flex-col justify-between transition-all duration-200 shrink-0 sticky top-0 h-screen z-20`}
      >
        <div>
          <div className="h-16 px-4 flex items-center gap-3 border-b border-black/[0.04]">
            <div
              className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                activeApp === "ats" ? "bg-[#0071E3]" : "bg-[#1D1D1F]"
              }`}
            >
              {activeApp === "ats" ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-[#1D1D1F] truncate">
                  {activeApp === "ats"
                    ? "招聘工作台"
                    : isEmployeeRole
                      ? "员工工作台"
                      : "人事工作台"}
                </div>
                <div className="text-[10px] font-medium text-[#86868B] tracking-wider uppercase truncate">
                  {activeApp === "ats"
                    ? "PEOPLEOS · ATS STUDIO"
                    : isEmployeeRole
                      ? "PEOPLEOS · WORKSPACE"
                      : "PEOPLEOS · HRIS PRO"}
                </div>
              </div>
            )}
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                activeApp === "ats"
                  ? atsActiveNav === item.id
                  : activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    activeApp === "ats"
                      ? setAtsActiveNav(item.id)
                      : setActiveNav(item.id)
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                    active
                      ? activeApp === "ats"
                        ? "bg-[#0071E3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                        : "bg-[#1D1D1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                      : "text-[#515154] hover:bg-black/[0.04] hover:text-[#1D1D1F]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-white" : "text-[#6E6E73]"
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {!sidebarCollapsed &&
                    item.badge !== undefined &&
                    item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full tabular-nums ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#FFF4E5] text-[#B25E00]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 space-y-2.5">
          {!sidebarCollapsed && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F2F2F7] to-white border border-black/[0.05]">
              <div className="text-xs font-semibold text-[#1D1D1F]">
                让每一份才华，被看见。
              </div>
              <div className="text-[11px] text-[#86868B] mt-0.5 leading-relaxed">
                {activeApp === "ats"
                  ? "ATS 与核心人事底座实时同源"
                  : "激活组织与人才的更多可能"}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-[#248A3D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                PeopleOS Core v3.0
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>收起侧栏</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
