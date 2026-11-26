import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePageState as useState } from "../../store/pageState";
export function TwoLevelCascader({
  value,
  onChange,
  dataMap,
  placeholder = "请选择",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  dataMap: Record<string, string[]>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const keys = Object.keys(dataMap);
  const initialFirst =
    value && value.includes(" / ") ? value.split(" / ")[0] : keys[0];
  const [activeFirst, setActiveFirst] = useState(
    keys.includes(initialFirst) ? initialFirst : keys[0],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const secondOptions = dataMap[activeFirst] || [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent text-left text-xs flex items-center justify-between transition-all ${
          disabled
            ? "opacity-75 cursor-default"
            : "hover:bg-[#EFEFF4] focus:bg-white focus:border-[#0071E3] cursor-pointer"
        }`}
      >
        <span
          className={value ? "text-[#1D1D1F] font-medium" : "text-[#86868B]"}
        >
          {value || placeholder}
        </span>
        {!disabled && <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />}
      </button>

      {open && !disabled && (
        <div className="absolute left-0 mt-1.5 w-[360px] max-w-[90vw] bg-white rounded-2xl shadow-[0_16px_44px_rgba(0,0,0,0.16)] border border-black/[0.08] overflow-hidden z-50 grid grid-cols-2">
          <div className="max-h-64 overflow-y-auto border-r border-black/[0.06] bg-[#FAFAFC] p-1.5 space-y-0.5">
            {keys.map((k) => (
              <div
                key={k}
                onMouseEnter={() => setActiveFirst(k)}
                onClick={() => setActiveFirst(k)}
                className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  activeFirst === k
                    ? "bg-[#0071E3] text-white font-semibold"
                    : "text-[#1D1D1F] hover:bg-black/[0.04]"
                }`}
              >
                <span className="truncate">{k}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </div>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 bg-white">
            {secondOptions.map((sub) => {
              const fullVal = `${activeFirst} / ${sub}`;
              const isSelected = value === fullVal;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    onChange(fullVal);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs text-left flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#EBF5FF] text-[#0071E3] font-semibold"
                      : "text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  }`}
                >
                  <span className="truncate">{sub}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-[#0071E3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
