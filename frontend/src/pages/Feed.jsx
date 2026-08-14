import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ItemForm from "../components/ItemForm";

function Feed() {
  const { token, user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [commentsByPost, setCommentsByPost] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editingPost, setEditingPost] = useState(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const multipartHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const fetchFeed = async () => {
    try {
      const res = await api.get("/posts/feed", authHeader);
      setPosts(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load feed");
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [token]);

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`, {}, authHeader);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const nowLiked = !post.liked_by_me;
          return {
            ...post,
            liked_by_me: nowLiked,
            like_count: Number(post.like_count) + (nowLiked ? 1 : -1),
          };
        })
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to like post");
    }
  };

  const toggleComments = async (postId) => {
    const isOpen = openComments[postId];
    setOpenComments((prev) => ({ ...prev, [postId]: !isOpen }));

    if (!isOpen && !commentsByPost[postId]) {
      try {
        const res = await api.get(`/posts/${postId}/comments`, authHeader);
        setCommentsByPost((prev) => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load comments");
      }
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComment[postId];
    if (!content) return;

    try {
      await api.post(`/posts/${postId}/comments`, { content }, authHeader);
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      const res = await api.get(`/posts/${postId}/comments`, authHeader);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res.data }));

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comment_count: Number(post.comment_count) + 1 }
            : post
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add comment");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`, authHeader);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete post");
    }
  };

  const handleEditItem = async (formData) => {
    try {
      const res = await api.patch(
        `/items/${editingPost.item_id}`,
        formData,
        multipartHeader
      );
      const updatedItem = res.data;

      setPosts((prev) =>
        prev.map((post) =>
          post.item_id === updatedItem.id
            ? {
                ...post,
                item_name: updatedItem.name,
                brand: updatedItem.brand,
                category: updatedItem.category,
                description: updatedItem.description,
                product_url: updatedItem.product_url,
                image_url: updatedItem.image_url,
                item_type: updatedItem.item_type,
              }
            : post
        )
      );

      setEditingPost(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update item");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.name}
        </h1>
      </div>

      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">
          {error}
        </p>
      )}

      {editingPost && (
        <ItemForm
          initialData={{
            name: editingPost.item_name,
            brand: editingPost.brand,
            category: editingPost.category,
            description: editingPost.description,
            product_url: editingPost.product_url,
            image_url: editingPost.image_url,
            item_type: editingPost.item_type,
          }}
          onSubmit={handleEditItem}
          onCancel={() => setEditingPost(null)}
        />
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {post.image_url && (
              <div className="w-full h-80 bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.item_name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            <div className="p-5">
              <p className="font-semibold text-slate-800">{post.username}</p>
              <p className="text-slate-700 mt-1">
                {post.item_name}{" "}
                <span className="text-slate-400">({post.brand})</span>
              </p>
              {post.caption && (
                <p className="text-slate-600 mt-2">{post.caption}</p>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    post.liked_by_me
                      ? "text-rose-500"
                      : "text-slate-400 hover:text-rose-400"
                  }`}
                >
                  {post.liked_by_me ? "❤️" : "🤍"} {post.like_count}
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  💬 {post.comment_count}
                </button>

                {post.user_id === user.id && (
                  <div className="ml-auto flex gap-3">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="text-slate-400 hover:text-indigo-600 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-slate-400 hover:text-rose-500 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {openComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {(commentsByPost[post.id] || []).map((comment) => (
                    <p key={comment.id} className="text-sm text-slate-700">
                      <span className="font-semibold">{comment.username}</span>{" "}
                      {comment.content}
                    </p>
                  ))}

                  <div className="flex gap-2 mt-3">
                    <input
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
