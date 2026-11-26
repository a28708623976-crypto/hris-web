import {
  Download,
  LayoutGrid as GridIcon,
  List,
  Plus,
  Search,
} from "lucide-react";
import { useMemo } from "react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import {
  AVATAR_STYLES,
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  HIRE_YEAR_MONTHS,
} from "../constants/index";
import type { Workspace } from "../hooks/useWorkspace";
import { usePageState as useState } from "../store/pageState";
import type { Employee } from "../types";
export function EmployeesDirectoryView({
  employees,
  onSelectEmployee,
  onOpenNewModal,
  onExportCsv,
  isSelfOnly = false,
}: {
  employees: Employee[];
  onSelectEmployee: Workspace["handleOpenEmployeeDetail"];
  onOpenNewModal: () => void;
  onExportCsv: () => void;
  isSelfOnly?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("全部部门");
  const [statusFilter, setStatusFilter] = useState("全部状态");
  const [hireMonthFilter, setHireMonthFilter] = useState("入职年月");
  const [categoryPill, setCategoryPill] = useState("全部员工");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  const pillCounts = useMemo(
    () => ({
      全部员工: employees.length,
      正式员工: employees.filter((e) => e.status === "正式员工").length,
      试用期: employees.filter((e) => e.status === "试用期").length,
      兼职: employees.filter((e) => e.type === "兼职").length,
      劳务: employees.filter((e) => e.type === "劳务").length,
      实习生: employees.filter((e) => e.type === "实习").length,
      已离职: employees.filter((e) => e.status === "已离职").length,
    }),
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (categoryPill === "正式员工" && emp.status !== "正式员工")
        return false;
      if (categoryPill === "试用期" && emp.status !== "试用期") return false;
      if (categoryPill === "已离职" && emp.status !== "已离职") return false;
      if (categoryPill === "兼职" && emp.type !== "兼职") return false;
      if (categoryPill === "劳务" && emp.type !== "劳务") return false;
      if (categoryPill === "实习生" && emp.type !== "实习") return false;

      if (deptFilter !== "全部部门" && emp.department !== deptFilter)
        return false;
      if (statusFilter !== "全部状态" && emp.status !== statusFilter)
        return false;
      if (
        hireMonthFilter !== "入职年月" &&
        !emp.hireDate.startsWith(hireMonthFilter)
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          emp.name.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [
    employees,
    categoryPill,
    deptFilter,
    statusFilter,
    hireMonthFilter,
    searchQuery,
  ]);

  const pills = [
    { key: "全部员工", dot: null },
    { key: "正式员工", dot: "bg-[#34C759]" },
    { key: "试用期", dot: "bg-[#FF9500]" },
    { key: "兼职", dot: "bg-[#0071E3]" },
    { key: "劳务", dot: "bg-[#5856D6]" },
    { key: "实习生", dot: "bg-[#AF52DE]" },
    { key: "已离职", dot: "bg-[#8E8E93]" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            {isSelfOnly ? "MY PROFILE" : "PEOPLE DIRECTORY"}
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {isSelfOnly ? "我的档案" : "员工档案"}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            {isSelfOnly
              ? "查看本人入职建档信息、教育背景、银行卡与劳动合同周期。"
              : "每一位伙伴，都是团队不可或缺的一部分。"}
          </p>
        </div>

        {!isSelfOnly && (
          <div className="flex items-center gap-2.5">
            <AppleActionButton icon={Download} onClick={onExportCsv}>
              导出报表
            </AppleActionButton>
            <AppleActionButton
              variant="primary"
              icon={Plus}
              onClick={onOpenNewModal}
            >
              新增员工
            </AppleActionButton>
          </div>
        )}
      </div>

      {/* 全维度员工类型与状态展陈胶囊栏 */}
      {!isSelfOnly && (
        <div className="flex flex-wrap items-center gap-2">
          {pills.map((p) => {
            const active = categoryPill === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setCategoryPill(p.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[#1D1D1F] text-white shadow-2xs"
                    : "bg-white text-[#515154] border border-black/[0.06] hover:bg-[#FAFAFC]"
                }`}
              >
                {p.dot && (
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                )}
                <span>{p.key}</span>
                <span
                  className={`font-mono ${active ? "text-white/80" : "text-[#86868B]"}`}
                >
                  {pillCounts[p.key as keyof typeof pillCounts]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索姓名、工号或岗位..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3.5 py-1.5 rounded-xl bg-[#F5F5F7] text-xs outline-none w-48 focus:w-56 transition-all"
              />
            </div>

            {!isSelfOnly && (
              <>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] outline-none cursor-pointer"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] outline-none cursor-pointer"
                >
                  {EMPLOYEE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={hireMonthFilter}
                  onChange={(e) => setHireMonthFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] outline-none cursor-pointer"
                >
                  {HIRE_YEAR_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m === "入职年月" ? "入职年月" : `${m} 入职`}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#86868B]">
              共 {filteredEmployees.length} 条档案
            </span>
            <div className="inline-flex p-0.5 rounded-xl bg-[#F5F5F7]">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white shadow-2xs text-[#1D1D1F]"
                    : "text-[#86868B]"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white shadow-2xs text-[#1D1D1F]"
                    : "text-[#86868B]"
                }`}
              >
                <GridIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                  <th className="py-3.5 px-5">员工</th>
                  <th className="py-3.5 px-4">所属部门</th>
                  <th className="py-3.5 px-4">岗位名称</th>
                  <th className="py-3.5 px-4">直属上级</th>
                  <th className="py-3.5 px-4">用工类型</th>
                  <th className="py-3.5 px-4">状态</th>
                  <th className="py-3.5 px-4">入职日期</th>
                  <th className="py-3.5 px-4">合同到期日</th>
                  <th className="py-3.5 px-5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-xs">
                {filteredEmployees.map((emp, i) => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="hover:bg-[#FAFAFC] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            AVATAR_STYLES[i % AVATAR_STYLES.length]
                          }`}
                        >
                          {emp.name.slice(-2)}
                        </div>
                        <div>
                          <div className="font-bold text-[#1D1D1F]">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-[#86868B] font-mono">
                            {emp.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#1D1D1F]">
                      {emp.department}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1D1D1F]">
                      {emp.role}
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6E73]">
                      {emp.manager}
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6E73]">{emp.type}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6E73] font-mono">
                      {emp.hireDate}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-mono ${
                        emp.contractEnd <= "2026-12-31"
                          ? "text-[#D97706] font-semibold"
                          : "text-[#6E6E73]"
                      }`}
                    >
                      {emp.contractEnd}
                    </td>
                    <td
                      className="py-3.5 px-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AppleActionButton
                        size="xs"
                        onClick={() => onSelectEmployee(emp)}
                      >
                        查看详情
                      </AppleActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp, i) => (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="p-4 rounded-2xl border border-black/[0.06] hover:shadow-md transition-all cursor-pointer bg-[#FAFAFC]/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        AVATAR_STYLES[i % AVATAR_STYLES.length]
                      }`}
                    >
                      {emp.name.slice(-2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1D1D1F]">
                        {emp.name}
                      </div>
                      <div className="text-[11px] text-[#86868B] font-mono">
                        {emp.id} · {emp.type}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={emp.status} />
                </div>
                <div className="mt-4 pt-3 border-t border-black/[0.05] text-xs space-y-1.5 text-[#6E6E73]">
                  <div className="flex justify-between">
                    <span>所属部门</span>
                    <span className="font-medium text-[#1D1D1F]">
                      {emp.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>岗位名称</span>
                    <span className="font-medium text-[#1D1D1F]">
                      {emp.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>入职日期</span>
                    <span className="font-mono">{emp.hireDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
