// src/pages/CandidateProfilePage.jsx
// Navbar comes from CandidateLayout — do NOT add it here

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  MapPin,
  Pencil,
  Settings2,
  ChevronRight,
  Camera,
  FileText,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Trash2,
  Star,
  Shield,
  Upload,
  TrendingUp,
  User,
  Loader2,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────
// Donut chart — SVG
// ─────────────────────────────────────────────────────────────
function DonutChart({ percent }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="9"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#2563EB"
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">
        {percent}%
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Info Row
// ─────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="text-gray-400 mt-0.5 shrink-0" />
      <span className="w-24 text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 break-words min-w-0">
        {value || "—"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function CandidateProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const profileImageInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [resumeActionLoading, setResumeActionLoading] = useState(null);
  const [replaceTargetId, setReplaceTargetId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const candidateId = storedUser?.id;
  const displayName =
    user?.username ||
    user?.name ||
    storedUser?.username ||
    storedUser?.name ||
    "User";

  // ── Fetch user profile, resume, skills, applications ──────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, skillsRes, appsRes] = await Promise.allSettled([
          API.get("/users/me"),
          API.get("/skills/user"),
          API.get("/applications/my"),
        ]);

        if (userRes.status === "fulfilled") setUser(userRes.value.data);
        if (skillsRes.status === "fulfilled")
          setSkills(skillsRes.value.data || []);
        if (appsRes.status === "fulfilled")
          setApplications(appsRes.value.data || []);

        try {
          const resumeRes = await API.get("/resume/my");
          setResumes(resumeRes.data || []);
        } catch {
          setResumes([]);
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchAll();
  }, []);

  // ── Toast helper ───────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Resume helpers ─────────────────────────────────────────
  const refreshResumes = async () => {
    try {
      const res = await API.get("/resume/my");
      setResumes(res.data || []);
    } catch {
      setResumes([]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (resumes.length >= 3) {
      showToast("Maximum 3 resumes allowed. Delete one first.", "error");
      return;
    }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      showToast("Only PDF, DOC, DOCX files are allowed.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadLoading(true);
    try {
      await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshResumes();
      showToast("Resume uploaded successfully!");
    } catch (err) {
      showToast(err?.response?.data || "Upload failed. Try again.", "error");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSetPrimary = async (resumeId) => {
    setResumeActionLoading(resumeId);
    try {
      await API.put(`/resume/${resumeId}/primary`);
      await refreshResumes();
      showToast("Primary resume updated!");
    } catch (err) {
      showToast(err?.response?.data || "Failed to update primary resume.", "error");
    } finally {
      setResumeActionLoading(null);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm("Delete this resume?")) return;
    setResumeActionLoading(resumeId + "-del");
    try {
      await API.delete(`/resume/${resumeId}`);
      await refreshResumes();
      showToast("Resume deleted.");
    } catch (err) {
      showToast(err?.response?.data || "Delete failed.", "error");
    } finally {
      setResumeActionLoading(null);
    }
  };

  const handleReplaceResume = async (file) => {
    if (!file || !replaceTargetId) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      showToast("Only PDF, DOC, DOCX files are allowed.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5MB.", "error");
      return;
    }

    const wasPrimary = resumes.find((r) => r.id === replaceTargetId)?.primary;
    const targetId = replaceTargetId;
    setReplaceTargetId(null);
    setResumeActionLoading(targetId + "-replace");

    try {
      await API.delete(`/resume/${targetId}`);

      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (wasPrimary && res.data?.id) {
        await API.put(`/resume/${res.data.id}/primary`);
      }

      await refreshResumes();
      showToast("Resume replaced successfully!");
    } catch (err) {
      showToast(err?.response?.data || "Replace failed.", "error");
      await refreshResumes();
    } finally {
      setResumeActionLoading(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  // ── Drop handler ───────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // ── Profile image upload ───────────────────────────────────
  const handleProfileImageUpload = async (file) => {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("Only JPG, PNG, WEBP images are allowed.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/users/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({
        ...prev,
        profileImageUrl: res.data.profileImageUrl,
      }));
      showToast("Profile photo updated!");
    } catch (err) {
      showToast(err?.response?.data || "Photo upload failed.", "error");
    }
  };

  // ── Change password ────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = "Required";
    if (!pwForm.newPassword || pwForm.newPassword.length < 4)
      errs.newPassword = "Min 4 characters";
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }

    setPwLoading(true);
    try {
      await API.put("/users/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwErrors({});
      setPwOpen(false);
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to change password.",
        "error",
      );
    } finally {
      setPwLoading(false);
    }
  };

  // ── Edit profile ──────────────────────────────────────────
  const openEditModal = () => {
    setEditForm({
      username: user?.username || "",
      phone: user?.phone || "",
      location: user?.location || "",
      education: user?.education || "",
      aboutMe: user?.aboutMe || "",
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editForm.username?.trim()) errs.username = "Username is required";
    if (editForm.phone) {
      const cleanedPhone = editForm.phone.replace(/\D/g, "");

      if (cleanedPhone.length !== 10) {
        errs.phone = "Phone number must be exactly 10 digits";
      }
    }
    return errs;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = validateEditForm();
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setEditLoading(true);
    try {
      const res = await API.put("/users/me", {
        username: editForm.username.trim(),
        phone: editForm.phone.trim(),
        location: editForm.location.trim(),
        education: editForm.education.trim(),
        aboutMe: editForm.aboutMe.trim(),
      });
      setUser(res.data);
      setEditOpen(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(
        err?.response?.data?.message || err?.response?.data || "Update failed.",
        "error",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const profileCompletion = user
    ? Math.round(
        ([
          !!user.username,
          !!user.profileImageUrl,
          !!user.phone,
          !!user.location,
          !!user.education,
          !!user.aboutMe,
          resumes.length > 0,
          skills.length > 0,
        ].filter(Boolean).length /
          8) *
          100,
      )
    : 0;

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1460px] mx-auto px-3 sm:px-4 lg:px-5 py-4 sm:py-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all
            ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-5">
        <button
          onClick={() => navigate("/find-jobs")}
          className="text-blue-600 hover:underline font-medium cursor-pointer"
        >
          Home
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-500 font-medium">Profile</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Hero card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-100 select-none"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold select-none">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                  title="Change profile photo"
                >
                  <Camera size={13} className="text-gray-600" />
                </button>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) =>
                    handleProfileImageUpload(e.target.files?.[0])
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                  {displayName}
                </h1>
                <p className="text-blue-600 font-semibold text-sm mt-0.5">
                  Candidate
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                  <MapPin size={13} />
                  <span>India</span>
                </div>
              </div>

              <button
                onClick={openEditModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shrink-0 cursor-pointer"
              >
                <Pencil size={14} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Personal Info + Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>
                <button
                  onClick={openEditModal}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                <InfoRow icon={Mail} label="Email" value={user?.email} />

                <InfoRow icon={Phone} label="Phone" value={user?.phone} />

                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={user?.location}
                />

                <InfoRow
                  icon={GraduationCap}
                  label="Education"
                  value={user?.education}
                />

                <InfoRow icon={User} label="About" value={user?.aboutMe} />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings2 size={16} className="text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-900">Skills</h2>
                </div>
                <button
                  onClick={() => navigate("/skill-management")}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Manage Skills
                </button>
              </div>
              {skills.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No skills added yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s.id || s.name}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100"
                    >
                      {s.name || s.skillName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText size={14} className="text-blue-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">My Resumes</h2>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full
                  ${resumes.length >= 3 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                  {resumes.length} / 3
                </span>
              </div>
              {resumes.length < 3 && (
                <button
                  disabled={uploadLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-all disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {uploadLoading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  {uploadLoading ? "Uploading..." : "Upload Resume"}
                </button>
              )}
              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />
              <input
                ref={replaceInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleReplaceResume(e.target.files?.[0])}
              />
            </div>

            <div className="p-5">
              {/* Empty state */}
              {resumes.length === 0 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 py-12 px-6 cursor-pointer transition-all
                    ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/80"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                    ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
                    {uploadLoading
                      ? <Loader2 size={24} className="text-blue-500 animate-spin" />
                      : <Upload size={24} className={dragOver ? "text-blue-500" : "text-gray-400"} />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {dragOver ? "Drop to upload" : "Upload your resume"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Drag &amp; drop or click to browse · PDF, DOC, DOCX · Max 5MB
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Browse Files
                  </span>
                </div>
              )}

              {/* Resume cards */}
              {resumes.length > 0 && (
                <div className="flex flex-col gap-3">
                  {[...resumes].sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0)).map((r, idx) => {
                    const ext = r.originalFileName?.split(".").pop().toUpperCase() || "PDF";
                    const isPrimary = r.primary;
                    const isReplacing = resumeActionLoading === r.id + "-replace";
                    const isDeleting = resumeActionLoading === r.id + "-del";
                    const isSettingPrimary = resumeActionLoading === r.id;
                    const isAnyLoading = isReplacing || isDeleting || isSettingPrimary;

                    const extColor = ext === "PDF"
                      ? { bg: "bg-red-50", text: "text-red-500", border: "border-red-100" }
                      : { bg: "bg-indigo-50", text: "text-indigo-500", border: "border-indigo-100" };

                    return (
                      <div
                        key={r.id}
                        className={`relative rounded-xl border transition-all overflow-hidden
                          ${isPrimary
                            ? "border-blue-200 bg-linear-to-r from-blue-50/80 to-white shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}`}
                      >
                        {/* Primary left accent bar */}
                        {isPrimary && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                        )}

                        <div className="flex items-center gap-3.5 px-4 py-3.5 pl-5">
                          {/* File type badge */}
                          <div className={`w-11 h-13 rounded-xl border flex flex-col items-center justify-center shrink-0 py-2 px-1.5 gap-0.5
                            ${extColor.bg} ${extColor.border}`}>
                            <FileText size={14} className={extColor.text} />
                            <span className={`text-[9px] font-black tracking-wide ${extColor.text}`}>{ext}</span>
                          </div>

                          {/* File info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900 truncate max-w-65" title={r.originalFileName}>
                                {r.originalFileName}
                              </p>
                              {isPrimary && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shrink-0">
                                  <Star size={8} fill="white" />
                                  PRIMARY
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Uploaded{" "}
                              {r.uploadedAt
                                ? new Date(r.uploadedAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </p>
                          </div>

                          {/* Action buttons — right side */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={r.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Preview"
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                            >
                              <Eye size={13} />
                            </a>
                            <a
                              href={r.resumeUrl}
                              download={r.originalFileName}
                              title="Download"
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition-all cursor-pointer"
                            >
                              <Download size={13} />
                            </a>
                            <button
                              title="Replace"
                              disabled={isAnyLoading}
                              onClick={() => {
                                setReplaceTargetId(r.id);
                                setTimeout(() => replaceInputRef.current?.click(), 0);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isReplacing
                                ? <Loader2 size={13} className="animate-spin" />
                                : <RefreshCw size={13} />}
                            </button>
                            {!isPrimary && (
                              <button
                                title="Set as Primary"
                                disabled={isAnyLoading}
                                onClick={() => handleSetPrimary(r.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {isSettingPrimary
                                  ? <Loader2 size={13} className="animate-spin" />
                                  : <Star size={13} />}
                              </button>
                            )}
                            <button
                              title="Delete"
                              disabled={isAnyLoading}
                              onClick={() => handleDeleteResume(r.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isDeleting
                                ? <Loader2 size={13} className="animate-spin" />
                                : <Trash2 size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Loading overlay bar */}
                        {isAnyLoading && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 overflow-hidden">
                            <div className="h-full bg-blue-400 animate-pulse w-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add another — inline drop zone */}
                  {resumes.length < 3 && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl flex items-center justify-center gap-2 py-3.5 cursor-pointer transition-all text-xs font-semibold
                        ${dragOver
                          ? "border-blue-400 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-400 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-500"}`}
                    >
                      {uploadLoading
                        ? <><Loader2 size={13} className="animate-spin" /> Uploading...</>
                        : <><Upload size={13} /> Add another resume</>}
                    </div>
                  )}
                </div>
              )}

              {/* Info footer */}
              <div className="flex items-start gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 mt-4">
                <Star size={13} className="text-blue-500 shrink-0 mt-0.5" fill="currentColor" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Your <span className="font-semibold text-gray-700">Primary</span> resume is shared with recruiters when you apply.
                  Upload up to 3 versions and swap primary anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-full xl:w-[320px] flex flex-col gap-5">
          {/* Profile Completion */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Profile Completion
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <DonutChart percent={profileCompletion} />
              <div>
                <p className="text-base font-bold text-blue-600">
                  {profileCompletion >= 75 ? "Good Job!" : "Keep Going!"}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Complete your profile to increase job match accuracy.
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900">
                Activity Summary
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-3 p-3 rounded-xl min-w-0 bg-gray-50 hover:bg-blue-50 transition-colors group cursor-pointer"
                onClick={() => navigate("/my-applications")}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Briefcase size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {applications.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Applied Jobs</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  View all <ChevronRight size={12} />
                </div>
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-xl min-w-0 bg-gray-50 hover:bg-green-50 transition-colors group cursor-pointer"
                onClick={() => navigate("/find-jobs")}
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {skills.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Skills Added</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Find Jobs <ChevronRight size={12} />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl min-w-0 bg-gray-50 hover:bg-purple-50 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <User size={16} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {profileCompletion}%
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Profile Completion
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Improve <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900">Security</h2>
            </div>
            <button
              onClick={() => {
                setPwForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setPwErrors({});
                setShowPw({ current: false, newPw: false, confirm: false });
                setPwOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={15} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Change Password
                </span>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Edit Profile
              </h2>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleEditSubmit}
              className="px-6 py-5 flex flex-col gap-4"
            >
              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, username: e.target.value }))
                  }
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all
                      ${editErrors.username ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  placeholder="Your full name"
                />
                {editErrors.username && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.username}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  maxLength={11}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    if (value.length > 10) {
                      setEditErrors((p) => ({
                        ...p,
                        phone: "Phone number cannot exceed 10 digits",
                      }));
                    } else {
                      setEditErrors((p) => ({
                        ...p,
                        phone: "",
                      }));
                    }

                    setEditForm((p) => ({
                      ...p,
                      phone: value,
                    }));
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all
                      ${editErrors.phone ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  placeholder="+91 98765 43210"
                />
                {editErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.phone}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="City, State"
                />
              </div>

              {/* Education */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Education
                </label>
                <input
                  type="text"
                  value={editForm.education}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, education: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="B.Tech in Computer Science"
                />
              </div>

              {/* About Me */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  About Me
                </label>
                <textarea
                  value={editForm.aboutMe}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, aboutMe: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  placeholder="Tell recruiters a bit about yourself..."
                />
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {editLoading && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Change Password
                </h2>
              </div>
              <button
                onClick={() => setPwOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleChangePassword}
              className="px-6 py-5 flex flex-col gap-4"
            >
              {/* Current Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.current ? "text" : "password"}
                    value={pwForm.currentPassword}
                    onChange={(e) => {
                      setPwForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }));
                      setPwErrors((p) => ({ ...p, currentPassword: "" }));
                    }}
                    placeholder="Enter current password"
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-xl outline-none transition-all
                        ${pwErrors.currentPassword ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, current: !p.current }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.newPw ? "text" : "password"}
                    value={pwForm.newPassword}
                    onChange={(e) => {
                      setPwForm((p) => ({ ...p, newPassword: e.target.value }));
                      setPwErrors((p) => ({ ...p, newPassword: "" }));
                    }}
                    placeholder="Min. 4 characters"
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-xl outline-none transition-all
                        ${pwErrors.newPassword ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, newPw: !p.newPw }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw.newPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.confirmPassword}
                    onChange={(e) => {
                      setPwForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }));
                      setPwErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
                    placeholder="Re-enter new password"
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-xl outline-none transition-all
                        ${pwErrors.confirmPassword ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, confirm: !p.confirm }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPwOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {pwLoading && <Loader2 size={14} className="animate-spin" />}
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
