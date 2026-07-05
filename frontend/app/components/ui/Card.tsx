import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
};

type CardSectionProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "", as: Component = "div" }: CardProps) {
  return (
    <Component
      className={`border border-slate-800 bg-slate-900 transition-colors duration-200 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = "" }: CardSectionProps) {
  return (
    <div className={`border-b border-slate-800 px-6 py-5 ${className}`.trim()}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardSectionProps) {
  return <div className={`px-6 py-6 ${className}`.trim()}>{children}</div>;
}
