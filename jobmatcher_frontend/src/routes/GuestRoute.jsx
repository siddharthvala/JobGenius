import { Navigate, Outlet } from "react-router-dom";
import { isTokenExpired, clearAuth } from "../utils/auth";

export default function GuestRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    if (isTokenExpired(token)) {
      clearAuth();
      return <Outlet />;
    }
    const destination =
      user.role === "RECRUITER" ? "/recruiter-dashboard" : "/find-jobs";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
