import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { flushSync } from "react-dom";
import { usePageState as useState } from "../../store/pageState";
import type { CascaderOption } from "../../types";
import { resolveCascaderPath } from "../../utils/cascader";

export function MultiLevelCascader({
  value,
  onChange,
  options,
  placeholder = "请选择申请事项",
  disabled = false,
}: {
  value: readonly string[];
  onChange: (path: string[]) => void;
  options: readonly CascaderOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState<string[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selected = resolveCascaderPath(options, value);
  const selectedLeaf = selected.at(-1);
  const selectedText =
    selectedLeaf && !selectedLeaf.children?.length
      ? selected.map((node) => node.label).join(" / ")
      : "";
  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, setOpen]);
  const columns: (readonly CascaderOption[])[] = [options];
  let level = options;
  for (const id of activePath) {
    const node = level.find((node) => node.id === id);
    if (!node?.children?.length) break;
    columns.push(node.children);
    level = node.children;
  }
  useEffect(() => {
    if (open && menu.current)
      menu.current.scrollLeft = menu.current.scrollWidth;
  }, [open, columns.length]);
  const expand = (node: CascaderOption, depth: number) =>
    setActivePath([...activePath.slice(0, depth), node.id]);
  const choose = (node: CascaderOption, depth: number) => {
    const path = [...activePath.slice(0, depth), node.id];
    setActivePath(path);
    if (!node.children?.length) {
      onChange(path);
      setOpen(false);
      trigger.current?.focus();
    }
  };
  const focusColumn = (depth: number, id?: string) => {
    const buttons = Array.from(
      container.current?.querySelectorAll<HTMLButtonElement>(
        `[data-depth="${depth}"]`,
      ) ?? [],
    );
    (
      buttons.find((button) => button.dataset.optionId === id) ?? buttons[0]
    )?.focus();
  };
  return (
    <div ref={container} className="relative min-w-0">
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label="申请业务类型"
        aria-expanded={open && !disabled}
        aria-controls={menuId}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => {
          setActivePath(selectedText ? [...value] : []);
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            flushSync(() => {
              setActivePath(selectedText ? [...value] : []);
              setOpen(true);
            });
            focusColumn(0);
          }
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent text-left text-xs flex items-center justify-between gap-2 transition-all ${disabled ? "opacity-75 cursor-default" : "hover:bg-[#EFEFF4] focus:bg-white focus:border-[#0071E3] cursor-pointer"}`}
      >
        <span
          className={`min-w-0 break-words ${selectedText ? "text-[#1D1D1F] font-medium" : "text-[#86868B]"}`}
        >
          {selectedText || placeholder}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
      </button>
      {open && !disabled && (
        <div
          ref={menu}
          id={menuId}
          aria-label="申请类型层级菜单"
          className="absolute left-0 mt-1.5 w-max max-w-full bg-white rounded-2xl shadow-[0_16px_44px_rgba(0,0,0,0.16)] border border-black/[0.08] overflow-x-auto z-50"
        >
          <div className="flex items-stretch">
            {columns.map((nodes, depth) => (
              <div
                key={depth}
                role="menu"
                aria-label={`第 ${depth + 1} 级`}
                className="w-40 shrink-0 max-h-64 overflow-y-auto border-r last:border-r-0 border-black/[0.06] bg-[#FAFAFC] p-1.5 space-y-0.5"
              >
                {nodes.map((node) => {
                  const branch = Boolean(node.children?.length);
                  const active = activePath[depth] === node.id;
                  const picked =
                    !branch &&
                    value.length === depth + 1 &&
                    value[depth] === node.id &&
                    activePath
                      .slice(0, depth)
                      .every((id, index) => id === value[index]);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      role="menuitem"
                      data-depth={depth}
                      data-option-id={node.id}
                      aria-haspopup={branch ? "menu" : undefined}
                      aria-expanded={branch ? active : undefined}
                      onMouseEnter={() => expand(node, depth)}
                      onClick={() => choose(node, depth)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowRight" && branch) {
                          event.preventDefault();
                          flushSync(() => expand(node, depth));
                          focusColumn(depth + 1);
                        }
                        if (event.key === "ArrowLeft" && depth > 0) {
                          event.preventDefault();
                          flushSync(() =>
                            setActivePath(activePath.slice(0, depth)),
                          );
                          focusColumn(depth - 1, activePath[depth - 1]);
                        }
                        if (
                          event.key === "ArrowDown" ||
                          event.key === "ArrowUp"
                        ) {
                          event.preventDefault();
                          const buttons = Array.from(
                            event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
                              '[role="menuitem"]',
                            ),
                          );
                          const index = buttons.indexOf(event.currentTarget);
                          buttons[
                            (index +
                              (event.key === "ArrowDown" ? 1 : -1) +
                              buttons.length) %
                              buttons.length
                          ]?.focus();
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors text-left ${active && branch ? "bg-[#0071E3] text-white font-semibold" : picked ? "bg-[#EBF5FF] text-[#0071E3] font-semibold" : "text-[#1D1D1F] hover:bg-black/[0.04]"}`}
                    >
                      <span>{node.label}</span>
                      {branch ? (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      ) : picked ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
