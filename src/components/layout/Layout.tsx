import { Navigate, Outlet } from "react-router";
import { useWorkspace } from "../../hooks/useWorkspace";
import { EmployeeDialogs } from "./EmployeeDialogs";
import { Sidebar } from "./Sidebar";
import { Spotlight } from "./Spotlight";
import { Toast } from "./Toast";
import { TopBar } from "./TopBar";
export default function Layout() {
  const workspace = useWorkspace();
  if (workspace.activeApp === "ats" && workspace.role !== "HR 主管")
    return (
      <Navigate
        to={
          workspace.navItems.some((item) => item.id === workspace.activeNav)
            ? `/${workspace.activeNav}`
            : "/dashboard"
        }
        replace
      />
    );
  if (
    !workspace.navItems.some(
      (item) =>
        item.id ===
        (workspace.activeApp === "ats"
          ? workspace.atsActiveNav
          : workspace.activeNav),
    )
  )
    return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex font-sans antialiased selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      {/* 1. 左侧极简导航栏 */}
      <Sidebar workspace={workspace} />

      {/* 2. 右侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar workspace={workspace} />

        <main className="flex-1 px-6 lg:px-8 py-6 max-w-[1440px] w-full mx-auto space-y-6">
          <Outlet context={workspace} />
        </main>
      </div>

      {/* 3. 居中自适应弹窗 A：新增员工完整建档 */}
      <EmployeeDialogs workspace={workspace} />

      {/* 4. 居中自适应弹窗 B：员工全息档案查看与编辑 */}

      {/* 5. Spotlight 全局快捷搜索弹窗 */}
      <Spotlight workspace={workspace} />

      {/* 6. 顶部轻提示 Toast */}
      <Toast workspace={workspace} />
    </div>
  );
}
