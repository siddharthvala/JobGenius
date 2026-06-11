import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_STYLE = {
  APPLICATION_APPLIED: { dot: "bg-blue-500", icon: "🚀" },
  APPLICATION_SCREENING: { dot: "bg-orange-500", icon: "📋" },
  APPLICATION_INTERVIEW: { dot: "bg-green-500", icon: "🎯" },
  APPLICATION_ACCEPTED: { dot: "bg-emerald-500", icon: "🏆" },
  APPLICATION_REJECTED: { dot: "bg-red-400", icon: "📩" },
  NEW_APPLICANT: { dot: "bg-purple-500", icon: "👤" },
  APPLICATION_WITHDRAWN: { dot: "bg-gray-400", icon: "↩️" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n) => {
    if (!n.read) await handleMarkAsRead(n.id);
    setOpen(false);
    if (n.redirectUrl) navigate(n.redirectUrl);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin text-blue-500" />{" "}
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
                  🔔
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 text-center">
                  You'll see updates about your applications here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const style = TYPE_STYLE[n.type] || {
                  dot: "bg-gray-400",
                  icon: "🔔",
                };
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0
                      ${!n.read ? "bg-blue-50/40" : ""}`}
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-base mt-0.5">
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-tight truncate ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 mt-2 ${style.dot}`}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
