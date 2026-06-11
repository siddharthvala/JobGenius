// src/components/RecruiterNavbar.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  ClipboardList,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import logo from "../../assets/Images/Horizontal_NoBG_Logo.png";
import NotificationBell from "./NotificationBell";

export default function RecruiterNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.name || user?.username || "Recruiter";
  const initial = name.charAt(0).toUpperCase();

  const navLinks = [
    { to: "/recruiter-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/post-job", label: "Post Job", icon: BriefcaseBusiness },
    { to: "/manage-jobs", label: "Manage Jobs", icon: ClipboardList },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm hover:shadow-md transition-all ">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1600px] px-3 sm:px-4 lg:px-6 xl:px-8 h-12 sm:h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="shrink-0">
            <img
              src={logo}
              alt="JobGenius"
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
            />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-blue-600 hover:bg-gray-100 transition-all duration-200
                ${isActive(to) ? "text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
              >
                <Icon size={16} className="hidden sm:block" />
                <span className="text-xs lg:text-sm font-semibold">
                  {label}
                </span>
                {/* Blue underline — matching second image */}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full translate-y-[-2px] transition-all duration-300" />
                )}
              </Link>
            ))}
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5
              rounded-full border border-gray-200 bg-white shadow-sm
              hover:bg-gray-50 hover:shadow-md active:scale-[0.96]
              transition-all duration-200 cursor-pointer"
          >
            {/* Icon */}
            <span className="text-lg leading-none">☰</span>

            {/* Label */}
            <span className="text-xs font-medium text-gray-600">Menu</span>
          </button>

          {/* Notification Bell + User Dropdown */}
          <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="relative shrink-0 lg:pr-5">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 h-9 px-2.5 rounded-lg flex items-center hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initial}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-gray-800 leading-tight">
                  {name}
                </p>
                <p className="text-xs text-gray-400 leading-tight">Recruiter</p>
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
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-1 shadow-sm">
          <div className="space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl 
          transition-all duration-200 group
          ${
            location.pathname.startsWith(to)
              ? "bg-blue-50 text-blue-600"
              : "text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
          }`}
              >
                {/* Icon */}
                <div
                  className={`p-2 rounded-lg 
            ${
              location.pathname.startsWith(to)
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
            }`}
                >
                  <Icon size={18} />
                </div>

                {/* Text */}
                <span className="text-sm font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
