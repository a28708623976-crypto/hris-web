import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { loadSession } from "../../api/session";
export function AuthBoundary() {
  const { status, error, user } = useAuthStore();
  const location = useLocation();
  useEffect(() => {
    void loadSession();
  }, []);
  if (status === "loading")
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center text-sm text-[#86868B]">
        正在加载登录信息…
      </div>
    );
  if (status === "error")
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col gap-4 items-center justify-center text-sm">
        <p role="alert">{error}</p>
        <button
          className="px-4 py-2 rounded-xl bg-[#1D1D1F] text-white"
          onClick={() => void loadSession()}
        >
          重新连接
        </button>
      </div>
    );
  if (status === "anonymous")
    return <Navigate to="/login" state={{ next: location.pathname }} replace />;
  const path = location.pathname;
  if (user && user.role !== "hr_lead") {
    const allowed =
      user.role === "employee"
        ? [
            "/dashboard",
            "/employees",
            "/contracts",
            "/attendance",
            "/self-service",
            "/performance",
            "/",
          ]
        : [
            "/dashboard",
            "/lifecycle",
            "/contracts",
            "/attendance",
            "/self-service",
            "/performance",
          ];
    if (!allowed.includes(path)) return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
