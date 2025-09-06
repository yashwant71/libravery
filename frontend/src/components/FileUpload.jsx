// frontend/src/components/FileUpload.jsx
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";
import ImageEditorModal from "./ImageEditorModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to convert the editor's base64 output back to a File
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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // State to manage the editor modal
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  const handleUpload = useCallback(
    async (fileToUpload) => {
      if (!libraryId || !user || !user._id) {
        setError("Cannot upload: missing user or library info.");
        return;
      }

      setUploading(true);
      setMessage("Uploading...");
      setError("");

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
            setMessage(`Uploading... ${percentCompleted}%`);
          },
        });
        setMessage("File uploaded successfully!");
        if (onFileUploaded) onFileUploaded();
      } catch (err) {
        console.error("Error uploading file:", err);
        setMessage("");
        setError(err.response?.data?.message || "Error uploading file.");
      } finally {
        setUploading(false);
        setTimeout(() => {
          setMessage("");
          setError("");
        }, 4000);
      }
    },
    [libraryId, user, onFileUploaded]
  );

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      setError("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
      return;
    }
    setError("");
    const file = acceptedFiles[0];
    if (file) {
      // Instead of uploading, open the editor
      setEditingFile(file);
      setEditorOpen(true);
    }
  }, []); // onDrop is now simpler and has no external dependencies

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpeg", ".jpg"], "image/png": [".png"] },
    multiple: false,
  });

  // Function to handle the save event from the editor modal
  const handleSaveFromEditor = (dataURL) => {
    setEditorOpen(false);
    if (editingFile) {
      const editedFile = dataURLtoFile(dataURL, editingFile.name);
      if (editedFile) {
        handleUpload(editedFile);
      } else {
        setError("Could not process edited image.");
      }
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

      <div className="bg-background-primary p-4 rounded-lg border border-border">
        <div
          {...getRootProps()}
          className={`relative cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-border-accent border-dashed rounded-lg bg-background-secondary transition-colors ${
            isDragActive
              ? "border-primary bg-background-muted"
              : "hover:bg-background-muted"
          }`}
        >
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
              <p className="font-semibold text-primary">
                Drop the file here...
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-text-muted">
                  <span className="font-semibold text-text-base">
                    Click to Contribute
                  </span>{" "}
                  or drag & drop
                </p>
                <p className="text-xs text-text-muted">
                  PNG, JPG, or JPEG only
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="text-danger mt-3 text-sm text-center w-full">{error}</p>
        )}
        {!uploading && message && (
          <p className="text-secondary mt-3 text-sm text-center w-full">
            {message}
          </p>
        )}
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
