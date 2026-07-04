import { Card } from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";

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
      <SectionTitle
        title="Team Prediction Accuracy"
        description="Accuracy based on completed matches."
        className="mb-4"
      />

      <div className="grid max-h-[260px] grid-cols-2 gap-3 overflow-y-auto text-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {teamStats.map((team) => (
          <div
            key={team.team}
            className="rounded-lg border border-slate-700 bg-slate-800 p-3"
          >
            <div className="truncate font-medium">{team.team}</div>

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

            <div className="text-xs text-slate-500">
              {team.correct}/{team.total} correct
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}