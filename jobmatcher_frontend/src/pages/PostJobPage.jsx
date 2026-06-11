// src/pages/PostJob.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronDown,
  CalendarDays,
  X,
  Search,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  Link as LinkIcon,
  Loader2,
  Pencil,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Reusable sub-components
// ─────────────────────────────────────────────────────────────────────────────

function TextField({
  label,
  name,
  placeholder,
  required,
  disabled = false,
  type = "text",
  form,
  errors,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all
          ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
          ${!disabled && errors[name] ? "border-red-400" : "border-gray-200"}`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-0.5">{errors[name]}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  form,
  errors,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o === form[name]);

  return (
    <div ref={ref} className="flex flex-col gap-1.5 relative">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer transition-all
          ${open ? "border-blue-500 ring-2 ring-blue-100" : errors[name] ? "border-red-400" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected
            ? selected.replace("_", " ")
            : `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-sm max-h-52 overflow-y-auto z-20">
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange({ target: { name, value: o } });
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-all
                ${form[name] === o ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {o.replace("_", " ")}
            </div>
          ))}
        </div>
      )}

      {errors[name] && (
        <p className="text-red-500 text-xs mt-0.5">{errors[name]}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Default empty form
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  companyName: "",
  location: "",
  jobType: "",
  workMode: "",
  salary: "",
  experienceRequired: "",
  lastDateToApply: "",
  description: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// PostJobPage — supports both "Post" (default) and "Edit" (isEdit=true) modes
//
// Props (all optional; only used in edit mode):
//   isEdit      {boolean}  — enables edit mode UI & PUT request
//   jobId       {string}   — the job's ID for PUT /job/:id
//   initialData {object}   — prefilled form values + requiredSkills:[{id,name}]
// ─────────────────────────────────────────────────────────────────────────────

export default function PostJobPage({
  isEdit = false,
  jobId = null,
  initialData = null,
}) {
  const navigate = useNavigate();

  // ── Form state ──────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Enum state ──────────────────────────────────────────────
  const [jobTypes, setJobTypes] = useState([]);
  const [workModes, setWorkModes] = useState([]);

  // ── Skills state ────────────────────────────────────────────
  const [allSkills, setAllSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── UI state ────────────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [experienceOpen, setExperienceOpen] = useState(false);
  const experienceRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const experienceOptions = [
    { value: "0", label: "Fresher (0 years)" },
    { value: "1", label: "1 Year" },
    { value: "2", label: "2 Years" },
    { value: "3", label: "3 Years" },
    { value: "4", label: "4 Years" },
    { value: "5", label: "5+ Years" },
  ];

  // ── Prefill form when initialData arrives (edit mode) ───────
  useEffect(() => {
    if (isEdit && initialData) {
      const { requiredSkills, ...formFields } = initialData;
      setForm((prev) => ({ ...prev, ...formFields }));
      if (Array.isArray(requiredSkills)) setSelectedSkills(requiredSkills);
    }
  }, [isEdit, initialData]);

  // ── Fetch enums ─────────────────────────────────────────────
  useEffect(() => {
    API.get("/enums/job-types").then((res) => setJobTypes(res.data));
    API.get("/enums/work-modes").then((res) => setWorkModes(res.data));
  }, []);

  // ── Fetch all skills ─────────────────────────────────────────
  useEffect(() => {
    API.get("/skills")
      .then((res) => {
        const data = res.data || [];
        const normalized = data.map((s) =>
          typeof s === "string"
            ? { id: s, name: s }
            : { id: s.id, name: s.name || s.skillName },
        );
        setAllSkills(normalized);
      })
      .catch(() => setSkillsError("Failed to load skills."))
      .finally(() => setSkillsLoading(false));
  }, []);

  // ── Close skill dropdown on outside click ───────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (experienceRef.current && !experienceRef.current.contains(e.target)) {
        setExperienceOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // ── Field change handler ─────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  // ── Skill helpers ────────────────────────────────────────────
  const isSelected = (skill) => selectedSkills.some((s) => s.id === skill.id);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      isSelected(skill)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill],
    );
    if (errors.skills) setErrors((p) => ({ ...p, skills: "" }));
  };

  const removeSkill = (skill) =>
    setSelectedSkills((prev) => prev.filter((s) => s.id !== skill.id));

  const filteredSkills = allSkills.filter((s) =>
    s.name?.toLowerCase().includes(skillSearch.toLowerCase()),
  );

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Job title is required";
    if (!form.companyName.trim()) err.companyName = "Company name is required";
    if (!form.location.trim()) err.location = "Location is required";
    if (!form.jobType) err.jobType = "Job type is required";
    if (!form.workMode) err.workMode = "Work mode is required";
    if (!form.salary) err.salary = "Salary is required";
    if (!form.lastDateToApply) err.lastDateToApply = "Last date is required";
    if (selectedSkills.length === 0) err.skills = "Select at least one skill";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const payload = {
      ...form,
      salary: Number(form.salary),
      experienceRequired:
        form.experienceRequired !== "" ? Number(form.experienceRequired) : null,
      skillIds: selectedSkills.map((s) => s.id),
    };

    try {
      if (isEdit) {
        // PUT /job/:id  (note: matches your spec endpoint)
        await API.put(`/jobs/${jobId}`, payload);
      } else {
        // POST /jobs
        await API.post("/jobs", payload);
      }
      navigate("/recruiter-dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data ||
          `Failed to ${isEdit ? "update" : "post"} job. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Page copy based on mode ───────────────────────────────────
  const pageTitle = isEdit ? "Edit Job" : "Post a New Job";
  const pageSubtitle = isEdit
    ? "Update the details below to modify this job posting."
    : "Fill in the details below to create a new job posting.";
  const breadcrumbLabel = isEdit ? "Edit Job" : "Post Job";
  const submitLabel = isEdit ? "Update Job" : "Publish Job";
  const submittingLabel = isEdit ? "Updating..." : "Publishing...";

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-13 py-6 sm:py-8">
      {/* ── Page header + breadcrumb ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {pageTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pageSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm shrink-0">
          <Link
            to="/recruiter-dashboard"
            className="text-blue-600 hover:underline font-medium"
          >
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 font-medium">{breadcrumbLabel}</span>
        </div>
      </div>

      {/* ── Server error ── */}
      {serverError && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {serverError}
        </div>
      )}

      {/* ── Main card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 lg:p-8">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">
          Job Details
        </h2>

        {/* Row 1: Title, Company, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-5 relative z-0">
          <TextField
            label="Job Title"
            name="title"
            placeholder="Enter job title"
            required
            disabled={isEdit}
            form={form}
            errors={errors}
            onChange={handleChange}
          />
          <TextField
            label="Company Name"
            name="companyName"
            placeholder="Enter company name"
            required
            form={form}
            errors={errors}
            onChange={handleChange}
          />
          <TextField
            label="Location"
            name="location"
            placeholder="Enter location (e.g. Bangalore, India)"
            required
            disabled={isEdit}
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        </div>

        {/* Row 2: Job Type, Work Mode, Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
          <SelectField
            label="Job Type"
            name="jobType"
            options={jobTypes}
            required
            form={form}
            errors={errors}
            onChange={handleChange}
          />
          <SelectField
            label="Work Mode"
            name="workMode"
            options={workModes}
            required
            form={form}
            errors={errors}
            onChange={handleChange}
          />

          {/* Salary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Salary (₹/month) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="Enter salary"
              className={`border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all
                ${errors.salary ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.salary && (
              <p className="text-red-500 text-xs mt-0.5">{errors.salary}</p>
            )}
          </div>
        </div>

        {/* Row 3: Experience + Last Date */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
          {/* Experience Required */}
          <div ref={experienceRef} className="flex flex-col gap-1.5 relative">
            <label className="text-sm font-medium text-gray-700">
              Experience Required
            </label>

            <div
              onClick={() => setExperienceOpen(!experienceOpen)}
              className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer transition-all
      ${
        experienceOpen
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border-gray-200 hover:border-gray-300"
      }`}
            >
              <span
                className={
                  form.experienceRequired ? "text-gray-800" : "text-gray-400"
                }
              >
                {experienceOptions.find(
                  (e) => e.value === String(form.experienceRequired),
                )?.label || "Select experience level"}
              </span>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  experienceOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {experienceOpen && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {experienceOptions.map((exp) => (
                  <div
                    key={exp.value}
                    onClick={() => {
                      handleChange({
                        target: {
                          name: "experienceRequired",
                          value: exp.value,
                        },
                      });
                      setExperienceOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-all
            ${
              String(form.experienceRequired) === exp.value
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
                  >
                    {exp.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last Date to Apply */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Last Date to Apply <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                ref={inputRef}
                type="date"
                name="lastDateToApply"
                value={form.lastDateToApply}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 pr-10 py-2.5 text-sm bg-white 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                  transition-all appearance-none
                  ${errors.lastDateToApply ? "border-red-400" : "border-gray-200"}`}
              />
              <CalendarDays
                size={18}
                onClick={() => inputRef.current?.showPicker()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:scale-110 transition"
              />
            </div>
            {errors.lastDateToApply && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.lastDateToApply}
              </p>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-sm font-medium text-gray-700">
            Job Description
          </label>
          {/* Toolbar */}
          <div className="border border-gray-200 rounded-t-xl px-3 py-2 flex items-center gap-1 flex-wrap bg-gray-50 border-b-0">
            {[
              { icon: Bold, title: "Bold" },
              { icon: Italic, title: "Italic" },
              { icon: Underline, title: "Underline" },
              { icon: List, title: "Bullet list" },
              { icon: ListOrdered, title: "Numbered list" },
              { icon: AlignLeft, title: "Align" },
              { icon: LinkIcon, title: "Link" },
            ].map(({ icon: Icon, title }) => (
              <button
                key={title}
                title={title}
                type="button"
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Enter job description, responsibilities, requirements, etc."
            className={`border rounded-b-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none
              ${errors.description ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>
          )}
        </div>

        {/* Required Skills + Selected Skills panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Left: Skill dropdown */}
          <div className="flex flex-col gap-1.5" ref={dropdownRef}>
            <label className="text-sm font-medium text-gray-700">
              Required Skills <span className="text-red-500">*</span>
            </label>

            {/* Tag input trigger */}
            <div
              onClick={() => !skillsLoading && setDropdownOpen(true)}
              className={`min-h-[46px] border rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text transition-all
                ${dropdownOpen ? "border-blue-500 ring-2 ring-blue-100" : errors.skills ? "border-red-400" : "border-gray-200"}`}
            >
              {selectedSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200"
                >
                  {skill.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSkill(skill);
                    }}
                    className="cursor-pointer"
                  >
                    <X
                      size={11}
                      className="hover:text-blue-900 transition-colors"
                    />
                  </button>
                </span>
              ))}

              {skillsLoading ? (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 size={13} className="animate-spin" /> Loading
                  skills...
                </span>
              ) : (
                <span className="text-sm text-gray-400 ml-1 flex-1">
                  {selectedSkills.length === 0 && "Click to select skills..."}
                </span>
              )}
              <ChevronDown size={16} className="text-gray-400 shrink-0" />
            </div>

            {errors.skills && (
              <p className="text-red-500 text-xs">{errors.skills}</p>
            )}
            {skillsError && (
              <p className="text-red-400 text-xs">{skillsError}</p>
            )}

            {/* Dropdown panel */}
            {dropdownOpen && !skillsLoading && (
              <div className="border border-gray-200 rounded-xl shadow-lg bg-white z-30 max-h-60 overflow-hidden flex flex-col">
                {/* Search bar */}
                <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills..."
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-sm outline-none placeholder-gray-400"
                    autoFocus
                  />
                  {skillSearch && (
                    <button
                      onClick={() => setSkillSearch("")}
                      className="cursor-pointer"
                    >
                      <X
                        size={13}
                        className="text-gray-400 hover:text-gray-600"
                      />
                    </button>
                  )}
                </div>

                {/* Skills grid */}
                <div className="overflow-y-auto p-3">
                  {filteredSkills.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No skills found
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                      {filteredSkills.map((skill) => (
                        <label
                          key={skill.id}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected(skill)}
                            onChange={() => toggleSkill(skill)}
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                          <span
                            className={`text-sm transition-colors group-hover:text-blue-600
                            ${isSelected(skill) ? "text-blue-600 font-medium" : "text-gray-700"}`}
                          >
                            {skill.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Selected skills panel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Selected Skills ({selectedSkills.length})
            </label>
            <div className="border border-gray-200 rounded-xl p-3 min-h-[120px] bg-gray-50/50 flex flex-wrap gap-2 content-start">
              {selectedSkills.length === 0 ? (
                <p className="text-xs text-gray-400 w-full text-center mt-6">
                  No skills selected yet
                </p>
              ) : (
                selectedSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="flex items-center gap-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-full shadow-sm"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="cursor-pointer"
                    >
                      <X
                        size={11}
                        className="hover:text-red-500 transition-colors"
                      />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-5 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/recruiter-dashboard")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {submittingLabel}
              </>
            ) : (
              <>
                {isEdit ? <Pencil size={15} /> : <Send size={15} />}
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
