import { Card } from "./ui/Card";

type TeamStat = {
  team: string;
  correct: number;
  total: number;
  accuracy: number;
};

type TeamAccuracyProps = {
  teamStats: TeamStat[];
};

export default function TeamAccuracy({
  teamStats,
}: TeamAccuracyProps) {
  return (
    <Card className="rounded-2xl bg-slate-900/70 p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-300/80">Model Performance</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Team prediction accuracy
          </h2>
        </div>

        <p className="max-w-md text-sm leading-6 text-slate-400">
          Accuracy based on completed matches, shown as a compact per-team summary.
        </p>
      </div>

      <div className="grid max-h-[260px] grid-cols-2 gap-3 overflow-y-auto text-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {teamStats.map((team) => (
          <div
            key={team.team}
            className="rounded-lg border border-slate-700 bg-slate-800 p-3"
          >
            <div className="truncate text-sm font-medium text-slate-100">{team.team}</div>

            <div
              className={`text-xl font-bold ${
                team.accuracy >= 70
                  ? "text-green-400"
                  : team.accuracy >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {team.accuracy.toFixed(0)}%
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700" aria-hidden="true">
              <div
                className={`h-full rounded-full ${
                  team.accuracy >= 70
                    ? "bg-green-400"
                    : team.accuracy >= 40
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${Math.max(4, team.accuracy)}%` }}
              />
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {team.correct}/{team.total} correct
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}