// frontend/src/components/CreateLibrary.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { USER_LOCAL_STORAGE_KEY } from "../constants/admin";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function CreateLibrary({ onLibraryCreated, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Library name cannot be empty.");
      return;
    }

    // --- Get the logged-in user's data from localStorage ---
    const storedUser = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (!storedUser) {
      setError("You must be logged in to create a library.");
      return;
    }
    const ownerId = JSON.parse(storedUser)._id;

    try {
      await axios.post(`${BACKEND_URL}/libraries`, {
        name,
        description,
        isPublic,
        ownerId,
      });
      onLibraryCreated();
      onClose();
    } catch (err) {
      console.error("Error creating library:", err);
      setError(err.response?.data?.message || "Failed to create library.");
    }
  };

  return (
    <div className="mt-2">
      <h3 className="text-2xl font-bold mb-4 text-center">
        Create a New Library
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="libraryName"
            className="block text-text-base text-sm font-bold mb-2"
          >
            Library Name
          </label>
          <input
            type="text"
            id="libraryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="appearance-none border border-border-accent rounded w-full py-2 px-3 text-text-base leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="libraryDescription"
            className="block text-text-base text-sm font-bold mb-2"
          >
            Description
          </label>
          <textarea
            id="libraryDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="appearance-none border border-border-accent rounded w-full py-2 px-3 text-text-base leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-text-base text-sm font-bold">
            Library Visibility
          </span>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`${
              isPublic ? "bg-secondary" : "bg-border-accent"
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
          >
            <span
              className={`${
                isPublic ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-background-primary rounded-full transition-transform`}
            />
          </button>
        </div>
        <p className="text-xs text-text-muted mb-4 text-center">
          {isPublic
            ? "This library will be visible to everyone."
            : "This library will be private."}
        </p>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Library
        </button>
        {error && <p className="text-danger text-xs italic mt-4">{error}</p>}
      </form>
    </div>
  );
}

CreateLibrary.propTypes = {
  onLibraryCreated: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateLibrary;
