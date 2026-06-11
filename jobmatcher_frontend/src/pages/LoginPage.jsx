// src/pages/Login.jsx

import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import API from "../services/api";
import logo from "../assets/Images/Horizoanatal_logo.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const successMsg = location.state?.message || "";

  const [form, setForm] = useState({ email: "", password: "" });
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
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Invalid email format";
    if (!form.password) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await API.post("/auth/loginresponse", {
        email: form.email.trim(),
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      const role = res.data.role;
      navigate(role === "RECRUITER" ? "/recruiter-dashboard" : "/find-jobs", {
        replace: true,
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data ||
          "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
        className="login-wrap min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(135deg, #eff6ff 0%, #f0f4ff 50%, #eef2ff 100%)",
        }}
      >
        {/* Subtle background blobs */}
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
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #dbeafe, transparent)",
            }}
          />
        </div>

        <div
          className="relative z-10 w-full max-w-3xl flex flex-col lg:flex-row rounded-3xl overflow-hidden"
          style={{
            boxShadow:
              "0 32px 80px rgba(37,99,235,0.15), 0 0 0 1px rgba(255,255,255,0.7)",
          }}
        >
          {/* ══════════════ LEFT PANEL ══════════════ */}
          <div
            className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col p-6 lg:p-8"
            style={{
              background:
                "linear-gradient(145deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 100%)",
            }}
          >
            {/* Subtle wave texture */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
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
            <div
              className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-full opacity-60"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
              }}
            />

            {/* Logo */}
            <div className="relative z-10 anim-fade-up mb-5">
              <div className="inline-flex bg-white rounded-2xl px-4 py-2.5 shadow-lg shadow-blue-900/20">
                <img
                  src={logo}
                  alt="JobGenius"
                  className="h-7 lg:h-9 w-auto object-contain"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="relative z-10 mb-6 anim-fade-up d1">
              <p className="text-[10px] font-bold tracking-[0.22em] text-blue-200/80 uppercase mb-2">
                AI-Powered Career Platform
              </p>
              <h2 className="text-2xl lg:text-[1.75rem] font-extrabold text-white leading-tight mb-3">
                Find the perfect job
                <br />
                that matches your
                <br />
                <span className="text-blue-200">skills</span>
                <span className="text-white"> & </span>
                <span className="text-cyan-200">ambition</span>
              </h2>
              <p className="text-blue-100/70 text-sm leading-relaxed max-w-[270px]">
                Smart matching, ATS scoring and personalized career
                recommendations — all in seconds.
              </p>
            </div>

            {/* Visual — orbital composition */}
            <div className="relative z-10 flex-1 flex items-center justify-center anim-fade-up d2">
              <div className="relative w-44 h-44">
                {/* Outer orbit */}
                <div className="orbit-ring anim-spin-ring absolute inset-0">
                  <div
                    className="orbit-dot"
                    style={{
                      background: "#93c5fd",
                      boxShadow: "0 0 10px #93c5fd",
                    }}
                  />
                </div>

                {/* Inner orbit */}
                <div
                  className="orbit-ring anim-counter absolute inset-[28px]"
                  style={{ borderColor: "rgba(255,255,255,0.35)" }}
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
                <div className="absolute inset-11 bg-white rounded-2xl flex flex-col items-center justify-center gap-1 anim-pulse shadow-xl shadow-blue-600/20 anim-float-a">
                  <div className="text-xl">🎯</div>
                  <span className="text-[9px] font-black text-blue-700 tracking-wider uppercase">
                    Match
                  </span>
                </div>

                {/* ATS Score card */}
                <div className="feature-card absolute -top-2 -right-10 px-3.5 py-2.5 anim-float-b">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <div>
                      <div className="text-blue-900 text-[11px] font-bold">
                        87% ATS
                      </div>
                      <div className="text-gray-400 text-[9px]">
                        Strong match
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Gap card */}
                <div className="feature-card absolute -bottom-3 -left-10 px-3.5 py-2.5 anim-float-c">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">
                      ⚡
                    </div>
                    <div>
                      <div className="text-blue-900 text-[11px] font-bold">
                        Skill Gap
                      </div>
                      <div className="text-gray-400 text-[9px]">Analyzed</div>
                    </div>
                  </div>
                </div>

                {/* Jobs pill */}
                <div
                  className="feature-card absolute top-12 -left-12 px-3 py-1.5 anim-float-b"
                  style={{ animationDelay: "1s" }}
                >
                  <span className="text-[10px] font-bold text-gray-600">
                    <span className="text-blue-600">+340</span> jobs
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="relative z-10 flex gap-2 mt-4 anim-fade-up d3">
              {[
                { val: "10k+", label: "Candidates" },
                { val: "95%", label: "Accuracy" },
                { val: "2min", label: "To match" },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="stat-card flex-1 text-center px-3 py-3"
                >
                  <div className="text-lg font-extrabold text-white">{val}</div>
                  <div className="text-[10px] text-blue-200/70 font-medium">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom shine */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
          </div>

          {/* ══════════════ RIGHT PANEL ══════════════ */}
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-10 py-8 relative bg-white">
            {/* Top-right register link */}
            <div className="absolute top-6 right-6 sm:right-8 text-sm text-gray-400">
              No account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>

            {/* Success message */}
            {successMsg && (
              <div
                className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700
                text-sm rounded-xl px-4 py-3 anim-fade-up"
              >
                ✅ {successMsg}
              </div>
            )}

            {/* Heading */}
            <div className="mb-5 anim-fade-up">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">
                Welcome back
              </h1>
              <p className="text-gray-400 text-sm">
                Sign in to continue your career journey
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm
                rounded-xl px-4 py-3 anim-fade-up"
              >
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div className="anim-fade-up d1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div
                  className={`input-box flex items-center gap-3 px-4 h-11 ${errors.email ? "err" : ""}`}
                >
                  <Mail size={17} className="text-gray-300 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-300"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="anim-fade-up d2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div
                  className={`input-box flex items-center gap-3 px-4 h-11 ${errors.password ? "err" : ""}`}
                >
                  <Lock size={17} className="text-gray-300 shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot */}
              <div className="flex justify-end -mt-1 anim-fade-up d2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 font-semibold hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <div className="anim-fade-up d3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sign-in w-full h-11 font-bold text-sm text-white
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
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <svg
                        width="16"
                        height="16"
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
              <div className="flex items-center gap-3 anim-fade-up d3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium tracking-wide">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Google */}
              <div className="anim-fade-up d4">
                <button
                  type="button"
                  className="btn-google w-full h-11 flex items-center justify-center gap-3
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
              <div className="flex items-center justify-center gap-2 pt-1 anim-fade-up d5">
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
