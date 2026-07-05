import { Card } from "./ui/Card";
import StatCard from "./ui/StatCard";

type DashboardStatsProps = {
  exactScores: number;
  correctResults: number;
  incorrectResults: number;
  accuracy: string;
};

type MixItem = {
  label: string;
  value: number;
  colourClassName: string;
  textClassName: string;
  description: string;
};

export default function DashboardStats({
  exactScores,
  correctResults,
  incorrectResults,
  accuracy,
}: DashboardStatsProps) {
  const totalPredictions = exactScores + correctResults + incorrectResults;

  const mixItems: MixItem[] = [
    {
      label: "Exact scores",
      value: exactScores,
      colourClassName: "bg-emerald-400",
      textClassName: "text-emerald-300",
      description: "Perfect scoreline hits",
    },
    {
      label: "Correct results",
      value: correctResults,
      colourClassName: "bg-amber-400",
      textClassName: "text-amber-300",
      description: "Right outcome, wrong score",
    },
    {
      label: "Incorrect",
      value: incorrectResults,
      colourClassName: "bg-rose-400",
      textClassName: "text-rose-300",
      description: "Outcome missed",
    },
  ];

  const mixSegments = totalPredictions > 0
    ? mixItems.map((item) => ({
        ...item,
        percentage: (item.value / totalPredictions) * 100,
      }))
    : [];

  return (
    <Card className="relative mb-6 overflow-hidden rounded-3xl border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.35)] sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_30%)]" />

      <div className="relative mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-300/80">Model Performance</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">Dashboard statistics</h2>
        </div>

        <p className="max-w-md text-sm leading-6 text-slate-400">
          A quick snapshot of prediction quality across exact score hits, result calls, and overall accuracy.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={exactScores}
          label="Exact Scores"
          description="Perfect scoreline predictions"
          valueClassName="text-emerald-300"
          accentClassName="from-emerald-500/10 via-transparent to-transparent"
          icon={
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-300" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3l2.1 5.2 5.4.4-4.1 3.5 1.3 5.3L12 14.7 7.3 17.4l1.3-5.3-4.1-3.5 5.4-.4L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          value={correctResults}
          label="Correct Results"
          description="Winner or draw identified"
          valueClassName="text-amber-300"
          accentClassName="from-amber-500/10 via-transparent to-transparent"
          icon={
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-300" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 12h14" strokeLinecap="round" />
              <path d="M14 5l5 7-5 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          value={incorrectResults}
          label="Incorrect"
          description="Mismatched result calls"
          valueClassName="text-rose-300"
          accentClassName="from-rose-500/10 via-transparent to-transparent"
          icon={
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-rose-300" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          value={`${accuracy}%`}
          label="Accuracy"
          description="Overall prediction accuracy"
          valueClassName="text-sky-300"
          accentClassName="from-sky-500/10 via-transparent to-transparent"
          icon={
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-sky-300" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 15l4-4 4 3 8-8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 7v4h-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      <div className="relative mt-5 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 sm:mt-6 sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Performance mix</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Share of completed predictions by outcome type.
            </p>
          </div>

          <p className="text-sm font-medium text-slate-300">
            {totalPredictions > 0 ? `${totalPredictions} completed predictions` : "No completed predictions yet"}
          </p>
        </div>

        <div className="overflow-hidden rounded-full border border-slate-800 bg-slate-900/90">
          {totalPredictions > 0 ? (
            <div className="flex h-3 w-full overflow-hidden sm:h-4" aria-label="Prediction outcome distribution">
              {mixSegments.map((segment) => (
                <div
                  key={segment.label}
                  className={segment.colourClassName}
                  style={{ width: `${segment.percentage}%` }}
                  title={`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}
                  aria-label={`${segment.label}: ${segment.value} predictions`}
                />
              ))}
            </div>
          ) : (
            <div className="h-3 w-full bg-slate-800 sm:h-4" />
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {mixItems.map((item) => {
            const share = totalPredictions > 0 ? (item.value / totalPredictions) * 100 : 0;

            return (
              <div key={item.label} className="flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-900/50 px-3 py-3">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.colourClassName}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-200">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.textClassName}`}>{item.value}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {share.toFixed(1)}% of completed predictions
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}