import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { canAccessRoute } from "../utils/permissions";

export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-base text-gray-500 gap-2">
        <Loader2 size={20} className="animate-spin" /> Checking session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!canAccessRoute(user.role, location.pathname)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-surface-base text-gray-400 gap-2">
        <span className="text-lg font-medium text-gray-200">Access restricted</span>
        <span className="text-sm">Your role ({user.role}) does not have permission to view this page.</span>
      </div>
    );
  }

  return children;
}