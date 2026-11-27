import { useEmployeeDraft } from "../../store/employeeDraft";
import { Check, Edit3, X } from "lucide-react";
import type { Workspace } from "../../hooks/useWorkspace";
import { EmployeeStandardFormSections } from "../employees/EmployeeStandardFormSections";
import { AppleActionButton } from "../ui/AppleActionButton";
import { StatusBadge } from "../ui/StatusBadge";
export function EmployeeDialogs({ workspace }: { workspace: Workspace }) {
  const busy = useEmployeeDraft((state) => state.busy);
  const {
    setActiveNav,
    role,
    showNewModal,
    setShowNewModal,
    newEmpForm,
    setNewEmpForm,
    selectedEmployee,
    setSelectedEmployee,
    editEmpForm,
    setEditEmpForm,
    isEditingEmp,
    setIsEditingEmp,
    setPrefillLifecycleModal,
    handleCreateEmployee,
    handleSaveEmployeeEdit,
  } = workspace;
  return (
    <>
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  新增员工入职登记与建档
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  请按左侧模块如实填写员工档案；居民身份证限制 18
                  位数字，手机号码限制 11 位数字
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <EmployeeStandardFormSections
              form={newEmpForm}
              setForm={setNewEmpForm}
            />

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#86868B]">
                校验规则：手机号码 11 位数字 · 居民身份证 18 位数字 ·
                家庭成员必填一位
              </span>
              <div className="flex items-center gap-2">
                <AppleActionButton
                  variant="secondary"
                  onClick={() => setShowNewModal(false)}
                >
                  取消
                </AppleActionButton>
                <AppleActionButton
                  variant="primary"
                  icon={Check}
                  onClick={handleCreateEmployee}
                  disabled={busy}
                >
                  确认创建完整档案
                </AppleActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedEmployee && editEmpForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#1E7E34] flex items-center justify-center text-xs font-bold">
                  {selectedEmployee.name.slice(-2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1D1D1F]">
                      {selectedEmployee.name} · 全息档案
                    </h3>
                    <StatusBadge status={selectedEmployee.status} />
                  </div>
                  <p className="text-xs text-[#86868B] font-mono mt-0.5">
                    {selectedEmployee.id} · {selectedEmployee.department} ·{" "}
                    {selectedEmployee.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setIsEditingEmp(false);
                }}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <EmployeeStandardFormSections
              form={editEmpForm}
              setForm={(update) =>
                setEditEmpForm((previous) => previous && update(previous))
              }
              readOnly={!isEditingEmp}
            />

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {role === "HR 主管" && selectedEmployee.status !== "已离职" ? (
                <div className="flex items-center gap-2">
                  {selectedEmployee.status === "试用期" && (
                    <AppleActionButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setActiveNav("lifecycle");
                        setPrefillLifecycleModal({
                          type: "转正评估",
                          employeeName: selectedEmployee.name,
                          employeeId: selectedEmployee.id,
                          department: selectedEmployee.department,
                          role: selectedEmployee.role,
                        });
                      }}
                    >
                      发起转正流程
                    </AppleActionButton>
                  )}
                  <AppleActionButton
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setActiveNav("lifecycle");
                      setPrefillLifecycleModal({
                        type: "离职办理",
                        employeeName: selectedEmployee.name,
                        employeeId: selectedEmployee.id,
                        department: selectedEmployee.department,
                        role: selectedEmployee.role,
                      });
                    }}
                  >
                    发起离职流程
                  </AppleActionButton>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <AppleActionButton
                  variant="secondary"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setIsEditingEmp(false);
                  }}
                >
                  关闭
                </AppleActionButton>
                {role === "HR 主管" &&
                  (isEditingEmp ? (
                    <AppleActionButton
                      variant="primary"
                      icon={Check}
                      onClick={handleSaveEmployeeEdit}
                      disabled={busy}
                    >
                      保存档案修改
                    </AppleActionButton>
                  ) : (
                    <AppleActionButton
                      variant="primary"
                      icon={Edit3}
                      onClick={() => setIsEditingEmp(true)}
                    >
                      编辑档案资料
                    </AppleActionButton>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
