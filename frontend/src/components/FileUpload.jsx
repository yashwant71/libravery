// frontend/src/components/FileUpload.jsx
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function FileUpload({ libraryId, onFileUploaded, userName }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- 2. Create a callback for when a file is dropped/selected ---
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      // Handle rejected files (e.g., wrong type)
      if (fileRejections.length > 0) {
        setError("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
        return;
      }

      setError(""); // Clear previous errors
      const file = acceptedFiles[0];
      if (file) {
        handleUpload(file);
      }
    },
    [libraryId, userName]
  ); // Dependencies for the callback

  // --- 3. Set up the dropzone hook ---
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    multiple: false, // Only allow one file at a time
  });

  // --- 4. The handleUpload function now accepts a file directly ---
  const handleUpload = async (file) => {
    if (!libraryId) {
      setError("Library ID is missing. Cannot upload.");
      return;
    }
    if (!userName) {
      setError("Cannot upload without a user name. Please refresh.");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("libraryId", libraryId);
    formData.append("userName", userName);

    try {
      await axios.post(`${BACKEND_URL}/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setMessage(`Uploading... ${percentCompleted}%`);
        },
      });
      setMessage("File uploaded successfully!");
      // The library will automatically reset, no need for a selectedFile state
      if (onFileUploaded) onFileUploaded();
    } catch (err) {
      console.error("Error uploading file:", err);
      setMessage(""); // Clear progress message on error
      setError(err.response?.data?.message || "Error uploading file.");
    } finally {
      setUploading(false);
      // Auto-clear messages after a few seconds
      setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
    }
  };

  return (
    <div className="bg-background-primary p-4 rounded-lg border border-border">
      {/* --- 5. Apply the props from the hook to a div --- */}
      <div
        {...getRootProps()}
        // Dynamically change style based on dropzone state
        className={`relative cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-border-accent border-dashed rounded-lg bg-background-secondary transition-colors ${
          isDragActive
            ? "border-primary bg-background-muted"
            : "hover:bg-background-muted"
        }`}
      >
        {/* --- 6. The input is handled by the hook --- */}
        <input {...getInputProps()} />

        <div className="text-center pointer-events-none">
          <FiUploadCloud
            className={`w-10 h-10 mb-3 mx-auto transition-colors ${
              isDragActive ? "text-primary" : "text-text-muted"
            }`}
          />
          {uploading ? (
            <p className="text-text-base">{message}</p>
          ) : isDragActive ? (
            <p className="font-semibold text-primary">Drop the file here...</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-text-muted">
                <span className="font-semibold text-text-base">
                  Click to Contribute
                </span>{" "}
                or drag & drop
              </p>
              <p className="text-xs text-text-muted">PNG, JPG, or JPEG only</p>
            </>
          )}
        </div>
      </div>

      {/* Error message display */}
      {error && (
        <p className="text-danger mt-3 text-sm text-center w-full">{error}</p>
      )}
      {/* Show success message here as well */}
      {!uploading && message && (
        <p className="text-secondary mt-3 text-sm text-center w-full">
          {message}
        </p>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  libraryId: PropTypes.string.isRequired,
  onFileUploaded: PropTypes.func.isRequired,
  userName: PropTypes.string,
};

export default FileUpload;
