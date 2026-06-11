// src/pages/SkillManagementPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  Star,
  Layers,
  ArrowRight,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function strengthColor(pct) {
  if (pct >= 80) return "#16a34a";
  if (pct >= 50) return "#2563eb";
  return "#f59e0b";
}

function strengthText(pct) {
  if (pct >= 80) return "Great! You're on the right track.";
  if (pct >= 50) return "Good progress! Add more skills to boost matches.";
  return "Add more skills to improve your profile.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MySkillTag({ name, onRemove, removing, selectedForRemove }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl shadow-sm transition-all group border
  ${
    selectedForRemove
      ? "bg-red-500 text-white border-red-500"
      : "bg-white border-gray-200 text-gray-700 hover:border-red-200"
  }`}
    >
      {name}
      <button
        onClick={() => onRemove(name)}
        disabled={removing}
        className={`transition-colors ${
          selectedForRemove
            ? "text-white/70 hover:text-white"
            : "text-gray-300 hover:text-red-500"
        }`}
      >
        {removing ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <X size={11} />
        )}
      </button>
    </span>
  );
}

function PopularSkillBtn({ name, selected, alreadyAdded, onToggle }) {
  return (
    <button
      onClick={() => !alreadyAdded && onToggle(name)}
      disabled={alreadyAdded}
      className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
        ${
          alreadyAdded
            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
            : selected
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
        }`}
    >
      <span className="truncate">{name}</span>
      <span
        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all
        ${
          selected
            ? "bg-white/20 border-white/40 text-white"
            : "border-gray-300 text-gray-400"
        }`}
      >
        {alreadyAdded ? (
          <CheckCircle2 size={10} className="text-gray-300" />
        ) : selected ? (
          <X size={10} />
        ) : (
          <Plus size={10} />
        )}
      </span>
    </button>
  );
}

function SelectedChip({ name, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full">
      {name}
      <button
        onClick={() => onRemove(name)}
        className="hover:text-blue-900 transition-colors"
      >
        <X size={10} />
      </button>
    </span>
  );
}

function SuggestedChip({ name, onAdd, alreadyAdded, adding }) {
  return (
    <button
      onClick={() => !alreadyAdded && onAdd(name)}
      disabled={alreadyAdded || adding}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
        ${
          alreadyAdded
            ? "bg-green-50 text-green-700 border-green-200 cursor-default"
            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
        }`}
    >
      {name}
      {adding ? (
        <Loader2 size={12} className="animate-spin text-blue-500" />
      ) : alreadyAdded ? (
        <CheckCircle2 size={12} className="text-green-600" />
      ) : (
        <Plus size={12} className="text-gray-400" />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SkillManagementPage() {
  const navigate = useNavigate();

  // ── My skills — GET /skills/user ──────────────────────────────────────────
  const [mySkills, setMySkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState("");
  const [removingSkills, setRemovingSkills] = useState(new Set());
  const [clearingAll, setClearingAll] = useState(false);

  // ── All system skills — GET /skills ──────────────────────────────────────
  const [allSystemSkills, setAllSystemSkills] = useState([]);
  const [systemLoading, setSystemLoading] = useState(true);

  // ── Suggested skills — derived from GET /jobmatch/match ──────────────────
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  // ── Add panel ─────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNew, setSelectedNew] = useState(new Set());
  const [saving, setSaving] = useState(false);

  // ── Quick-add ─────────────────────────────────────────────────────────────
  const [quickAdding, setQuickAdding] = useState(new Set());

  // ── Feedback ──────────────────────────────────────────────────────────────
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedRemoveSkills, setSelectedRemoveSkills] = useState(new Set());
  // ─────────────────────────────────────────────────────────────────────────
  // 1. GET /skills/user — fetch MY skills
  // ─────────────────────────────────────────────────────────────────────────
  const fetchMySkills = useCallback(() => {
    setSkillsLoading(true);
    setSkillsError("");
    API.get("/skills/user")
      .then((r) => {
        setMySkills(r.data || []);
      })
      .catch(() => setSkillsError("Failed to load your skills."))
      .finally(() => setSkillsLoading(false));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. GET /skills — all system skills for popular grid
  // ─────────────────────────────────────────────────────────────────────────
  const fetchSystemSkills = useCallback(() => {
    setSystemLoading(true);
    API.get("/skills")
      .then((r) => {
        setAllSystemSkills(r.data || []);
      })
      .catch(() => {})
      .finally(() => setSystemLoading(false));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. GET /jobmatch/match — derive suggested skills from top matched jobs
  //    Skills from top-5 matched jobs that the user doesn't already have
  // ─────────────────────────────────────────────────────────────────────────
  const fetchSuggested = useCallback(() => {
    setSuggestedLoading(true);
    API.get("/jobmatch/match")
      .then((r) => {
        const matches = r.data || [];
        const topJobs = Array.isArray(matches) ? matches.slice(0, 5) : [];

        // Collect required skills from top matched jobs
        const suggested = new Set();
        topJobs.forEach((item) => {
          // match response shape: {jobId, matchPercentage, requiredSkills?}
          // or {job: {requiredSkills}} or {requiredSkills}
          const skills =
            item.requiredSkills ||
            item.job?.requiredSkills ||
            item.jobDetails?.requiredSkills ||
            [];
          skills.forEach((s) => {
            const name = s?.name || s?.skillName;
            if (name) suggested.add(name);
          });
        });

        setSuggestedSkills([...suggested].slice(0, 12));
      })
      .catch(() => {
        // Fallback: derive from system skills not in user skills
        setSuggestedSkills([]); // will be populated from allSystemSkills fallback below
      })
      .finally(() => setSuggestedLoading(false));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMySkills();
    fetchSystemSkills();
    fetchSuggested();
  }, [fetchMySkills, fetchSystemSkills, fetchSuggested]);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  // Remove one skill — PUT /skills with filtered list
  const toggleRemoveSkill = (skill) => {
    setSelectedRemoveSkills((prev) => {
      const exists = [...prev].find((s) => s.id === skill.id);

      if (exists) {
        return new Set([...prev].filter((s) => s.id !== skill.id));
      }

      return new Set([...prev, skill]);
    });
  };

  const handleRemoveSelected = async () => {
    if (selectedRemoveSkills.size === 0) return;

    const removeIds = [...selectedRemoveSkills].map((s) => s.id);

    setRemovingSkills(new Set(removeIds));

    const updatedSkills = mySkills.filter((s) => !removeIds.includes(s.id));

    try {
      await API.put("/skills", {
        skillIds: updatedSkills.map((s) => s.id),
      });

      setMySkills(updatedSkills);

      setSelectedRemoveSkills(new Set());
    } catch (e) {
      console.log(e);
    } finally {
      setRemovingSkills(new Set());
    }
  };
  // Clear all — PUT /skills with []
  const handleClearAll = async () => {
    if (!window.confirm("Remove all your skills?")) return;

    setClearingAll(true);

    try {
      await API.put("/skills", {
        skillIds: [],
      });

      setMySkills([]);
      setSelectedRemoveSkills(new Set());
    } catch (e) {
      console.log(e);

      setSkillsError("Failed to clear skills.");
    } finally {
      setClearingAll(false);
    }
  };
  // Toggle select from popular grid
  const toggleSelect = (skill) => {
    if (mySkills.some((s) => s.id === skill.id)) return;

    setSelectedNew((p) => {
      const n = new Set(p);

      const exists = [...n].find((s) => s.id === skill.id);

      if (exists) {
        n.delete(exists);
      } else {
        n.add(skill);
      }

      return new Set(n);
    });
  };

  // Remove from selected preview
  const removeFromSelected = (skill) => {
    setSelectedNew((p) => {
      const n = new Set([...p].filter((s) => s.id !== skill.id));
      return n;
    });
  };

  // Add selected — PUT /skills
  const handleAddSelected = async () => {
    if (selectedNew.size === 0) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const merged = [...mySkills, ...selectedNew];

    try {
      await API.put("/skills", {
        skillIds: merged.map((s) => s.id),
      });

      setMySkills(merged);

      setSelectedNew(new Set());

      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Failed to add skills. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Quick-add from suggested — PUT /skills
  const handleQuickAdd = async (skill) => {
    if (mySkills.some((s) => s.id === skill.id)) return;

    setQuickAdding((p) => new Set(p).add(skill.id));

    const merged = [...mySkills, skill];

    try {
      await API.put("/skills", {
        skillIds: merged.map((s) => s.id),
      });

      setMySkills(merged);
    } catch (e) {
      console.log(e);
    } finally {
      setQuickAdding((p) => {
        const n = new Set(p);
        n.delete(skill.id);
        return n;
      });
    }
  };

  // Refresh all
  const handleRefresh = () => {
    fetchMySkills();
    fetchSuggested();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────────────────────

  const skillCount = mySkills.length;
  const strengthPct = Math.min(100, Math.round((skillCount / 10) * 100));

  // Popular grid — from GET /skills, filtered by search
  const displaySkills = searchQuery.trim()
    ? allSystemSkills.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allSystemSkills;

  // Suggested — from /jobmatch/match, fallback to system skills not yet added
  // If jobmatch returns no skill data, show system skills user hasn't added yet
  const suggestedSource =
    suggestedSkills.length > 0 ? suggestedSkills : allSystemSkills.slice(0, 20);

  const suggestedDisplay = suggestedSource
    .filter((s) => !mySkills.some((m) => m.id === s.id))
    .slice(0, 12);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="w-full max-w-400 mx-auto px-3 sm:px-4 lg:px-6 xl:px-13 py-6 sm:py-8">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Skill Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your skills to get better matches and grow your career.
            </p>
          </div>

          {/* Why add skills */}
          <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 max-w-sm w-full sm:w-auto shrink-0">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Star size={18} className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Why add skills?</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Adding more relevant skills helps our AI match you with the best
                job opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* ── Feedback banners ── */}
        {skillsError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            <AlertCircle size={14} className="shrink-0" /> {skillsError}
            <button
              onClick={fetchMySkills}
              className="ml-auto flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
            <CheckCircle2 size={14} className="shrink-0" /> Skills updated
            successfully!
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            <AlertCircle size={14} className="shrink-0" /> {saveError}
          </div>
        )}

        {/* ── Stats strip ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            {/* Skill count */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Layers size={28} className="text-blue-500" />
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 leading-none">
                  {skillsLoading ? (
                    <Loader2 size={28} className="animate-spin text-blue-400" />
                  ) : (
                    skillCount
                  )}
                </p>
                <p className="text-sm font-bold text-gray-700 mt-1">
                  Skills Added
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Keep updating your skills
                  <br />
                  for better matches
                </p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-16 bg-gray-100 shrink-0" />
            <div className="block sm:hidden h-px w-full bg-gray-100" />

            {/* Strength bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-end justify-between mb-2 gap-2">
                <p className="text-sm font-bold text-gray-700">
                  Profile Strength
                </p>
                <span
                  className="text-2xl font-black leading-none"
                  style={{ color: strengthColor(strengthPct) }}
                >
                  {strengthPct}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${strengthPct}%`,
                    backgroundColor: strengthColor(strengthPct),
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {strengthText(strengthPct)}
              </p>
            </div>

            <div className="hidden sm:block w-px h-16 bg-gray-100 shrink-0" />

            {/* View Skill Gap CTA */}
            <button
              onClick={() => navigate("/skill-gap")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 active:scale-[0.97] transition-all whitespace-nowrap shrink-0"
            >
              View Skill Gap <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* ── Main two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* ── My Skills ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">My Skills</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  These are the skills you've added.
                </p>
              </div>
              {mySkills.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={clearingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all shrink-0"
                >
                  {clearingAll ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Trash2 size={11} />
                  )}
                  Clear All
                </button>
              )}
            </div>

            {/* Skills list */}
            {skillsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
                <Loader2 size={16} className="animate-spin text-blue-500" />{" "}
                Loading your skills…
              </div>
            ) : mySkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <Layers size={30} className="text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">
                  No skills added yet.
                </p>
                <p className="text-xs text-gray-300">
                  Search and add skills from the panel on the right.
                </p>
              </div>
            ) : (
              <div
                className={`flex flex-wrap gap-2 overflow-y-auto pr-1 content-start ${
                  selectedRemoveSkills.size > 0 ? "max-h-[140px]" : "flex-1"
                }`}
              >
                {mySkills.map((skill) => (
                  <MySkillTag
                    key={skill.id}
                    name={skill.name}
                    onRemove={() => toggleRemoveSkill(skill)}
                    removing={removingSkills.has(skill.id)}
                    selectedForRemove={[...selectedRemoveSkills].some(
                      (s) => s.id === skill.id,
                    )}
                  />
                ))}
              </div>
            )}
            {/* Tips */}
            {selectedRemoveSkills.size > 0 && (
              <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-sm font-semibold text-red-700">
                    Selected for removal ({selectedRemoveSkills.size})
                  </p>

                  <button
                    onClick={() => setSelectedRemoveSkills(new Set())}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {[...selectedRemoveSkills].map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-red-200 text-red-600 text-xs font-medium"
                    >
                      {skill.name}

                      <button onClick={() => toggleRemoveSkill(skill)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleRemoveSelected}
                  className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all"
                >
                  Remove Skills ({selectedRemoveSkills.size})
                </button>
              </div>
            )}
          </div>

          {/* ── Add New Skills ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Add New Skills
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Search and add skills from our database.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills (e.g. Java, Python, React…)"
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Popular / search grid — from GET /skills */}
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                {searchQuery.trim() ? "Search results" : "Popular Skills"}
              </p>

              {systemLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
                  <Loader2 size={12} className="animate-spin text-blue-400" />{" "}
                  Loading skills…
                </div>
              ) : displaySkills.length === 0 && searchQuery ? (
                <p className="text-xs text-gray-400 py-3">
                  No skills found. Try a different term.
                </p>
              ) : displaySkills.length === 0 ? (
                <p className="text-xs text-gray-400 py-3">
                  No skills available.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[150px] overflow-y-auto pr-1">
                  {displaySkills.map((skill) => (
                    <PopularSkillBtn
                      key={skill.id}
                      name={skill.name}
                      selected={[...selectedNew].some((s) => s.id === skill.id)}
                      alreadyAdded={mySkills.some((s) => s.id === skill.id)}
                      onToggle={() => toggleSelect(skill)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Selected preview row */}
            {selectedNew.size > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-600">
                    Selected ({selectedNew.size})
                  </p>
                  <button
                    onClick={() => setSelectedNew(new Set())}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedNew].map((skill) => (
                    <SelectedChip
                      key={skill.id}
                      name={skill.name}
                      onRemove={() => removeFromSelected(skill)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add button */}
            <button
              onClick={handleAddSelected}
              disabled={selectedNew.size === 0 || saving}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                ${
                  selectedNew.size > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Plus size={15} /> Add Skills ({selectedNew.size})
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Suggested Skills — derived from GET /jobmatch/match ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Suggested Skills for You
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Based on your current skills and latest job trends.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline shrink-0"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {suggestedLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
              <Loader2 size={14} className="animate-spin text-blue-400" />{" "}
              Loading suggestions…
            </div>
          ) : suggestedDisplay.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle2 size={15} className="shrink-0" /> You've added all
              suggested skills!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestedDisplay.map((skill) => (
                <SuggestedChip
                  key={skill.id}
                  name={skill.name}
                  onAdd={() => handleQuickAdd(skill)}
                  alreadyAdded={mySkills.some((s) => s.id === skill.id)}
                  adding={quickAdding.has(skill.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
