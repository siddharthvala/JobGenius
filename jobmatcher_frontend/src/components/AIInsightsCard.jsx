// src/components/AIInsightsCard.jsx

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { fetchCareerInsights } from "../services/aiService";

/**
 * Drop-in card for the Skill Gap page.
 *
 * Props:
 *   targetRole    {string}
 *   matchedSkills {string[]}
 *   missingSkills {string[]}
 */
export default function AIInsightsCard({
  targetRole,
  matchedSkills,
  missingSkills,
}) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCareerInsights(
        targetRole,
        matchedSkills,
        missingSkills,
      );
      if (data.success) {
        setInsights(data.insights || []);
        setFetched(true);
      } else {
        setError(data.error || "Failed to load insights.");
      }
    } catch {
      setError("Could not connect to AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Not yet loaded ──────────────────────────────────────────
  if (!fetched && !loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              AI Career Insights
            </h3>
            <p className="text-xs text-gray-500">Powered by NVIDIA NIM</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Get personalized AI-generated tips to land the{" "}
          <span className="font-semibold text-blue-700">{targetRole}</span>{" "}
          role.
        </p>
        <button
          onClick={loadInsights}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all active:scale-[0.98] shadow-sm shadow-blue-200"
        >
          <Sparkles size={13} /> Generate AI Insights
        </button>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              AI Career Insights
            </h3>
            <p className="text-xs text-gray-500">Powered by NVIDIA NIM</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <p className="text-xs text-gray-500">Analyzing your skill gap…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            AI Career Insights
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-xs mb-3">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </div>
        <button
          onClick={loadInsights}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  // ── Insights loaded ─────────────────────────────────────────
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              AI Career Insights
            </h3>
            <p className="text-xs text-gray-500">Powered by NVIDIA NIM</p>
          </div>
        </div>
        <button
          onClick={loadInsights}
          title="Refresh"
          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-all"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Target role chip */}
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-xs text-gray-500">Tips for:</span>
        <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
          {targetRole}
        </span>
      </div>

      {/* Insight bullets */}
      <ul className="flex flex-col gap-2.5">
        {insights.map((tip, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 bg-white/70 rounded-xl px-3.5 py-2.5 border border-blue-100"
          >
            <ChevronRight size={25} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="ai-career-insights">{tip}</div>
          </li>
        ))}
      </ul>

      {/* Footer note */}
      <p className="text-[10px] text-gray-400 mt-3 text-right">
        AI-generated • Not a guarantee of employment
      </p>
    </div>
  );
}
