import { ArrowUpDown, Filter, RotateCcw, Search, X } from "lucide-react";

export default function SearchToolbar({
  search,
  onSearchChange,
  stateFilter,
  onStateFilterChange,
  technologyFilter,
  onTechnologyFilterChange,
  sortBy,
  onSortByChange,
  states = [],
  technologies = [],
  projectCount,
  onResetFilters,
}) {
  const hasActiveFilters = Boolean(
    search || stateFilter || technologyFilter || sortBy !== "name"
  );

  return (
    <div className="toolbar-container">
      <div className="toolbar-primary">
        <div className="search-box">
          <Search size={18} aria-hidden="true" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search projects, sponsors, locations, KGRA..."
            aria-label="Search projects"
          />

          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search input"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          <div className="filter-select-wrapper">
            <Filter size={14} className="filter-icon" aria-hidden="true" />
            <select
              value={stateFilter}
              onChange={(e) => onStateFilterChange(e.target.value)}
              aria-label="Filter by state"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={technologyFilter}
              onChange={(e) => onTechnologyFilterChange(e.target.value)}
              aria-label="Filter by technology"
            >
              <option value="">All Technologies</option>
              {technologies.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper sort-wrapper">
            <ArrowUpDown size={14} className="filter-icon" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              aria-label="Sort projects by"
            >
              <option value="name">Name (A-Z)</option>
              <option value="capacity-desc">Capacity (High to Low)</option>
              <option value="capacity-asc">Capacity (Low to High)</option>
              <option value="progress-desc">Progress (High to Low)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={onResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="toolbar-status-row">
        <span className="result-count">
          Showing <strong>{projectCount}</strong> project{projectCount === 1 ? "" : "s"}
        </span>

        {hasActiveFilters && (
          <div className="active-filter-chips">
            {search && (
              <span className="filter-chip">
                Search: &ldquo;{search}&rdquo;
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Remove search filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {stateFilter && (
              <span className="filter-chip">
                State: {stateFilter}
                <button
                  type="button"
                  onClick={() => onStateFilterChange("")}
                  aria-label="Remove state filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {technologyFilter && (
              <span className="filter-chip">
                Tech: {technologyFilter}
                <button
                  type="button"
                  onClick={() => onTechnologyFilterChange("")}
                  aria-label="Remove technology filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
