// frontend/src/components/FileUpload.jsx
import { useState, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FiUploadCloud } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function FileUpload({ libraryId, onFileUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null); // Create a ref for the input

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage("");
      setError("");
    }
  };

  // A dedicated function to trigger the file input click
  const triggerFileSelect = () => {
    // We trigger the click on the actual hidden input element
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }
    if (!libraryId) {
      setError("Library ID is missing. Cannot upload.");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("libraryId", libraryId);

    try {
      await axios.post(`${BACKEND_URL}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setMessage(`Uploading... ${percentCompleted}%`);
        },
      });
      setMessage("File uploaded successfully!");
      setSelectedFile(null);
      if (onFileUploaded) onFileUploaded();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.response?.data?.message || "Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setMessage("");
    setError("");
  };

  return (
    <div className="bg-background-primary p-4 rounded-lg border border-border">
      {!selectedFile ? (
        // We now use a div with explicit event handlers for max compatibility
        <div
          className="relative cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-border-accent border-dashed rounded-lg bg-background-secondary hover:bg-background-muted transition-colors"
          onClick={triggerFileSelect}
          onTouchEnd={triggerFileSelect} // Explicitly handle touch events
          style={{ WebkitTapHighlightColor: "transparent" }} // Prevents iOS tap highlight flash
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") triggerFileSelect();
          }} // For accessibility
        >
          {/* pointer-events-none ensures clicks/taps pass through to the parent div */}
          <div className="text-center pointer-events-none">
            <FiUploadCloud className="w-10 h-10 mb-3 text-text-muted mx-auto" />
            <p className="mb-2 text-sm text-text-muted">
              <span className="font-semibold text-text-base">
                Click to Contribute
              </span>
            </p>
            <p className="text-xs text-text-muted">PNG, JPG, or JPEG only</p>
          </div>
          {/* The input is still hidden, but we now interact with it via its ref */}
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-32">
          <p className="text-text-base font-medium mb-4 text-center">
            Selected:{" "}
            <span className="text-primary block sm:inline">
              {selectedFile.name}
            </span>
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
            >
              {uploading ? "Uploading..." : "Confirm & Upload"}
            </button>
            <button
              onClick={clearSelection}
              disabled={uploading}
              className="bg-background-muted hover:bg-border text-text-base font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && !error && (
        <p className="text-secondary mt-3 text-sm text-center w-full">
          {message}
        </p>
      )}
      {error && (
        <p className="text-danger mt-3 text-sm text-center w-full">{error}</p>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  libraryId: PropTypes.string.isRequired,
  onFileUploaded: PropTypes.func.isRequired,
};

export default FileUpload;
