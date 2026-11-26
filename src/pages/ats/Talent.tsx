import { useOutletContext } from "react-router-dom";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function Talent() {
  const { talentPool } = useOutletContext<AtsWorkspace>();
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
          TALENT POOL
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
          人才库
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          沉淀未录用但具备长期跟踪价值的银牌储备候选人。
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        {talentPool.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#86868B]">
            人才库还是空的，淘汰候选人时可以选择放入人才库
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                <th className="py-3.5 px-5">姓名</th>
                <th className="py-3.5 px-4">原应聘职位</th>
                <th className="py-3.5 px-4">入库时间</th>
                <th className="py-3.5 px-5 text-right">储备标签</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {talentPool.map((tp) => (
                <tr key={tp.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                    {tp.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#1D1D1F]">{tp.role}</td>
                  <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                    {tp.lastActive}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-[11px] font-semibold">
                      {tp.tag}
                    </span>
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
