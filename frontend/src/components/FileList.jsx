// frontend/src/components/FileList.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // <-- Import PropTypes
import axios from "axios";
import { FaTrash, FaUserCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
// --- Import our new admin constants ---
import { USER_LOCAL_STORAGE_KEY } from "../constants/admin";
// --- Import our centralized file shape definition ---
import { fileShape } from "../utils/propTypes";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// This sub-component does not need changes, but it's good practice to define its props.
const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-4xl hover:text-text-muted transition-colors"
        onClick={onClose}
        aria-label="Close image view"
      >
        <IoClose />
      </button>
      <div className="relative p-4">
        <img
          src={imageUrl}
          alt="Full-screen view"
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

ImageModal.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

function FileList({ libraryName, refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.isAdmin) {
        setIsAdmin(true);
      }
    }
  }, []); // Run once on component mount

  const fetchFiles = async () => {
    if (!libraryName) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/files?libraryName=${libraryName}`
      );
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch files.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await axios.delete(`${BACKEND_URL}/files/${fileId}`);
      fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      alert(
        "Failed to delete file: " + (err.response?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryName, refreshTrigger]);

  if (loading) return <div className="text-center py-8">Loading files...</div>;
  if (error)
    return <div className="text-danger text-center py-8">Error: {error}</div>;
  if (files.length === 0)
    return (
      <div className="text-center py-8 text-text-muted">
        No files in this library yet.
      </div>
    );

  return (
    <>
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {files.map((file) => (
          <div
            key={file._id}
            className="relative bg-background-primary rounded-lg border border-border flex flex-col items-center text-center group overflow-hidden"
          >
            {file.mimetype.startsWith("image/") ? (
              <img
                src={file.url}
                alt={file.originalName}
                className="h-40 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                onClick={() => setSelectedImage(file.url)}
              />
            ) : (
              <div className="h-40 w-full flex items-center justify-center bg-background-muted">
                <span className="text-6xl text-text-muted">📄</span>
              </div>
            )}
            <div className="p-2 w-full">
              {/* <p className="text-sm font-semibold text-text-base truncate">
                {file.originalName}
              </p> */}
              {file.uploadedBy && file.uploadedBy.name && (
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-text-muted">
                  <FaUserCircle />
                  <span>{file.uploadedBy.name}</span>
                </div>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={() => handleDelete(file._id)}
                className="absolute top-2 right-2 bg-danger bg-opacity-70 hover:bg-opacity-100 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                title="Delete File"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// --- NEW: Define PropTypes to remove the ESLint warning and improve code quality ---
FileList.propTypes = {
  libraryName: PropTypes.string.isRequired,
  refreshTrigger: PropTypes.number.isRequired,
  // This validates that 'files' is an array of objects matching our central 'fileShape'
  files: PropTypes.arrayOf(fileShape),
};

export default FileList;
