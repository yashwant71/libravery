// frontend/src/components/Breadcrumbs.jsx
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaHome,
  FaGlobeAmericas,
  FaLock,
  FaChevronRight,
} from "react-icons/fa";

function Breadcrumbs({ library }) {
  const navClasses =
    "sticky top-0 z-10 bg-background-secondary border-b border-border py-3 -mx-5 px-10 mb-6";

  if (!library) {
    return (
      <nav className={navClasses}>
        <div className="h-6 bg-background-muted rounded animate-pulse w-1/3"></div>
      </nav>
    );
  }

  return (
    <nav className={navClasses} aria-label="Breadcrumb">
      <ol className="inline-flex items-center text-sm text-text-muted">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center font-medium text-text-base hover:text-primary"
          >
            <FaHome className="w-4 h-4" />
            <span className="ml-2">Home</span>
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <FaChevronRight className="w-3 h-3 text-border-accent mx-1 md:mx-3" />
            <span className="font-medium text-text-base inline-flex items-center gap-2">
              {library.name}
              {library.isPublic ? (
                <FaGlobeAmericas
                  className="w-4 h-4 text-secondary"
                  title="Public Library"
                />
              ) : (
                <FaLock
                  className="w-4 h-4 text-text-muted"
                  title="Private Library"
                />
              )}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
}

Breadcrumbs.propTypes = {
  library: PropTypes.shape({
    name: PropTypes.string,
    isPublic: PropTypes.bool,
  }),
};

export default Breadcrumbs;
