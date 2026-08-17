import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-8"
      >
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">Closet</h1>
        <h2 className="text-slate-500 mb-6">Reset your password</h2>

        {error && (
          <p className="mb-4 px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">{error}</p>
        )}
        {message && (
          <p className="mb-4 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm">{message}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <button
          type="submit"
          className="w-full mt-5 px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Send Reset Link
        </button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Back to Log In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;