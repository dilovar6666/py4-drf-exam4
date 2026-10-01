import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import PageState from "./ui/PageState";

export default function StaffRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageState type="loading" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_staff) return <Navigate to="/" replace />;
  return children;
}
