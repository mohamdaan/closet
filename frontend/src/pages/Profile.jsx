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
      await api.patch("/auth/password", { currentPassword, newPassword }, authHeader);
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMessage(err.response?.data?.error || "Failed to update password");
    }
  };

  const handleAddFriend = async () => {
    try {
      await api.post("/friends/request", { receiver_id: profile.id }, authHeader);
      setRequestSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send request");
    }
  };

  if (!profile) {
    return <div style={{ padding: "1rem" }}>{error ? <p style={{ color: "red" }}>{error}</p> : "Loading..."}</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {isEditing ? (
        <form onSubmit={handleSaveProfile}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
          <div>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <h2>{profile.name}</h2>
          <p>@{profile.username}</p>
          {profile.bio && <p>{profile.bio}</p>}
          <p>
            <Link to={`/friends/user/${profile.id}`}>{profile.friend_count} friends</Link>
          </p>

          {profile.is_self && (
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}

          {!profile.is_self && !profile.is_friend && (
            requestSent ? (
              <p>Friend request sent.</p>
            ) : (
              <button onClick={handleAddFriend}>Add Friend</button>
            )
          )}
        </>
      )}

      {profile.is_self && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} style={{ marginTop: "0.5rem" }}>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="submit">Update Password</button>
              {passwordMessage && <p>{passwordMessage}</p>}
            </form>
          )}
        </div>
      )}

      <h3 style={{ marginTop: "1.5rem" }}>Posts</h3>
      {profile.posts.length === 0 ? (
        <p>
          {profile.is_self || profile.is_friend
            ? "No posts yet."
            : "Add this person as a friend to see their posts."}
        </p>
      ) : (
        profile.posts.map((post) => (
          <div key={post.id} style={{ border: "1px solid gray", margin: "10px 0", padding: "10px" }}>
            <p>{post.item_name} ({post.brand})</p>
            <p>{post.caption}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Profile;