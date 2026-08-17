import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }

    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setMessage("Password reset successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-8"
      >
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">Closet</h1>
        <h2 className="text-slate-500 mb-6">Set a new password</h2>

        {error && (
          <p className="mb-4 px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm">
            {message}
          </p>
        )}

        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
        />

        <button
          type="submit"
          className="w-full mt-5 px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Reset Password
        </button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Back to Log In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPassword;
