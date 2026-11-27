import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { isInternalPath } from "../utils/navigation";
import { useStore } from "../store";
import type { Setter } from "../types";

export function useWorkspaceNavigation() {
  const { pathname } = useLocation();
  const routerNavigate = useNavigate();
  const navigate = (target: string) =>
    routerNavigate(isInternalPath(target) ? target : "/dashboard");
  const state = useStore();
  const activeApp = pathname.startsWith("/ats") ? "ats" : "hris";
  const activeNav =
    activeApp === "hris" ? pathname.slice(1) || "employees" : state.activeNav;
  const creatingJob = pathname === "/ats/jobs/new";
  const atsActiveNav =
    activeApp === "ats" && !creatingJob
      ? `ats-${pathname.split("/")[2] || "home"}`
      : state.atsActiveNav === "ats-funnel" && creatingJob
        ? "ats-jobs"
        : state.atsActiveNav;
  const atsViewMode =
    activeApp === "hris"
      ? state.atsViewMode
      : creatingJob
        ? "job-create"
        : "dashboard";
  useEffect(() => {
    useStore.setState({ activeApp, activeNav, atsActiveNav, atsViewMode });
  }, [activeApp, activeNav, atsActiveNav, atsViewMode]);
  const resolve = (value: Parameters<Setter<string>>[0], previous: string) =>
    typeof value === "function" ? value(previous) : value;
  const setActiveNav: Setter<string> = (value) => {
    const id = resolve(value, activeNav);
    useStore.getState().setActiveNav(id);
    navigate(`/${id}`);
  };
  const setAtsActiveNav: Setter<string> = (value) => {
    const id = resolve(value, atsActiveNav);
    const normalized = id === "ats-funnel" ? "ats-home" : id;
    useStore.getState().setAtsActiveNav(normalized);
    if (!creatingJob) navigate(`/ats/${normalized.slice(4)}`);
  };
  const setActiveApp: Setter<string> = (value) => {
    const app = resolve(value, activeApp);
    useStore.getState().setActiveApp(app);
    const current = useStore.getState();
    navigate(
      app === "ats"
        ? current.atsViewMode === "job-create"
          ? "/ats/jobs/new"
          : `/ats/${current.atsActiveNav === "ats-funnel" ? "home" : current.atsActiveNav.slice(4)}`
        : `/${current.activeNav}`,
    );
  };
  const setAtsViewMode: Setter<string> = (value) => {
    const mode = resolve(value, atsViewMode);
    useStore.getState().setAtsViewMode(mode);
    navigate(
      mode === "job-create" ? "/ats/jobs/new" : `/ats/${atsActiveNav.slice(4)}`,
    );
  };
  return {
    activeApp,
    activeNav,
    atsActiveNav,
    atsViewMode,
    setActiveApp,
    setActiveNav,
    setAtsActiveNav,
    setAtsViewMode,
  };
}
