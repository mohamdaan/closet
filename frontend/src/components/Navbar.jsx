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

  const linkClasses =
    "text-slate-600 hover:text-indigo-600 font-medium transition-colors";

  return (
    <nav className="flex items-center gap-6 px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
      <Link to="/feed" className="text-xl font-bold text-indigo-600 mr-2">
        Closet
      </Link>
      <Link to="/feed" className={linkClasses}>
        Feed
      </Link>
      <Link to="/items" className={linkClasses}>
        Items
      </Link>
      <Link to="/friends" className={linkClasses}>
        Friends
      </Link>
      <Link to="/messages" className={linkClasses}>
        Messages
      </Link>
      <Link to="/profile" className={linkClasses}>
        Profile
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-slate-700 font-medium">{user.name}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
