// src/components/layout/CandidateLayout.jsx

import { Outlet } from "react-router-dom";
import CandidateNavbar from "../common/CandidateNavbar";

export default function CandidateLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Navbar — shared across all candidate pages */}
      <CandidateNavbar />

      {/* Page content rendered here */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
