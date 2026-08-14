import { useState } from "react";

function PostForm({ item, onSubmit, onCancel }) {
  const [caption, setCaption] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(caption);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6"
    >
      <p className="text-sm text-slate-500 mb-3">
        Posting:{" "}
        <span className="font-semibold text-slate-800">{item.name}</span>
      </p>
      <input
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Post
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

export default PostForm;
