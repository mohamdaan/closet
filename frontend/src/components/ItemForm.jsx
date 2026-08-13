import { useState } from "react";

function ItemForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [productUrl, setProductUrl] = useState(initialData?.product_url || "");
  const [itemType, setItemType] = useState(initialData?.item_type || "WARDROBE");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      brand,
      category,
      description,
      image_url: imageUrl,
      product_url: productUrl,
      item_type: itemType,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid gray", padding: "1rem", margin: "1rem 0" }}>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
      <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <input placeholder="Product URL" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} />
      <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
        <option value="WARDROBE">Wardrobe</option>
        <option value="WISHLIST">Wishlist</option>
      </select>
      <div>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default ItemForm;