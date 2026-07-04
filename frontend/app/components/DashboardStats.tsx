import { Card } from "./ui/Card";
import StatCard from "./ui/StatCard";

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
    <Card className="mb-8 rounded-xl p-6">
      <h2 className="mb-4 text-xl font-bold">Model Performance</h2>

      <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
        <StatCard value={exactScores} label="Exact Scores" valueClassName="text-green-400" />
        <StatCard value={correctResults} label="Correct Results" valueClassName="text-yellow-400" />
        <StatCard value={incorrectResults} label="Incorrect" valueClassName="text-red-400" />
        <StatCard value={`${accuracy}%`} label="Accuracy" valueClassName="text-blue-400" />
      </div>
    </Card>
  );
}