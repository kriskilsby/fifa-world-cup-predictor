import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-400 ${className}`.trim()}
    >
      {children}
    </span>
  );
}
