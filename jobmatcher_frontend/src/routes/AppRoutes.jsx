// src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/RegisterPage";
import Login from "../pages/LoginPage";

// Layouts
import RecruiterLayout from "../components/layout/RecruiterLayout";
import CandidateLayout from "../components/layout/CandidateLayout";

// Route guards
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

// Recruiter pages
import RecruiterDashboard from "../pages/RecruiterDashboard";
import PostJobPage from "../pages/PostJobPage";
import EditJobPage from "../pages/EditJobPage";
import ManageJobsPage from "../pages/ManageJobPage";
import JobApplicationPage from "../pages/JobApplicationPage";

// Candidate pages
import JobListingPage from "../pages/JobListingPage";
import SkillManagementPage from "../pages/SkillManagementPage";
import SkillGapPage from "../pages/SkillGapPage";
import MyApplicationsPage from "../pages/MyApplicationsPage";
import JobDetailPage from "../pages/JobDetailPage";
import CandidateProfilePage from "../pages/CandidateProfilePage";
import ResumeAnalyzerPage from "../pages/ResumeAnalyzerPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public (guests only — redirect logged-in users to their dashboard) ── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Recruiter — all pages share RecruiterLayout (Navbar) ── */}
      <Route element={<ProtectedRoute role="RECRUITER" />}>
        <Route element={<RecruiterLayout />}>
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/edit-job/:id" element={<EditJobPage />} />
          <Route path="/manage-jobs" element={<ManageJobsPage />} />
          <Route
            path="/manage-jobs/:jobId/applicants"
            element={<JobApplicationPage />}
          />
        </Route>
      </Route>

      {/* ── Candidate — all pages share CandidateLayout (Navbar) ── */}
      <Route element={<ProtectedRoute role="CANDIDATE" />}>
        <Route element={<CandidateLayout />}>
          <Route path="/find-jobs" element={<JobListingPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/skill-management" element={<SkillManagementPage />} />
          <Route path="/skill-gap/:jobId" element={<SkillGapPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/profile" element={<CandidateProfilePage />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
        </Route>
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
