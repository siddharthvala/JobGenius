import { Outlet } from "react-router-dom";
import RecruiterNavbar from "../common/RecruiterNavbar";

export default function RecruiterLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Navbar — shared across all recruiter pages */}
      <RecruiterNavbar />

      {/* Page content rendered here */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
