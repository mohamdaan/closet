import { useState } from "react";

const CATEGORIES = [
  "Shoes",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Accessories",
  "Bags",
  "Other",
];

function ItemForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [category, setCategory] = useState(
    initialData?.category || CATEGORIES[0]
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [productUrl, setProductUrl] = useState(initialData?.product_url || "");
  const [itemType, setItemType] = useState(
    initialData?.item_type || "WARDROBE"
  );
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.image_url || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("product_url", productUrl);
    formData.append("item_type", itemType);
    if (imageFile) formData.append("image", imageFile);
    onSubmit(formData);
  };

  const inputClasses =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 space-y-3"
    >
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={inputClasses}
      />
      <input
        placeholder="Brand"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className={inputClasses}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={inputClasses}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={inputClasses}
      />
      <input
        placeholder="Product URL"
        value={productUrl}
        onChange={(e) => setProductUrl(e.target.value)}
        className={inputClasses}
      />

      <select
        value={itemType}
        onChange={(e) => setItemType(e.target.value)}
        className={inputClasses}
      >
        <option value="WARDROBE">Wardrobe</option>
        <option value="WISHLIST">Wishlist</option>
      </select>

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm text-slate-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-medium hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg mt-3"
          />
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ItemForm;
