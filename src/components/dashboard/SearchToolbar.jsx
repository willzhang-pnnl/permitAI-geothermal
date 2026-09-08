import { Search } from "lucide-react";

export default function SearchToolbar({
  search,
  onSearchChange,
  projectCount,
}) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Search size={18} />

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects, states, sponsors..."
        />
      </div>

      <div className="result-count">
        {projectCount} project{projectCount === 1 ? "" : "s"}
      </div>
    </div>
  );
}