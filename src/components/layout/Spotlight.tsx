import { ChevronRight, Search } from "lucide-react";
import type { Workspace } from "../../hooks/useWorkspace";
export function Spotlight({ workspace }: { workspace: Workspace }) {
  const {
    activeApp,
    setActiveNav,
    setAtsActiveNav,
    showSpotlight,
    setShowSpotlight,
    spotlightQuery,
    setSpotlightQuery,
    navItems,
  } = workspace;
  return (
    <>
      {showSpotlight && (
        <div
          onClick={() => setShowSpotlight(false)}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/25 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)] border border-black/[0.08] overflow-hidden"
          >
            <div className="px-4 py-3.5 border-b border-black/[0.06] flex items-center gap-3">
              <Search className="w-4 h-4 text-[#86868B]" />
              <input
                autoFocus
                type="text"
                placeholder="输入模块名称或切换至 ATS 招聘工作台..."
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent"
              />
              <button
                onClick={() => setShowSpotlight(false)}
                className="text-xs text-[#86868B] px-2 py-0.5 rounded bg-[#F5F5F7] cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              {navItems
                .filter((i) => i.label.includes(spotlightQuery))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (activeApp === "ats") setAtsActiveNav(item.id);
                        else setActiveNav(item.id);
                        setShowSpotlight(false);
                        setSpotlightQuery("");
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-[#F5F5F7] flex items-center justify-between text-xs font-medium text-[#1D1D1F] cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#6E6E73]" />
                        {item.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
