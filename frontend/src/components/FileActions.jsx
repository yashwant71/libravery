// frontend/src/components/FileActions.jsx
import PropTypes from "prop-types";
import axios from "axios";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { fileShape } from "../utils/propTypes";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function FileActions({ file, user, onUpdate, onAuthRequired }) {
  if (!file) return null;

  const handleAction = async (action) => {
    if (!user || !user._id) {
      onAuthRequired();
      return;
    }
    try {
      const response = await axios.put(
        `${BACKEND_URL}/files/${file._id}/like`,
        { userId: user._id, action }
      );
      onUpdate(response.data);
    } catch (err) {
      console.error(`Error performing action: ${action}`, err);
    }
  };

  const userHasLiked =
    user && file.likes?.some((like) => like.user === user._id);
  const userHasDisliked =
    user && file.dislikes?.some((dislike) => dislike.user === user._id);

  const buttonVariants = {
    rest: { scale: 1 },
    tap: { scale: 0.9 },
  };

  const countVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="flex w-full border-t border-b border-border ">
      {/* --- Like Button Block --- */}
      <motion.button
        onClick={() => handleAction("like")}
        // --- THE FIX IS HERE: Use full class names in the ternary ---
        className={`flex-1 flex items-center justify-center gap-2 py-2 transition-colors duration-200 hover:bg-background-muted ${
          userHasLiked ? "text-primary" : "text-text-muted"
        }`}
        aria-label="Like"
        variants={buttonVariants}
        initial="rest"
        whileTap="tap"
      >
        <FaThumbsUp />
        <div className="relative h-5 w-6 flex items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.span
              key={file.likes?.length || 0}
              className="absolute text-sm font-semibold"
              variants={countVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "tween", duration: 0.15 }}
            >
              {file.likes?.length || 0}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>

      <div className="w-px bg-border"></div>

      {/* --- Dislike Button Block --- */}
      <motion.button
        onClick={() => handleAction("dislike")}
        // --- THE FIX IS HERE: Use full class names in the ternary ---
        className={`flex-1 flex items-center justify-center gap-2 py-2 transition-colors duration-200 hover:bg-background-muted ${
          userHasDisliked ? "text-danger" : "text-text-muted"
        }`}
        aria-label="Dislike"
        variants={buttonVariants}
        initial="rest"
        whileTap="tap"
      >
        <FaThumbsDown />
        <div className="relative h-5 w-6 flex items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.span
              key={file.dislikes?.length || 0}
              className="absolute text-sm font-semibold"
              variants={countVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "tween", duration: 0.15 }}
            >
              {file.dislikes?.length || 0}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}

FileActions.propTypes = {
  file: fileShape.isRequired,
  user: PropTypes.shape({ _id: PropTypes.string }),
  onUpdate: PropTypes.func.isRequired,
  onAuthRequired: PropTypes.func.isRequired,
};

export default FileActions;
