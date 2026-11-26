export function StatusBadge({ status }: { status: string }) {
  const config = {
    正式员工: {
      bg: "bg-[#EAF8EE]",
      text: "text-[#1E7E34]",
      dot: "bg-[#34C759]",
    },
    试用期: { bg: "bg-[#FFF5E6]", text: "text-[#B25E00]", dot: "bg-[#FF9500]" },
    已离职: { bg: "bg-[#F2F2F7]", text: "text-[#6E6E73]", dot: "bg-[#8E8E93]" },
    即将到期: {
      bg: "bg-[#FFF5E6]",
      text: "text-[#B25E00]",
      dot: "bg-[#FF9500]",
    },
    不再续签: {
      bg: "bg-[#FFF2F2]",
      text: "text-[#D70015]",
      dot: "bg-[#FF3B30]",
    },
    正常履行中: {
      bg: "bg-[#EAF8EE]",
      text: "text-[#1E7E34]",
      dot: "bg-[#34C759]",
    },
    待补全材料: {
      bg: "bg-[#FFF5E6]",
      text: "text-[#B25E00]",
      dot: "bg-[#FF9500]",
    },
    已驳回: { bg: "bg-[#FFF2F2]", text: "text-[#D70015]", dot: "bg-[#FF3B30]" },
  };
  const current = config[status as keyof typeof config] || {
    bg: "bg-[#EBF5FF]",
    text: "text-[#0071E3]",
    dot: "bg-[#0071E3]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${current.bg} ${current.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {status}
    </span>
  );
}
