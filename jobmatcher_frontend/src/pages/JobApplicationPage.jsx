// src/pages/JobApplicantsPage.jsx
// Navbar comes from RecruiterLayout — do NOT add it here

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  ChevronDown,
  Mail,
  Calendar,
  X,
  FileText,
  Eye,
  Download,
  BarChart3,
  CheckCircle2,
  XCircle,
  Target,
  TrendingUp,
  SortAsc,
  Zap,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────
const STATUSES = ["APPLIED", "SCREENING", "INTERVIEW", "ACCEPTED", "REJECTED"];

const STATUS_STYLES = {
  APPLIED: {
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#BFDBFE",
    dot: "#3B82F6",
  },
  SCREENING: {
    bg: "#FFFBEB",
    text: "#92400E",
    border: "#FDE68A",
    dot: "#F59E0B",
  },
  INTERVIEW: {
    bg: "#F5F3FF",
    text: "#5B21B6",
    border: "#DDD6FE",
    dot: "#8B5CF6",
  },
  ACCEPTED: {
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
    dot: "#22C55E",
  },
  REJECTED: {
    bg: "#FEF2F2",
    text: "#991B1B",
    border: "#FECACA",
    dot: "#EF4444",
  },
};

function StatusBadge({ value }) {
  const key = value?.toUpperCase();
  const s = STATUS_STYLES[key] || {
    bg: "#F9FAFB",
    text: "#6B7280",
    border: "#E5E7EB",
    dot: "#9CA3AF",
  };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
    >
      <span
        style={{ backgroundColor: s.dot }}
        className="w-1.5 h-1.5 rounded-full shrink-0"
      />
      {key}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// StatusDropdown — portal-based (unchanged)
// ─────────────────────────────────────────────────────────────
function StatusDropdown({
  applicationId,
  currentStatus,
  onStatusChange,
  updating,
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropRef = useRef(null);

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 160),
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropRef.current &&
        !dropRef.current.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const currentKey = currentStatus?.toUpperCase();
  const currentStyle = STATUS_STYLES[currentKey];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={open ? () => setOpen(false) : openDropdown}
        disabled={updating}
        style={
          currentStyle
            ? { borderColor: currentStyle.border, color: currentStyle.text }
            : {}
        }
        className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border bg-white text-xs font-semibold
          transition-all disabled:opacity-50 hover:shadow-sm w-full justify-between cursor-pointer"
      >
        {updating ? (
          <span className="flex items-center gap-1.5 w-full justify-center text-gray-500">
            <Loader2 size={11} className="animate-spin" /> Saving…
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5 truncate">
              {currentStyle && (
                <span
                  style={{ backgroundColor: currentStyle.dot }}
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                />
              )}
              <span className="truncate">{currentKey || "Set status"}</span>
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform shrink-0 ml-1 ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={dropRef}
            style={{
              position: "absolute",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Change Status
              </p>
            </div>
            {STATUSES.map((s) => {
              const style = STATUS_STYLES[s];
              const isCurrent = s === currentKey;
              return (
                <div
                  key={s}
                  onClick={() => {
                    if (!isCurrent) onStatusChange(applicationId, s);
                    setOpen(false);
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2
                  ${isCurrent ? "opacity-40 cursor-default bg-gray-50" : "hover:bg-gray-50"}`}
                  style={{ color: style.text }}
                >
                  <span
                    style={{ backgroundColor: style.dot }}
                    className="w-2 h-2 rounded-full shrink-0"
                  />
                  {s}
                  {isCurrent && (
                    <span className="ml-auto text-[10px] text-gray-400 font-normal">
                      current
                    </span>
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ATS Score Badge
// ─────────────────────────────────────────────────────────────
function ATSBadge({ score }) {
  if (score == null)
    return <span className="text-xs text-gray-300 font-medium">N/A</span>;
  const color = score >= 80 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626";
  const bg = score >= 80 ? "#f0fdf4" : score >= 60 ? "#fffbeb" : "#fef2f2";
  const border = score >= 80 ? "#bbf7d0" : score >= 60 ? "#fde68a" : "#fecaca";
  return (
    <div>
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        {score}%
      </span>
      <div className="flex items-center gap-1.5 mt-1.5">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ATS Modal
// ─────────────────────────────────────────────────────────────
function ATSModal({ applicant, onClose }) {
  const score = applicant.atsScore;
  const matched = applicant.matchedSkills || [];
  const missing = applicant.missingSkills || [];
  const name =
    applicant.candidateName ||
    applicant.userName ||
    applicant.name ||
    "Candidate";
  const color = score >= 80 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626";
  const label =
    score >= 80
      ? "Strong Match"
      : score >= 60
        ? "Moderate Match"
        : "Weak Match";
  const r = 40;
  const circ = 2 * Math.PI * r;
  const filled = score != null ? (score / 100) * circ : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <BarChart3 size={15} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">ATS Analysis</h3>
              <p className="text-[11px] text-gray-400">{name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 border-b border-gray-100">
          {score != null ? (
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0">
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r={r}
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={`${filled} ${circ}`}
                    strokeLinecap="round"
                    strokeDashoffset={circ * 0.25}
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "48px 48px",
                      transition: "stroke-dasharray 0.8s ease",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-gray-900">
                    {score}
                  </span>
                  <span className="text-[9px] text-gray-400">/100</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1.5">
                  ATS Score
                </p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: color + "15", color }}
                >
                  {label}
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  {matched.length} matched · {missing.length} missing
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Target size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">ATS score not available</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 flex flex-col gap-4 max-h-60 overflow-y-auto">
          {matched.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Matched ({matched.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matched.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missing.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1.5">
                <XCircle size={12} /> Missing ({missing.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {matched.length === 0 && missing.length === 0 && score != null && (
            <p className="text-sm text-gray-400 text-center py-2">
              No skill data available
            </p>
          )}
        </div>
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────
// Stats Bar
// ─────────────────────────────────────────────────────────────
function StatsBar({ applicants }) {
  const withScore = applicants.filter((a) => a.atsScore != null);
  const avg = withScore.length
    ? Math.round(
        withScore.reduce((s, a) => s + a.atsScore, 0) / withScore.length,
      )
    : null;
  const strong = withScore.filter((a) => a.atsScore >= 80).length;
  const weak = withScore.filter((a) => a.atsScore < 60).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {[
        {
          label: "Total Applicants",
          value: applicants.length,
          icon: Users,
          color: "#2563eb",
        },
        {
          label: "Avg ATS Score",
          value: avg != null ? `${avg}%` : "—",
          icon: Target,
          color: "#7c3aed",
        },
        {
          label: "Strong (80+)",
          value: strong,
          icon: ShieldCheck,
          color: "#059669",
        },
        {
          label: "Weak (<60)",
          value: weak,
          icon: TrendingUp,
          color: "#dc2626",
        },
      ].map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: color + "12" }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <div>
            <p className="text-xl font-black text-gray-900 leading-none">
              {value}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Action Menu — clean popover replacing 3 stacked buttons
// ─────────────────────────────────────────────────────────────
function ActionMenu({ app, onViewATS, onShortlist, updatingId }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const isShortlisted = app.status?.toUpperCase() === "SCREENING";
  const updating = updatingId === app.id;

  const openMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // Open to the left of the button so it doesn't clip
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 180,
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={open ? () => setOpen(false) : openMenu}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center
          hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
      >
        <MoreHorizontal size={15} className="text-gray-500" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: 196,
              zIndex: 9999,
            }}
            className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Actions
              </p>
            </div>

            {/* View ATS Analysis */}
            <button
              onClick={() => {
                onViewATS(app);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-blue-600
              hover:bg-blue-50 transition-all text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <BarChart3 size={13} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700">ATS Analysis</p>
                <p className="text-[10px] text-gray-400">
                  View score &amp; skills
                </p>
              </div>
            </button>

            <div className="h-px bg-gray-100 mx-3" />

            {/* Shortlist */}
            {isShortlisted ? (
              <div className="flex items-center gap-3 px-4 py-3 opacity-60">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600">
                    Shortlisted
                  </p>
                  <p className="text-[10px] text-gray-400">Already screening</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onShortlist(app.id);
                  setOpen(false);
                }}
                disabled={updating}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-all text-left disabled:opacity-50 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  {updating ? (
                    <Loader2
                      size={13}
                      className="text-amber-600 animate-spin"
                    />
                  ) : (
                    <Zap size={13} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-700">Shortlist</p>
                  <p className="text-[10px] text-gray-400">Move to screening</p>
                </div>
              </button>
            )}

            <div className="h-px bg-gray-100 mx-3" />

            {/* Resume actions */}
            {app.selectedResumeUrl ? (
              <>
                <a
                  href={app.selectedResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Eye size={13} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      Preview Resume
                    </p>
                    <p className="text-[10px] text-gray-400">Open in new tab</p>
                  </div>
                </a>
                <a
                  href={app.selectedResumeUrl}
                  download
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Download size={13} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      Download Resume
                    </p>
                    <p className="text-[10px] text-gray-400">Save to device</p>
                  </div>
                </a>
              </>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText size={13} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-400">No resume submitted</p>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [atsModal, setATSModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setFetchError("");
    Promise.all([
      API.get(`/applications/job/${jobId}`),
      API.get(`/jobs/${jobId}`),
    ])
      .then(([appRes, jobRes]) => {
        setApplicants(appRes.data || []);
        setJobTitle(jobRes.data?.title || "");
      })
      .catch(() =>
        setFetchError("Failed to load applicants. Please try again."),
      )
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    setUpdateError("");
    try {
      await API.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: newStatus } : a,
        ),
      );
    } catch {
      setUpdateError("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShortlist = (applicationId) =>
    handleStatusChange(applicationId, "SCREENING");

  const sortedApplicants = [...applicants].sort((a, b) => {
    if (sortBy === "ats_desc") return (b.atsScore ?? -1) - (a.atsScore ?? -1);
    if (sortBy === "ats_asc") return (a.atsScore ?? 999) - (b.atsScore ?? 999);
    return 0;
  });

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

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = applicants.filter((a) => a.status?.toUpperCase() === s).length;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-13 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/manage-jobs")}
            className="mt-0.5 p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Job Applicants
            </h1>
            {jobTitle && (
              <p className="text-gray-500 text-sm mt-0.5">
                Applicants for{" "}
                <span className="font-semibold text-gray-700">{jobTitle}</span>
              </p>
            )}
          </div>
        </div>
        {!loading && !fetchError && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl shrink-0 w-fit">
            <Users size={15} className="text-blue-500" />
            <span className="text-sm font-semibold text-blue-700">
              {applicants.length} Applicant{applicants.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Status summary pills */}
      {!loading && !fetchError && applicants.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => {
            if (statusCounts[s] === 0) return null;
            const style = STATUS_STYLES[s];
            return (
              <div
                key={s}
                style={{
                  backgroundColor: style.bg,
                  borderColor: style.border,
                  color: style.text,
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold"
              >
                <span
                  style={{ backgroundColor: style.dot }}
                  className="w-2 h-2 rounded-full"
                />
                {s}
                <span className="font-bold ml-0.5">{statusCounts[s]}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats bar */}
      {!loading && !fetchError && applicants.length > 0 && (
        <StatsBar applicants={applicants} />
      )}

      {/* Sort + count */}
      {!loading && !fetchError && applicants.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {applicants.length}
            </span>{" "}
            applicant{applicants.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <SortAsc size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Sort:</span>
            <div className="flex gap-1.5">
              {[
                { value: "latest", label: "Latest" },
                { value: "ats_desc", label: "Highest ATS" },
                { value: "ats_asc", label: "Lowest ATS" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                    ${
                      sortBy === value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Update error */}
      {updateError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          <AlertCircle size={15} className="shrink-0" />
          <span className="flex-1">{updateError}</span>
          <button
            onClick={() => setUpdateError("")}
            className="p-0.5 hover:bg-red-100 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <Loader2 size={30} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading applicants…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3.5 text-sm max-w-md w-full">
            <AlertCircle size={16} className="shrink-0" /> {fetchError}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Users size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No applicants yet for this job.
          </p>
          <p className="text-xs text-gray-400">
            Applications will appear here once candidates apply.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto rounded-2xl">
            <table
              className="w-full"
              style={{ minWidth: "980px", tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: "44px" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "72px" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {[
                    "#",
                    "Candidate",
                    "Email",
                    "Applied On",
                    "ATS Score",
                    "Match",
                    "Status",
                    "Resume",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedApplicants.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-blue-50/20 transition-colors ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                  >
                    {/* # */}
                    <td className="px-4 py-4 text-xs text-gray-400 font-medium">
                      {i + 1}
                    </td>

                    {/* Candidate */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200
                          flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm"
                        >
                          {(app.candidateName ||
                            app.userName ||
                            app.name ||
                            "?")[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {app.candidateName || app.userName || app.name || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail size={12} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500 truncate">
                          {app.candidateEmail || app.email || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Applied On */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar
                          size={12}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="text-sm text-gray-500">
                          {fmt(app.appliedAt || app.appliedOn || app.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* ATS Score */}
                    <td className="px-4 py-4">
                      <ATSBadge score={app.atsScore} />
                    </td>

                    {/* Match */}
                    <td className="px-4 py-4">
                      {app.matchedSkills?.length != null ? (
                        <div className="text-xs">
                          <span className="font-bold text-emerald-600">
                            {app.matchedSkills.length}
                          </span>
                          <span className="text-gray-400"> matched</span>
                          {app.missingSkills?.length > 0 && (
                            <>
                              <br />
                              <span className="font-bold text-red-500">
                                {app.missingSkills.length}
                              </span>
                              <span className="text-gray-400"> missing</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge value={app.status} />
                        <StatusDropdown
                          applicationId={app.id}
                          currentStatus={app.status}
                          onStatusChange={handleStatusChange}
                          updating={updatingId === app.id}
                        />
                      </div>
                    </td>

                    {/* Resume — file name only, actions moved to menu */}
                    <td className="px-4 py-4">
                      {app.selectedResumeFileName ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                            <FileText size={11} className="text-red-400" />
                          </div>
                          <span
                            className="text-xs font-medium text-gray-600 truncate"
                            title={app.selectedResumeFileName}
                          >
                            {app.selectedResumeFileName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>

                    {/* Actions — clean ⋯ button */}
                    <td className="px-4 py-4">
                      <ActionMenu
                        app={app}
                        onViewATS={setATSModal}
                        onShortlist={handleShortlist}
                        updatingId={updatingId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Total{" "}
              <span className="font-semibold text-gray-600">
                {applicants.length}
              </span>{" "}
              applicant{applicants.length !== 1 ? "s" : ""} · Sorted by{" "}
              {sortBy === "latest"
                ? "latest applied"
                : sortBy === "ats_desc"
                  ? "highest ATS"
                  : "lowest ATS"}
            </p>
          </div>
        </div>
      )}

      {atsModal && (
        <ATSModal applicant={atsModal} onClose={() => setATSModal(null)} />
      )}
    </div>
  );
}
