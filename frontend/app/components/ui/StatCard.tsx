type StatCardProps = {
  value: string | number;
  label: string;
  valueClassName?: string;
};

export default function StatCard({
  value,
  label,
  valueClassName = "text-slate-100",
}: StatCardProps) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}
