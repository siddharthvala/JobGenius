// src/pages/Register.jsx
// UI redesign only — all logic preserved exactly as-is
// Matches JobGenius brand: white + blue gradient

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import API from "../services/api";
import logo from "../assets/Images/Register_logo.png";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const err = {};
    if (!form.username.trim()) err.username = "Username is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Invalid email format";
    if (!form.password) err.password = "Password is required";
    else if (form.password.length < 4) err.password = "Min 4 characters";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/auth/register", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      navigate("/login", {
        state: { message: "Account created! Please log in." },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
        className="reg-wrap min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(135deg, #eff6ff 0%, #f0f4ff 50%, #eef2ff 100%)",
        }}
      >
        {/* Ambient blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, #bfdbfe, transparent)",
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-25"
            style={{
              background: "radial-gradient(circle, #c7d2fe, transparent)",
            }}
          />
        </div>

        <div
          className="relative z-10 w-full max-w-[960px] flex flex-col lg:flex-row rounded-[28px] overflow-hidden"
          style={{
            boxShadow:
              "0 32px 80px rgba(37,99,235,0.15), 0 0 0 1px rgba(255,255,255,0.7)",
          }}
        >
          {/* ════════════════ LEFT PANEL ════════════════ */}
          <div
            className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col p-8 lg:p-10"
            style={{
              background:
                "linear-gradient(145deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 100%)",
            }}
          >
            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            {/* Top shine */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              }}
            />

            {/* Logo */}
            <div className="relative z-10 anim-fade-up mb-6">
              <div className="inline-flex bg-white rounded-2xl px-5 py-3 shadow-lg shadow-blue-900/20">
                <img
                  src={logo}
                  alt="JobGenius"
                  className="h-8 lg:h-10 w-auto object-contain"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="relative z-10 mb-8 anim-fade-up d1">
              <p className="text-[10px] font-bold tracking-[0.22em] text-blue-200/80 uppercase mb-3">
                Start your journey
              </p>
              <h2 className="text-2xl lg:text-[1.85rem] font-extrabold text-white leading-[1.3] mb-3">
                Join thousands of
                <br />
                professionals finding
                <br />
                <span className="text-cyan-200">their dream job</span>
              </h2>
              <p className="text-blue-100/70 text-sm leading-relaxed max-w-[250px]">
                AI-powered matching, skill analysis and personalized
                recommendations.
              </p>
            </div>

            {/* Visual — orbital */}
            <div className="relative z-10 flex-1 flex items-center justify-center anim-fade-up d2">
              <div className="relative w-44 h-44">
                <div className="orbit-ring anim-spin-ring absolute inset-0">
                  <div
                    className="orbit-dot"
                    style={{
                      background: "#93c5fd",
                      boxShadow: "0 0 8px #93c5fd",
                    }}
                  />
                </div>
                <div
                  className="orbit-ring anim-counter absolute inset-[24px]"
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}
                >
                  <div
                    className="orbit-dot"
                    style={{
                      width: 7,
                      height: 7,
                      top: -3.5,
                      left: "calc(50% - 3.5px)",
                      background: "#bfdbfe",
                    }}
                  />
                </div>

                {/* Core */}
                <div className="absolute inset-[50px] bg-white rounded-xl flex flex-col items-center justify-center gap-1 anim-pulse shadow-xl shadow-blue-600/20 anim-float-a">
                  <UserRound size={22} className="text-blue-600" />
                  <span className="text-[8px] font-black text-blue-700 tracking-wider uppercase">
                    You
                  </span>
                </div>

                {/* Floating badges */}
                <div className="float-card absolute -top-2 -right-10 px-3 py-2 anim-float-b">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="text-blue-900 text-[10px] font-bold">
                        Matched
                      </div>
                      <div className="text-gray-400 text-[9px]">87% ATS</div>
                    </div>
                  </div>
                </div>

                <div
                  className="float-card absolute -bottom-3 -left-10 px-3 py-2 anim-float-a"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs">
                      🎯
                    </div>
                    <div>
                      <div className="text-blue-900 text-[10px] font-bold">
                        340+ Jobs
                      </div>
                      <div className="text-gray-400 text-[9px]">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative z-10 flex gap-2 mt-6 anim-fade-up d3">
              {[
                { val: "10k+", label: "Members" },
                { val: "95%", label: "Accuracy" },
                { val: "Free", label: "To join" },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="stat-card flex-1 text-center px-2 py-2.5"
                >
                  <div className="text-base font-extrabold text-white">
                    {val}
                  </div>
                  <div className="text-[10px] text-blue-200/70 font-medium">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
          </div>

          {/* ════════════════ RIGHT PANEL ════════════════ */}
          <div className="flex-1 flex flex-col justify-center px-7 sm:px-9 lg:px-12 py-8 relative bg-white">
            {/* Already have account */}
            <div className="absolute top-5 right-5 sm:right-7 text-sm text-gray-400">
              Have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Login
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-5 anim-fade-up">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                Create Account
              </h1>
              <p className="text-gray-400 text-sm">
                Start your smart job matching journey
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm
                rounded-xl px-4 py-3 anim-fade-up"
              >
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {/* Username */}
              <div className="anim-fade-up d1">
                <div
                  className={`reg-input flex items-center gap-3 px-4 h-[46px] ${errors.username ? "err" : ""}`}
                >
                  <User size={16} className="text-gray-300 shrink-0" />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Username"
                    disabled={loading}
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-300"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="anim-fade-up d2">
                <div
                  className={`reg-input flex items-center gap-3 px-4 h-[46px] ${errors.email ? "err" : ""}`}
                >
                  <Mail size={16} className="text-gray-300 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    disabled={loading}
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-300"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="anim-fade-up d3">
                <div
                  className={`reg-input flex items-center gap-3 px-4 h-[46px] ${errors.password ? "err" : ""}`}
                >
                  <Lock size={16} className="text-gray-300 shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password (min 4 chars)"
                    disabled={loading}
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="anim-fade-up d4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2.5">
                  I am a
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Candidate */}
                  <label
                    className={`role-card relative flex flex-col items-center gap-2 p-4
                    ${form.role === "CANDIDATE" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="CANDIDATE"
                      checked={form.role === "CANDIDATE"}
                      onChange={handleChange}
                      className="absolute top-3 right-3 accent-blue-600 w-3.5 h-3.5"
                    />
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${form.role === "CANDIDATE" ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      <UserRound
                        size={19}
                        className={
                          form.role === "CANDIDATE"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <span className="font-bold text-sm text-gray-800">
                      Candidate
                    </span>
                    <span className="text-[10px] text-gray-400 text-center leading-snug">
                      Looking for jobs
                      <br />& opportunities
                    </span>
                  </label>

                  {/* Recruiter */}
                  <label
                    className={`role-card relative flex flex-col items-center gap-2 p-4
                    ${form.role === "RECRUITER" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="RECRUITER"
                      checked={form.role === "RECRUITER"}
                      onChange={handleChange}
                      className="absolute top-3 right-3 accent-blue-600 w-3.5 h-3.5"
                    />
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${form.role === "RECRUITER" ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      <BriefcaseBusiness
                        size={19}
                        className={
                          form.role === "RECRUITER"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <span className="font-bold text-sm text-gray-800">
                      Recruiter
                    </span>
                    <span className="text-[10px] text-gray-400 text-center leading-snug">
                      Hire and find
                      <br />
                      great talent
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="anim-fade-up d5">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-create w-full h-[46px] font-bold text-sm text-white
                    flex items-center justify-center gap-2.5
                    disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 anim-fade-up d5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Google */}
              <div className="anim-fade-up d6">
                <button
                  type="button"
                  className="btn-google w-full h-[46px] flex items-center justify-center gap-3
                    text-sm font-semibold text-gray-600 hover:text-gray-800"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Security */}
              <div className="flex items-center justify-center gap-2 anim-fade-up d6">
                <ShieldCheck size={13} className="text-gray-300" />
                <span className="text-xs text-gray-400">
                  Your data is secure and protected
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}
