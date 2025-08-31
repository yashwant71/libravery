// frontend/src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
  Link,
  useLocation,
  Outlet, // For nested routing
  useOutletContext, // To receive context from parent layout
} from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import CreateLibrary from "./components/CreateLibrary";
import LibraryCard from "./components/LibraryCard";
import Modal from "./components/common/Modal";
// --- react-icons will be used directly in the Layout ---
import {
  FaHome,
  FaGlobeAmericas,
  FaLock,
  FaChevronRight,
} from "react-icons/fa";
import { ADMIN_USER_PARAM, ADMIN_USER_VALUE } from "./constants/admin";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// --- 1. The NEW "Smart" Layout Component ---
// This single component contains the persistent navbar and fetches data for child pages.
function Layout() {
  const { libraryName } = useParams(); // Get libraryName if on a library page
  const [currentLibrary, setCurrentLibrary] = useState(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch library data here, in the parent layout
  const fetchLibraryData = useCallback(async () => {
    if (!libraryName) {
      setCurrentLibrary(null); // Clear library data if we are not on a library page
      return;
    }
    setLoadingLibrary(true);
    setError(null);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/libraries/by-name/${libraryName}`
      );
      setCurrentLibrary(response.data);
    } catch (err) {
      console.error("Error fetching library:", err);
      setError("Failed to load library data.");
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* --- The SINGLE Persistent Navbar --- */}
      <nav className="bg-background-primary shadow-sm p-4 border-b border-border sticky top-0 z-20">
        <div className="flex items-center text-sm">
          {/* --- Dynamic Content Logic --- */}
          {/* If we have a library name in the URL, show the breadcrumbs */}
          {libraryName ? (
            <ol className="inline-flex items-center text-text-muted">
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
                  {/* Show a loading skeleton or the library name */}
                  {loadingLibrary ? (
                    <div className="h-5 bg-background-muted rounded animate-pulse w-32"></div>
                  ) : currentLibrary ? (
                    <span className="font-medium text-text-base inline-flex items-center gap-2">
                      {currentLibrary.name}
                      {currentLibrary.isPublic ? (
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
                  ) : (
                    <span className="font-medium text-danger">
                      Library not found
                    </span>
                  )}
                </div>
              </li>
            </ol>
          ) : (
            // Otherwise, just show the brand name on the homepage
            <Link
              to="/"
              className="text-xl font-bold text-text-base hover:text-primary transition-colors"
            >
              Libra<span className="text-primary">very</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Main content area */}
      <main className="bg-background-secondary min-h-screen">
        <div className="py-6 sm:px-6 lg:px-8">
          {/* Pass all necessary data down to the child page (HomePage or LibraryPage) */}
          <Outlet
            context={{
              library: currentLibrary,
              loading: loadingLibrary,
              error,
              refreshKey,
              handleFileUploadSuccess,
            }}
          />
        </div>
      </main>
    </div>
  );
}

// --- 2. SIMPLIFIED LibraryPage Component ---
// It no longer fetches data. It receives it from the Layout via context.
function LibraryPage() {
  // Get all data and functions from the parent Layout component
  const { library, loading, error, refreshKey, handleFileUploadSuccess } =
    useOutletContext();

  if (loading)
    return (
      <div className="p-5">
        <div className="h-8 w-1/2 bg-background-muted rounded animate-pulse mb-8"></div>
        <div className="h-32 bg-background-muted rounded-lg animate-pulse"></div>
      </div>
    );

  if (error || !library)
    return (
      <div className="p-5 text-danger text-center">
        {error || "Library could not be loaded."}
      </div>
    );

  return (
    <div className="p-5">
      <p className="text-text-muted mb-8">{library.description}</p>
      <FileUpload
        libraryId={library._id}
        onFileUploaded={handleFileUploadSuccess}
      />
      <h3 className="text-2xl font-semibold mt-10 mb-4">
        Files in this Library
      </h3>
      <FileList libraryName={library.name} refreshTrigger={refreshKey} />
    </div>
  );
}

function HomePage() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [libraryInput, setLibraryInput] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to check for admin status from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get(ADMIN_USER_PARAM) === ADMIN_USER_VALUE) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [location.search]);

  const fetchLibraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // If admin, add the isAdmin=true query parameter to the request
      const url = isAdmin
        ? `${BACKEND_URL}/libraries?isAdmin=true`
        : `${BACKEND_URL}/libraries`;
      const response = await axios.get(url);
      setLibraries(response.data);
    } catch (err) {
      console.error("Error fetching libraries:", err);
      setError("Failed to fetch libraries.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]); // Re-run fetchLibraries if admin status changes

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  const handleGoToLibrary = (e) => {
    e.preventDefault();
    if (libraryInput.trim()) {
      // If admin, preserve the admin query parameter when navigating
      const searchParams = isAdmin
        ? `?${ADMIN_USER_PARAM}=${ADMIN_USER_VALUE}`
        : "";
      navigate(`/library/${libraryInput.trim().toLowerCase()}${searchParams}`);
    }
  };

  const onLibraryCreated = () => {
    fetchLibraries(); // Refresh the list of public libraries
  };

  // Handler for deleting a library
  const handleDeleteLibrary = async (libraryId, libraryName) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete the "${libraryName}" library and all of its files?`
      )
    ) {
      try {
        await axios.delete(`${BACKEND_URL}/libraries/${libraryId}`);
        // Refresh the list after successful deletion
        fetchLibraries();
      } catch (err) {
        console.error("Error deleting library:", err);
        alert("Failed to delete library.");
      }
    }
  };

  return (
    <>
      <div className="text-center p-5">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Share, Collaborate, Organize
        </h1>
        <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
          Quickly access a library or discover collections below.
        </p>

        <div className="max-w-xl mx-auto mb-10">
          <form
            onSubmit={handleGoToLibrary}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={libraryInput}
              onChange={(e) => setLibraryInput(e.target.value)}
              placeholder="Enter library name..."
              className="flex-grow appearance-none border border-border-accent rounded w-full py-3 px-4 text-text-base leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Go
            </button>
          </form>
        </div>

        <div className="border-t border-border pt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-base">
              {isAdmin ? "All Libraries" : "Public Libraries"}
            </h2>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              + Create New
            </button>
          </div>

          {loading && <div>Loading libraries...</div>}
          {error && <div className="text-danger">{error}</div>}
          {!loading && !error && libraries.length === 0 && (
            <div className="text-center py-10 px-4 bg-background-primary rounded-lg">
              <p className="text-text-muted">No libraries found.</p>
              {isAdmin ? (
                <p className="text-text-muted text-sm mt-2">
                  Create your first library to get started.
                </p>
              ) : (
                <p className="text-text-muted text-sm mt-2">
                  Be the first to create one!
                </p>
              )}
            </div>
          )}
          {!loading && !error && libraries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {libraries.map((lib) => (
                <LibraryCard
                  key={lib._id}
                  library={lib}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteLibrary}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <Modal onClose={() => setCreateModalOpen(false)}>
          <CreateLibrary
            onLibraryCreated={onLibraryCreated}
            onClose={() => setCreateModalOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}

// --- 4. Main App Component with Nested Routes ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="library/:libraryName" element={<LibraryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
