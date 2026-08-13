import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Feed() {
  const { token, user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [commentsByPost, setCommentsByPost] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

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

      // Update just this post's like state locally, instead of refetching the whole feed
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add comment");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={logout}>Log Out</button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {posts.map((post) => (
        <div
          key={post.id}
          style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}
        >
          <p>
            <strong>{post.username}</strong>
          </p>
          <p>
            {post.item_name} ({post.brand})
          </p>
          <p>{post.caption}</p>

          <button
            onClick={() => handleLike(post.id)}
            style={{
              fontWeight: post.liked_by_me ? "bold" : "normal",
              color: post.liked_by_me ? "red" : "inherit",
            }}
          >
            {post.liked_by_me ? "❤️ Liked" : "🤍 Like"} ({post.like_count})
          </button>

          <button onClick={() => toggleComments(post.id)}>
            💬 {openComments[post.id] ? "Hide" : "Show"} Comments
          </button>

          {openComments[post.id] && (
            <div style={{ marginTop: "10px" }}>
              {(commentsByPost[post.id] || []).map((comment) => (
                <p key={comment.id}>
                  <strong>{comment.username}:</strong> {comment.content}
                </p>
              ))}

              <input
                placeholder="Add a comment..."
                value={newComment[post.id] || ""}
                onChange={(e) =>
                  setNewComment((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
              />
              <button onClick={() => handleAddComment(post.id)}>Send</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Feed;
