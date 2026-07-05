// frontend/app/components/Filters.tsx
import { Card } from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";
import { formatMatchPhaseLabel } from "../utils/matchPhase";

type FiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
  groups: string[];
};

export default function Filters({
  search,
  setSearch,
  selectedGroup,
  setSelectedGroup,
  groups,
}: FiltersProps) {
  return (
    <Card className="rounded-2xl bg-slate-900/70 p-4 shadow-sm sm:p-6">
      <SectionTitle
        title="Filters"
        description="Narrow down the fixture list by team or phase."
        className="mb-4"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white placeholder:text-slate-500 transition hover:border-slate-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        />

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white transition hover:border-slate-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <option value="ALL">All Phases</option>

          {groups.map((group) => (
            <option key={group} value={group}>
              {formatMatchPhaseLabel(group)}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}