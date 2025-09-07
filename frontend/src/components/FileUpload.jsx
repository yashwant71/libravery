// frontend/src/components/FileUpload.jsx
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FiUploadCloud, FiCheckCircle, FiAlertCircle } from "react-icons/fi"; // Import new icons
import ImageEditorModal from "./ImageEditorModal";
import { motion } from "framer-motion"; // Import motion for animations

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to convert base64 to File object
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function FileUpload({ libraryId, onFileUploaded, user }) {
  // --- NEW: Use a single state to manage the button's appearance and text ---
  const [uploadState, setUploadState] = useState({
    status: "idle",
    message: "",
  });

  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setUploadState({ status: "error", message: "Invalid file type." });
        // Reset after a delay
        setTimeout(() => setUploadState({ status: "idle", message: "" }), 4000);
        return;
      }
      setEditingFile(file);
      setEditorOpen(true);
    }
  };

  const handleUpload = useCallback(
    async (fileToUpload) => {
      if (!libraryId || !user || !user._id) {
        setUploadState({
          status: "error",
          message: "User or library missing.",
        });
        setTimeout(() => setUploadState({ status: "idle", message: "" }), 4000);
        return;
      }

      setUploadState({ status: "uploading", message: "Preparing..." });

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("libraryId", libraryId);
      formData.append("userId", user._id);

      try {
        await axios.post(`${BACKEND_URL}/files/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadState({
              status: "uploading",
              message: `Uploading ${percentCompleted}%`,
            });
          },
        });
        setUploadState({ status: "success", message: "Upload Complete!" });
        if (onFileUploaded) onFileUploaded();
      } catch (err) {
        console.error("Error uploading file:", err);
        setUploadState({
          status: "error",
          message: err.response?.data?.message || "Upload Failed",
        });
      } finally {
        // Reset the button back to idle after 4 seconds
        setTimeout(() => setUploadState({ status: "idle", message: "" }), 4000);
      }
    },
    [libraryId, user, onFileUploaded]
  );

  const handleSaveFromEditor = (dataURL) => {
    setEditorOpen(false);
    if (editingFile) {
      const editedFile = dataURLtoFile(dataURL, editingFile.name);
      if (editedFile) {
        handleUpload(editedFile);
      } else {
        setUploadState({
          status: "error",
          message: "Image processing failed.",
        });
        setTimeout(() => setUploadState({ status: "idle", message: "" }), 4000);
      }
    }
  };

  // --- NEW: Logic to determine button content and style based on state ---
  const getButtonContent = () => {
    switch (uploadState.status) {
      case "uploading":
        return <>{uploadState.message}</>;
      case "success":
        return (
          <>
            <FiCheckCircle /> {uploadState.message}
          </>
        );
      case "error":
        return (
          <>
            <FiAlertCircle /> {uploadState.message}
          </>
        );
      case "idle":
      default:
        return (
          <>
            <FiUploadCloud /> Contribute Photo
          </>
        );
    }
  };

  const getButtonClassName = () => {
    const baseClasses =
      "flex items-center justify-center gap-3 font-bold py-3 px-6 rounded cursor-pointer transition-all duration-300 w-full sm:w-auto";
    switch (uploadState.status) {
      case "uploading":
        return `${baseClasses} bg-background-muted text-text-muted cursor-not-allowed`;
      case "success":
        return `${baseClasses} bg-secondary text-white`;
      case "error":
        return `${baseClasses} bg-danger text-white`;
      case "idle":
      default:
        return `${baseClasses} bg-primary hover:bg-primary-hover text-white`;
    }
  };

  return (
    <>
      {isEditorOpen && editingFile && (
        <ImageEditorModal
          file={editingFile}
          onSave={handleSaveFromEditor}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* The UI is now just a single, smart button positioned to the right */}
      <div className="flex justify-end">
        <motion.label
          htmlFor="file-upload-input"
          className={getButtonClassName()}
          // Animate background color changes
          animate={{
            backgroundColor:
              getButtonClassName().match(/bg-[a-z]+(?:-\d+)?/)[0],
          }}
          transition={{ duration: 0.3 }}
        >
          {getButtonContent()}
        </motion.label>
        <input
          id="file-upload-input"
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/png, image/jpeg, image/jpg"
          // Disable the input while uploading
          disabled={uploadState.status === "uploading"}
        />
      </div>
    </>
  );
}

FileUpload.propTypes = {
  libraryId: PropTypes.string.isRequired,
  onFileUploaded: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
};

export default FileUpload;
