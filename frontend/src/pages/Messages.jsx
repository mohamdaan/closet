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
    <div style={{ padding: "1rem" }}>
      <h2>Messages</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        conversations.map((c) => (
          <Link
            key={c.id}
            to={`/messages/${c.id}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid gray",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span><strong>{c.name}</strong> (@{c.username})</span>
            {Number(c.unread_count) > 0 && (
              <span
                style={{
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 8px",
                  fontSize: "0.8rem",
                }}
              >
                {c.unread_count}
              </span>
            )}
          </Link>
        ))
      )}
    </div>
  );
}

export default Messages;