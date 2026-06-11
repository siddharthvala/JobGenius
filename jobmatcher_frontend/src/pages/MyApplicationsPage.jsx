// src/pages/MyApplicationsPage.jsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Bookmark,
  Send,
  MapPin,
  Briefcase,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  BookmarkCheck,
  BookmarkX,
  BadgeCheck,
  FileText,
  Eye,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

function getSkillNames(job) {
  const raw = job?.requiredSkills || job?.skills || [];
  return raw
    .map((s) => (typeof s === "string" ? s : s?.name || s?.skillName || ""))
    .filter(Boolean);
}

function matchColor(pct) {
  if (pct >= 80) return "#16a34a";
  if (pct >= 60) return "#2563eb";
  return "#f59e0b";
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  APPLIED: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  SCREENING: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  INTERVIEW: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  ACCEPTED: { bg: "#F0FDF4", text: "#166534", border: "#86EFAC" },
  REJECTED: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
};

function StatusBadge({ status }) {
  const key = status?.toUpperCase();
  const style = STATUS_STYLE[key] || {
    bg: "#F3F4F6",
    text: "#374151",
    border: "#E5E7EB",
  };
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
    >
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Company Logo
// ─────────────────────────────────────────────────────────────────────────────

function CompanyLogo({ name, logo, size = 48 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden"
    >
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="w-full h-full object-contain p-1"
        />
      ) : (
        <span
          className="font-bold text-gray-300"
          style={{ fontSize: size * 0.4 }}
        >
          {(name || "?")[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tip Banner
// ─────────────────────────────────────────────────────────────────────────────

function TipBanner({ text }) {
  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mt-5">
      <div className="w-8 h-8 rounded-full border-2 border-blue-300 flex items-center justify-center shrink-0 mt-0.5">
        <Info size={15} className="text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-blue-700">Tip</p>
        <p className="text-sm text-blue-600 mt-0.5">{text}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Icon size={26} className="text-gray-300" />
      </div>
      <p className="text-sm font-bold text-gray-700">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
      {action && (
        <button
          onClick={onAction}
          className="mt-1 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Applied Jobs Tab
// ─────────────────────────────────────────────────────────────────────────────

function AppliedJobsTab({ matchMap }) {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = () => {
    setLoading(true);
    setError("");
    // GET /applications/my — returns list of ApplicationResponse
    API.get("/applications/my")
      .then((r) => setApplications(r.data || []))
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </div>
        <button
          onClick={fetchApplications}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium"
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );

  if (applications.length === 0)
    return (
      <>
        <EmptyState
          icon={Send}
          title="No applications yet"
          subtitle="Start applying to jobs that match your skills."
          action="Find Jobs"
          onAction={() => navigate("/find-jobs")}
        />
        <TipBanner text="We will notify you about the status updates via email." />
      </>
    );

  return (
    <>
      {/* Table header — desktop */}
      <div className="hidden md:grid grid-cols-[2.4fr_1.1fr_1fr_0.9fr_0.7fr_1.2fr_1fr] gap-6 px-6 pb-3 border-b border-gray-100 items-center">
        {["Job", "Company", "Applied On", "Status", "Match", "Resume", "Action"].map(
          (h) => (
            <span
              key={h}
              className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >
              {h}
            </span>
          ),
        )}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-4">
        {applications.map((app) => {
          // ApplicationResponse fields: id, jobId, jobTitle, companyName, location,
          // jobType, appliedAt/createdAt, status, coverLetter
          const pct = matchMap[String(app.jobId)] ?? app.matchPercentage ?? 0;
          const date = fmtDate(app.appliedAt || app.createdAt);

          return (
            <div
              key={app.id}
              className="grid grid-cols-1 md:grid-cols-[2.4fr_1.1fr_1fr_0.9fr_0.7fr_1.2fr_1fr] gap-6 items-center px-6 py-5 hover:bg-gray-50 transition-all rounded-xl"
            >
              {/* Job info */}
              <div className="flex items-center gap-3">
                <CompanyLogo
                  name={app.companyName}
                  logo={app.companyLogo}
                  size={44}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {app.jobTitle || app.title}
                    </p>
                    <BadgeCheck size={13} className="text-blue-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {app.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={10} /> {app.location}
                      </span>
                    )}
                    {app.jobType && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Briefcase size={10} />{" "}
                          {app.jobType.replace(/_/g, " ")}
                        </span>
                      </>
                    )}
                  </div>
                  {/* Status badge on mobile */}
                  <div className="mt-1 md:hidden">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              </div>

              {/* Company */}
              <div className="hidden md:flex items-center">
                <p className="text-sm font-semibold text-gray-700">
                  {app.companyName || "—"}
                </p>
              </div>

              {/* Applied On */}
              <div className="hidden md:flex items-center">
                <p className="text-sm text-gray-600">{date}</p>
              </div>

              {/* Status */}
              <div className="hidden md:flex items-center">
                <StatusBadge status={app.status} />
              </div>

              {/* Match */}
              <div className="hidden md:flex items-center">
                <span
                  className="text-sm font-bold"
                  style={{ color: matchColor(pct) }}
                >
                  {pct}%
                </span>
              </div>

              {/* Resume */}
              <div className="hidden md:flex items-center">
                {app.selectedResumeFileName && app.selectedResumeUrl ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={13} className="text-gray-400 shrink-0" />
                    <span
                      className="text-xs text-gray-600 truncate max-w-28"
                      title={app.selectedResumeFileName}
                    >
                      {app.selectedResumeFileName}
                    </span>
                    <a
                      href={app.selectedResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Preview resume"
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                    >
                      <Eye size={13} />
                    </a>
                  </div>
                ) : (
                  <span className="text-sm text-gray-300">—</span>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 md:justify-start">
                <button
                  onClick={() => navigate(`/jobs/${app.jobId}`)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all whitespace-nowrap"
                >
                  <ExternalLink size={13} /> View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TipBanner text="We will notify you about the status updates via email." />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Saved Jobs Tab
// NOTE: Saved jobs are stored locally (localStorage) since the backend doesn't
//       have a saved-jobs endpoint. When you add one, swap the localStorage
//       logic with API calls.
// ─────────────────────────────────────────────────────────────────────────────

function SavedJobsTab({ matchMap }) {
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load saved job IDs from localStorage, then fetch job details
  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem("savedJobIds") || "[]");
    if (savedIds.length === 0) {
      setLoading(false);
      return;
    }

    API.get("/jobs")
      .then((r) => {
        const jobs = r.data || [];
        const saved = jobs.filter((j) => savedIds.includes(String(j.id)));
        setSavedJobs(saved);
        setAllJobs(jobs);
      })
      .catch(() => setError("Failed to load saved jobs."))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = (jobId) => {
    const ids = JSON.parse(localStorage.getItem("savedJobIds") || "[]");
    const updated = ids.filter((id) => String(id) !== String(jobId));
    localStorage.setItem("savedJobIds", JSON.stringify(updated));
    setSavedJobs((p) => p.filter((j) => String(j.id) !== String(jobId)));
  };

  const handleClearAll = () => {
    localStorage.setItem("savedJobIds", JSON.stringify([]));
    setSavedJobs([]);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </div>
      </div>
    );

  if (savedJobs.length === 0)
    return (
      <>
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          subtitle="Bookmark jobs while browsing to find them here later."
          action="Browse Jobs"
          onAction={() => navigate("/find-jobs")}
        />
        <TipBanner text="Review your saved jobs regularly and apply to the best matches!" />
      </>
    );

  return (
    <>
      {/* Clear all */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-all"
        >
          <Trash2 size={13} /> Clear All Saved
        </button>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {savedJobs.map((job) => {
          const skills = getSkillNames(job);
          const shown = skills.slice(0, 3);
          const extra = skills.length - shown.length;
          const pct = matchMap[String(job.id)] ?? job.matchPercentage ?? 0;
          // Saved date from localStorage
          const savedDates = JSON.parse(
            localStorage.getItem("savedJobDates") || "{}",
          );
          const savedDate = fmtDate(savedDates[String(job.id)] || null);

          return (
            <div
              key={job.id}
              className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.3fr_0.7fr] items-center px-7 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
            >
              {/* Job Info */}
              <div className="flex items-center gap-4 min-w-0 pr-3">
                <CompanyLogo
                  name={job.companyName}
                  logo={job.companyLogo}
                  size={54}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[15px] font-bold text-gray-900 truncate">
                      {job.title}
                    </p>

                    <BadgeCheck size={14} className="text-blue-500 shrink-0" />
                  </div>

                  <p className="text-sm text-gray-500 mt-0.5">
                    {job.companyName}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {job.location}
                      </span>
                    )}

                    {job.jobType && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} />
                        {job.jobType.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap items-center gap-2 lg:border-l lg:border-gray-100 lg:px-6 min-h-[72px]">
                {shown.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold whitespace-nowrap"
                  >
                    {s}
                  </span>
                ))}

                {extra > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold border border-gray-200">
                    +{extra}
                  </span>
                )}
              </div>

              {/* Match */}
              <div className="flex flex-col justify-center lg:border-l lg:border-gray-100 lg:px-6 min-h-[72px]">
                <span className="text-xs text-gray-400 font-medium">Match</span>

                <span
                  className="text-lg font-bold"
                  style={{ color: matchColor(pct) }}
                >
                  {pct}%
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-8 lg:border-l lg:border-gray-100 lg:px-6 min-h-[72px]">
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 font-medium">
                    Saved on
                  </p>

                  <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {savedDate}
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <ExternalLink size={15} />
                  </button>

                  <button
                    onClick={() => handleUnsave(job.id)}
                    title="Remove from saved"
                    className="w-9 h-9 rounded-xl border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <BookmarkCheck size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TipBanner text="Review your saved jobs regularly and apply to the best matches!" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from query param: ?tab=saved or ?tab=applied
  const params = new URLSearchParams(location.search);
  const initialTab = params.get("tab") === "saved" ? "saved" : "applied";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Match map from /jobmatch/match — shared between both tabs
  const [matchMap, setMatchMap] = useState({});

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
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
      .catch(() => {});
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(`/my-applications?tab=${tab}`, { replace: true });
  };

  const pageTitle = activeTab === "saved" ? "Saved Jobs" : "Applied Jobs";
  const pageSubtitle =
    activeTab === "saved"
      ? "Jobs you have saved for later."
      : "Jobs you have applied to.";

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 xl:px-13 py-5 sm:py-6">
        {" "}
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link
            to="/find-jobs"
            className="text-blue-600 hover:underline font-medium"
          >
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-blue-600 font-medium">Applications</span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-700 font-medium">{pageTitle}</span>
        </nav>
        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {pageTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pageSubtitle}</p>
        </div>
        {/* Main card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchTab("saved")}
              className={`relative flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors
                ${
                  activeTab === "saved"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Bookmark
                size={15}
                className={
                  activeTab === "saved" ? "fill-blue-600 text-blue-600" : ""
                }
              />
              Saved Jobs
              {activeTab === "saved" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => switchTab("applied")}
              className={`relative flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors
                ${
                  activeTab === "applied"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Send
                size={14}
                className={activeTab === "applied" ? "text-blue-600" : ""}
              />
              Applied Jobs
              {activeTab === "applied" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-5">
            {activeTab === "applied" ? (
              <AppliedJobsTab matchMap={matchMap} />
            ) : (
              <SavedJobsTab matchMap={matchMap} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
