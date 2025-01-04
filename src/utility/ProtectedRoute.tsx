import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../firebase/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return user ? (
    children
  ) : (
    <Navigate to="/" state={{ from: location.pathname }} />
  );
}

export default ProtectedRoute;
