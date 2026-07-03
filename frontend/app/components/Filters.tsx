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
    <div className="mb-8 rounded-xl bg-slate-900 border border-slate-800 p-6">

      <h2 className="font-bold text-lg mb-4">
        Filters
      </h2>

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