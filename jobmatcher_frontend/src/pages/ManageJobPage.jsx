// src/pages/ManageJobs.jsx
// Navbar comes from RecruiterLayout — do NOT add it here

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import API from "../services/api";

const fmtExp = (v) => {
  if (v == null || v === "") return "Not specified";
  const n = Number(v);
  if (n === 0) return "Fresher";
  if (n === 1) return "1 Year";
  if (n >= 5) return `${n}+ Years`;
  return `${n} Years`;
};

// ─────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────
const JOB_TYPE_COLORS = {
  FULL_TIME: { bg: "#EDE9FE", text: "#5B21B6" },
  PART_TIME: { bg: "#FEF3C7", text: "#92400E" },
  CONTRACT: { bg: "#FFF3E0", text: "#B45309" },
  INTERNSHIP: { bg: "#E0F2FE", text: "#0369A1" },
  FREELANCE: { bg: "#F0FDF4", text: "#166534" },
};

const WORK_MODE_COLORS = {
  REMOTE: { bg: "#ECFDF5", text: "#065F46" },
  HYBRID: { bg: "#EFF6FF", text: "#1D4ED8" },
  ON_SITE: { bg: "#FFF7ED", text: "#C2410C" },
  ONSITE: { bg: "#FFF7ED", text: "#C2410C" },
  OFFICE: { bg: "#FFF7ED", text: "#C2410C" },
};

const STATUS_COLORS = {
  ACTIVE: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  CLOSED: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
};

function Badge({ value, map }) {
  const key = value?.toUpperCase().replace(/[\s-]/g, "_");
  const color = map[key] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      style={{ backgroundColor: color.bg, color: color.text }}
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
    >
      {value?.replace(/_/g, " ")}
    </span>
  );
}

function StatusBadge({ value }) {
  const key = value?.toUpperCase();
  const color = STATUS_COLORS[key] || {
    bg: "#F9FAFB",
    text: "#6B7280",
    border: "#E5E7EB",
  };
  return (
    <span
      style={{
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
      }}
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
    >
      {value}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterDropdown
// ─────────────────────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative min-w-[130px]">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-xl bg-white transition-all cursor-pointer
          ${open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span className="text-gray-700 truncate">{value || label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
          <div
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`px-4 py-2 text-sm cursor-pointer transition-colors ${!value ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
          >
            All
          </div>
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${value === o ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {o.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────
function DeleteModal({ job, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Job</h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">"{job?.title}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RowsPerPage
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// ManageJobs — Main
// ─────────────────────────────────────────────────────────────
export default function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Applicant counts per job { [jobId]: number }
  const [applicantCounts, setApplicantCounts] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Enums from API
  const [jobTypes, setJobTypes] = useState([]);
  const [workModes, setWorkModes] = useState([]);

  useEffect(() => {
    Promise.all([API.get("/enums/job-types"), API.get("/enums/work-modes")])
      .then(([jtRes, wmRes]) => {
        setJobTypes(jtRes.data || []);
        setWorkModes(wmRes.data || []);
      })
      .catch(() => {});
  }, []);

  // ── Fetch jobs ─────────────────────────────────────────────
  const fetchJobs = () => {
    setLoading(true);
    setFetchError("");
    API.get("/jobs/recruiter")
      .then((res) => {
        const jobList = res.data || [];
        setJobs(jobList);
        // Fetch applicant counts for all jobs in parallel
        fetchApplicantCounts(jobList);
      })
      .catch(() => setFetchError("Failed to load jobs. Please try again."))
      .finally(() => setLoading(false));
  };

  const fetchApplicantCounts = async (jobList) => {
    const counts = {};
    await Promise.allSettled(
      jobList.map(async (job) => {
        try {
          const res = await API.get(`/applications/job/${job.id}`);
          counts[job.id] = (res.data || []).length;
        } catch {
          counts[job.id] = 0;
        }
      }),
    );
    setApplicantCounts(counts);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const isExpired = (d) => {
    if (!d) return false;
    return new Date(d) < new Date(new Date().toDateString());
  };

  // ── Filtered + paginated ───────────────────────────────────
  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      j.title?.toLowerCase().includes(q) ||
      j.companyName?.toLowerCase().includes(q) ||
      j.jobType?.toLowerCase().includes(q) ||
      j.workMode?.toLowerCase().includes(q);
    const matchType = !jobTypeFilter || j.jobType === jobTypeFilter;
    const matchMode = !workModeFilter || j.workMode === workModeFilter;
    const matchStatus =
      !statusFilter || j.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchType && matchMode && matchStatus;
  });

  filtered.sort((a, b) => {
    const aExpired = isExpired(a.lastDateToApply) ? 1 : 0;
    const bExpired = isExpired(b.lastDateToApply) ? 1 : 0;
    return aExpired - bExpired;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safeP = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safeP - 1) * rowsPerPage,
    safeP * rowsPerPage,
  );

  const resetFilters = () => {
    setSearch("");
    setJobTypeFilter("");
    setWorkModeFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/jobs/${deleteTarget.id}`);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // keep modal open for retry
    } finally {
      setDeleteLoading(false);
    }
  };

  const fmt = (d) => {
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
  };

  const isExpiringSoon = (d) => {
    if (!d || isExpired(d)) return false;
    const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-13 py-6 sm:py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Manage Jobs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View, edit or delete all the jobs you have posted.
          </p>
        </div>
        <button
          onClick={() => navigate("/post-job")}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-200 shrink-0 w-fit cursor-pointer"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 sm:px-5 py-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, company, job type..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <FilterDropdown
              label="Job Type"
              value={jobTypeFilter}
              options={jobTypes}
              onChange={(v) => {
                setJobTypeFilter(v);
                setPage(1);
              }}
            />
            <FilterDropdown
              label="Work Mode"
              value={workModeFilter}
              options={workModes}
              onChange={(v) => {
                setWorkModeFilter(v);
                setPage(1);
              }}
            />
            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={["ACTIVE", "CLOSED"]}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            />
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all cursor-pointer"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <Loader2 size={30} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading jobs…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3.5 text-sm max-w-md w-full">
            <AlertCircle size={16} className="shrink-0" /> {fetchError}
          </div>
          <button
            onClick={fetchJobs}
            className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Job Title",
                    "Company",
                    "Job Type",
                    "Work Mode",
                    "Experience",
                    "Last Date",
                    "Status",
                    "Applicants",
                    "Skills",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <Search size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          No jobs found matching your filters.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="text-xs text-blue-600 hover:underline cursor-pointer"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((job, i) => (
                    <tr
                      key={job.id}
                      className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                    >
                      {/* Job Title */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {job.title}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <MapPin size={10} /> {job.location || "—"}
                        </p>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                        {job.companyName || "—"}
                      </td>

                      {/* Job Type */}
                      <td className="px-4 py-3.5">
                        <Badge value={job.jobType} map={JOB_TYPE_COLORS} />
                      </td>

                      {/* Work Mode */}
                      <td className="px-4 py-3.5">
                        <Badge value={job.workMode} map={WORK_MODE_COLORS} />
                      </td>

                      {/* Experience */}
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {fmtExp(job.experienceRequired)}
                      </td>

                      {/* Last Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${isExpired(job.lastDateToApply) ? "text-gray-400 line-through" : isExpiringSoon(job.lastDateToApply) ? "text-red-500" : "text-gray-700"}`}
                        >
                          {fmt(job.lastDateToApply)}
                        </span>
                        {isExpired(job.lastDateToApply) && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Deadline passed
                          </p>
                        )}
                        {isExpiringSoon(job.lastDateToApply) && (
                          <p className="text-[10px] text-red-400 mt-0.5">
                            Expiring soon
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          value={
                            job.status ||
                            (isExpired(job.lastDateToApply)
                              ? "CLOSED"
                              : "ACTIVE")
                          }
                        />
                      </td>

                      {/* Applicants — NEW */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                            <Users size={13} className="text-blue-400" />
                            {applicantCounts[job.id] ?? "—"}
                          </span>
                          <button
                            onClick={() =>
                              navigate(`/manage-jobs/${job.id}/applicants`)
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all whitespace-nowrap cursor-pointer"
                          >
                            <Users size={11} /> View
                          </button>
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap max-w-[160px]">
                          {(job.skills || []).slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            >
                              {typeof s === "string"
                                ? s
                                : s.name || s.skillName}
                            </span>
                          ))}
                          {(job.skills || []).length > 3 && (
                            <span className="text-xs text-blue-600 font-medium">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/edit-job/${job.id}`)}
                            title="Edit"
                            className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(job)}
                            title="Delete"
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing{" "}
              {filtered.length === 0 ? 0 : (safeP - 1) * rowsPerPage + 1} to{" "}
              {Math.min(safeP * rowsPerPage, filtered.length)} of{" "}
              {filtered.length} jobs
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
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          job={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
