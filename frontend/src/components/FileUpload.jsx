// frontend/src/components/FileUpload.jsx
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FiUploadCloud } from "react-icons/fi";
import ImageEditorModal from "./ImageEditorModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
        return;
      }
      setError("");
      setEditingFile(file);
      setEditorOpen(true);
    }
  };

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
        <div className="flex flex-col items-center justify-center w-full">
          {/* --- THE FIX: A simple, styled button using a label --- */}
          <label
            htmlFor="file-upload-input"
            className="flex items-center gap-3 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded cursor-pointer transition-colors"
          >
            <FiUploadCloud className="w-6 h-6" />
            <span>Contribute a Photo</span>
          </label>
          <input
            id="file-upload-input"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/png, image/jpeg, image/jpg"
          />

          {/* --- Displaying Status Messages --- */}
          <div className="h-6 mt-3 text-sm text-center">
            {uploading && <p className="text-text-base">{message}</p>}
            {error && <p className="text-danger">{error}</p>}
            {!uploading && message && (
              <p className="text-secondary">{message}</p>
            )}
          </div>
        </div>
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
