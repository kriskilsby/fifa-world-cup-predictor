"use client";

import { useEffect, useState } from "react";

type StatCardProps = {
  value: string | number;
  label: string;
  description?: string;
  icon: JSX.Element;
  accentClassName: string;
  valueClassName?: string;
};

export default function StatCard({
  value,
  label,
  description,
  icon,
  accentClassName,
  valueClassName = "text-slate-100",
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(() => getInitialDisplayValue(value));

  useEffect(() => {
    const parsedValue = parseNumericValue(value);

    if (!parsedValue) {
      return;
    }

    const { prefix, numericValue, suffix, decimals } = parsedValue;
    const targetValue = Number(numericValue);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finalDisplayValue = `${prefix}${formatNumber(targetValue, decimals)}${suffix}`;

    if (reducedMotion) {
      const frameId = window.requestAnimationFrame(() => {
        setDisplayValue(finalDisplayValue);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    let frameId = 0;
    let startTime = 0;
    const duration = 900;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = targetValue * easedProgress;

      setDisplayValue(`${prefix}${formatNumber(currentValue, decimals)}${suffix}`);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [value]);

  return (
    <article
      className={`group relative flex h-full min-h-[170px] flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-[0_16px_40px_rgba(15,23,42,0.35)] ${accentClassName}`.trim()}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />

      <div className="mb-5 flex min-h-[5.5rem] items-start justify-between gap-4 xl:min-h-[6rem]">
        <div className="min-h-[3.5rem]">
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">{label}</div>
          {description && <div className="mt-1 text-sm leading-5 text-slate-500">{description}</div>}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-white/5 text-slate-100 shadow-inner transition group-hover:scale-105 group-hover:bg-white/10">
          {icon}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className={`text-3xl font-semibold tracking-tight text-balance sm:text-4xl ${valueClassName}`.trim()}>
          {displayValue}
        </div>
      </div>
    </article>
  );
}

function getInitialDisplayValue(value: string | number) {
  const parsedValue = parseNumericValue(value);

  if (!parsedValue) {
    return String(value);
  }

  return `${parsedValue.prefix}0${parsedValue.suffix}`;
}

function parseNumericValue(value: string | number) {
  const rawValue = String(value);
  const match = rawValue.match(/^([^0-9+-]*)(-?\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return null;
  }

  const [, prefix, numericValue, suffix] = match;
  return {
    prefix,
    numericValue,
    suffix,
    decimals: numericValue.includes(".") ? numericValue.split(".")[1].length : 0,
  };
}

function formatNumber(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}
