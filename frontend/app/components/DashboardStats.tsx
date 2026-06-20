// frontend/components/DashboardStats.tsx
type DashboardStatsProps = {
  exactScores: number;
  correctResults: number;
  incorrectResults: number;
  accuracy: string;
};

export default function DashboardStats({
  exactScores,
  correctResults,
  incorrectResults,
  accuracy,
}: DashboardStatsProps) {
  return (
    <div className="mb-8 rounded-xl bg-slate-900 border border-slate-800 p-6">
      <h2 className="text-xl font-bold mb-4">
        Model Performance
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-green-400 text-3xl font-bold">
            {exactScores}
          </div>
          <div className="text-sm text-gray-400">
            Exact Scores
          </div>
        </div>

        <div>
          <div className="text-yellow-400 text-3xl font-bold">
            {correctResults}
          </div>
          <div className="text-sm text-gray-400">
            Correct Results
          </div>
        </div>

        <div>
          <div className="text-red-400 text-3xl font-bold">
            {incorrectResults}
          </div>
          <div className="text-sm text-gray-400">
            Incorrect
          </div>
        </div>

        <div>
          <div className="text-blue-400 text-3xl font-bold">
            {accuracy}%
          </div>
          <div className="text-sm text-gray-400">
            Accuracy
          </div>
        </div>
      </div>
    </div>
  );
}