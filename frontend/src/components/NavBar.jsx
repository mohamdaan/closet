import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid gray" }}>
      <Link to="/feed">Feed</Link>
      <Link to="/items">Items</Link>
      <Link to="/friends">Friends</Link>
      <Link to="/messages">Messages</Link>
      <span style={{ marginLeft: "auto" }}>
        {user.name} <button onClick={handleLogout}>Log Out</button>
      </span>
    </nav>
  );
}

export default Navbar;