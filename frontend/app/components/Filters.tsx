// frontend/components/Filters.tsx
type FiltersProps = {
  search: string;
  setSearch: (value: string) => void;

  selectedGroup: string;
  setSelectedGroup: (value: string) => void;

  groups: string[];

  onRefresh: () => void;
};

export default function Filters({
  search,
  setSearch,
  selectedGroup,
  setSelectedGroup,
  groups,
  onRefresh,
}: FiltersProps) {
  return (
    <div className="mb-8 rounded-xl bg-slate-900 border border-slate-800 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">
          Filters
        </h2>

        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="p-3 rounded-lg bg-slate-800 border border-slate-700"
        />

        <select
          value={selectedGroup}
          onChange={(e) =>
            setSelectedGroup(e.target.value)
          }
          className="p-3 rounded-lg bg-slate-800 border border-slate-700"
        >
          <option value="ALL">
            All Groups
          </option>

          {groups.map((group) => (
            <option
              key={group}
              value={group}
            >
              {group.replace(
                "GROUP_",
                "Group "
              )}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}