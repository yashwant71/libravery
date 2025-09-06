// frontend/src/components/UserInputModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import Modal from "./common/Modal";

function UserInputModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mt-2">
        <h3 className="text-2xl font-bold mb-4 text-center">Welcome!</h3>
        <p className="text-center text-text-muted mb-6">
          Please enter your name to contribute.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="userName"
              className="block text-text-base text-sm font-bold mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="appearance-none border border-border-accent rounded w-full py-2 px-3 text-text-base leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., John Doe"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Continue
          </button>
        </form>
      </div>
    </Modal>
  );
}

UserInputModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserInputModal;
