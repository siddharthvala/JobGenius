// ============================================================
// src/services/aiService.js
// Final AI Service — Career Insights + Resume Analyzer
// ============================================================

import API from "./api";

// ──────────────────────────────────────────────────────────
// Career Insights
// ──────────────────────────────────────────────────────────

/**
 * POST /api/ai/career-insights
 * Fetches AI career insights based on skill gap.
 * Used in: SkillGapPage.jsx, AIInsightsCard.jsx
 */
export async function fetchCareerInsights(
  targetRole,
  matchedSkills,
  missingSkills,
) {
  const res = await API.post("/api/ai/career-insights", {
    targetRole,
    matchedSkills,
    missingSkills,
  });
  return res.data;
}

// ──────────────────────────────────────────────────────────
// Resume Analyzer
// ──────────────────────────────────────────────────────────

/**
 * POST /api/resume/analyze
 * Sends resume file + optional jobId for ATS analysis.
 * Used in: ResumeAnalyzerPage.jsx
 */
export async function analyzeResume({ file, resumeId, jobId } = {}) {
  const formData = new FormData();
  if (file)     formData.append("file",     file);
  if (resumeId) formData.append("resumeId", resumeId);
  if (jobId)    formData.append("jobId",    jobId);

  const res = await API.post("/api/resume/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
