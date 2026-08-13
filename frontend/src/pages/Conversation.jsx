import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Conversation() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/conversations/${id}/messages`, authHeader);
      setMessages(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load messages");
    }
  };

  const fetchOtherUser = async () => {
    try {
      const res = await api.get("/messages/conversations", authHeader);
      const convo = res.data.find((c) => String(c.id) === id);
      if (convo) setOtherUser(convo);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load conversation info");
    }
  };

  const markAsRead = async () => {
    try {
      await api.patch(`/messages/conversations/${id}/read`, {}, authHeader);
    } catch (err) {
      // non-critical, fail silently
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchOtherUser();
    markAsRead();

    intervalRef.current = setInterval(() => {
      fetchMessages();
      markAsRead();
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [id, token]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage) return;

    try {
      await api.post(`/messages/conversations/${id}/messages`, { content: newMessage }, authHeader);
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Link to="/messages">← Back to conversations</Link>
      <h2>{otherUser ? otherUser.name : "Chat"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ border: "1px solid gray", padding: "10px", minHeight: "300px" }}>
        {messages.map((msg) => {
          const isMine = msg.sender_id === user.id;
          return (
            <p key={msg.id} style={{ textAlign: isMine ? "right" : "left" }}>
              <strong>{isMine ? "You" : otherUser?.name || "Them"}:</strong> {msg.content}
              {isMine && (
                <span style={{ marginLeft: "6px", color: msg.read_at ? "dodgerblue" : "gray" }}>
                  {msg.read_at ? "✓✓" : "✓"}
                </span>
              )}
            </p>
          );
        })}
      </div>

      <form onSubmit={handleSend}>
        <input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Conversation;