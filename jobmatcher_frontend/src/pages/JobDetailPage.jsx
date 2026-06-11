// src/pages/JobDetailPage.jsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Clock,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ChevronRight,
  Monitor,
  Users,
  Hash,
  Loader2,
  AlertCircle,
  X,
  Send,
  CheckCircle2,
  BarChart2,
  Building2,
  TrendingUp,
  RefreshCw,
  Trash2,
  Star,
  Eye,
  Upload,
  FileText,
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

function fmtSalary(s) {
  if (s == null) return null;

  const yearly = s * 12;

  const yearlyFormatted =
    yearly >= 100000
      ? `₹${(yearly / 100000).toFixed(1).replace(/\.0$/, "")}L/year`
      : `₹${yearly.toLocaleString("en-IN")}/year`;

  return `₹${s.toLocaleString("en-IN")}/month • ${yearlyFormatted}`;
}

function fmtExp(v) {
  if (v == null || v === "") return "Not specified";
  const n = Number(v);
  if (n === 0) return "Fresher";
  if (n === 1) return "1 Year";
  if (n >= 5) return `${n}+ Years`;
  return `${n} Years`;
}

function getSkillNames(job) {
  const raw = job?.requiredSkills || job?.skills || [];
  return raw
    .map((s) => (typeof s === "string" ? s : s?.name || s?.skillName || ""))
    .filter(Boolean);
}

function isExpiringSoon(d) {
  if (!d) return false;
  const diff = (new Date(d) - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

// ─────────────────────────────────────────────────────────────────────────────
// Match Ring
// ─────────────────────────────────────────────────────────────────────────────

function MatchRing({ pct = 0, size = 120, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#2563eb" : "#f59e0b";
  const label =
    pct >= 80 ? "Strong Match" : pct >= 60 ? "Good Match" : "Partial Match";
  const desc =
    pct >= 80
      ? "Great! You match most of the required skills for this job."
      : pct >= 60
        ? "You match many of the required skills. Consider improving a few more."
        : "You match some skills. Check skill gap for recommendations.";

  return (
    <div className="flex items-center gap-4">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-base font-bold" style={{ color }}>
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-1 max-w-[160px] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill chip
// ─────────────────────────────────────────────────────────────────────────────

function SkillChip({ name, highlight }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
      ${
        highlight
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {name}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta row item
// ─────────────────────────────────────────────────────────────────────────────

function MetaItem({ icon: Icon, label, value, red }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p
          className={`text-sm font-semibold mt-0.5 ${red ? "text-red-500" : "text-gray-800"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply Modal
// ─────────────────────────────────────────────────────────────────────────────

function ApplyModal({ job, onClose, onSuccess }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [uploadingLocal, setUploadingLocal] = useState(false);
  const [error, setError] = useState("");
  const localFileRef = useRef(null);

  useEffect(() => {
    API.get("/resume/my")
      .then((r) => {
        const list = r.data || [];
        const sorted = [...list].sort(
          (a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0),
        );
        setResumes(sorted);
        const primary = sorted.find((r) => r.primary);
        setSelectedResumeId(primary?.id ?? sorted[0]?.id ?? null);
      })
      .catch(() => {})
      .finally(() => setResumesLoading(false));
  }, []);

  const handleApply = async () => {
    if (!selectedResumeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.post(`/applications/${job.id}`, {
        coverLetter: coverLetter.trim() || null,
        selectedResumeId,
      });
      onSuccess(
        res.data?.id,
        res.data?.selectedResumeFileName,
        res.data?.selectedResumeUrl,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to apply. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocalFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLocal(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newResume = res.data;
      setResumes((prev) => [...prev, newResume]);
      setSelectedResumeId(newResume.id);
    } catch (err) {
      setError(
        err?.response?.data ||
          "Failed to upload resume. Max 5MB, PDF/DOC/DOCX only.",
      );
    } finally {
      setUploadingLocal(false);
      if (localFileRef.current) localFileRef.current.value = "";
    }
  };

  function fmtUploadDate(d) {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  function getExt(name) {
    if (!name) return "FILE";
    const dot = name.lastIndexOf(".");
    return dot !== -1 ? name.slice(dot + 1).toUpperCase() : "FILE";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Apply for this Job
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {job.title} · {job.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* Resume Selection */}
          <p className="text-sm font-semibold text-gray-800 mb-2.5">
            Select Resume <span className="text-red-400">*</span>
          </p>

          {resumesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={22} className="animate-spin text-blue-500" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>
                No resume uploaded. Please upload a resume from your{" "}
                <strong>Profile</strong> page before applying.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-5">
              {resumes.map((r) => {
                const ext = getExt(r.originalFileName);
                const isSelected = selectedResumeId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedResumeId(r.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {/* Ext badge */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold border ${
                        ext === "PDF"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-indigo-50 text-indigo-600 border-indigo-100"
                      }`}
                    >
                      {ext}
                    </div>

                    {/* Name + date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {r.originalFileName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Uploaded {fmtUploadDate(r.uploadedAt)}
                      </p>
                    </div>

                    {/* Badges + preview */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {r.primary && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
                          <Star size={9} fill="currentColor" /> PRIMARY
                        </span>
                      )}
                      <a
                        href={r.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Preview resume"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Eye size={14} />
                      </a>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Upload from device */}
          {!resumesLoading && (
            <>
              <input
                ref={localFileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleLocalFile}
              />
              <button
                type="button"
                onClick={() => localFileRef.current?.click()}
                disabled={uploadingLocal}
                className="w-full flex items-center gap-3 px-4 py-3 mb-5 rounded-xl border border-dashed border-gray-300 text-left hover:border-blue-400 hover:bg-blue-50/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                {uploadingLocal ? (
                  <Loader2
                    size={16}
                    className="animate-spin text-blue-500 shrink-0"
                  />
                ) : (
                  <Upload size={16} className="text-gray-400 shrink-0" />
                )}
                <span
                  className={`text-sm font-medium ${uploadingLocal ? "text-blue-600" : "text-gray-500"}`}
                >
                  {uploadingLocal ? "Uploading…" : "Upload from device"}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  PDF, DOC, DOCX · max 5 MB
                </span>
              </button>
            </>
          )}

          {/* Cover Letter */}
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Cover Letter{" "}
            <span className="text-gray-400 font-normal text-xs">
              (optional)
            </span>
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Tell the recruiter why you're a great fit for this role..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-gray-700 placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            {coverLetter.length} / 1000 characters
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={loading || !selectedResumeId}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Success Toast
// ─────────────────────────────────────────────────────────────────────────────

function SuccessToast({ onClose, resumeFileName, resumeUrl }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 max-w-sm">
      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">Application Submitted!</p>
        <p className="text-xs text-green-200 mt-0.5">
          We'll notify you on updates.
        </p>
        {resumeFileName && (
          <div className="flex items-center gap-1.5 mt-1.5 bg-green-700/50 rounded-lg px-2.5 py-1.5">
            <FileText size={11} className="text-green-200 shrink-0" />
            <span className="text-xs text-green-100 truncate">
              {resumeFileName}
            </span>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 hover:text-white text-green-200 transition-colors cursor-pointer"
                title="Preview resume"
              >
                <Eye size={12} />
              </a>
            )}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="hover:text-green-200 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function WithdrawToast({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4">
      <Trash2 size={18} />

      <div>
        <p className="text-sm font-bold">Application Withdrawn!</p>

        <p className="text-xs text-red-100 mt-0.5">
          You can apply again anytime.
        </p>
      </div>

      <button
        onClick={onClose}
        className="ml-2 hover:text-red-200 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [job, setJob] = useState(null);
  const [matchPct, setMatchPct] = useState(0);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [saved, setSaved] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("savedJobIds") || "[]");
      return ids.map(String).includes(String(id));
    } catch {
      return false;
    }
  });

  // ── Load state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Modal / toast ─────────────────────────────────────────────────────────
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [appliedResumeFileName, setAppliedResumeFileName] = useState(null);
  const [appliedResumeUrl, setAppliedResumeUrl] = useState(null);
  // ── 1. GET /jobs/{id} ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    API.get(`/jobs/${id}`)
      .then((r) => setJob(r.data))
      .catch(() => setError("Failed to load job details. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── 2. GET /applications/check/{jobId} ─────────────────────────────────────
  useEffect(() => {
    if (!id || !localStorage.getItem("token")) return;

    API.get(`/applications/check/${id}`)
      .then((r) => {
        const applied = r.data === true || r.data?.applied === true;

        setAlreadyApplied(applied);

        if (r.data?.applicationId) {
          setApplicationId(r.data.applicationId);
        }

        if (r.data?.resumeFileName) {
          setAppliedResumeFileName(r.data.resumeFileName);
        }

        if (r.data?.resumeUrl) {
          setAppliedResumeUrl(r.data.resumeUrl);
        }
      })
      .catch(() => {});
  }, [id]);

  // ── 3. GET /jobmatch/match — find this job's match % ──────────────────────
  useEffect(() => {
    if (!id || !localStorage.getItem("token")) return;
    API.get("/jobmatch/match")
      .then((r) => {
        const data = r.data || [];
        let pct = 0;
        if (Array.isArray(data)) {
          const found = data.find(
            (item) =>
              String(item.jobId ?? item.id ?? item.job?.id) === String(id),
          );
          pct =
            found?.matchPercentage ?? found?.matchScore ?? found?.score ?? 0;
        } else if (typeof data === "object") {
          pct = data[id] ?? data[String(id)] ?? 0;
        }
        setMatchPct(Math.round(Number(pct)));
      })
      .catch(() => {});
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApplySuccess = (appId, resumeFileName, resumeUrl) => {
    setShowApplyModal(false);
    setAlreadyApplied(true);
    setShowSuccess(true);
    if (appId) setApplicationId(appId);
    if (resumeFileName) setAppliedResumeFileName(resumeFileName);
    if (resumeUrl) setAppliedResumeUrl(resumeUrl);
  };

  const handleToggleSave = () => {
    setSaved((prev) => {
      const next = !prev;
      try {
        const ids = JSON.parse(localStorage.getItem("savedJobIds") || "[]").map(
          String,
        );
        if (next) {
          if (!ids.includes(String(id))) ids.push(String(id));
          const dates = JSON.parse(
            localStorage.getItem("savedJobDates") || "{}",
          );
          dates[String(id)] = new Date().toISOString();
          localStorage.setItem("savedJobDates", JSON.stringify(dates));
        } else {
          const filtered = ids.filter((x) => x !== String(id));
          localStorage.setItem("savedJobIds", JSON.stringify(filtered));
        }
        if (next) localStorage.setItem("savedJobIds", JSON.stringify(ids));
      } catch {}
      return next;
    });
  };
  const handleWithdrawApplication = async () => {
    try {
      setWithdrawLoading(true);

      await API.delete(`/applications/${applicationId}`);
      setAlreadyApplied(false);
      setApplicationId(null);
      setShowWithdrawSuccess(true);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to withdraw application. Please try again.",
      );
    } finally {
      setWithdrawLoading(false);
    }
  };
  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={30} className="animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Loading job details…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3.5 text-sm max-w-md w-full">
          <AlertCircle size={15} className="shrink-0" />{" "}
          {error || "Job not found."}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium"
          >
            <RefreshCw size={13} /> Try again
          </button>
          <span className="text-gray-300">·</span>
          <button
            onClick={() => navigate("/find-jobs")}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Back to jobs
          </button>
        </div>
      </div>
    );
  }

  const skillNames = getSkillNames(job);
  const shownSkills = skillNames.slice(0, 6);
  const extraSkills = skillNames.length - shownSkills.length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link
            to="/find-jobs"
            className="text-blue-600 hover:underline font-medium"
          >
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link
            to="/find-jobs"
            className="text-blue-600 hover:underline font-medium"
          >
            Find Jobs
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-700 font-medium">Job Details</span>
        </nav>

        <div className="flex gap-5 items-start">
          {/* ── LEFT: Main content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* ── Job Header Card ── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.companyName}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-300">
                      {(job.companyName || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                    {job.title}
                  </h1>

                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Building2 size={14} className="text-blue-500" />
                      {job.companyName}
                      <BadgeCheck size={14} className="text-blue-500" />
                    </span>
                    <span className="text-gray-300">·</span>
                    {job.location && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={13} /> {job.location}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
                    {job.jobType && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Briefcase size={13} /> {job.jobType.replace(/_/g, " ")}
                      </span>
                    )}
                    {job.workMode && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Monitor size={13} /> {job.workMode.replace(/_/g, " ")}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <IndianRupee size={12} /> {fmtSalary(job.salary)}
                      </span>
                    )}
                    {job.experienceRequired != null && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Users size={13} /> {fmtExp(job.experienceRequired)}{" "}
                        Experience
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {(job.createdAt || job.postedOn) && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Posted{" "}
                        {timeAgo(job.createdAt || job.postedOn)}
                      </span>
                    )}
                    {job.lastDateToApply && (
                      <span
                        className={`flex items-center gap-1 ${isExpiringSoon(job.lastDateToApply) ? "text-red-500 font-semibold" : ""}`}
                      >
                        <Clock size={11} /> Apply by{" "}
                        {fmtDate(job.lastDateToApply)}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA buttons (desktop right) */}
                <div className="hidden sm:flex flex-col gap-2.5 shrink-0 min-w-[160px]">
                  {alreadyApplied ? (
                    <>
                      <button
                        onClick={handleWithdrawApplication}
                        disabled={withdrawLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      >
                        {withdrawLoading ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        {withdrawLoading
                          ? "Withdrawing..."
                          : "Withdraw Application"}
                      </button>
                      {appliedResumeFileName && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                          <FileText
                            size={11}
                            className="text-green-600 shrink-0"
                          />
                          <span
                            className="text-[11px] text-green-700 font-medium truncate flex-1"
                            title={appliedResumeFileName}
                          >
                            {appliedResumeFileName}
                          </span>
                          {appliedResumeUrl && (
                            <a
                              href={appliedResumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Preview"
                              className="text-green-500 hover:text-green-700 cursor-pointer shrink-0"
                            >
                              <Eye size={12} />
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 active:scale-[0.97] transition-all shadow-sm shadow-green-200 cursor-pointer"
                    >
                      <Send size={14} /> Apply Now
                    </button>
                  )}
                  <button
                    onClick={handleToggleSave}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                      ${saved ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                  >
                    {saved ? (
                      <BookmarkCheck size={14} />
                    ) : (
                      <Bookmark size={14} />
                    )}
                    {saved ? "Saved" : "Save Job"}
                  </button>
                </div>
              </div>

              {/* Tag badges row */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                {job.jobType && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                    {job.jobType.replace(/_/g, " ")}
                  </span>
                )}
                {job.workMode && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">
                    {job.workMode.replace(/_/g, " ")}
                  </span>
                )}
                {job.salary && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                    {fmtSalary(job.salary)}
                  </span>
                )}
                {job.experienceRequired != null && (
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100">
                    {fmtExp(job.experienceRequired)}
                  </span>
                )}
              </div>

              {/* Mobile CTA */}
              <div className="flex gap-2.5 mt-4 sm:hidden">
                {alreadyApplied ? (
                  <button
                    onClick={handleWithdrawApplication}
                    disabled={withdrawLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {withdrawLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}

                    {withdrawLoading ? "Withdrawing..." : "Withdraw"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all"
                  >
                    <Send size={14} /> Apply Now
                  </button>
                )}
                <button
                  onClick={handleToggleSave}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all
                    ${saved ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200"}`}
                >
                  {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>
            </div>

            {/* ── Job Description ── */}
            {job.description && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  Job Description
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            )}

            {/* ── Required Skills ── */}
            {skillNames.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillNames.map((s, i) => (
                    <SkillChip key={i} name={s} highlight={true} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Job Details Grid ── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Job Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetaItem
                  icon={MapPin}
                  label="Location"
                  value={job.location || "—"}
                />
                <MetaItem
                  icon={Monitor}
                  label="Work Mode"
                  value={job.workMode?.replace(/_/g, " ") || "—"}
                />
                <MetaItem
                  icon={Briefcase}
                  label="Job Type"
                  value={job.jobType?.replace(/_/g, " ") || "—"}
                />
                <MetaItem
                  icon={Calendar}
                  label="Posted Date"
                  value={fmtDate(job.createdAt || job.postedOn)}
                />
                <MetaItem
                  icon={IndianRupee}
                  label="Salary"
                  value={fmtSalary(job.salary) || "Not disclosed"}
                />
                <MetaItem
                  icon={Clock}
                  label="Last Date to Apply"
                  value={fmtDate(job.lastDateToApply)}
                  red={isExpiringSoon(job.lastDateToApply)}
                />
                <MetaItem
                  icon={Users}
                  label="Experience Required"
                  value={fmtExp(job.experienceRequired)}
                />
                {job.recruiterId && (
                  <MetaItem
                    icon={Hash}
                    label="Recruiter ID"
                    value={`#${job.recruiterId}`}
                  />
                )}
              </div>
            </div>

            {/* ── Skill Gap CTA Banner ── */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <BarChart2 size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  Understand Your Skill Gap for This Job
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  See the skills you are missing for this job and get
                  personalised recommendations to improve your match.
                </p>
              </div>
              <button
                onClick={() => navigate(`/skill-gap/${job.id}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm shadow-blue-200 whitespace-nowrap shrink-0"
              >
                View Skill Gap &amp; Recommendations <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
            {/* Match card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Match Percentage
              </h3>
              <MatchRing pct={matchPct} />
            </div>

            {/* Required skills (compact) */}
            {skillNames.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {shownSkills.map((s, i) => (
                    <SkillChip key={i} name={s} />
                  ))}
                  {extraSkills > 0 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full border border-gray-200">
                      +{extraSkills} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* About company */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                About Company
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.companyName}
                      className="w-full h-full object-contain p-0.5"
                    />
                  ) : (
                    <span className="text-base font-bold text-gray-300">
                      {(job.companyName || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    {job.companyName}{" "}
                    <BadgeCheck size={13} className="text-blue-500" />
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {job.companyDescription ||
                  `${job.companyName} is a leading company hiring top talent for ${job.title}.`}
              </p>
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold mt-3">
                View company profile <ArrowRight size={11} />
              </button>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/skill-gap/${job.id}`)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Skill Gap Analysis
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Find missing skills
                    </p>
                  </div>
                  <ArrowRight
                    size={13}
                    className="text-gray-300 group-hover:text-blue-500 ml-auto transition-colors"
                  />
                </button>
                <button
                  onClick={() => navigate("/skill-management")}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <BarChart2 size={14} className="text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Manage Skills
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Add or update your skills
                    </p>
                  </div>
                  <ArrowRight
                    size={13}
                    className="text-gray-300 group-hover:text-blue-500 ml-auto transition-colors"
                  />
                </button>
                <button
                  onClick={() => navigate("/my-applications")}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Briefcase size={14} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      My Applications
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Track your progress
                    </p>
                  </div>
                  <ArrowRight
                    size={13}
                    className="text-gray-300 group-hover:text-blue-500 ml-auto transition-colors"
                  />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* ── Success Toast ── */}
      {showSuccess && (
        <SuccessToast
          onClose={() => setShowSuccess(false)}
          resumeFileName={appliedResumeFileName}
          resumeUrl={appliedResumeUrl}
        />
      )}
      {showWithdrawSuccess && (
        <WithdrawToast onClose={() => setShowWithdrawSuccess(false)} />
      )}
    </div>
  );
}
