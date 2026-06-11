// src/pages/RecruiterDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  TrendingUp,
  Calendar,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import API from "../services/api";

// ── Rows Per Page ─────────────────────────────────────────────
function RowsPerPage({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = [5, 10, 20, 50];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all cursor-pointer"
      >
        {value}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 w-20">
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer ${value === o ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  trendColor,
  label,
  value,
  sub,
  subColor,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-start gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-0">
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon size={22} className={`sm:w-6 sm:h-6 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl sm:text-[32px] font-bold text-gray-900 leading-tight">
          {value}
        </p>
        <p className={`text-xs sm:text-sm mt-1 font-medium ${subColor}`}>
          {sub}
        </p>
      </div>
      <TrendingUp
        size={20}
        className={`sm:w-6 sm:h-6 ${trendColor} shrink-0 mt-1 sm:mt-2`}
      />
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-green-50 text-green-600 border-green-200",
    CLOSED: "bg-red-50 text-red-700 border-red-200",
  };
  const key = status?.toUpperCase();
  return (
    <span
      className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${map[key] || map.ACTIVE}`}
    >
      {key === "CLOSED" ? "Closed" : "Active"}
    </span>
  );
}

// ── Row Action Menu ───────────────────────────────────────────
function ActionMenu({ jobId, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition cursor-pointer"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
            <Link
              to={`/edit-job/${jobId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} className="text-blue-500" /> Edit Job
            </Link>
            {/* <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
            >
              <Eye size={14} className="text-violet-500" /> View Apps
            </button> */}
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => {
                onDelete(jobId);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-50">
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32 sm:w-44 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-20 sm:w-28" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-3 bg-gray-200 rounded w-8" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-3 bg-gray-200 rounded w-20 sm:w-24" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-3 bg-gray-200 rounded w-20 sm:w-24" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-100 rounded w-4" />
      </td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = (user?.name || user?.username || "there").split(" ")[0];

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    API.get("/jobs/recruiter")
      .then((res) => setJobs(res.data || []))
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      alert("Failed to delete job.");
    }
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(
    (j) => (j.status || "ACTIVE").toUpperCase() === "ACTIVE",
  ).length;
  const totalApplications = jobs.reduce(
    (s, j) => s + (j.applicationCount || 0),
    0,
  );

  const isExpired = (d) =>
    d && new Date(d) < new Date(new Date().toDateString());

  const filteredJobs = jobs.filter((j) => {
    if (isExpired(j.lastDateToApply)) return false;
    const q = searchQuery.toLowerCase();
    return (
      j.title?.toLowerCase().includes(q) ||
      j.jobType?.toLowerCase().includes(q) ||
      j.workMode?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / rowsPerPage));
  const safeP = Math.min(page, totalPages);
  const pagedJobs = filteredJobs.slice(
    (safeP - 1) * rowsPerPage,
    safeP * rowsPerPage,
  );

  const handleSearch = (val) => {
    setSearchQuery(val);
    setPage(1);
  };

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "—";

  return (
    <div className="w-full overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8">
        {/* ── Welcome + Date ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {firstName}! 👋why
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Here's what's happening with your job postings.
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors shrink-0 cursor-pointer">
            <Calendar size={15} className="sm:w-4 sm:h-4 text-gray-400" />
            <span className="whitespace-nowrap">May 12 – May 18, 2024</span>
            <ChevronDown size={15} className="sm:w-4 sm:h-4 text-gray-400" />
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={BriefcaseBusiness}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            trendColor="text-blue-400"
            label="Total Jobs"
            value={loading ? "—" : totalJobs}
            sub="2 new this week"
            subColor="text-blue-500"
          />
          <StatCard
            icon={Users}
            iconBg="bg-green-50"
            iconColor="text-green-500"
            trendColor="text-green-400"
            label="Total Applications"
            value={loading ? "—" : totalApplications}
            sub="18 new this week"
            subColor="text-green-500"
          />
          <StatCard
            icon={BriefcaseBusiness}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
            trendColor="text-violet-400"
            label="Active Jobs"
            value={loading ? "—" : activeJobs}
            sub="3 expiring soon"
            subColor="text-amber-500"
          />
        </div>

        {/* ── Recent Job Postings ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* ── Table Header with Search ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 shrink-0">
              Job Postings
            </h2>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by job title..."
                  className="w-full pl-8 pr-8 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-red-50 border-b border-red-100 text-xs sm:text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Job Title",
                    "Applications",
                    "Status",
                    "Last Date to Apply",
                    "Posted On",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Loading skeleton */}
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}

                {/* Empty state — no jobs at all */}
                {!loading && jobs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 sm:px-6 py-12 sm:py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <BriefcaseBusiness
                            size={24}
                            className="sm:w-7 sm:h-7 text-gray-300"
                          />
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm font-medium">
                          No job postings yet
                        </p>
                        <Link
                          to="/post-job"
                          className="text-xs sm:text-sm text-blue-600 font-semibold hover:underline"
                        >
                          + Post your first job
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {/* No search results */}
                {!loading &&
                  jobs.length > 0 &&
                  searchQuery &&
                  filteredJobs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 sm:px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                          {/* Icon */}
                          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                            <Search size={28} className="text-blue-400" />
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            No results found
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            We couldn’t find any jobs matching{" "}
                            <span className="text-blue-600 font-semibold">
                              "{searchQuery}"
                            </span>
                          </p>

                          {/* Suggestions */}
                          <p className="text-xs text-gray-400 mt-2">
                            Try adjusting your search or using different
                            keywords
                          </p>

                          {/* Action */}
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                          >
                            <X size={14} />
                            Clear Search
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                {/* Job rows */}
                {!loading &&
                  pagedJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="group transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-all duration-200 cursor-pointer">
                          {job.title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {job.jobType || "Full-time"} •{" "}
                          {job.location || job.workMode || "Remote"}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-700">
                        {job.applicationCount ?? 0}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <StatusBadge status={job.status || "Active"} />
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                        {fmt(job.lastDateToApply || job.deadline)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                        {fmt(job.postedDate)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <ActionMenu jobId={job.id} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing{" "}
              {filteredJobs.length === 0 ? 0 : (safeP - 1) * rowsPerPage + 1} to{" "}
              {Math.min(safeP * rowsPerPage, filteredJobs.length)} of{" "}
              {filteredJobs.length} jobs
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safeP === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - safeP) <= 1,
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`e-${i}`}
                        className="px-2 text-gray-400 text-sm"
                      >
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
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                Rows per page
                <RowsPerPage
                  value={rowsPerPage}
                  onChange={(v) => {
                    setRowsPerPage(v);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
