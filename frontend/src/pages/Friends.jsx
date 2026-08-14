import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Friends() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchFriends = async () => {
    try {
      const res = await api.get("/friends", authHeader);
      setFriends(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load friends");
    }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get("/friends/pending", authHeader);
      setPending(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load requests");
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, [token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const res = await api.get(
        `/users/search?query=${searchQuery}`,
        authHeader
      );
      setSearchResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Search failed");
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      await api.post(
        "/friends/request",
        { receiver_id: receiverId },
        authHeader
      );
      setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send request");
    }
  };

  const handleRespond = async (friendshipId, status) => {
    try {
      await api.patch(
        `/friends/${friendshipId}/respond`,
        { status },
        authHeader
      );
      fetchPending();
      fetchFriends();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to respond");
    }
  };

  const handleMessage = async (friendId) => {
    try {
      const res = await api.post(
        "/messages/conversations",
        { other_user_id: friendId },
        authHeader
      );
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start conversation");
    }
  };

  const sectionClasses =
    "bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6";
  const rowClasses = "flex items-center justify-between py-2";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Friends</h1>

      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">
          {error}
        </p>
      )}

      <div className={sectionClasses}>
        <h3 className="font-semibold text-slate-700 mb-3">Search for people</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-1">
            {searchResults.map((u) => (
              <div key={u.id} className={rowClasses}>
                <span className="text-slate-700">
                  {u.name}{" "}
                  <span className="text-slate-400">(@{u.username})</span>
                </span>
                <button
                  onClick={() => handleSendRequest(u.id)}
                  className="px-3 py-1 text-sm rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={sectionClasses}>
        <h3 className="font-semibold text-slate-700 mb-3">Pending Requests</h3>
        {pending.length === 0 ? (
          <p className="text-slate-500 text-sm">No pending requests.</p>
        ) : (
          <div className="space-y-1">
            {pending.map((req) => (
              <div key={req.id} className={rowClasses}>
                <span className="text-slate-700">
                  {req.name}{" "}
                  <span className="text-slate-400">(@{req.username})</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(req.id, "accepted")}
                    className="px-3 py-1 text-sm rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, "rejected")}
                    className="px-3 py-1 text-sm rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={sectionClasses}>
        <h3 className="font-semibold text-slate-700 mb-3">My Friends</h3>
        {friends.length === 0 ? (
          <p className="text-slate-500 text-sm">No friends yet.</p>
        ) : (
          <div className="space-y-1">
            {friends.map((f) => (
              <div key={f.id} className={rowClasses}>
                <Link
                  to={`/profile/${f.id}`}
                  className="text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  {f.name}{" "}
                  <span className="text-slate-400">(@{f.username})</span>
                </Link>
                <button
                  onClick={() => handleMessage(f.id)}
                  className="px-3 py-1 text-sm rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
