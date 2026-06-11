// src/components/common/CandidateNavbar.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Layers,
  BarChart2,
  ClipboardCheck,
  ChevronDown,
  LogOut,
  User,
  Settings,
  FileSearch,
} from "lucide-react";
import logo from "../../assets/Images/Horizontal_NoBG_Logo.png";
import API from "../../services/api";
import NotificationBell from "./NotificationBell";

export default function CandidateNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const name = storedUser?.username || storedUser?.name || "Candidate";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    API.get("/users/me")
      .then((res) => setProfileImageUrl(res.data.profileImageUrl || null))
      .catch(() => {});
  }, []);

  const navLinks = [
    { to: "/find-jobs", label: "Find Jobs", icon: Search },
    { to: "/resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
    { to: "/skill-gap", label: "Skill Gap", icon: BarChart2 },
    { to: "/my-applications", label: "My Applications", icon: ClipboardCheck },
    { to: "/skill-management", label: "Skill Management", icon: Layers },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm hover:shadow-md transition-all">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1600px] px-3 sm:px-4 lg:px-6 xl:px-8 h-12 sm:h-14 flex items-center justify-between gap-4">
          {/* ── Logo ── */}
          <Link to="/candidate-dashboard" className="shrink-0">
            <img
              src={logo}
              alt="JobGenius"
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
            />
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 px-2 xl:px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  hover:text-blue-600 hover:bg-gray-100
                  ${isActive(to) ? "text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
              >
                <Icon size={16} className="hidden xl:block" />
                <span className="text-xs xl:text-sm font-semibold">
                  {label}
                </span>

                {/* Blue active underline */}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full translate-y-[-2px] transition-all duration-300" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5
              rounded-full border border-gray-200 bg-white shadow-sm
              hover:bg-gray-50 hover:shadow-md active:scale-[0.96]
              transition-all duration-200"
          >
            <span className="text-lg leading-none">☰</span>
            <span className="text-xs font-medium text-gray-600">Menu</span>
          </button>

          {/* ── Notification Bell + User Dropdown ── */}
          <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="relative shrink-0 lg:pr-5">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 h-9 px-2.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initial}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-gray-800 leading-tight">
                  {name}
                </p>
                <p className="text-xs text-gray-400 leading-tight">Candidate</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 min-w-[180px] w-full bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={15} className="text-gray-400" /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={15} className="text-gray-400" /> Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-1 shadow-sm">
          <div className="space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl
                  transition-all duration-200 group
                  ${
                    isActive(to)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
                  }`}
              >
                <div
                  className={`p-2 rounded-lg
                  ${
                    isActive(to)
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-sm font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
