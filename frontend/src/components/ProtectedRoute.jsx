import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";
import PageState from "./ui/PageState";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageState type="loading" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
