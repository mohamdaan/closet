import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute({ children }) {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}

export default PublicOnlyRoute;