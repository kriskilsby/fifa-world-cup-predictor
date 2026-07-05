// frontend/app/components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatMatchPhaseLabel } from "../utils/matchPhase";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
];

type HeaderProps = {
  showSearch?: boolean;
  search?: string;
  setSearch?: (value: string) => void;
  selectedGroup?: string;
  setSelectedGroup?: (value: string) => void;
  groups?: string[];
};

export default function Header({
  showSearch = false,
  search = "",
  setSearch,
  selectedGroup = "ALL",
  setSelectedGroup,
  groups = [],
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/75">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              FIFA Predictor
            </p>
            <p className="text-sm text-slate-400">
              Live insights and match predictions
            </p>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {showSearch && (
              <button
                type="button"
                aria-label="Toggle search"
                onClick={() => setSearchOpen((open) => !open)}
                className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                🔎
              </button>
            )}

            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="block h-5 w-5">
                <span className="mb-1 block h-0.5 w-full bg-current" />
                <span className="mb-1 block h-0.5 w-full bg-current" />
                <span className="block h-0.5 w-full bg-current" />
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          <div
            className={`grid overflow-hidden transition-all duration-300 ease-out lg:hidden ${
              mobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <nav className="overflow-hidden">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/95 p-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="flex flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center lg:justify-end lg:gap-3">
            <nav className="hidden flex-wrap gap-2 lg:flex lg:flex-row lg:items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
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

            <div className="grid gap-3 lg:grid-flow-col lg:items-center lg:gap-3">
              {showSearch && (
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out lg:block ${
                    searchOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0 lg:grid-rows-[1fr] lg:opacity-100"
                  }`}
                >
                  <label className="overflow-hidden lg:w-72">
                    <span className="sr-only">Search teams</span>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch?.(e.target.value)}
                      placeholder="Search teams..."
                      className="w-full rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 transition hover:border-slate-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    />
                  </label>
                </div>
              )}

              <label className="w-full lg:w-52">
                <span className="sr-only">Select phase</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup?.(e.target.value)}
                  className="w-full rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white transition hover:border-slate-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <option value="ALL">All phases</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {formatMatchPhaseLabel(group)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
