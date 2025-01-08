import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../firebase/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

if (loading) {
  return <h1>Loading...</h1>;
}

  return user ? (
    children
  ) : (
    <Navigate to="/" state={{ from: location.pathname }} />
  );
}

export default ProtectedRoute;
