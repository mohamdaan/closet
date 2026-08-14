import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { id } = useParams();
  const { token, user: loggedInUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [commentsByPost, setCommentsByPost] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const profileId = id || loggedInUser?.id;

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${profileId}`, authHeader);
      setProfile(res.data);
      setName(res.data.name);
      setBio(res.data.bio || "");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
    setRequestSent(false);
  }, [profileId, token]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch("/users/me", { name, bio }, authHeader);
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    try {
      await api.patch(
        "/auth/password",
        { currentPassword, newPassword },
        authHeader
      );
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMessage(
        err.response?.data?.error || "Failed to update password"
      );
    }
  };

  const handleAddFriend = async () => {
    try {
      await api.post(
        "/friends/request",
        { receiver_id: profile.id },
        authHeader
      );
      setRequestSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send request");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`, authHeader);
      setProfile((prev) => ({
        ...prev,
        posts: prev.posts.filter((post) => post.id !== postId),
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete post");
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`, {}, authHeader);
      setProfile((prev) => ({
        ...prev,
        posts: prev.posts.map((post) => {
          if (post.id !== postId) return post;
          const nowLiked = !post.liked_by_me;
          return {
            ...post,
            liked_by_me: nowLiked,
            like_count: Number(post.like_count) + (nowLiked ? 1 : -1),
          };
        }),
      }));
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

      setProfile((prev) => ({
        ...prev,
        posts: prev.posts.map((post) =>
          post.id === postId
            ? { ...post, comment_count: Number(post.comment_count) + 1 }
            : post
        ),
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add comment");
    }
  };

  const inputClasses =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error ? (
          <p className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">
            {error}
          </p>
        ) : (
          <p className="text-slate-500">Loading...</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {error && (
        <p className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm">
          {error}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center mb-6">
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3 text-left">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className={inputClasses}
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              className={inputClasses}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800">
              {profile.name}
            </h1>
            <p className="text-slate-400">@{profile.username}</p>
            {profile.bio && (
              <p className="text-slate-600 mt-2">{profile.bio}</p>
            )}
            <p className="mt-3">
              <Link
                to={`/friends/user/${profile.id}`}
                className="text-indigo-600 font-medium hover:underline"
              >
                {profile.friend_count} friends
              </Link>
            </p>

            <div className="flex justify-center gap-2 mt-4">
              {profile.is_self && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Edit Profile
                </button>
              )}

              {!profile.is_self &&
                !profile.is_friend &&
                (requestSent ? (
                  <p className="text-emerald-600 font-medium text-sm self-center">
                    Friend request sent.
                  </p>
                ) : (
                  <button
                    onClick={handleAddFriend}
                    className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Add Friend
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      {profile.is_self && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-3 mt-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClasses}
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClasses}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Update Password
              </button>
              {passwordMessage && (
                <p className="text-sm text-slate-600">{passwordMessage}</p>
              )}
            </form>
          )}
        </div>
      )}

      <h3 className="font-semibold text-slate-700 mb-3">Posts</h3>
      {profile.posts.length === 0 ? (
        <p className="text-slate-500 text-sm">
          {profile.is_self || profile.is_friend
            ? "No posts yet."
            : "Add this person as a friend to see their posts."}
        </p>
      ) : (
        <div className="space-y-3">
          {profile.posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              {post.image_url && (
                <div className="w-full h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.item_name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-slate-700">
                  {post.item_name}{" "}
                  <span className="text-slate-400">({post.brand})</span>
                </p>
                {post.caption && (
                  <p className="text-slate-600 mt-1">{post.caption}</p>
                )}

                <div className="flex items-center gap-4 mt-3 text-sm">
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

                  {profile.is_self && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="ml-auto text-rose-500 hover:text-rose-600 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {openComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    {(commentsByPost[post.id] || []).map((comment) => (
                      <p key={comment.id} className="text-sm text-slate-700">
                        <span className="font-semibold">
                          {comment.username}
                        </span>{" "}
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
      )}
    </div>
  );
}

export default Profile;
