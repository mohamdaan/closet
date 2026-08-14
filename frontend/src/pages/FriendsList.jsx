import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function FriendsList() {
  const { id } = useParams();
  const { token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await api.get(`/friends/user/${id}`, authHeader);
        setFriends(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setBlocked(true);
        } else {
          setError(err.response?.data?.error || "Failed to load friends");
        }
      }
    };

    fetchFriends();
  }, [id, token]);

  const handleAddFriend = async () => {
    try {
      await api.post("/friends/request", { receiver_id: Number(id) }, authHeader);
      setRequestSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send request");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Friends</h1>

      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">{error}</p>
      )}

      {blocked ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-slate-500 mb-3">You must be friends to view this list.</p>
          {requestSent ? (
            <p className="text-emerald-600 font-medium text-sm">Friend request sent.</p>
          ) : (
            <button
              onClick={handleAddFriend}
              className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Add Friend
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-1">
          {friends.map((f) => (
            <div key={f.id} className="py-1">
              <Link to={`/profile/${f.id}`} className="text-slate-700 hover:text-indigo-600 transition-colors">
                {f.name} <span className="text-slate-400">(@{f.username})</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendsList;