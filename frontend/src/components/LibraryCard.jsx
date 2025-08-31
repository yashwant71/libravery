// frontend/src/components/LibraryCard.jsx
import { Link } from "react-router-dom";
import PropTypes from "prop-types"; // Still need to import PropTypes for other props
import { FaFolder, FaTrash, FaLock } from "react-icons/fa";
// --- Import our centralized shape definition ---
import { libraryShape } from "../utils/propTypes";
function LibraryCard({ library, isAdmin, onDelete }) {
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(library._id, library.name);
  };

  return (
    <div className="relative group">
      <Link
        to={`/library/${library.name.toLowerCase()}`}
        className="block bg-background-primary p-6 rounded-lg border border-border hover:border-border-accent hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-center space-x-4">
          <FaFolder className="w-10 h-10 text-primary" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-text-base truncate">
                {library.name}
              </h4>
              {isAdmin && !library.isPublic && (
                <FaLock
                  className="w-3 h-3 text-text-muted"
                  title="Private Library"
                />
              )}
            </div>
            <p className="text-text-muted text-sm mt-1 line-clamp-1">
              {library.description || "No description"}
            </p>
          </div>
        </div>
      </Link>

      {isAdmin && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-3 right-3 z-10 bg-danger bg-opacity-70 hover:bg-opacity-100 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
          title={`Delete ${library.name}`}
        >
          <FaTrash className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// --- Use the imported shape for the library prop ---
LibraryCard.propTypes = {
  library: libraryShape.isRequired,
  isAdmin: PropTypes.bool,
  onDelete: PropTypes.func,
};

export default LibraryCard;
