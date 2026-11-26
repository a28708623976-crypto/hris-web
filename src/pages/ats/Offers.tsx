import { useOutletContext } from "react-router-dom";
import { AppleActionButton } from "../../components/ui/AppleActionButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function Offers() {
  const { candidates, setOfferCandidate, setOfferForm } =
    useOutletContext<AtsWorkspace>();
  const offerList = candidates.filter(
    (c) =>
      c.stage === "终面通过" ||
      c.stage === "Offer 待确认" ||
      c.stage === "已录用转入职",
  );
  const getOfferDisplayStatus = (st: string) => {
    if (st === "已录用转入职") return "已转入 HRIS";
    if (st === "Offer 待确认") return "已发送";
    return "待审批";
  };
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
          OFFER CENTER
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
          Offer 中心
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          集中管理拟定、审批中、已发送及已签署转入 HRIS 的全部录用 Offer。
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        {offerList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#86868B]">
            暂无待审批或已发出的 Offer
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                <th className="py-3.5 px-5">候选人</th>
                <th className="py-3.5 px-4">应聘职位</th>
                <th className="py-3.5 px-4">基本月薪</th>
                <th className="py-3.5 px-4">状态</th>
                <th className="py-3.5 px-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {offerList.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#1D1D1F]">{c.jobTitle}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1D1D1F]">
                    ¥ {(c.offerDetails?.baseMonthly ?? 32000).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={getOfferDisplayStatus(c.stage)} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <AppleActionButton
                      size="xs"
                      onClick={() => {
                        setOfferForm((prev) => ({
                          ...prev,
                          status:
                            c.stage === "已录用转入职"
                              ? "accepted"
                              : c.stage === "Offer 待确认"
                                ? "sent"
                                : "draft",
                        }));
                        setOfferCandidate(c);
                      }}
                    >
                      查看
                    </AppleActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
