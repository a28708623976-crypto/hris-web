import React from "react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { TwoLevelCascader } from "../components/ui/TwoLevelCascader";
import { SELF_SERVICE_CATEGORIES } from "../constants/index";
import { usePageState as useState } from "../store/pageState";
export function SelfServiceModuleView({
  currentUser,
  requests,
  onSubmitRequest,
}: {
  currentUser: import("../types").Employee;
  requests: import("../types").SelfRequest[];
  onSubmitRequest: import("../hooks/useWorkspace").Workspace["handleSubmitSelfRequest"];
}) {
  const [bizType, setBizType] = useState("假勤申请 / 年假申请");
  const [effectiveDate, setEffectiveDate] = useState("2026-12-04");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmitRequest({
      bizType,
      effectiveDate,
      reason,
    });
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
          EMPLOYEE SELF-SERVICE
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
          员工自助
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          当前登录：{currentUser.name}（{currentUser.id} · {currentUser.role}）
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">剩余法定年假</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2">8.5 天</div>
          <div className="text-[11px] text-[#86868B] mt-1">
            有效期至 2026-12-31
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">可用调休余额</div>
          <div className="text-3xl font-bold text-[#0071E3] mt-2">
            12.0 小时
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">
            支持最小 0.5 小时为单位调休
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">本月打卡状态</div>
          <div className="text-3xl font-bold text-[#248A3D] mt-2">全勤正常</div>
          <div className="text-[11px] text-[#86868B] mt-1">
            今日上班打卡 09:26 · 总部研发中心
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4"
        >
          <h2 className="text-sm font-bold text-[#1D1D1F]">发起申请</h2>
          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">
              申请业务类型（一级大类 / 二级具体事项）
            </label>
            <TwoLevelCascader
              value={bizType}
              onChange={setBizType}
              dataMap={SELF_SERVICE_CATEGORIES}
              placeholder="请选择申请业务类型"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">
              申请日期 / 生效时间
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">
              申请事由 / 补充说明
            </label>
            <textarea
              rows={3}
              placeholder="请填写具体事由、金额或规格型号说明..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-xs outline-none"
            />
          </div>

          <AppleActionButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!reason.trim()}
          >
            提交审批申请
          </AppleActionButton>
        </form>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F]">我的申请记录</h2>
            <span className="text-xs text-[#86868B]">
              共 {requests.length} 条记录
            </span>
          </div>
          <div className="space-y-2.5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-black/[0.06] bg-[#FAFAFC] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-[#1D1D1F]">
                    {req.bizType}{" "}
                    <span className="font-mono font-normal text-[#86868B]">
                      {req.effectiveDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6E6E73] mt-0.5">
                    {req.reason}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                    req.status === "已批准"
                      ? "bg-[#EAF8EE] text-[#1E7E34]"
                      : "bg-[#FFF5E6] text-[#B25E00]"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
