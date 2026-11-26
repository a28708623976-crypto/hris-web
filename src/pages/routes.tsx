import { useOutletContext } from "react-router-dom";
import type { Workspace } from "../hooks/useWorkspace";
import { AttendancePayrollView } from "./AttendancePayrollView";
import { CertificatesModuleView } from "./CertificatesModuleView";
import { ContractsModuleView } from "./ContractsModuleView";
import { DashboardOverview } from "./DashboardOverview";
import { EmployeesDirectoryView } from "./EmployeesDirectoryView";
import { LifecycleModuleView } from "./LifecycleModuleView";
import { OnboardingModuleView } from "./OnboardingModuleView";
import { PerformanceModuleView } from "./PerformanceModuleView";
import { SelfServiceModuleView } from "./SelfServiceModuleView";
export function DashboardOverviewRoute() {
  const {
    setActiveNav,
    role,
    employees,
    onboardingTasks,
    lifecycleTasks,
    setShowNewModal,
    currentUser,
  } = useOutletContext<Workspace>();
  return (
    <DashboardOverview
      employees={employees}
      onboardingTasks={onboardingTasks}
      lifecycleTasks={lifecycleTasks}
      onNavigate={setActiveNav}
      onOpenNewModal={() => setShowNewModal(true)}
      role={role}
      currentUser={currentUser}
    />
  );
}

// Re-entering a different data scope must not retain hidden HR-only filters.
export function EmployeesDirectoryViewRoute() {
  const {
    employees,
    setShowNewModal,
    currentUser,
    isEmployeeRole,
    handleExportCsv,
    handleOpenEmployeeDetail,
  } = useOutletContext<Workspace>();
  return (
    <EmployeesDirectoryView
      key={isEmployeeRole ? currentUser.id : "directory"}
      employees={
        isEmployeeRole
          ? employees.filter((e) => e.id === currentUser.id)
          : employees
      }
      onSelectEmployee={handleOpenEmployeeDetail}
      onOpenNewModal={() => setShowNewModal(true)}
      onExportCsv={handleExportCsv}
      isSelfOnly={isEmployeeRole}
    />
  );
}

export function OnboardingModuleViewRoute() {
  const { onboardingTasks, setShowNewModal, handleCompleteOnboarding } =
    useOutletContext<Workspace>();
  return (
    <OnboardingModuleView
      tasks={onboardingTasks}
      onCompleteOnboarding={handleCompleteOnboarding}
      onOpenNewModal={() => setShowNewModal(true)}
    />
  );
}

export function ContractsModuleViewRoute() {
  const {
    role,
    employees,
    currentUser,
    handleRenewContract,
    handleTerminateRenewal,
  } = useOutletContext<Workspace>();
  return (
    <ContractsModuleView
      key={role === "HR 主管" ? "all-contracts" : currentUser.id}
      employees={
        role === "HR 主管"
          ? employees
          : employees.filter((e) => e.id === currentUser.id)
      }
      onRenewContract={handleRenewContract}
      onTerminateRenewal={handleTerminateRenewal}
      isSelfOnly={role !== "HR 主管"}
    />
  );
}

export function LifecycleModuleViewRoute() {
  const {
    role,
    lifecycleTasks,
    prefillLifecycleModal,
    setPrefillLifecycleModal,
    currentUser,
    handleApproveLifecycle,
    handleRejectLifecycle,
    handleCreateLifecycleTask,
  } = useOutletContext<Workspace>();
  return (
    <LifecycleModuleView
      tasks={lifecycleTasks}
      onApproveTask={handleApproveLifecycle}
      onRejectTask={handleRejectLifecycle}
      onCreateTask={handleCreateLifecycleTask}
      role={role}
      currentUser={currentUser}
      prefillModal={prefillLifecycleModal}
      onClearPrefillModal={() => setPrefillLifecycleModal(null)}
    />
  );
}

export function AttendancePayrollViewRoute() {
  const {
    role,
    employees,
    salaryUnlocked,
    setSalaryUnlocked,
    triggerToast,
    currentUser,
  } = useOutletContext<Workspace>();
  return (
    <AttendancePayrollView
      employees={employees}
      role={role}
      currentUser={currentUser}
      onTriggerToast={triggerToast}
      unlocked={salaryUnlocked}
      setUnlocked={setSalaryUnlocked}
    />
  );
}

export function SelfServiceModuleViewRoute() {
  const { selfRequests, currentUser, handleSubmitSelfRequest } =
    useOutletContext<Workspace>();
  return (
    <SelfServiceModuleView
      currentUser={currentUser}
      requests={selfRequests}
      onSubmitRequest={handleSubmitSelfRequest}
    />
  );
}

export function PerformanceModuleViewRoute() {
  const {
    perfRecords,
    handleSyncPerformancePayroll,
    currentUser,
    isEmployeeRole,
    handleCalibrateGrade,
  } = useOutletContext<Workspace>();
  return (
    <PerformanceModuleView
      key={isEmployeeRole ? currentUser.id : "team-performance"}
      records={perfRecords}
      onCalibrateGrade={handleCalibrateGrade}
      onSyncPayroll={handleSyncPerformancePayroll}
      isSelfOnly={isEmployeeRole}
      currentUser={currentUser}
    />
  );
}

export function CertificatesModuleViewRoute() {
  const { employees, salaryUnlocked, triggerToast } =
    useOutletContext<Workspace>();
  return (
    <CertificatesModuleView
      employees={employees}
      onTriggerToast={triggerToast}
      salaryUnlocked={salaryUnlocked}
    />
  );
}
