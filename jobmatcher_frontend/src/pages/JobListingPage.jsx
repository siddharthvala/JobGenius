// src/pages/JobListingPage.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  // navigate,
  List,
  BadgeCheck,
  IndianRupee,
  TrendingUp,
  Eye,
  PhoneCall,
  ArrowRight,
  Star,
  Loader2,
  AlertCircle,
  X,
  SlidersHorizontal,
  Building2,
  Monitor,
  CalendarDays,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return "";
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getSkillNames(job) {
  const raw = job.requiredSkills || job.skills || [];
  return raw
    .map((s) => (typeof s === "string" ? s : s?.name || s?.skillName || ""))
    .filter(Boolean);
}

function fmtSalary(s) {
  if (s == null) return null;
  const yearly = s * 12;
  const yearlyFmt =
    yearly >= 100000
      ? `₹${(yearly / 100000).toFixed(1).replace(/\.0$/, "")}L/year`
      : `₹${yearly.toLocaleString("en-IN")}/year`;
  return `₹${s.toLocaleString("en-IN")}/month • ${yearlyFmt}`;
}

function fmtDate(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function fmtExp(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (n === 0) return "Fresher";
  if (n === 1) return "1 Year";
  if (n >= 5) return `${n}+ Years`;
  return `${n} Years`;
}

const JOB_TYPE_STYLE = {
  FULL_TIME: { bg: "#EDE9FE", text: "#5B21B6" },
  PART_TIME: { bg: "#FEF3C7", text: "#92400E" },
  CONTRACT: { bg: "#FFF3E0", text: "#B45309" },
  INTERNSHIP: { bg: "#E0F2FE", text: "#0369A1" },
  FREELANCE: { bg: "#F0FDF4", text: "#166534" },
  REMOTE: { bg: "#ECFDF5", text: "#065F46" },
};

function JTypeBadge({ value }) {
  const key = value?.toUpperCase().replace(/[\s-]/g, "_");
  const color = JOB_TYPE_STYLE[key] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      style={{ backgroundColor: color.bg, color: color.text }}
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0"
    >
      {value?.replace(/_/g, " ")}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Match Ring
// ─────────────────────────────────────────────────────────────────────────────

function MatchRing({ pct = 0 }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const color = pct >= 85 ? "#16a34a" : pct >= 70 ? "#2563eb" : "#f59e0b";
  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center shrink-0">
      <svg width="72" height="72" className="-rotate-90 absolute inset-0">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="5"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-gray-900 leading-none">
          {pct}%
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Match</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Type Dropdown (hero search bar)
// ─────────────────────────────────────────────────────────────────────────────

function JobTypeDropdown({ value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <Briefcase
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
      />
      <div
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white cursor-pointer select-none transition-all
          ${open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span
          className={`truncate ${value ? "text-gray-800" : "text-gray-400"}`}
        >
          {value ? value.replace(/_/g, " ") : "Job Types"}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] w-full min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-xl z-[200] overflow-hidden">
          <div
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`px-4 py-2.5 text-sm cursor-pointer ${!value ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
          >
            All Types
          </div>
          {options.map((t) => (
            <div
              key={t}
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer ${value === t ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {t.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar helpers
// ─────────────────────────────────────────────────────────────────────────────

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded accent-blue-600 cursor-pointer shrink-0"
      />
      <span
        className={`text-sm leading-tight transition-colors ${checked ? "text-blue-600 font-medium" : "text-gray-600 group-hover:text-gray-900"}`}
      >
        {label}
      </span>
    </label>
  );
}

function SalaryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = ["Any", "₹5L – ₹10L", "₹10L – ₹15L", "₹15L – ₹25L", "₹25L+"];

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-xl bg-white transition-all cursor-pointer
          ${open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span
          className={
            value && value !== "Any"
              ? "text-gray-800 font-medium"
              : "text-gray-400"
          }
        >
          {value || "Select range"}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {opts.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer ${value === o ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = [
    "Most Relevant",
    "Newest First",
    "Highest Salary",
    "Best Match",
  ];

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all font-medium text-gray-700 whitespace-nowrap cursor-pointer"
      >
        {value}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {opts.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer ${value === o ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillChip({ name }) {
  return (
    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap">
      {name}
    </span>
  );
}

function MetaItem({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1">
      <Icon size={10} />
      {children}
    </span>
  );
}

function QuickLinkCard({ icon: Icon, color, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color.bg }}
      >
        <Icon size={15} style={{ color: color.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 leading-tight">
          {title}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
          {subtitle}
        </p>
      </div>
      <ArrowRight
        size={12}
        className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0"
      />
    </button>
  );
}

const APP_STATUS_STYLE = {
  Applied: { bg: "#EFF6FF", text: "#1D4ED8" },
  Interview: { bg: "#F0FDF4", text: "#15803D" },
  Screening: { bg: "#FFF7ED", text: "#C2410C" },
  Rejected: { bg: "#FFF1F2", text: "#BE123C" },
};

function AppStatusBadge({ status }) {
  const s = APP_STATUS_STYLE[status] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.text }}
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
    >
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Card
// ─────────────────────────────────────────────────────────────────────────────

function JobCard({
  job,
  matchPct,
  navigate,
  saved,
  onSave,
  onApply,
  applied,
  isCandidate,
}) {
  const skillNames = getSkillNames(job);
  const shown = skillNames.slice(0, 4);
  const extra = skillNames.length - shown.length;
  const matchColor =
    matchPct >= 85 ? "#16a34a" : matchPct >= 70 ? "#2563eb" : "#f59e0b";

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-11 h-11 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.companyName}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <span className="text-base font-bold text-gray-300">
              {(job.companyName || "?")[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: title + bookmark */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <BadgeCheck size={14} className="text-blue-500 shrink-0" />
                {job.jobType && <JTypeBadge value={job.jobType} />}
              </div>

              {/* Meta line 1 */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-xs text-gray-500">
                {job.companyName && (
                  <span className="flex items-center gap-1">
                    <Building2 size={10} />
                    {job.companyName}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {job.location}
                  </span>
                )}
                {job.workMode && (
                  <span className="flex items-center gap-1">
                    <Monitor size={10} />
                    {job.workMode.replace(/_/g, " ")}
                  </span>
                )}
                {fmtExp(job.experienceRequired) && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={10} />
                    {fmtExp(job.experienceRequired)}
                  </span>
                )}
              </div>

              {/* Meta line 2 */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                {job.salary && (
                  <span className="flex items-center gap-1">
                    <IndianRupee size={10} />
                    {fmtSalary(job.salary)}
                  </span>
                )}
                {job.lastDateToApply && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={10} />
                    Apply by {fmtDate(job.lastDateToApply)}
                  </span>
                )}
              </div>
            </div>

            {/* Time + bookmark */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-gray-400 whitespace-nowrap hidden md:block">
                {timeAgo(job.createdAt || job.postedOn)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(job.id);
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${saved ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
              >
                {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              </button>
            </div>
          </div>

          {/* Skills */}
          {shown.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
              {shown.map((s, i) => (
                <SkillChip key={i} name={s} />
              ))}
              {extra > 0 && (
                <span className="text-xs text-blue-600 font-semibold">
                  +{extra} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Match + Apply — sm and above */}
        <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
          <MatchRing pct={matchPct} />
          {isCandidate &&
            (applied ? (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-green-700 bg-green-50 border border-green-200 whitespace-nowrap">
                <CheckCircle2 size={11} /> Applied
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(job);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm whitespace-nowrap cursor-pointer"
              >
                Apply Now
              </button>
            ))}
        </div>
      </div>

      {/* Mobile: match + apply */}
      <div className="sm:hidden flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-sm font-bold" style={{ color: matchColor }}>
          {matchPct}% Match
        </span>
        {isCandidate &&
          (applied ? (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-green-700 bg-green-50 border border-green-200">
              <CheckCircle2 size={11} /> Applied
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApply(job);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
            >
              Apply Now
            </button>
          ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EXP_LEVELS = ["Fresher", "1 - 3 years", "3 - 5 years", "5+ years"];

const MOCK_APPLICATIONS = [
  {
    title: "Senior Backend Developer",
    company: "Google",
    status: "Applied",
    time: "2h ago",
  },
  {
    title: "Full Stack Developer",
    company: "Amazon",
    status: "Interview",
    time: "1d ago",
  },
  {
    title: "Software Engineer",
    company: "Microsoft",
    status: "Screening",
    time: "2d ago",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Right Sidebar Components
// ─────────────────────────────────────────────────────────────────────────────

function InsightStat({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50">
        <Icon size={13} style={{ color }} />
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
      <span className="text-[10px] text-gray-400 leading-tight text-center">
        {label}
      </span>
    </div>
  );
}

function ApplicationRow({ app }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-900 truncate">
          {app.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{app.company}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <AppStatusBadge status={app.status} />
        <span className="text-[10px] text-gray-400">{app.time}</span>
      </div>
    </div>
  );
}

function ProfileCard({ firstName, navigate }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {firstName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            Hi, {firstName} 👋
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Profile completeness</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: "80%" }}
          />
        </div>
        <span className="text-xs font-bold text-gray-700">80%</span>
      </div>
      <button
        onClick={() => navigate("/profile")}
        className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
      >
        Improve your profile <ArrowRight size={11} />
      </button>
    </div>
  );
}

function QuickLinksCard({ navigate }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-1.5">
      <QuickLinkCard
        icon={Star}
        color={{ bg: "#FFF7ED", icon: "#F97316" }}
        title="Skill Management"
        subtitle="Add, remove or update your skills"
        onClick={() => navigate("/skill-management")}
      />
      <QuickLinkCard
        icon={TrendingUp}
        color={{ bg: "#F0FDF4", icon: "#16A34A" }}
        title="Skill Gap"
        subtitle="Find missing skills and get suggestions"
        onClick={() => navigate("/skill-gap")}
      />
      <QuickLinkCard
        icon={Bookmark}
        color={{ bg: "#EFF6FF", icon: "#2563EB" }}
        title="Saved / Applied Jobs"
        subtitle="Track your saved and applied jobs"
        onClick={() => navigate("/my-applications")}
      />
    </div>
  );
}

function MyApplicationsCard({ navigate }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">My Applications</p>
        <button
          onClick={() => navigate("/my-applications")}
          className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
        >
          View all
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {MOCK_APPLICATIONS.map((app, i) => (
          <ApplicationRow key={i} app={app} />
        ))}
      </div>
    </div>
  );
}

function InsightsCard() {
  const stats = [
    { icon: PhoneCall, value: "12", label: "Applications", color: "#3B82F6" },
    { icon: Eye, value: "156", label: "Profile Views", color: "#8B5CF6" },
    {
      icon: TrendingUp,
      value: "8",
      label: "Interview Calls",
      color: "#10B981",
    },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">JobGenius Insights</p>
        <span className="text-xs text-gray-400">This week</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {stats.map((s) => (
          <InsightStat key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function JobListingPage() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  const firstName = (user.username || user.name || "User").split(" ")[0];
  const isCandidate = user.role === "CANDIDATE";

  // ── Data ──────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [matchMap, setMatchMap] = useState({});
  const [allSkills, setAllSkills] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobTypeSearch, setJobTypeSearch] = useState("");
  const [checkedTypes, setCheckedTypes] = useState([]);
  const [checkedSkills, setCheckedSkills] = useState([]);
  const [checkedExp, setCheckedExp] = useState([]);
  const [salaryRange, setSalaryRange] = useState("Any");
  const [skillSearch, setSkillSearch] = useState("");
  const [showMoreSkills, setShowMoreSkills] = useState(false);

  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("savedJobIds") || "[]").map(String),
      );
    } catch {
      return new Set();
    }
  });

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState("Most Relevant");
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const ROWS = viewMode === "grid" ? 6 : 5;

  // ── API calls ──────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(() => {
    setJobsLoading(true);
    setJobsError("");
    API.get("/jobs")
      .then((r) => setJobs(r.data || []))
      .catch(() => setJobsError("Failed to load jobs. Please try again."))
      .finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    setMatchLoading(true);
    API.get("/jobmatch/match")
      .then((r) => {
        const data = r.data || [];
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            const id = item.jobId ?? item.id ?? item.job?.id;
            const pct =
              item.matchPercentage ?? item.matchScore ?? item.score ?? 0;
            if (id != null) map[String(id)] = Math.round(pct);
          });
        } else {
          Object.entries(data).forEach(([k, v]) => {
            map[k] = Math.round(Number(v));
          });
        }
        setMatchMap(map);
      })
      .catch(() => {})
      .finally(() => setMatchLoading(false));
  }, []);

  useEffect(() => {
    API.get("/skills")
      .then((r) => {
        setAllSkills(
          (r.data || [])
            .map((s) =>
              typeof s === "string" ? s : s?.name || s?.skillName || "",
            )
            .filter(Boolean),
        );
      })
      .catch(() => {})
      .finally(() => setSkillsLoading(false));
  }, []);

  useEffect(() => {
    API.get("/enums/job-types")
      .then((r) => setJobTypes(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token") || !isCandidate) return;
    API.get("/applications/my")
      .then((r) => setAppliedJobs(new Set((r.data || []).map((a) => a.jobId))))
      .catch(() => {});
  }, [isCandidate]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = jobs.filter((j) => {
    const kw = keyword.toLowerCase();
    const lc = location.toLowerCase();
    return (
      (!kw ||
        j.title?.toLowerCase().includes(kw) ||
        j.companyName?.toLowerCase().includes(kw)) &&
      (!lc || j.location?.toLowerCase().includes(lc)) &&
      (!jobTypeSearch ||
        j.jobType?.toUpperCase() === jobTypeSearch.toUpperCase()) &&
      (checkedTypes.length === 0 ||
        checkedTypes.some(
          (t) => j.jobType?.toUpperCase() === t.toUpperCase(),
        )) &&
      (checkedSkills.length === 0 ||
        checkedSkills.some((sk) =>
          getSkillNames(j).some((s) =>
            s.toLowerCase().includes(sk.toLowerCase()),
          ),
        ))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Newest First")
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === "Highest Salary") return (b.salary ?? 0) - (a.salary ?? 0);
    return (matchMap[String(b.id)] ?? 0) - (matchMap[String(a.id)] ?? 0);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS));
  const safeP = Math.min(page, totalPages);
  const paginated = sorted.slice((safeP - 1) * ROWS, safeP * ROWS);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeP) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && arr[i - 1] !== p - 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  const toggleType = (t) =>
    setCheckedTypes((p) =>
      p.includes(t) ? p.filter((x) => x !== t) : [...p, t],
    );
  const toggleSkill = (s) =>
    setCheckedSkills((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
    );

  const toggleSave = (id) =>
    setSavedJobs((p) => {
      const n = new Set(p),
        key = String(id);
      if (n.has(key)) {
        n.delete(key);
      } else {
        n.add(key);
        try {
          const dates = JSON.parse(
            localStorage.getItem("savedJobDates") || "{}",
          );
          dates[key] = new Date().toISOString();
          localStorage.setItem("savedJobDates", JSON.stringify(dates));
        } catch {}
      }
      localStorage.setItem("savedJobIds", JSON.stringify([...n]));
      return n;
    });

  const handleApply = (job) => navigate(`/jobs/${job.id}`);
  const clearAll = () => {
    setCheckedTypes([]);
    setCheckedSkills([]);
    setCheckedExp([]);
    setSalaryRange("Any");
    setSkillSearch("");
  };
  const getMatch = (job) =>
    matchMap[String(job.id)] ?? job.matchPercentage ?? 0;

  const displayedSkills = (
    showMoreSkills ? allSkills : allSkills.slice(0, 6)
  ).filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()));

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const SidebarContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-blue-600" /> Filters
        </h3>
        <button
          onClick={clearAll}
          className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Job Type
        </p>
        <div className="space-y-2">
          <FilterCheckbox
            label="All Types"
            checked={checkedTypes.length === 0}
            onChange={() => setCheckedTypes([])}
          />
          {(jobTypes.length > 0
            ? jobTypes
            : ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]
          ).map((t) => (
            <FilterCheckbox
              key={t}
              label={t.replace(/_/g, " ")}
              checked={checkedTypes.includes(t)}
              onChange={() => toggleType(t)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Skills
        </p>
        <div className="relative mb-2">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Search skills"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
        {skillsLoading ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 py-1">
            <Loader2 size={11} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-2">
            {displayedSkills.map((s) => (
              <FilterCheckbox
                key={s}
                label={s}
                checked={checkedSkills.includes(s)}
                onChange={() => toggleSkill(s)}
              />
            ))}
          </div>
        )}
        {allSkills.length > 6 && (
          <button
            onClick={() => setShowMoreSkills(!showMoreSkills)}
            className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-1.5 hover:underline cursor-pointer"
          >
            {showMoreSkills
              ? "Show less"
              : `Show more (${allSkills.length - 6})`}
            <ChevronDown
              size={11}
              className={`transition-transform ${showMoreSkills ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      <div className="border-t border-gray-100" />

      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Experience Level
        </p>
        <div className="space-y-2">
          {EXP_LEVELS.map((e) => (
            <FilterCheckbox
              key={e}
              label={e}
              checked={checkedExp.includes(e)}
              onChange={() =>
                setCheckedExp((p) =>
                  p.includes(e) ? p.filter((x) => x !== e) : [...p, e],
                )
              }
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Salary Range
        </p>
        <SalaryDropdown value={salaryRange} onChange={setSalaryRange} />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none overflow-hidden" />
        <div className="absolute top-6 right-32 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-7 sm:pt-10 pb-0">
          <div className="max-w-2xl mb-5 sm:mb-7">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Find the right job
              <br />
              with <span className="text-yellow-400">smart matching</span>
            </h1>
            <p className="text-blue-100 text-sm mt-2">
              Our AI matches your skills with the best opportunities.
            </p>
          </div>

          {/* Search bar — connects visually to page body below */}
          <div className="bg-white rounded-2xl rounded-b-none shadow-xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Keyword */}
            <div className="flex-1 relative min-w-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Software Engineer"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Location */}
            <div className="flex-1 relative min-w-0">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                placeholder="Select location"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Job type */}
            <div className="w-full sm:w-40 shrink-0">
              <JobTypeDropdown
                value={jobTypeSearch}
                onChange={(v) => {
                  setJobTypeSearch(v);
                  setPage(1);
                }}
                options={
                  jobTypes.length > 0
                    ? jobTypes
                    : ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
                }
              />
            </div>

            {/* CTA */}
            <button
              onClick={() => setPage(1)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search size={14} /> Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5">
        <div className="flex gap-5 items-start">
          {/* Left sidebar — sticky, scrollable internally */}
          <aside className="hidden lg:block w-52 xl:w-56 shrink-0 sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            {SidebarContent}
          </aside>

          {/* Centre */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium cursor-pointer"
                >
                  <SlidersHorizontal size={13} /> Filters
                </button>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">
                    {sorted.length.toLocaleString()}
                  </span>{" "}
                  jobs found
                  {matchLoading && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400">
                      <Loader2 size={11} className="animate-spin" />{" "}
                      Calculating…
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={fetchJobs}
                  title="Refresh"
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                </button>
                <span className="text-xs text-gray-500 hidden sm:block">
                  Sort by:
                </span>
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors cursor-pointer ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Job cards */}
            {jobsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <p className="text-sm text-gray-500">
                  Finding the best jobs for you…
                </p>
              </div>
            ) : jobsError ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm max-w-md w-full">
                  <AlertCircle size={14} className="shrink-0" /> {jobsError}
                </div>
                <button
                  onClick={fetchJobs}
                  className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={13} /> Try again
                </button>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Search size={32} className="text-gray-300" />
                <p className="text-gray-500 text-sm">
                  No jobs match your search.
                </p>
                <button
                  onClick={clearAll}
                  className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                    : "flex flex-col gap-3"
                }
              >
                {paginated.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    navigate={navigate}
                    matchPct={getMatch(job)}
                    saved={savedJobs.has(String(job.id))}
                    onSave={toggleSave}
                    onApply={handleApply}
                    applied={appliedJobs.has(job.id)}
                    isCandidate={isCandidate}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!jobsLoading && !jobsError && sorted.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safeP === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {pageNums.map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} className="px-1 text-gray-400 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all cursor-pointer ${safeP === p ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeP === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="hidden xl:flex flex-col gap-4 w-60 2xl:w-64 shrink-0">
            <ProfileCard firstName={firstName} navigate={navigate} />
            <QuickLinksCard navigate={navigate} />
            <MyApplicationsCard navigate={navigate} />
            <InsightsCard />
          </aside>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative ml-auto w-72 max-w-[85vw] bg-white h-full overflow-y-auto shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            {SidebarContent}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="w-full mt-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
