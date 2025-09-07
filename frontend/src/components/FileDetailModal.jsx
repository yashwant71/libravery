// frontend/src/components/FileDetailModal.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { fileShape, libraryShape } from "../utils/propTypes";
import FileActions from "./FileActions";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function FileDetailModal({
  file,
  user,
  library,
  onClose,
  onAuthRequired,
  onFileUpdate,
  onFileDelete,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!file) return;
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/comments/${file._id}`);
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    fetchComments();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !user._id) return;

    try {
      const response = await axios.post(`${BACKEND_URL}/comments/${file._id}`, {
        userId: user._id,
        text: newComment,
      });
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to permanently delete this file?")
    ) {
      try {
        await axios.delete(`${BACKEND_URL}/files/${file._id}`);
        onFileDelete(file._id); // Notify parent to remove file from state
        onClose(); // Close the modal
      } catch (err) {
        console.error("Error deleting file:", err);
        alert("Failed to delete file.");
      }
    }
  };
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- Permission Logic ---
  const isUploader = user?._id === file.uploadedBy?._id;
  const isAdmin = user?.isAdmin === true;
  const isLibraryOwner = user?._id === library?.owner?._id;
  const canDelete = isUploader || isAdmin || isLibraryOwner;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background-primary rounded-lg flex flex-col w-full h-full max-w-4xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
              {file.uploadedBy?.name
                ? file.uploadedBy.name.charAt(0).toUpperCase()
                : "?"}
            </div>
            <div>
              <p className="font-bold text-text-base leading-tight">
                {file.uploadedBy?.name || "Anonymous"}
              </p>
              <p className="text-xs text-text-muted leading-tight">
                Uploaded on {formatDate(file.uploadedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-danger hover:text-danger-hover transition-colors"
                title="Delete File"
              >
                <FaTrash size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-base"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="bg-black flex items-center justify-center">
            <img
              src={file.url}
              alt={file.originalName}
              className="max-h-[60vh] max-w-full object-contain"
            />
          </div>

          <div className="p-4">
            <h3 className="font-bold mb-2">{file.originalName}</h3>
            {file.description && (
              <p className="text-sm text-text-muted mb-4">{file.description}</p>
            )}
            {/* --- THE FIX IS HERE (for likes) --- */}
            {/* Only show the like/dislike actions if the user is logged in */}
            {user && (
              <div className="my-4">
                <FileActions
                  file={file}
                  user={user}
                  onUpdate={onFileUpdate}
                  onAuthRequired={onAuthRequired}
                />
              </div>
            )}

            <h4 className="font-bold mt-6 mb-4 border-t border-border pt-4">
              Comments ({comments.length})
            </h4>

            {loading ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-background-muted rounded-full flex items-center justify-center text-text-base font-bold">
                      {comment.user?.name
                        ? comment.user.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {comment.user?.name || "Anonymous"}
                      </p>
                      <p className="text-sm text-text-muted">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                No comments yet. Be the first!
              </p>
            )}
          </div>
        </div>

        {/* --- THE FIX IS HERE (for comments) --- */}
        {/* Only show the comment input form if the user is logged in */}
        {user ? (
          <div className="p-4 border-t border-border mt-auto flex-shrink-0">
            <form
              onSubmit={handleSubmitComment}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={newComment}
                // This was the bug: it was trying to read from e.Targate instead of e.target
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow appearance-none border border-border-accent rounded-full py-2 px-4 text-text-base leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white rounded-full p-3 hover:bg-primary-hover transition-colors"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        ) : (
          // Show a disabled-looking prompt for non-logged-in users
          <div className="p-4 border-t border-border mt-auto flex-shrink-0">
            <div
              onClick={onAuthRequired}
              className="w-full text-center text-text-muted bg-background-muted py-2 px-4 rounded-full cursor-pointer hover:bg-border"
            >
              Login to add a comment
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

FileDetailModal.propTypes = {
  file: fileShape.isRequired,
  user: PropTypes.shape({ _id: PropTypes.string, isAdmin: PropTypes.bool }),
  library: libraryShape,
  onClose: PropTypes.func.isRequired,
  onAuthRequired: PropTypes.func.isRequired,
  onFileUpdate: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired,
};

export default FileDetailModal;
