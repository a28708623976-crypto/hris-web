import {
  Briefcase,
  Check,
  ChevronsUpDown,
  Layers,
  Search,
  Users,
} from "lucide-react";
import type { Workspace } from "../../hooks/useWorkspace";
export function TopBar({ workspace }: { workspace: Workspace }) {
  const {
    activeApp,
    setActiveApp,
    showAppSwitcher,
    setShowAppSwitcher,
    setActiveNav,
    setAtsActiveNav,
    role,
    setRole,
    setShowSpotlight,
    triggerToast,
    currentUser,
    isEmployeeRole,
    currentNavLabel,
  } = workspace;
  return (
    <>
      <header className="h-16 px-6 bg-white/75 backdrop-blur-xl border-b border-black/[0.05] sticky top-0 z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          {/* 全局顶部最左侧：同源底座子应用切换器 (App Switcher) */}
          {role === "HR 主管" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAppSwitcher((prev) => !prev)}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBF0] border border-black/[0.06] text-xs font-semibold text-[#1D1D1F] transition-all cursor-pointer"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeApp === "ats" ? "bg-[#0071E3]" : "bg-[#1D1D1F]"
                  }`}
                />
                <span>
                  {activeApp === "ats" ? "招聘管理 (ATS)" : "核心人事 (HRIS)"}
                </span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-[#86868B]" />
              </button>

              {showAppSwitcher && (
                <>
                  <div
                    onClick={() => setShowAppSwitcher(false)}
                    className="fixed inset-0 z-30"
                  />
                  <div className="absolute left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_44px_rgba(0,0,0,0.14)] border border-black/[0.08] p-2 z-40 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#86868B] uppercase flex items-center justify-between">
                      <span>PEOPLEOS 同源子应用工作台</span>
                      <Layers className="w-3 h-3" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveApp("hris");
                        setShowAppSwitcher(false);
                        triggerToast(
                          "已切换至「核心人事 (HRIS)」",
                          "花名册、入转调离、合同与考勤算薪同源联动",
                        );
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                        activeApp === "hris"
                          ? "bg-[#1D1D1F] text-white"
                          : "hover:bg-[#F5F5F7] text-[#1D1D1F]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activeApp === "hris"
                              ? "bg-white/15 text-white"
                              : "bg-[#F5F5F7] text-[#1D1D1F]"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">
                            核心人事 (HRIS)
                          </div>
                          <div
                            className={`text-[10px] ${
                              activeApp === "hris"
                                ? "text-white/70"
                                : "text-[#86868B]"
                            }`}
                          >
                            员工档案 · 入转调离 · 合同考勤绩效
                          </div>
                        </div>
                      </div>
                      {activeApp === "hris" && (
                        <Check className="w-4 h-4 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveApp("ats");
                        setShowAppSwitcher(false);
                        triggerToast(
                          "已切换至「招聘管理 (ATS)」",
                          "已进入独立招聘工作台，录用结果自动同步入职管理",
                        );
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                        activeApp === "ats"
                          ? "bg-[#0071E3] text-white"
                          : "hover:bg-[#F5F5F7] text-[#1D1D1F]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activeApp === "ats"
                              ? "bg-white/20 text-white"
                              : "bg-[#EBF5FF] text-[#0071E3]"
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">
                            招聘管理 (ATS)
                          </div>
                          <div
                            className={`text-[10px] ${
                              activeApp === "ats"
                                ? "text-white/80"
                                : "text-[#86868B]"
                            }`}
                          >
                            职位 HC · 面试漏斗 · Offer 与人才库
                          </div>
                        </div>
                      </div>
                      {activeApp === "ats" && (
                        <Check className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <span className="text-[#D1D1D6]">/</span>
          <button
            onClick={() =>
              activeApp === "ats"
                ? setAtsActiveNav("ats-funnel")
                : setActiveNav("dashboard")
            }
            className="text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
          >
            {activeApp === "ats"
              ? "ATS 招聘工作台"
              : isEmployeeRole
                ? "我的工作台"
                : "工作台"}
          </button>
          <span className="text-[#D1D1D6]">/</span>
          <span className="font-semibold text-[#1D1D1F]">
            {currentNavLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSpotlight(true)}
            className="hidden sm:flex items-center justify-between gap-6 px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBF0] text-xs text-[#86868B] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              搜索功能或模块...
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border border-black/[0.08] font-mono">
              ⌘ K
            </kbd>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] text-xs">
            <span className="text-[#86868B]">视角</span>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as import("../../types").Role)
              }
              className="font-semibold text-[#1D1D1F] bg-transparent outline-none cursor-pointer"
            >
              <option value="HR 主管">HR 主管</option>
              <option value="部门负责人">部门负责人</option>
              <option value="普通员工">普通员工</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-black/[0.06]">
            <div className="w-8 h-8 rounded-full bg-[#EFE6FA] text-[#6A1B9A] flex items-center justify-center text-xs font-bold">
              {currentUser.name.slice(-2)}
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-xs font-bold text-[#1D1D1F]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-[#86868B]">{role}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
