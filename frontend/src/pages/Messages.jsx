import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Messages() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/messages/conversations", authHeader);
        setConversations(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load conversations");
      }
    };

    fetchConversations();
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Messages</h1>

      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">{error}</p>
      )}

      {conversations.length === 0 ? (
        <p className="text-slate-500">No conversations yet.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/messages/${c.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-700">
                <span className="font-semibold">{c.name}</span>{" "}
                <span className="text-slate-400">(@{c.username})</span>
              </span>
              {Number(c.unread_count) > 0 && (
                <span className="bg-rose-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                  {c.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Messages;