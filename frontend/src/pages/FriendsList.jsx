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
      await api.post(
        "/friends/request",
        { receiver_id: Number(id) },
        authHeader
      );
      setRequestSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send request");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Friends</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {blocked && (
        <div>
          <p>You must be friends to view this list.</p>
          {requestSent ? (
            <p>Friend request sent.</p>
          ) : (
            <button onClick={handleAddFriend}>Add Friend</button>
          )}
        </div>
      )}

      {friends.map((f) => (
        <div key={f.id}>
          <Link to={`/profile/${f.id}`}>
            {f.name} (@{f.username})
          </Link>
        </div>
      ))}
    </div>
  );
}

export default FriendsList;
