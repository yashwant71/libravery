// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { FaGlobeAmericas, FaLock, FaChevronRight } from "react-icons/fa";

const BACKEND_URL = process.env.VITE_BACKEND_URL;

interface Library {
  name: string;
  isPublic: boolean;
}

function Navbar() {
  const params = useParams(); // Hook to get URL parameters like :libraryName
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(false);

  // This effect runs whenever the URL parameter for the library name changes.
  useEffect(() => {
    // If there's no libraryName in the URL, we're on the homepage, so reset.
    if (!params.libraryName) {
      setLibrary(null);
      return;
    }

    const fetchLibraryDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${BACKEND_URL}/libraries/by-name/${params.libraryName}`
        );
        setLibrary(response.data);
      } catch (error) {
        console.error("Navbar failed to fetch library details:", error);
        setLibrary(null); // Clear on error
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryDetails();
  }, [params.libraryName]); // Dependency: re-run only when the library name in URL changes

  return (
    <nav className="bg-background-primary shadow-sm p-4 border-b border-border sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Main Brand Link - always visible */}
        <Link
          to="/"
          className="text-xl font-bold text-text-base hover:text-primary transition-colors"
        >
          Libra<span className="text-primary">very</span>
        </Link>

        {/* Dynamic Breadcrumb Section */}
        {/* Shows a placeholder while loading library details */}
        {loading && (
          <div className="flex items-center">
            <FaChevronRight className="w-3 h-3 text-border-accent mx-1 md:mx-3" />
            <div className="h-5 w-32 bg-background-muted rounded animate-pulse"></div>
          </div>
        )}

        {/* Shows the breadcrumb if we have successfully loaded library details */}
        {!loading && library && (
          <div className="flex items-center text-sm">
            <FaChevronRight className="w-3 h-3 text-border-accent mx-1 md:mx-3" />
            <span className="font-medium text-text-base inline-flex items-center gap-2">
              {library?.name}
              {library?.isPublic ? (
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
        )}
      </div>
    </nav>
  );
}

export default Navbar;
