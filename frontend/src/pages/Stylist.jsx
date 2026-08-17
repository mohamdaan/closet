import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import OutfitCollage from "../components/OutfitCollage";

function Stylist() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/stylist/chat/history", authHeader);
        setMessages(res.data);
      } catch (err) {
        setError("Failed to load chat history");
      }
    };
    fetchHistory();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/stylist/chat",
        { content: input },
        authHeader
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.reply,
          outfitItems: res.data.outfitItems,
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">✨ Stylist</h1>

      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">
          {error}
        </p>
      )}

      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-10">
            Ask me for outfit ideas, styling advice, or what to wear from your
            wardrobe.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-sm px-4 py-2 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-violet-50 text-slate-800 rounded-bl-sm"
              }`}
            >
              <p>{msg.content}</p>

              {msg.outfitItems && msg.outfitItems.length > 0 && (
                <OutfitCollage items={msg.outfitItems} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-violet-50 text-slate-400 px-4 py-2 rounded-2xl text-sm">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-4">
        <input
          placeholder="Ask your stylist..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Stylist;
