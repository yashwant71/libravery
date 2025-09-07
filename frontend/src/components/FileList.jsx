// frontend/src/components/FileList.jsx
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { FaTrash, FaUserCircle, FaEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { fileShape } from "../utils/propTypes";
import FileActions from "./FileActions";
import FileDetailModal from "./FileDetailModal";

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

function FileList({ libraryName, refreshTrigger, filter }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { userInfo, onAuthRequired } = useOutletContext();

  useEffect(() => {
    // Admin check can now be based on the user object
    setIsAdmin(userInfo?.isAdmin === true);
  }, [userInfo]);

  const handleFileUpdate = (updatedFile) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file._id === updatedFile._id ? updatedFile : file
      )
    );
    // Also update the selectedFile if it's the one being changed
    if (selectedFile?._id === updatedFile._id) {
      setSelectedFile(updatedFile);
    }
  };
  const fetchFiles = async () => {
    if (!libraryName) return;
    setLoading(true);
    setError(null);
    try {
      // Append the sort parameter to the API request URL
      const response = await axios.get(
        `${BACKEND_URL}/files?libraryName=${libraryName}&sort=${filter}`
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
  }, [libraryName, refreshTrigger, filter]); // Re-fetch when the filter changes

  const handleTrackView = async (file) => {
    // Open the detail modal immediately
    setSelectedFile(file);

    if (!userInfo || !userInfo._id) return; // Don't track view if not logged in

    const hasViewed = file.views?.some((view) => view.user === userInfo._id);
    if (hasViewed) return;

    try {
      await axios.post(`${BACKEND_URL}/files/${file._id}/view`, {
        userId: userInfo._id,
      });
      const updatedFile = {
        ...file,
        views: [
          ...(file.views || []),
          { user: userInfo._id, date: new Date().toISOString() },
        ],
      };
      handleFileUpdate(updatedFile);
    } catch (err) {
      console.error("Error tracking view:", err);
    }
  };

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
      {selectedFile && (
        <FileDetailModal
          file={selectedFile}
          user={userInfo}
          onClose={() => setSelectedFile(null)}
          onAuthRequired={onAuthRequired}
          onFileUpdate={handleFileUpdate}
        />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {files.map((file) => (
          <div
            key={file._id}
            className="relative bg-background-primary rounded-lg border border-border flex flex-col group overflow-hidden"
          >
            <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white text-xs font-bold flex items-center gap-1.5 py-1 px-2 rounded-full">
              <FaEye />
              <span>{file.views?.length || 0}</span>
            </div>
            {file.mimetype.startsWith("image/") ? (
              <img
                src={file.url}
                alt={file.originalName}
                className="h-40 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                onClick={() => handleTrackView(file)}
              />
            ) : (
              <div className="h-40 w-full flex items-center justify-center bg-background-muted">
                <span className="text-6xl text-text-muted">📄</span>
              </div>
            )}
            <FileActions
              file={file}
              user={userInfo}
              onUpdate={handleFileUpdate}
              onAuthRequired={onAuthRequired}
            />
            <div className="p-2 w-full text-center">
              {/* --- Integrate the FileActions component here --- */}

              {/* <p className="text-sm font-semibold text-text-base truncate">
                {file.originalName}
              </p> */}
              {file.uploadedBy?.name && (
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
  filter: PropTypes.string.isRequired,
};

export default FileList;
