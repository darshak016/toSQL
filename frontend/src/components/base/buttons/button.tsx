import React, { isValidElement } from "react";
import { cx } from "@/utils/cx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "secondary" | "tertiary" | "primary-destructive" | "secondary-destructive" | "link-color" | "link-gray";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  iconLeading?: React.ReactNode | React.ComponentType<{ className?: string }>;
  iconTrailing?: React.ReactNode | React.ComponentType<{ className?: string }>;
  loading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    color = "secondary",
    size = "sm",
    iconLeading: IconLeading,
    iconTrailing: IconTrailing,
    loading = false,
    disabled = false,
    className = "",
    children,
    type = "button",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  // Untitled UI Button Sizes
  const sizeClasses = {
    xs: "gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold",
    sm: "gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold",
    md: "gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold",
    lg: "gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
    xl: "gap-2 rounded-lg px-4.5 py-3 text-base font-semibold",
  };

  // Untitled UI Button Variants & Colors
  const colorClasses = {
    primary:
      "bg-[#155eef] text-white shadow-xs hover:bg-[#174dc4] active:bg-[#155eef] focus-visible:ring-4 focus-visible:ring-[#155eef]/20 border border-transparent",
    secondary:
      "bg-white text-[#344054] border border-[#d0d5dd] shadow-xs hover:bg-[#f9fafb] hover:text-[#101828] active:bg-white focus-visible:ring-4 focus-visible:ring-[#155eef]/10",
    tertiary:
      "bg-transparent text-[#475467] hover:bg-[#f9fafb] hover:text-[#101828] active:bg-[#f2f4f7] focus-visible:ring-4 focus-visible:ring-[#155eef]/10 border border-transparent",
    "primary-destructive":
      "bg-[#d92d20] text-white shadow-xs hover:bg-[#b42318] active:bg-[#d92d20] focus-visible:ring-4 focus-visible:ring-[#f04438]/20 border border-transparent",
    "secondary-destructive":
      "bg-white text-[#b42318] border border-[#fecdca] shadow-xs hover:bg-[#fef3f2] hover:text-[#912018] active:bg-white focus-visible:ring-4 focus-visible:ring-[#f04438]/10",
    "link-color":
      "bg-transparent text-[#155eef] hover:text-[#174dc4] underline-offset-4 hover:underline p-0 border-none shadow-none",
    "link-gray":
      "bg-transparent text-[#475467] hover:text-[#101828] underline-offset-4 hover:underline p-0 border-none shadow-none",
  };

  const renderIcon = (iconNode: any, extraClass = "") => {
    if (!iconNode) return null;
    if (isValidElement(iconNode)) {
      return iconNode;
    }
    const Comp = iconNode;
    return <Comp className={cx("size-4 shrink-0", extraClass)} />;
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cx(
        "inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-all duration-150 outline-none select-none",
        sizeClasses[size] || sizeClasses.sm,
        colorClasses[color] || colorClasses.secondary,
        isDisabled && "cursor-not-allowed opacity-50 shadow-none pointer-events-none",
        className
      )}
      {...props}
    >
      {loading ? (
        <svg
          className="size-4 animate-spin shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        renderIcon(IconLeading)
      )}

      {children && <span>{children}</span>}

      {!loading && renderIcon(IconTrailing)}
    </button>
  );
});

export default Button;
