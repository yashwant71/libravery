// frontend/src/utils/propTypes.js
import PropTypes from "prop-types";

const actionShape = PropTypes.shape({
  user: PropTypes.string.isRequired, // The user ID
  date: PropTypes.string,
});

export const fileShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  originalName: PropTypes.string,
  description: PropTypes.string,
  mimetype: PropTypes.string,
  size: PropTypes.number,
  url: PropTypes.string.isRequired,
  public_id: PropTypes.string.isRequired,
  uploadedBy: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  likes: PropTypes.arrayOf(actionShape),
  dislikes: PropTypes.arrayOf(actionShape),
  views: PropTypes.arrayOf(actionShape),
  uploadedAt: PropTypes.string,
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
