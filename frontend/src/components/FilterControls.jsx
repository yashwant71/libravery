// frontend/src/components/FilterControls.jsx
import PropTypes from "prop-types";

const filterOptions = [
  { value: "most-recent", label: "Most Recent" },
  { value: "most-viewed-all-time", label: "Most Viewed (All Time)" },
  { value: "most-viewed-this-month", label: "Most Viewed (This Month)" },
  { value: "most-viewed-this-week", label: "Most Viewed (This Week)" },
  { value: "most-liked-all-time", label: "Most Liked (All Time)" },
  { value: "most-liked-this-month", label: "Most Liked (This Month)" },
  { value: "most-liked-this-week", label: "Most Liked (This Week)" },
];

function FilterControls({ currentFilter, onFilterChange }) {
  return (
    <div className="flex justify-start mb-4">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="custom-select bg-background-primary border border-border-accent text-text-base text-sm rounded-lg focus:ring-primary focus:border-primary block w-full sm:w-auto p-2.5"
      >
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

FilterControls.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterControls;
