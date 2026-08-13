// src/pages/Feed.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Feed() {
  const { token, user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/posts/feed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load feed");
      }
    };

    fetchFeed();
  }, [token]);

  return (
    <div>
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
        </div>
      ))}
    </div>
  );
}

export default Feed;
