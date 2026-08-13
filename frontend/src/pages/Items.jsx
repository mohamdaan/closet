import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ItemForm from "../components/ItemForm";

function Items() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("WARDROBE");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

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
      await api.post("/items", formData, authHeader);
      setShowAddForm(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add item");
    }
  };

  const handleEdit = async (formData) => {
    try {
      await api.patch(`/items/${editingItem.id}`, formData, authHeader);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update item");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`, authHeader);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete item");
    }
  };

  const filteredItems = items.filter((item) => item.item_type === activeTab);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>My Items</h2>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("WARDROBE")}
          style={{ fontWeight: activeTab === "WARDROBE" ? "bold" : "normal" }}
        >
          Wardrobe
        </button>
        <button
          onClick={() => setActiveTab("WISHLIST")}
          style={{ fontWeight: activeTab === "WISHLIST" ? "bold" : "normal" }}
        >
          Wishlist
        </button>
        <button onClick={() => setShowAddForm(true)}>+ Add Item</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

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

      {filteredItems.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid gray",
              margin: "10px 0",
              padding: "10px",
            }}
          >
            <p>
              <strong>{item.name}</strong>
            </p>
            <p>
              {item.brand} — {item.category}
            </p>
            {item.description && <p>{item.description}</p>}
            <button onClick={() => setEditingItem(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Items;
