import { useState } from "react";

function PostForm({ item, onSubmit, onCancel }) {
  const [caption, setCaption] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(caption);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid gray", padding: "1rem", margin: "10px 0" }}>
      <p>Posting: <strong>{item.name}</strong></p>
      <input
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <div>
        <button type="submit">Post</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default PostForm;