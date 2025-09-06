// frontend/src/utils/propTypes.js
import PropTypes from "prop-types";

/**
 * Defines the shape of a File object received from the backend.
 * This is our frontend "schema" for a file.
 */
export const fileShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  originalName: PropTypes.string,
  mimetype: PropTypes.string,
  size: PropTypes.number,
  url: PropTypes.string.isRequired,
  public_id: PropTypes.string.isRequired,
  // --- MODIFIED: uploadedBy is now an object with a name property ---
  uploadedBy: PropTypes.shape({
    _id: PropTypes.string, // The ID will be populated too
    name: PropTypes.string,
  }),
});

/**
 * Defines the shape of a Library object received from the backend.
 * This is our frontend "schema" for a library.
 */
export const libraryShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  isPublic: PropTypes.bool.isRequired,
  createdAt: PropTypes.string, // Dates are often serialized as strings
});
