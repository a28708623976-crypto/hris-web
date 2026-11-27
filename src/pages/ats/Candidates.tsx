import { useOutletContext } from "react-router";
import { AppleActionButton } from "../../components/ui/AppleActionButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function Candidates() {
  const {
    atsRegionMode,
    atsAnonymousMode,
    candidates,
    setActiveCandidateDrawer,
  } = useOutletContext<AtsWorkspace>();
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
          CANDIDATES DIRECTORY
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
          候选人库
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          点击任意候选人可唤出右侧 80%
          宽度全息审阅抽屉，支持简历预览、结构化评估与协作 @ 提醒。
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">候选人</th>
              <th className="py-3.5 px-4">应聘岗位</th>
              <th className="py-3.5 px-4">所属部门</th>
              <th className="py-3.5 px-4">
                {atsRegionMode === "overseas"
                  ? "Expected Annual (USD)"
                  : "期望薪酬"}
              </th>
              <th className="py-3.5 px-4">
                {atsRegionMode === "overseas"
                  ? "Work Auth & Timezone"
                  : "最快到岗"}
              </th>
              <th className="py-3.5 px-4">当前节点</th>
              <th className="py-3.5 px-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {candidates.map((c, idx) => (
              <tr
                key={c.id}
                onClick={() => setActiveCandidateDrawer(c)}
                className="hover:bg-[#FAFAFC] cursor-pointer"
              >
                <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                  {atsAnonymousMode ? `匿名候选人 #${c.id}` : c.name}
                  <div className="text-[11px] font-normal text-[#86868B]">
                    {c.exp}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium">{c.jobTitle}</td>
                <td className="py-3.5 px-4 text-[#6E6E73]">{c.department}</td>
                <td className="py-3.5 px-4 font-mono">
                  {atsRegionMode === "overseas"
                    ? `$${115 + idx * 10}K - $${135 + idx * 10}K / yr`
                    : c.expectedSalary}
                </td>
                <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                  {atsRegionMode === "overseas"
                    ? "Authorized · UTC+8 / PST"
                    : c.availableDate}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={c.stage} />
                </td>
                <td
                  className="py-3.5 px-5 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AppleActionButton
                    size="xs"
                    onClick={() => setActiveCandidateDrawer(c)}
                  >
                    审阅详情
                  </AppleActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
