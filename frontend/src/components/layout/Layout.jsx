// frontend/src/components/layout/Layout.jsx
import { useParams, Link, Outlet } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AuthModal from "../AuthModal";
import UserMenu from "../UserMenu";
import {
  FaHome,
  FaGlobeAmericas,
  FaLock,
  FaChevronRight,
} from "react-icons/fa";
import { USER_LOCAL_STORAGE_KEY } from "../../constants/admin";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Layout() {
  const { libraryName } = useParams();
  const [currentLibrary, setCurrentLibrary] = useState(null);
  const [loadingLibrary, setLoadingLibrary] = useState(!!libraryName);
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (libraryName && !userInfo) {
      setAuthModalOpen(true);
    }
  }, [libraryName, userInfo, authLoading]);

  const fetchLibraryData = useCallback(async () => {
    if (!libraryName) {
      setCurrentLibrary(null);
      setLoadingLibrary(false); // Ensure loading is false if there's nothing to fetch

      return;
    }
    setLoadingLibrary(true);

    try {
      const response = await axios.get(
        `${BACKEND_URL}/libraries/by-name/${libraryName}`
      );
      setCurrentLibrary(response.data);
    } catch (err) {
      console.error("Error fetching library:", err);
      setCurrentLibrary(null);
    } finally {
      setLoadingLibrary(false);
    }
  }, [libraryName]);

  useEffect(() => {
    fetchLibraryData();
  }, [fetchLibraryData]);

  const handleFileUploadSuccess = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleAuthSuccess = (userData) => {
    localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(userData));
    setUserInfo(userData);
    setAuthModalOpen(false);
  };
  const requireAuth = () => {
    setAuthModalOpen(true);
  };
  return (
    // This top-level div allows the background color to be full-width
    <div>
      <nav className="bg-background-primary p-4 border-b border-border sticky top-0 z-20">
        {/* This inner div constrains the navbar content to max-w-7xl and centers it */}
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex-1 min-w-0">
            {libraryName ? (
              <ol className="inline-flex items-center text-text-muted">
                <li className="inline-flex items-center">
                  <Link
                    to="/"
                    className="inline-flex items-center font-medium text-text-base hover:text-primary"
                  >
                    <FaHome className="w-4 h-4" />{" "}
                    <span className="ml-2">Home</span>
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <FaChevronRight className="w-3 h-3 text-border-accent mx-1 md:mx-3" />
                    {loadingLibrary ? (
                      <div className="h-5 bg-background-muted rounded animate-pulse w-32"></div>
                    ) : currentLibrary ? (
                      <span className="font-medium text-text-base inline-flex items-center gap-2 truncate">
                        {currentLibrary.name}
                        {currentLibrary.isPublic ? (
                          <FaGlobeAmericas className="w-4 h-4 text-secondary" />
                        ) : (
                          <FaLock className="w-4 h-4 text-text-muted" />
                        )}
                      </span>
                    ) : (
                      <span className="font-medium text-danger">
                        Library not found
                      </span>
                    )}
                  </div>
                </li>
              </ol>
            ) : (
              <Link
                to="/"
                className="text-xl font-bold text-text-base hover:text-primary transition-colors"
              >
                Libra<span className="text-primary">very</span>
              </Link>
            )}
          </div>
          <div className="flex-shrink-0">
            {libraryName && userInfo && <UserMenu user={userInfo} />}
          </div>
        </div>
      </nav>

      {/* This main content area is now constrained and centered */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet
          context={{
            library: currentLibrary,
            loading: loadingLibrary,
            error: null,
            refreshKey,
            handleFileUploadSuccess,
            userInfo,
            onAuthRequired: requireAuth,
          }}
        />
      </main>

      {isAuthModalOpen && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;
