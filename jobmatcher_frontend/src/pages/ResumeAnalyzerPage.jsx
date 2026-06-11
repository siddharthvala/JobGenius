// src/pages/ResumeAnalyzerPage.jsx
// Premium AI Resume Analyzer — Modern SaaS Dashboard UI
// All existing API integrations preserved. Only UI redesigned.

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  Target,
  Brain,
  TrendingUp,
  Award,
  RotateCcw,
  Search,
  Briefcase,
  File,
  MapPin,
  Clock,
  Building2,
  Zap,
  BarChart3,
  ChevronDown,
  Star,
  Shield,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { analyzeResume } from "../services/aiService";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtExp(v) {
  if (v == null || v === "") return "Not specified";
  const n = Number(v);
  if (n === 0) return "Fresher";
  if (n === 1) return "1 Year";
  if (n >= 5) return `${n}+ Years`;
  return `${n} Years`;
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────
function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const Icon =
    type === "error"
      ? XCircle
      : type === "success"
        ? CheckCircle2
        : AlertCircle;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm">
      <div
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl border text-sm font-medium ${styles[type]}`}
      >
        <Icon size={16} className="mt-0.5 shrink-0" />
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100 ml-1"
        >
          <XCircle size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Loading Overlay
// ─────────────────────────────────────────────────────────────
function LoadingOverlay() {
  const steps = [
    { icon: FileText, label: "Parsing resume..." },
    { icon: Brain, label: "AI extraction in progress..." },
    { icon: BarChart3, label: "Calculating ATS score..." },
    { icon: Sparkles, label: "Generating insights..." },
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 1500);
    return () => clearInterval(t);
  }, []);

  const { icon: Icon, label } = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div
        className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-10
        flex flex-col items-center gap-6 max-w-xs w-full mx-4"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={22} className="text-blue-600" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900 mb-1">
            Analyzing Resume
          </p>
          <p className="text-sm text-blue-600 font-medium">{label}</p>
        </div>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300
                ${i === step ? "w-6 bg-blue-500" : "w-1.5 bg-gray-200"}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Powered by NVIDIA NIM · Usually takes 5–15 seconds
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ResumeCard
// ─────────────────────────────────────────────────────────────
function ResumeCard({ resume, selected, onClick }) {
  const ext = resume.originalFileName?.split(".").pop()?.toUpperCase() || "PDF";
  const isPdf = ext === "PDF";

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border-2 p-3.5 w-full overflow-visible transition-all duration-200
        ${
          selected
            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md shadow-blue-100"
            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
        }`}
    >
      {selected && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full
  flex items-center justify-center shadow-md z-20"
        >
          <CheckCircle2 size={13} className="text-white" />
        </div>
      )}

      {resume.isPrimary && (
        <span
          className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full
          bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide"
        >
          Primary
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0
          ${isPdf ? "bg-red-100" : "bg-blue-100"}`}
        >
          <FileText
            size={15}
            className={isPdf ? "text-red-600" : "text-blue-600"}
          />
          <span
            className={`text-[8px] font-black mt-0.5 ${isPdf ? "text-red-500" : "text-blue-500"}`}
          >
            {ext}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {resume.originalFileName}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Uploaded {fmtDate(resume.uploadedAt)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(resume.resumeUrl, "_blank");
          }}
          title="Preview resume"
          className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold
            text-blue-500 border border-blue-200 bg-blue-50
            hover:bg-blue-500 hover:text-white hover:border-blue-500
            px-2.5 py-1.5 rounded-lg transition-all duration-200"
        >
          <Eye size={12} /> Preview
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UploadZone
// ─────────────────────────────────────────────────────────────
function UploadZone({ file, onFile, onRemove }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      onFile(e.dataTransfer.files[0]);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
        ${
          file
            ? "border-emerald-400 bg-emerald-50 cursor-default"
            : drag
              ? "border-blue-400 bg-blue-50 cursor-copy"
              : "border-gray-200 bg-gray-50/60 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
        }`}
    >
      <div className="flex flex-col items-center justify-center gap-2 py-5 px-4 text-center">
        {file ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline"
            >
              Remove file
            </button>
          </>
        ) : (
          <>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
              ${drag ? "bg-blue-100 scale-110" : "bg-gray-100"}`}
            >
              <Upload
                size={20}
                className={drag ? "text-blue-600" : "text-gray-400"}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {drag ? "Drop it here!" : "Drag & drop resume"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                or click to browse · PDF, DOCX · Max 5MB
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// JobCard
// ─────────────────────────────────────────────────────────────
function JobCard({ job, selected, onClick }) {
  const skills = job.skills || [];

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200
        ${
          selected
            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md shadow-blue-100"
            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
        }`}
    >
      {selected && (
        <div
          className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-blue-500 rounded-full
          flex items-center justify-center shadow-md"
        >
          <CheckCircle2 size={13} className="text-white" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100
            flex items-center justify-center shrink-0 mt-0.5"
          >
            <Briefcase size={14} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">
              {job.title}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
              <Building2 size={9} /> {job.companyName}
            </p>
          </div>
        </div>
        {job.jobType && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-600 shrink-0">
            {job.jobType}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-2.5">
        {job.location && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <MapPin size={9} /> {job.location}
          </span>
        )}
        {job.experienceRequired != null && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock size={9} /> {fmtExp(job.experienceRequired)}
          </span>
        )}
        {job.workMode && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <Zap size={9} /> {job.workMode}
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
          {skills.slice(0, 4).map((s) => {
            const label = typeof s === "object" ? s.name || s.id : s;
            return (
              <span
                key={label}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                  bg-blue-50 text-blue-600 border border-blue-100"
              >
                {label}
              </span>
            );
          })}
          {skills.length > 4 && (
            <span className="text-[10px] text-gray-400 self-center">
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ATSScoreRing
// ─────────────────────────────────────────────────────────────
function ATSScoreRing({ score }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 75 ? "#059669" : score >= 50 ? "#1a56db" : "#dc2626";
  const label =
    score >= 75 ? "Excellent" : score >= 50 ? "Average" : "Needs Work";
  const bg =
    score >= 75
      ? "from-emerald-50 to-green-50 border-emerald-100"
      : score >= 50
        ? "from-blue-50 to-indigo-50 border-blue-100"
        : "from-red-50 to-orange-50 border-red-100";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-gradient-to-br border ${bg}`}
    >
      <div className="relative w-44 h-44">
        <svg width="176" height="176" viewBox="0 0 176 176">
          <circle
            cx="88"
            cy="88"
            r={r}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
          />
          <circle
            cx="88"
            cy="88"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            strokeDashoffset={circ * 0.25}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "88px 88px",
              transition:
                "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-gray-900">{score}</span>
          <span className="text-sm text-gray-400 font-medium">/ 100</span>
        </div>
      </div>
      <span
        className="px-5 py-1.5 rounded-full text-sm font-bold"
        style={{ backgroundColor: color + "18", color }}
      >
        {label} ATS Score
      </span>
      <p
        className="text-xs text-center leading-relaxed max-w-[200px]"
        style={{ color: color + "cc" }}
      >
        {score >= 75
          ? "Your resume is well-optimized for ATS systems."
          : score >= 50
            ? "Some improvements will help pass ATS screening."
            : "Significant improvements needed for ATS filters."}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ScoreBar
// ─────────────────────────────────────────────────────────────
function ScoreBar({ label, score, maxScore, color, tag }) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {tag && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor: tag === "AI" ? "#EFF6FF" : "#F0FDF4",
                color: tag === "AI" ? "#1a56db" : "#059669",
              }}
            >
              {tag}
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-gray-800">
          {score}
          <span className="text-xs font-normal text-gray-400">/{maxScore}</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Chip
// ─────────────────────────────────────────────────────────────
function Chip({ label, variant = "neutral" }) {
  const styles = {
    matched: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    missing: "bg-red-50 text-red-600 border border-red-200",
    neutral: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function ResumeAnalyzerPage() {
  const abortRef = useRef(null);

  const [savedResumes, setSavedResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const [selectedResume, setSelectedResume] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeMode, setResumeMode] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("All");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    setResumesLoading(true);
    API.get("/resume/my")
      .then((r) => setSavedResumes(r.data || []))
      .catch(() => setSavedResumes([]))
      .finally(() => setResumesLoading(false));
  }, []);

  useEffect(() => {
    setJobsLoading(true);
    API.get("/jobs")
      .then((r) => {
        setJobs(r.data || []);
        setFilteredJobs(r.data || []);
      })
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    let list = [...jobs];
    if (jobSearch.trim()) {
      const q = jobSearch.toLowerCase();
      list = list.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.companyName?.toLowerCase().includes(q),
      );
    }
    if (jobFilter !== "All") {
      list = list.filter(
        (j) => j.jobType === jobFilter || j.workMode === jobFilter,
      );
    }
    setFilteredJobs(list);
  }, [jobSearch, jobFilter, jobs]);

  const jobTypes = [
    "All",
    ...new Set(jobs.map((j) => j.jobType).filter(Boolean)),
  ];

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(ext)) {
      showToast("Only PDF or DOCX supported.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      showToast("File must be under 5MB.");
      return;
    }
    setUploadedFile(f);
    setSelectedResume(null);
    setResumeMode("upload");
    setResult(null);
  };

  const handleSelectSaved = (r) => {
    const isSame = selectedResume?.id === r.id;
    setSelectedResume(isSame ? null : r);
    setUploadedFile(null);
    setResumeMode(isSame ? null : "saved");
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!resumeMode) {
      showToast("Select or upload a resume first.");
      return;
    }
    if (!selectedJob) {
      showToast("Select a job to compare against.", "info");
      return;
    }

    abortRef.current = new AbortController();
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeResume({
        resumeId: resumeMode === "saved" ? selectedResume?.id : undefined,
        file: resumeMode === "upload" ? uploadedFile : undefined,
        jobId: selectedJob?.id || undefined,
      });
      if (data.success) {
        setResult(data);
        showToast("Analysis complete!", "success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showToast(data.error || "Analysis failed.");
      }
    } catch {
      showToast("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSelectedResume(null);
    setUploadedFile(null);
    setResumeMode(null);
    setSelectedJob(null);
    setJobSearch("");
    setJobFilter("All");
  };

  const activeResumeName =
    resumeMode === "saved"
      ? selectedResume?.originalFileName
      : uploadedFile?.name;

  const canAnalyze = !!resumeMode && !!selectedJob;

  return (
    <>
      {loading && <LoadingOverlay />}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        <div className="w-full max-w-400 mx-auto px-3 sm:px-4 lg:px-6 xl:px-13 py-8">
          {/* ── Hero Banner ─────────────────────────────── */}
          {!result && (
            <div
              className="relative overflow-hidden rounded-3xl mb-8 fade-up"
              style={{
                background:
                  "linear-gradient(135deg, #1a56db 0%, #1e429f 60%, #1e3a8a 100%)",
              }}
            >
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-blue-400/10 translate-y-1/2" />
              <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div
                    className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20
                    text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm"
                  >
                    <Sparkles size={11} /> Powered by NVIDIA NIM
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                    AI Resume Analyzer
                  </h1>
                  <p className="text-blue-200 text-sm max-w-md leading-relaxed">
                    Intelligent ATS scoring, skill gap analysis, and
                    personalized career recommendations — all in seconds.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      label: "Resumes",
                      value: resumesLoading ? "—" : savedResumes.length,
                      icon: FileText,
                    },
                    {
                      label: "Jobs",
                      value: jobsLoading ? "—" : jobs.length,
                      icon: Briefcase,
                    },
                    { label: "Accuracy", value: "~95%", icon: Shield },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3
                        border border-white/20 min-w-[76px]"
                    >
                      <Icon size={13} className="text-blue-300 mx-auto mb-1" />
                      <p className="text-xl font-black text-white">{value}</p>
                      <p className="text-[10px] text-blue-300 font-medium">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ─────────────────────────────────── */}
          {result && (
            <div className="fade-up flex flex-col gap-5">
              {/* Result header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Analysis Results
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-700">
                      {activeResumeName}
                    </span>
                    {selectedJob && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="text-blue-600 font-semibold">
                          {selectedJob.title}
                        </span>
                        <span className="text-gray-400">
                          {" "}
                          at {selectedJob.companyName}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl
                    border-2 border-gray-200 text-sm font-bold text-gray-600
                    hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <RotateCcw size={14} /> Analyze Another
                </button>
              </div>

              {/* Row 1 — Score + Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Score Ring */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-fit self-start">
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Target size={13} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">ATS Score</h3>
                  </div>
                  <div className="p-6 flex justify-center">
                    <ATSScoreRing score={result.atsScore} />
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
                        <TrendingUp size={13} className="text-purple-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        Score Breakdown
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        AI
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Logic
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-5">
                    <ScoreBar
                      label="Skills Match"
                      score={result.skillScore}
                      maxScore={60}
                      color="#1a56db"
                      tag="Logic"
                    />
                    <ScoreBar
                      label="Experience"
                      score={result.experienceScore}
                      maxScore={20}
                      color="#7c3aed"
                      tag="AI"
                    />
                    <ScoreBar
                      label="Projects"
                      score={result.projectScore}
                      maxScore={10}
                      color="#0891b2"
                      tag="AI"
                    />
                    <ScoreBar
                      label="Resume Strength"
                      score={result.strengthScore}
                      maxScore={10}
                      color="#059669"
                      tag="Logic"
                    />
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Total ATS Score
                      </span>
                      <span className="text-2xl font-black text-gray-900">
                        {result.atsScore}
                        <span className="text-sm font-normal text-gray-400">
                          /100
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 — Extracted Profile + Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Extracted Profile */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                      <FileText size={13} className="text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">
                      Extracted Profile
                    </h3>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    {[
                      { label: "Experience", value: fmtExp(result.experienceYears) },
                      { label: "Education", value: result.education },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                      >
                        <span className="w-24 text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">
                          {label}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {value || "—"}
                        </span>
                      </div>
                    ))}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
                        Suggested Roles
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(result.suggestedRoles || []).map((r) => (
                          <span
                            key={r}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                              bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"
                          >
                            <Star size={10} /> {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Award size={13} className="text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Skills Analysis</h3>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    {result.matchedSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 size={12} />
                          Matched ({result.matchedSkills.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedSkills.map((s) => (
                            <Chip key={s} label={s} variant="matched" />
                          ))}
                        </div>
                      </div>
                    )}
                    {result.missingSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1.5">
                          <XCircle size={12} />
                          Missing ({result.missingSkills.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingSkills.map((s) => (
                            <Chip key={s} label={s} variant="missing" />
                          ))}
                        </div>
                      </div>
                    )}
                    {result.extractedSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 mb-2">
                          All Extracted Skills ({result.extractedSkills.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.extractedSkills.map((s) => (
                            <Chip key={s} label={s} variant="neutral" />
                          ))}
                        </div>
                      </div>
                    )}
                    {!result.matchedSkills?.length &&
                      !result.missingSkills?.length && (
                        <div className="text-center py-8">
                          <BarChart3
                            size={30}
                            className="text-gray-200 mx-auto mb-2"
                          />
                          <p className="text-sm text-gray-400">
                            No skill comparison data
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              {result.recommendations?.length > 0 && (
                <div
                  className="relative overflow-hidden rounded-3xl p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)",
                  }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          AI Recommendations
                        </h3>
                        <p className="text-blue-300 text-xs">
                          Powered by NVIDIA NIM
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.recommendations.map((tip, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl
                            px-4 py-3.5 border border-white/15"
                        >
                          <span
                            className="w-5 h-5 rounded-full bg-blue-400/40 flex items-center justify-center
                            text-[9px] font-black text-white shrink-0 mt-0.5"
                          >
                            {i + 1}
                          </span>
                          <p className="text-sm text-blue-50 leading-relaxed">
                            {tip}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-blue-400 text-[11px] mt-4 text-right">
                      AI-generated · Not a guarantee of employment
                    </p>
                  </div>
                </div>
              )}

              {/* Perfect score */}
              {result.recommendations?.length === 0 &&
                result.atsScore >= 90 && (
                  <div className="flex items-center gap-4 bg-emerald-50 border-2 border-emerald-200 rounded-3xl px-6 py-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Shield size={22} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800">
                        Excellent Resume!
                      </p>
                      <p className="text-sm text-emerald-600">
                        Your ATS score is {result.atsScore}/100 — no major
                        improvements needed.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* ── SELECTION UI ─────────────────────────────── */}
          {!result && (
            <div className="fade-up flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Resume Selection */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FileText size={13} className="text-blue-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">
                          Select Resume
                        </h2>
                        <p className="text-[11px] text-gray-400">
                          Choose from saved or upload new
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    {resumesLoading ? (
                      <div className="flex flex-col gap-2">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-[68px] w-full" />
                        ))}
                      </div>
                    ) : savedResumes.length > 0 ? (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Saved Resumes
                        </p>
                        <div className="flex flex-col gap-2">
                          {savedResumes.map((r) => (
                            <ResumeCard
                              key={r.id}
                              resume={r}
                              selected={selectedResume?.id === r.id}
                              onClick={() => handleSelectSaved(r)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl">
                        <FileText
                          size={28}
                          className="text-gray-300 mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-400">
                          No resumes saved yet
                        </p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          Go to Profile to upload one
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs text-gray-400 font-medium">
                        {savedResumes.length > 0
                          ? "or upload new"
                          : "upload resume"}
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <UploadZone
                      file={uploadedFile}
                      onFile={handleFile}
                      onRemove={() => {
                        setUploadedFile(null);
                        setResumeMode(null);
                      }}
                    />
                  </div>
                </div>

                {/* Job Selection */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[480px] sm:h-[540px] lg:h-[620px]">
                  {" "}
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Briefcase size={13} className="text-purple-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">Select Job</h2>
                        <p className="text-[11px] text-gray-400">
                          Compare resume against a job's requirements
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1 overflow-hidden">
                    {/* Search + Filter */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                          placeholder="Search jobs or companies..."
                          className="w-full pl-8 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl
                            bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400
                            focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <select
                          value={jobFilter}
                          onChange={(e) => setJobFilter(e.target.value)}
                          className="appearance-none pl-3 pr-7 py-2.5 text-xs border border-gray-200 rounded-xl
                            bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer"
                        >
                          {jobTypes.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={11}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Selected job pill */}
                    {selectedJob && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 truncate flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> {selectedJob.title} ·{" "}
                          {selectedJob.companyName}
                        </p>
                        <button
                          onClick={() => setSelectedJob(null)}
                          className="text-blue-400 hover:text-blue-600 shrink-0 ml-2"
                        >
                          <XCircle size={13} />
                        </button>
                      </div>
                    )}

                    {/* Job list */}
                    <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2">
                      {jobsLoading ? (
                        <div className="flex flex-col gap-2">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-28 w-full" />
                          ))}
                        </div>
                      ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-10">
                          <Briefcase
                            size={28}
                            className="text-gray-200 mx-auto mb-2"
                          />
                          <p className="text-sm text-gray-400">No jobs found</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 w-full">
                          {filteredJobs.map((job) => (
                            <JobCard
                              key={job.id}
                              job={job}
                              selected={selectedJob?.id === job.id}
                              onClick={() =>
                                setSelectedJob(
                                  selectedJob?.id === job.id ? null : job,
                                )
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Analyze Panel */}
              <div className="mt-2">
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/60 px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                        ${
                          resumeMode
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <FileText size={11} />
                        {resumeMode ? activeResumeName : "No resume selected"}
                      </div>
                      <span className="text-gray-300 text-sm">→</span>
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                        ${
                          selectedJob
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Briefcase size={11} />
                        {selectedJob ? selectedJob.title : "No job selected"}
                      </div>
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={!canAnalyze}
                      className={`flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-bold
                        transition-all duration-200 shrink-0 active:scale-[0.97]
                        ${
                          canAnalyze
                            ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:from-blue-700 hover:to-indigo-800"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <Brain size={15} />
                      Analyze Resume
                      {canAnalyze && <ArrowUpRight size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
