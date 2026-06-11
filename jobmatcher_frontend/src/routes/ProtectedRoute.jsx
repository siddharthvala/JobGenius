import { Navigate, Outlet } from "react-router-dom";
import { isTokenExpired, clearAuth } from "../utils/auth";

export default function ProtectedRoute({ role }) {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== role) {
      // Logged in but wrong role — send to their actual dashboard
      return <Navigate to={user.role === "RECRUITER" ? "/recruiter-dashboard" : "/find-jobs"} replace />;
    }
  }

  return <Outlet />;
}
