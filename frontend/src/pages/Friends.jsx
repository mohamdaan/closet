import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Friends</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <section>
        <h3>Search for people</h3>
        <form onSubmit={handleSearch}>
          <input
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {searchResults.map((u) => (
          <div
            key={u.id}
            style={{ display: "flex", gap: "1rem", alignItems: "center" }}
          >
            <span>
              {u.name} (@{u.username})
            </span>
            <button onClick={() => handleSendRequest(u.id)}>Add Friend</button>
          </div>
        ))}
      </section>

      <section>
        <h3>Pending Requests</h3>
        {pending.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          pending.map((req) => (
            <div
              key={req.id}
              style={{ display: "flex", gap: "1rem", alignItems: "center" }}
            >
              <span>
                {req.name} (@{req.username})
              </span>
              <button onClick={() => handleRespond(req.id, "accepted")}>
                Accept
              </button>
              <button onClick={() => handleRespond(req.id, "rejected")}>
                Reject
              </button>
            </div>
          ))
        )}
      </section>

      <section>
        <h3>My Friends</h3>
        {friends.length === 0 ? (
          <p>No friends yet.</p>
        ) : (
          friends.map((f) => (
            <div
              key={f.id}
              style={{ display: "flex", gap: "1rem", alignItems: "center" }}
            >
              <span>
                {f.name} (@{f.username})
              </span>
              <button onClick={() => handleMessage(f.id)}>Message</button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Friends;
