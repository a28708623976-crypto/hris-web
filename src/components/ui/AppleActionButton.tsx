import React from "react";
export function AppleActionButton({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  className = "",
  icon: Icon,
  disabled = false,
  type = "button",
}: React.PropsWithChildren<{
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "blue" | "secondary" | "subtle" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  icon?: import("lucide-react").LucideIcon;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}>) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-medium rounded-xl transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none cursor-pointer";
  const variants = {
    primary:
      "bg-[#1D1D1F] text-white hover:bg-[#333336] shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
    blue: "bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-[0_1px_3px_rgba(0,113,227,0.28)]",
    secondary:
      "bg-white text-[#1D1D1F] border border-black/[0.08] hover:bg-[#F5F5F7] shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
    subtle: "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]",
    danger:
      "bg-[#FFF2F2] text-[#D70015] border border-[#FF3B30]/20 hover:bg-[#FFE5E5]",
  };
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-[13px]",
    lg: "px-5 py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.secondary} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && (
        <Icon
          className={size === "xs" || size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}
        />
      )}
      {children}
    </button>
  );
}
