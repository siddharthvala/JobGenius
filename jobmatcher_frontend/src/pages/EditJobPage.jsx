// src/pages/EditJob.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import API from "../services/api";
import PostJobPage from "./PostJobPage";

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!id) {
      setFetchError("Invalid job ID.");
      setLoading(false);
      return;
    }

    API.get(`/jobs/${id}`)
      .then((res) => {
        const job = res.data;

        // Normalize requiredSkills → [{id, name}]
        // Backend may return [string] or [{id, name}] or [{skillName}]
        const skills = (job.skills || []).map((s) => ({
          id: s.id,
          name: s.name,
        }));

        // Normalize lastDateToApply to yyyy-MM-dd for <input type="date">
        let lastDate = job.lastDateToApply || "";
        if (lastDate && lastDate.includes("T")) {
          lastDate = lastDate.split("T")[0];
        }

        setInitialData({
          title: job.title || "",
          companyName: job.companyName || "",
          location: job.location || "",
          jobType: job.jobType || "",
          workMode: job.workMode || "",
          salary: job.salary != null ? String(job.salary) : "",
          experienceRequired: job.experienceRequired != null ? String(job.experienceRequired) : "",
          lastDateToApply: lastDate,
          description: job.description || "",
          requiredSkills: skills,
        });
      })
      .catch(() =>
        setFetchError("Failed to load job details. Please try again."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Loading job details…</p>
      </div>
    );
  }

  // ── Fetch error state ──────────────────────────────────────
  if (fetchError) {
    return (
      <div className="w-full px-4 py-16 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3.5 text-sm max-w-md w-full">
          <AlertCircle size={16} className="shrink-0" />
          <span>{fetchError}</span>
        </div>
        <button
          onClick={() => navigate("/recruiter-dashboard")}
          className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Render PostJobPage in edit mode ────────────────────────
  return <PostJobPage isEdit jobId={id} initialData={initialData} />;
}
