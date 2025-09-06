// frontend/src/components/AuthModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Modal from "./common/Modal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function AuthModal({ onAuthSuccess, onClose }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/users/auth`, {
        name,
        password,
      });
      onAuthSuccess(response.data); // Pass the user data back to the parent
    } catch (err) {
      setError(err.response?.data?.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mt-2">
        <h3 className="text-2xl font-bold mb-4 text-center">Welcome!</h3>
        <p className="text-center text-text-muted mb-6">
          Login or create an account to contribute.
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
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-text-base text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="appearance-none border border-border-accent rounded w-full py-2 px-3 text-text-base leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
          >
            {loading ? "Authenticating..." : "Continue"}
          </button>
          {error && (
            <p className="text-danger text-center text-sm mt-4">{error}</p>
          )}
        </form>
      </div>
    </Modal>
  );
}

AuthModal.propTypes = {
  onAuthSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AuthModal;
