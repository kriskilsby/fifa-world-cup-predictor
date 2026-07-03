"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
];

type HeaderProps = {
  showSearch?: boolean;
  search?: string;
  setSearch?: (value: string) => void;
};

export default function Header({
  showSearch = false,
  search = "",
  setSearch,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            FIFA Predictor
          </p>
          <p className="text-sm text-slate-400">
            Live insights and match predictions
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {showSearch && (
            <label className="w-full lg:w-72">
              <span className="sr-only">Search teams</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch?.(e.target.value)}
                placeholder="Search teams..."
                className="w-full rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </label>
          )}
        </div>
      </div>
    </header>
  );
}
