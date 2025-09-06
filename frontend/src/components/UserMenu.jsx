// frontend/src/components/UserMenu.jsx
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaSignOutAlt } from "react-icons/fa";
import { USER_LOCAL_STORAGE_KEY } from "../constants/admin";

function UserMenu({ user }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // Ref to detect outside clicks

  // --- NEW: Effect to handle clicks outside the menu ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false); // Close the menu
      }
    }
    // Add event listener when the menu is open
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]); // Only re-run if isMenuOpen changes

  if (!user) {
    return null; // Don't render anything if there's no user
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  const handleLogout = () => {
    localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
    window.location.href = "/"; // Redirect to home page after logout
  };

  return (
    // Attach the ref to the main container
    <div ref={menuRef} className="relative">
      {/* The Avatar - now toggles the menu on click */}
      <button
        onClick={() => setMenuOpen(!isMenuOpen)}
        className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary focus:ring-primary"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
      >
        {userInitial}
      </button>

      {/* The Dropdown Menu - visibility is controlled by isMenuOpen state */}
      {isMenuOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-48 bg-background-primary border border-border rounded-lg shadow-lg z-30"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm text-text-muted">Signed in as</p>
            <p className="text-sm font-medium text-text-base truncate">
              {user.name}
            </p>
          </div>
          <ul>
            <li
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-base hover:bg-background-secondary cursor-pointer"
              onClick={handleLogout}
              role="menuitem"
            >
              <FaSignOutAlt className="text-text-muted" />
              <span>Logout</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

UserMenu.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
};

export default UserMenu;
