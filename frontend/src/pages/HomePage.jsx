// frontend/src/pages/HomePage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LibraryCard from "../components/LibraryCard";
import Modal from "../components/common/Modal";
import CreateLibrary from "../components/CreateLibrary";
import { USER_LOCAL_STORAGE_KEY } from "../constants/admin";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function HomePage() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [libraryInput, setLibraryInput] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  const isAdmin = userInfo?.isAdmin === true;

  const fetchLibraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
  }, [isAdmin]);

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  const handleGoToLibrary = (e) => {
    e.preventDefault();
    if (libraryInput.trim()) {
      navigate(`/library/${libraryInput.trim().toLowerCase()}`);
    }
  };

  const onLibraryCreated = () => {
    fetchLibraries();
  };

  const handleDeleteLibrary = async (libraryId, libraryName) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete the "${libraryName}" library and all of its files?`
      )
    ) {
      try {
        await axios.delete(`${BACKEND_URL}/libraries/${libraryId}`);
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
          Your Media Library Hub
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

export default HomePage;
