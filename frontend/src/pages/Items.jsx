import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ItemForm from "../components/ItemForm";
import PostForm from "../components/PostForm";

function Items() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("WARDROBE");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [postingItem, setPostingItem] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const multipartHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const fetchItems = async () => {
    try {
      const res = await api.get("/items", authHeader);
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleAdd = async (formData) => {
    try {
      await api.post("/items", formData, multipartHeader);
      setShowAddForm(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add item");
    }
  };

  const handleEdit = async (formData) => {
    try {
      await api.patch(`/items/${editingItem.id}`, formData, multipartHeader);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update item");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`, authHeader);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete item");
    }
  };

  const handlePost = async (caption) => {
    try {
      await api.post(
        "/posts",
        { item_id: postingItem.id, caption },
        authHeader
      );
      setPostingItem(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post");
    }
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestions(null);
    setError("");
    try {
      const res = await api.post("/stylist/suggest", {}, authHeader);
      setSuggestions(res.data.outfits);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const filteredItems = items.filter((item) => item.item_type === activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Items</h1>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab("WARDROBE")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "WARDROBE"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
          }`}
        >
          Wardrobe
        </button>
        <button
          onClick={() => setActiveTab("WISHLIST")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "WISHLIST"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
          }`}
        >
          Wishlist
        </button>
        <button
          onClick={handleGetSuggestions}
          disabled={loadingSuggestions}
          className="px-4 py-2 rounded-lg font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {loadingSuggestions ? "Thinking..." : "✨ Get Outfit Ideas"}
        </button>
        <button
          onClick={() => setShowAddForm(true)}
          className="ml-auto px-4 py-2 rounded-lg font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
        >
          + Add Item
        </button>
      </div>

      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">
          {error}
        </p>
      )}

      {suggestions && (
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-slate-700">Outfit Ideas</h3>
          {suggestions.map((outfit, index) => (
            <div
              key={index}
              className="bg-white border border-violet-200 rounded-xl shadow-sm p-4"
            >
              <p className="font-semibold text-violet-700 mb-2">
                Outfit {index + 1}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {outfit.items.map((item) => (
                  <span
                    key={item.id}
                    className="px-2 py-1 bg-violet-50 text-violet-700 rounded-lg text-sm"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <p className="text-slate-600 text-sm">{outfit.description}</p>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <ItemForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} />
      )}

      {editingItem && (
        <ItemForm
          initialData={editingItem}
          onSubmit={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {postingItem && (
        <PostForm
          item={postingItem}
          onSubmit={handlePost}
          onCancel={() => setPostingItem(null)}
        />
      )}

      {filteredItems.length === 0 ? (
        <p className="text-slate-500">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {item.image_url ? (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  No image
                </div>
              )}

              <div className="p-4">
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {item.brand} — {item.category}
                </p>
                {item.description && (
                  <p className="text-sm text-slate-600 mt-1">
                    {item.description}
                  </p>
                )}

                <div className="flex gap-2 mt-3 text-sm">
                  <button
                    onClick={() => setPostingItem(item)}
                    className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors"
                  >
                    Post
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium transition-colors ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Items;
