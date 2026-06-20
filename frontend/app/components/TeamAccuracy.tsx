// frontend/app/components/TeamAccuracy.tsx
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
    <div className="mb-8 rounded-xl bg-slate-900 border border-slate-800 p-6">
      <h2 className="text-xl font-bold mb-4">
        Team Prediction Accuracy
      </h2>

      <div className="max-h-[220px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center">
        {teamStats.slice(0, 15).map((team) => (
            <div
            key={team.team}
            className="rounded-lg bg-slate-800 border border-slate-700 p-3"
            >
            <div className="font-medium">
                {team.team}
            </div>

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

            <div className="text-xs text-gray-500">
                {team.correct}/{team.total} correct
            </div>
            </div>
        ))}
        </div>
    </div>
  );
}