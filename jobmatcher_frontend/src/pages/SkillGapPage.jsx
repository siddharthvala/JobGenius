// src/pages/SkillGapPage.jsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import {
  X,
  List,
  Filter,
  TrendingUp,
  Search,
  ChevronDown,
  Calendar,
  LayoutGrid,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Briefcase,
  IndianRupee,
  BadgeCheck,
  Users,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
  Trophy,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import API from "../services/api";
import AIInsightsCard from "../components/AIInsightsCard";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeSkill(s) {
  return typeof s === "string" ? s : s?.name || s?.skillName || "";
}

function fmtSalary(s) {
  if (s == null) return null;
  if (typeof s !== "number") return s;
  const yearly = s * 12;
  const yearlyFormatted =
    yearly >= 100000
      ? `₹${(yearly / 100000).toFixed(1).replace(/\.0$/, "")}L/year`
      : `₹${yearly.toLocaleString("en-IN")}/year`;
  return `₹${s.toLocaleString("en-IN")}/month • ${yearlyFormatted}`;
}

function fmtDate(d) {
  if (!d) return "—";
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

function matchColor(pct) {
  if (pct >= 80) return { text: "#16a34a", bg: "#F0FDF4", border: "#BBF7D0" };
  if (pct >= 60) return { text: "#2563eb", bg: "#EFF6FF", border: "#BFDBFE" };
  return { text: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
}

function matchLabel(pct) {
  if (pct >= 80) return "Strong";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Partial";
  return "Low";
}

const STATUS_STYLE = {
  APPLIED: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  SCREENING: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  INTERVIEW: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  ACCEPTED: { bg: "#F0FDF4", text: "#166534", border: "#86EFAC" },
  REJECTED: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
};

function StatusBadge({ status }) {
  const key = status?.toUpperCase();
  const s = STATUS_STYLE[key] || {
    bg: "#F3F4F6",
    text: "#374151",
    border: "#E5E7EB",
  };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
    >
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Match Ring
// ─────────────────────────────────────────────────────────────────────────────

function MatchRing({ pct = 0 }) {
  const size = 130;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#2563eb" : "#f59e0b";
  const label =
    pct >= 80 ? "Strong Match" : pct >= 60 ? "Good Match" : "Partial Match";
  const desc =
    pct >= 80
      ? "Excellent! You match most required skills."
      : pct >= 60
        ? "You're close! Learn the missing skills to improve your match."
        : "You match some skills. Check recommendations below.";

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={off}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-base font-bold" style={{ color }}>
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-1.5 max-w-[160px] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill chip
// ─────────────────────────────────────────────────────────────────────────────

function MissingChip({ name }) {
  return (
    <span className="px-3 py-1.5 rounded-full text-sm font-semibold border border-red-200 bg-red-50 text-red-600 whitespace-nowrap">
      {name}
    </span>
  );
}

function MatchedChip({ name }) {
  return (
    <span className="px-3 py-1.5 rounded-full text-sm font-semibold border border-green-200 bg-green-50 text-green-700 whitespace-nowrap">
      {name}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SkillGapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams();

  // If navigated from JobDetailPage, jobId may be in query param: ?jobId=123
  const params = new URLSearchParams(location.search);
  const jobIdParam = jobId || params.get("jobId");
  // ── Data ──────────────────────────────────────────────────────────────────
  const [allJobs, setAllJobs] = useState([]); // GET /jobs
  const [selectedJobId, setSelectedJobId] = useState(jobIdParam || "");
  const [job, setJob] = useState(null); // GET /jobs/{id}
  const [userSkills, setUserSkills] = useState([]); // GET /skills/user

  // ── Load state ────────────────────────────────────────────────────────────
  const [jobsLoading, setJobsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  // Job list state
  const [applications, setApplications] = useState([]);
  const [matchMap, setMatchMap] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("match");
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. GET /jobs — populate selector
  // ─────────────────────────────────────────────────────────────────────────
  // Fetch all jobs + applications + match data together
  useEffect(() => {
    Promise.all([
      API.get("/jobs"),
      API.get("/applications/my"),
      API.get("/jobmatch/match"),
    ])
      .then(([jobsRes, appsRes, matchRes]) => {
        setAllJobs(jobsRes.data || []);
        setApplications(appsRes.data || []);
        const data = matchRes.data || [];
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            const id = item.jobId ?? item.job?.id ?? item.id;
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
      .finally(() => setJobsLoading(false));
  }, []);
  useEffect(() => {
    setSelectedJobId(jobIdParam || "");
  }, [jobIdParam]);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. GET /skills/user — user's current skills
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    API.get("/skills/user")
      .then((r) => {
        setUserSkills((r.data || []).map(normalizeSkill).filter(Boolean));
      })
      .catch(() => {});
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. When selectedJobId changes — GET /jobs/{id}
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedJobId) {
      setJob(null);
      return;
    }
    setPageLoading(true);
    setError("");

    API.get(`/jobs/${selectedJobId}`)
      .then((r) => setJob(r.data))
      .catch(() => setError("Failed to load skill gap data. Please try again."))
      .finally(() => setPageLoading(false));
  }, [selectedJobId]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived: missing vs matched skills
  // ─────────────────────────────────────────────────────────────────────────

  const jobSkills = job
    ? (job.requiredSkills || job.skills || [])
        .map(normalizeSkill)
        .filter(Boolean)
    : [];

  const matchedSkills = jobSkills.filter((skill) =>
    userSkills.some((u) => u.toLowerCase() === skill.toLowerCase()),
  );

  const missingSkills = jobSkills.filter(
    (skill) => !userSkills.some((u) => u.toLowerCase() === skill.toLowerCase()),
  );

  const fromMap = matchMap[String(selectedJobId)];
  const matchPct =
    fromMap != null
      ? Math.round(fromMap)
      : jobSkills.length > 0
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0;

  // Filtered + sorted all jobs for the selection screen
  const processedApps = useMemo(() => {
    // Build application lookup: { jobId -> application }
    const appMap = {};
    applications.forEach((a) => {
      appMap[String(a.jobId ?? a.id)] = a;
    });

    let list = allJobs.map((j) => {
      const app = appMap[String(j.id)] || null;
      return {
        ...j,
        jobId: j.id,
        jobTitle: j.title,
        status: app?.status || null,
        appliedAt: app?.appliedAt || null,
        _pct: matchMap[String(j.id)] ?? app?.matchPercentage ?? 0,
      };
    });

    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q) ||
          (a.companyName || "").toLowerCase().includes(q) ||
          (a.location || "").toLowerCase().includes(q),
      );
    }
    if (statusFilter === "APPLIED") {
      list = list.filter((a) => a.status !== null);
    }

    if (sortBy === "match") list.sort((a, b) => b._pct - a._pct);
    if (sortBy === "newest")
      list.sort(
        (a, b) =>
          new Date(b.postedAt || b.createdAt || 0) -
          new Date(a.postedAt || a.createdAt || 0),
      );
    if (sortBy === "title")
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [allJobs, applications, search, statusFilter, sortBy, matchMap]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, sortBy]);

  const totalPages = Math.ceil(processedApps.length / PAGE_SIZE);
  const pagedApps = processedApps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="w-full max-w-400 mx-auto px-3 sm:px-4 lg:px-6 xl:px-13 py-5 sm:py-6">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
          <Link
            to="/find-jobs"
            className="text-blue-600 hover:underline font-medium"
          >
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          {jobIdParam && (
            <>
              <Link
                to={`/jobs/${jobIdParam}`}
                className="text-blue-600 hover:underline font-medium"
              >
                Job Details
              </Link>
              <ChevronRight size={14} className="text-gray-300" />
            </>
          )}
          <span className="text-gray-700 font-medium">
            Skill Gap &amp; Recommendations
          </span>
        </nav>

        {/* ── Back button ── */}
        {jobIdParam && (
          <button
            onClick={() => navigate(`/jobs/${jobIdParam}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all mb-5"
          >
            <ArrowLeft size={14} /> Back to Job Details
          </button>
        )}

        {/* ── Page title + match ring row ── */}
        {/* ── Header + Job Card + Match Card ── */}
        <div className="flex flex-col lg:flex-row gap-5 mb-6">
          {/* Left Side */}
          <div className="flex-1">
            {/* Title */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {job?.title
                  ? `${job.title} Skill Gap Analysis`
                  : "Skill Gap & Recommendations"}
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Analyse missing skills, matched skills, and improve your chances
                for this role.
              </p>
            </div>

            {/* Compact Job Card */}
            {job && !pageLoading && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-300">
                          {(job.companyName || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Job Info */}
                    <div className="min-w-0">
                      <h2 className="text-xl font-black text-gray-900">
                        {job.title}
                      </h2>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          {job.companyName}
                          <BadgeCheck size={13} className="text-blue-500" />
                        </span>

                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {job.location}
                          </span>
                        )}

                        {job.jobType && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={12} />
                            {job.jobType.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-8 shrink-0">
                    {fmtExp(job.experienceRequired) && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Experience</p>

                        <div className="flex items-center gap-2">
                          <Users size={15} className="text-gray-400" />

                          <p className="text-sm font-semibold text-gray-700">
                            {fmtExp(job.experienceRequired)}
                          </p>
                        </div>
                      </div>
                    )}

                    {job.salary != null && fmtSalary(job.salary) && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Salary</p>

                        <div className="flex items-center gap-2">
                          <IndianRupee size={15} className="text-gray-400" />

                          <p className="text-sm font-semibold text-gray-700">
                            {fmtSalary(job.salary)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Match Card */}
          {(job || pageLoading) && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 lg:w-80 shrink-0 h-fit">
              <p className="text-sm font-bold text-gray-900 mb-4">
                Match Percentage
              </p>

              {pageLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  Calculating…
                </div>
              ) : (
                <>
                  <MatchRing pct={matchPct} />
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Matched:{" "}
                      <span className="font-bold text-green-600">
                        {matchedSkills.length}
                      </span>
                    </span>
                    <span>
                      Missing:{" "}
                      <span className="font-bold text-red-500">
                        {missingSkills.length}
                      </span>
                    </span>
                    <span>
                      Total:{" "}
                      <span className="font-bold text-gray-700">
                        {jobSkills.length}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {/* ── Job Selection Screen — shown when no job selected ── */}
        {!selectedJobId && !pageLoading && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">
                    Select a Job to Analyse
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click any job to see your skill gap.
                  </p>
                </div>
                {jobsLoading && (
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by job title, company or location…"
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Status pills + sort + view */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["ALL", "APPLIED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all
                ${
                  statusFilter === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
                    >
                      {s === "ALL" ? "All Jobs" : "Applied"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="
      appearance-none
      h-9
      min-w-[125px]
      pl-3
      pr-9
      text-sm
      font-medium
      text-gray-700
      bg-white
      border border-gray-200
      rounded-lg
      shadow-sm
      cursor-pointer
      transition-all
      hover:border-blue-300
      hover:bg-blue-50/30
      focus:outline-none
      focus:ring-2
      focus:ring-blue-100
      focus:border-blue-500
    "
                    >
                      <option value="match">Best Match</option>
                      <option value="newest">Newest</option>
                      <option value="title">Title A–Z</option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="
      absolute
      right-3
      top-1/2
      -translate-y-1/2
      text-gray-400
      pointer-events-none
    "
                    />
                  </div>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
                    >
                      <List size={13} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
                    >
                      <LayoutGrid size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs */}
            {jobsLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-sm text-gray-400">
                <Loader2 size={18} className="animate-spin text-blue-500" />{" "}
                Loading jobs…
              </div>
            ) : processedApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                {allJobs.length === 0 ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <Briefcase size={24} className="text-blue-400" />
                    </div>
                    <p className="text-base font-bold text-gray-700">
                      No jobs available
                    </p>
                    <p className="text-sm text-gray-400 max-w-xs">
                      Check back later for new job listings.
                    </p>
                  </>
                ) : (
                  <>
                    <Search size={24} className="text-gray-200" />
                    <p className="text-sm text-gray-400">
                      No results.{" "}
                      <button
                        onClick={() => {
                          setSearch("");
                          setStatus("ALL");
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div
                className={`p-4 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col divide-y divide-gray-100"}`}
              >
                {pagedApps.map((app) => {
                  const mc = matchColor(app._pct);
                  return viewMode === "list" ? (
                    <button
                      key={app.id}
                      onClick={() => navigate(`/skill-gap/${app.jobId}`)}
                      className="w-full flex items-center gap-4 px-4 py-4 bg-white hover:bg-blue-50/40 transition-all group text-left"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        {app.companyLogo ? (
                          <img
                            src={app.companyLogo}
                            alt={app.companyName}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-400">
                            {(app.companyName || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Job info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {app.jobTitle || app.title}
                        </p>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                          {app.companyName && (
                            <span className="font-medium text-gray-600">{app.companyName}</span>
                          )}
                          {app.location && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} className="text-gray-400" />
                                {app.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status + date */}
                      {app.status && (
                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                          <StatusBadge status={app.status} />
                          {app.appliedAt && (
                            <span className="text-[11px] text-gray-400">
                              {fmtDate(app.appliedAt)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Match box */}
                      <div
                        className="w-16 h-16 flex flex-col items-center justify-center rounded-xl shrink-0 shadow-sm"
                        style={{ backgroundColor: mc.bg, border: `1.5px solid ${mc.border}` }}
                      >
                        <span className="text-base font-black leading-none" style={{ color: mc.text }}>
                          {app._pct}%
                        </span>
                        <span className="text-[10px] font-semibold mt-0.5" style={{ color: mc.text }}>
                          {matchLabel(app._pct)}
                        </span>
                      </div>

                      <ChevronRight size={15} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                    </button>
                  ) : (
                    <button
                      key={app.id}
                      onClick={() => navigate(`/skill-gap/${app.jobId}`)}
                      className="flex flex-col bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group text-left"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {app.companyLogo ? (
                            <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-lg font-bold text-gray-300">
                              {(app.companyName || "?")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div
                          className="flex flex-col items-center px-2.5 py-1.5 rounded-xl"
                          style={{ backgroundColor: mc.bg, border: `1px solid ${mc.border}` }}
                        >
                          <span className="text-sm font-black leading-none" style={{ color: mc.text }}>{app._pct}%</span>
                          <span className="text-[9px] font-semibold uppercase" style={{ color: mc.text }}>Match</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {app.jobTitle || app.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">{app.companyName}</p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                        {app.status ? <StatusBadge status={app.status} /> : <span className="text-xs text-gray-400">Not applied</span>}
                        {app.appliedAt && <span className="text-xs text-gray-400">{fmtDate(app.appliedAt)}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer: count + pagination */}
            {!jobsLoading && processedApps.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-600">
                    {Math.min((page - 1) * PAGE_SIZE + 1, processedApps.length)}–{Math.min(page * PAGE_SIZE, processedApps.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-600">{processedApps.length}</span>{" "}
                  jobs
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 text-xs font-semibold rounded-lg border transition-all ${
                          p === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* ── Loading ── */}
        {pageLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Analysing your skill gap…</p>
          </div>
        )}

        {/* ── Main content ── */}
        {job && !pageLoading && !error && (
          <>
            {/* ── Missing + Matched skills grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Missing Skills */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        Missing Skills
                      </h3>
                      {missingSkills.length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          {missingSkills.length}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Skills required for this job that you don't have yet.
                    </p>
                  </div>
                </div>

                {missingSkills.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle2 size={14} className="shrink-0" /> You have all
                    required skills!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((skill) => (
                      <MissingChip key={skill} name={skill} />
                    ))}
                  </div>
                )}

                {/* Why important */}
                {missingSkills.length > 0 && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3.5 mt-auto">
                    <Lightbulb
                      size={16}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-red-700">
                        Why are these skills important?
                      </p>
                      <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                        These skills are in high demand for this role and will
                        significantly improve your match percentage.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Matched Skills */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} className="text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        Your Matched Skills
                      </h3>
                      {matchedSkills.length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          {matchedSkills.length}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Skills you already have that match this job.
                    </p>
                  </div>
                </div>

                {matchedSkills.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <AlertCircle size={14} className="shrink-0" /> No matching
                    skills yet. Start adding skills!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((skill) => (
                      <MatchedChip key={skill} name={skill} />
                    ))}
                  </div>
                )}

                {/* Great job */}
                <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3.5 mt-auto">
                  <Trophy
                    size={16}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-green-700">
                      Great job!
                    </p>
                    <p className="text-xs text-green-600 mt-0.5 leading-relaxed">
                      {matchedSkills.length > 0
                        ? "You have strong foundational skills. Add the missing skills to become a top match!"
                        : "Start adding relevant skills to improve your match percentage for this job."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tip banner ── */}
            <div className="flex items-start gap-4 bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 mb-5">
              <div className="w-9 h-9 rounded-full border-2 border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-700">Tip</p>
                <p className="text-sm text-blue-600 mt-0.5">
                  Focus on the missing skills to increase your match percentage
                  and stand out to recruiters.
                </p>
              </div>
            </div>

            {/* ── Skill Gap Recommendations ── */}
            {missingSkills.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <TrendingUp size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        Skill Gap Recommendations
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Learn these skills to boost your match percentage.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full">
                    {missingSkills.length} skill
                    {missingSkills.length > 1 ? "s" : ""} missing
                  </span>
                </div>

                {/* Recommendation rows */}
                <div className="flex flex-col gap-2 p-4">
                  {missingSkills.map((skill, idx) => {
                    const boost = Math.round(
                      (100 - matchPct) / missingSkills.length,
                    );
                    return (
                      <div
                        key={skill}
                        className="w-full flex items-center gap-4 px-5 py-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        {/* Step number */}
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-blue-600">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Skill name + hint */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {skill}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Add this skill to your profile to improve your match
                          </p>
                        </div>

                        {/* Badge + date-like label */}
                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap bg-red-50 text-red-600 border border-red-200">
                            Missing
                          </span>
                          <span className="text-xs text-gray-400">
                            Recommended
                          </span>
                        </div>

                        {/* Boost % box — same size/style as match % box in cards */}
                        <div
                          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl shrink-0"
                          style={{
                            backgroundColor: "#FFFBEB",
                            border: "1px solid #FDE68A",
                          }}
                        >
                          <span
                            className="text-base font-black leading-none"
                            style={{ color: "#D97706" }}
                          >
                            +{boost}%
                          </span>
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: "#D97706" }}
                          >
                            Boost
                          </span>
                        </div>

                        <ChevronRight
                          size={15}
                          className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-400">
                    Adding all{" "}
                    <span className="font-semibold text-gray-600">
                      {missingSkills.length}
                    </span>{" "}
                    missing skills could bring your match to{" "}
                    <span className="font-semibold text-green-600">100%</span>
                  </p>
                </div>
              </div>
            )}

            {/* ── AI Insights ── */}
            <AIInsightsCard
              targetRole={job?.title || "Target Role"}
              matchedSkills={(matchedSkills || []).map(s =>
                typeof s === "string" ? s : s.name || s.skillName
              )}
              missingSkills={(missingSkills || []).map(s =>
                typeof s === "string" ? s : s.name || s.skillName
              )}
            />

            {/* ── Action buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-5 border-t border-gray-100">
              <button
                onClick={() =>
                  navigate("/skill-management", {
                    state: {
                      suggestedSkills: missingSkills,
                      fromSkillGap: true,
                      jobId: job.id,
                    },
                  })
                }
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm shadow-blue-200"
              >
                Add Missing Skills
              </button>
              <button
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-blue-600 border-2 border-blue-200 hover:bg-blue-50 transition-all"
              >
                Back to Job Details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
