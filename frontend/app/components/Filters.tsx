// frontend/components/Filters.tsx
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Filters</h2>
          <p className="text-sm text-slate-400">
            Narrow down the fixture list by team or group.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Groups</option>

          {groups.map((group) => (
            <option key={group} value={group}>
              {group.replace("GROUP_", "Group ")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}