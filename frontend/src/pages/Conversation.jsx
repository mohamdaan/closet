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
      // non-critical
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/messages" className="text-indigo-600 text-sm font-medium hover:underline">
        ← Back to conversations
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mt-2 mb-6">
        {otherUser ? otherUser.name : "Chat"}
      </h1>

      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">{error}</p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 min-h-[400px] flex flex-col gap-2">
        {messages.map((msg) => {
          const isMine = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
                {isMine && (
                  <span className={`ml-2 text-xs ${msg.read_at ? "text-indigo-200" : "text-indigo-300"}`}>
                    {msg.read_at ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-4">
        <input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Conversation;