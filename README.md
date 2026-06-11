# JobGenius – Smart Job Matching & Skill Gap Analyzer

JobGenius is a full-stack SaaS job portal that matches user skills with job requirements, calculates match percentage, identifies missing skills, and provides skill improvement recommendations.

Core Flow:
User → Login → Add Skills → Job Matching Engine → Match % → Skill Gap → Apply Job

## Core Features

### Authentication

- JWT login/register
- Protected routes

### Skill Management

- Add/remove skills
- Skill suggestions

### Job Matching

- Match percentage calculation
- Ranking system
- Skill gap analysis

### Job System

- Job listing
- Job details
- Apply/withdraw application

### AI Career Insights (NVIDIA NIM)

- AI-generated career tips powered by NVIDIA NIM
- Personalized 5-point tips based on matched and missing skills
- Integrated in Skill Gap page via `AIInsightsCard` component

### AI Resume Analyzer — ATS Scoring (NVIDIA NIM)

- Upload a new resume or select a saved one for analysis
- Compare resume against any job posting's required skills
- AI extracts skills, experience, education, and suggested roles via NVIDIA NIM
- Hybrid ATS scoring engine (0–100) with four weighted components:
  - **Skill Match** (60%) — deterministic backend logic
  - **Experience Relevance** (20%) — AI-scored via NIM
  - **Project Relevance** (10%) — AI-scored via NIM
  - **Resume Strength** (10%) — keyword-based deterministic logic
- Returns matched skills, missing skills, and AI-generated recommendations
- Recommendations generated only when ATS score < 90 and missing skills exist
- Powered by `ResumeAnalyzerPage` on the frontend
- Experience extracted as integer years (0 = Fresher, 1+ = years of experience)

### ATS Score on Recruiter Side

- Recruiters see each applicant's ATS score directly in the applicants table
- ATS score is computed at application time and stored with the application
- Score displayed as a color-coded badge (green/yellow/red) based on threshold
- Recruiter can compare candidates side-by-side using their ATS scores

### Email Notifications

Automated HTML email notifications are sent at every key stage of the hiring pipeline via `NotificationService` → `EmailService`. Emails are **non-blocking** — failures are caught and logged as warnings so they never interrupt the user flow.

| Trigger | Recipient | Subject |
|---|---|---|
| Successful registration | Candidate | Welcome to JobGenius 🚀 |
| Job application submitted | Candidate | Application Received – `{job}` at `{company}` |
| Status → `SCREENING` | Candidate | Your profile has been shortlisted – `{job}` |
| Status → `INTERVIEW` | Candidate | Interview Round – `{job}` at `{company}` |
| Status → `ACCEPTED` | Candidate | 🎉 Offer Letter – `{job}` at `{company}` |
| Status → `REJECTED` | Candidate | Application Update – `{job}` at `{company}` |
| Password reset *(future)* | User | Reset Your JobGenius Password |

**Status dispatcher** — when a recruiter updates an application's status, `NotificationService.sendStatusUpdateNotification()` routes to the correct template:

```
SCREENING → sendScreeningNotification()
INTERVIEW → sendInterviewNotification()
ACCEPTED  → sendAcceptedNotification()
REJECTED  → sendRejectedNotification()
(other)   → debug log only, no email sent
```

All email HTML is built by `EmailTemplateUtil` and includes a direct link to the frontend (`app.frontend.url`).

### Recommendations

- Missing skill suggestions
- Learning recommendations

### Candidate Profile

- Profile page
- Personal information management
- Profile completion tracking
- Activity summary

### Resume Management

- Upload resume (PDF/DOC/DOCX)
- Preview/download resume
- Set primary resume
- Replace/delete resume
- Select resume during job application
- Recruiter can preview/download applicant's submitted resume

## Tech Stack

### Frontend

- React
- Tailwind CSS
- React Router
- Axios

### Backend

- Spring Boot
- Java
- JWT Authentication
- REST APIs

### Database

- PostgreSQL

## Architecture

Frontend Architecture:

- Component-based architecture
- Reusable UI components
- Service layer for API calls
- Protected route system

Backend Architecture:
Controller → Service → Repository → Database

## Frontend Structure

src/
├── components/
├── pages/
├── services/
├── hooks/
├── context/
├── routes/
├── layouts/
├── utils/
└── styles/

## Backend Structure

src/main/java/com/jobmatcher
├── controller/
├── service/
├── repository/
├── dto/
├── model/
├── config/
├── exception/

# API Documentation

Base URL:

```env
http://localhost:8080/api
```

---

# Authentication APIs

## Auth `/auth`

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/auth/register`      | Register new user        |
| POST   | `/auth/login`         | Login user               |
| POST   | `/auth/loginresponse` | Login with full response |

---

# User APIs

## Users `/users`

| Method | Endpoint    | Description                 |
| ------ | ----------- | --------------------------- |
| GET    | `/users/me` | Get current user profile    |
| PUT    | `/users/me` | Update current user profile |

---

# Job APIs

## Jobs `/jobs`

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/jobs`           | Get all jobs              |
| GET    | `/jobs/{jobId}`   | Get job by ID             |
| GET    | `/jobs/recruiter` | Get recruiter posted jobs |
| POST   | `/jobs`           | Create job                |
| PUT    | `/jobs/{jobId}`   | Update job                |
| DELETE | `/jobs/{jobId}`   | Delete job                |

---

# Application APIs

## Applications `/applications`

| Method | Endpoint                               | Description               | Auth Required |
| ------ | -------------------------------------- | ------------------------- | ------------- |
| POST   | `/applications/{jobId}`                | Apply for a job           | Candidate     |
| GET    | `/applications/my`                     | Get my applications       | Candidate     |
| GET    | `/applications/job/{jobId}`            | Get applicants for a job  | Recruiter     |
| PUT    | `/applications/{applicationId}/status` | Update application status | Recruiter     |
| DELETE | `/applications/{applicationId}`        | Withdraw application      | Candidate     |
| GET    | `/applications/check/{jobId}`          | Check if already applied  | Candidate     |

### Apply for Job — Request Body (optional)

```json
{
  "coverLetter": "string",
  "selectedResumeId": 1
}
```

### Application Response Fields

| Field                  | Type   | Description                                           |
| ---------------------- | ------ | ----------------------------------------------------- |
| id                     | Long   | Application ID                                        |
| jobId                  | Long   | Job ID                                                |
| jobTitle               | String | Job title                                             |
| companyName            | String | Company name                                          |
| status                 | String | APPLIED / SCREENING / INTERVIEW / ACCEPTED / REJECTED |
| appliedAt              | String | Application timestamp                                 |
| coverLetter            | String | Cover letter text                                     |
| selectedResumeId       | Long   | ID of resume submitted with application               |
| selectedResumeFileName | String | Filename of submitted resume                          |
| selectedResumeUrl      | String | URL to preview/download submitted resume              |

### Check Applied — Response

```json
{
  "applied": true,
  "applicationId": 5
}
```

---

# Skill APIs

## Skills `/skills`

| Method | Endpoint            | Description               |
| ------ | ------------------- | ------------------------- |
| GET    | `/skills`           | Get all skills            |
| GET    | `/skills/user`      | Get current user's skills |
| POST   | `/skills`           | Add skills                |
| PUT    | `/skills`           | Update skills             |
| DELETE | `/skills/{skillId}` | Delete skill              |

---

# Job Matching APIs

## Job Matching `/jobmatch`

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | `/jobmatch/match` | Get matched jobs |

---

# Resume APIs

## Resume `/resume`

| Method | Endpoint                     | Description                     | Auth Required |
| ------ | ---------------------------- | ------------------------------- | ------------- |
| POST   | `/resume/upload`             | Upload a resume file            | Candidate     |
| GET    | `/resume/my`                 | Get all resumes of current user | Candidate     |
| DELETE | `/resume/{resumeId}`         | Delete a resume                 | Candidate     |
| PUT    | `/resume/{resumeId}/primary` | Set resume as primary           | Candidate     |

### Resume Upload Request

`multipart/form-data` with field `file` (PDF/DOC/DOCX, max 5 MB)

### Resume Response Fields

| Field            | Type    | Description                        |
| ---------------- | ------- | ---------------------------------- |
| id               | Long    | Resume ID                          |
| originalFileName | String  | Original uploaded file name        |
| resumeUrl        | String  | URL to access/preview the resume   |
| isPrimary        | Boolean | Whether this is the primary resume |
| uploadedAt       | String  | Upload timestamp                   |

---

# AI APIs

## AI Insights `/api/ai`

| Method | Endpoint                  | Description                       | Auth Required |
| ------ | ------------------------- | --------------------------------- | ------------- |
| POST   | `/api/ai/career-insights` | Get AI career tips for a job role | Candidate     |

### Request Body

```json
{
  "targetRole": "string",
  "matchedSkills": ["string"],
  "missingSkills": ["string"]
}
```

### Response Fields

| Field    | Type     | Description                     |
| -------- | -------- | ------------------------------- |
| success  | Boolean  | Whether insights were generated |
| insights | String[] | Array of 5 career tip strings   |
| error    | String   | Error message if failed         |

---

## AI Resume Analyzer `/api/resume`

| Method | Endpoint              | Description                                      | Auth Required |
| ------ | --------------------- | ------------------------------------------------ | ------------- |
| POST   | `/api/resume/analyze` | Analyze a resume against a job using ATS scoring | Candidate     |

### Request — `multipart/form-data`

| Parameter  | Type          | Required | Description                                   |
| ---------- | ------------- | -------- | --------------------------------------------- |
| `file`     | MultipartFile | No\*     | Resume file to upload (PDF/DOC/DOCX, max 5MB) |
| `resumeId` | Long          | No\*     | ID of a saved resume to analyze               |
| `jobId`    | Long          | No       | ID of the job to compare the resume against   |

\* One of `file` or `resumeId` is required.

### Response Fields

| Field           | Type     | Description                                         |
| --------------- | -------- | --------------------------------------------------- |
| success         | Boolean  | Whether analysis succeeded                          |
| atsScore        | Integer  | Overall ATS score (0–100)                           |
| skillScore      | Integer  | Weighted skill match component score                |
| experienceScore | Integer  | Weighted experience component score (AI)            |
| projectScore    | Integer  | Weighted project component score (AI)               |
| strengthScore   | Integer  | Weighted resume strength component score            |
| extractedSkills | String[] | Skills detected in the resume                       |
| matchedSkills   | String[] | Skills matching the job requirements                |
| missingSkills   | String[] | Skills required by the job but absent in the resume |
| experienceYears | Integer  | Years of experience extracted by AI (0 = Fresher)   |
| education       | String   | Education summary extracted by AI                   |
| suggestedRoles  | String[] | AI-suggested job roles based on resume content      |
| recommendations | String[] | Up to 5 AI tips to improve the score (when < 90)    |
| error           | String   | Error message if analysis failed                    |

---

# Enum APIs

## Enums `/enums`

| Method | Endpoint            | Description     |
| ------ | ------------------- | --------------- |
| GET    | `/enums/job-types`  | List job types  |
| GET    | `/enums/work-modes` | List work modes |

# Frontend Pages Summary

---

# Public Pages

| Page         | Purpose                                   | APIs Used                  |
| ------------ | ----------------------------------------- | -------------------------- |
| LoginPage    | Email/password login, role-based redirect | `POST /auth/loginresponse` |
| RegisterPage | New user registration form                | `POST /auth/register`      |

---

# Candidate Pages (under `CandidateLayout`)

| Page                                    | Purpose                       | APIs Used                                                                                                                  | Key Features                                                                                                   |
| --------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| JobListingPage `/find-jobs`             | Browse all jobs               | `GET /jobs`                                                                                                                | Search, filter by job type/work mode, grid/list toggle, pagination, bookmarks, match %                         |
| JobDetailPage `/jobs/:id`               | View full job details + apply | `GET /jobs/:id`, `POST /applications/:jobId`, `GET /applications/check/:jobId`, `GET /resume/my`                           | Match ring, resume selection modal (with local upload), apply/withdraw, expiry warning                         |
| MyApplicationsPage `/my-applications`   | Track applied jobs            | `GET /applications/my`, `DELETE /applications/:id`                                                                         | Status badges, resume column (filename + preview), withdraw application                                        |
| SkillManagementPage `/skill-management` | Add/remove personal skills    | `GET /skills/user`, `POST /skills`, `DELETE /skills/:id`                                                                   | Skill strength indicator, tag-style UI                                                                         |
| SkillGapPage `/skill-gap/:jobId`        | Analyze skill gap for a job   | `GET /jobmatch/match`, `POST /api/ai/career-insights`                                                                      | Matched vs missing skills, salary info, job match score, AI career insights card                               |
| CandidateProfilePage `/profile`         | Manage candidate profile      | `GET /users/me`, `PUT /users/me`, `GET /resume/my`, `POST /resume/upload`, `DELETE /resume/:id`, `PUT /resume/:id/primary` | Personal info, resume upload/preview/delete, set primary, profile completion, activity summary                 |
| ResumeAnalyzerPage `/resume-analyzer`   | AI-powered ATS resume scoring | `GET /resume/my`, `GET /jobs`, `POST /api/resume/analyze`                                                                  | Select saved resume or upload new, select job, ATS score breakdown, matched/missing skills, AI recommendations |

---

# Recruiter Pages (under `RecruiterLayout`)

| Page                                      | Purpose                       | APIs Used                                                      | Key Features                                                                              |
| ----------------------------------------- | ----------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| RecruiterDashboard `/recruiter-dashboard` | Overview stats                | `GET /jobs/recruiter`, applications data                       | Stat cards (total jobs, applications), status breakdown                                   |
| ManageJobPage `/manage-jobs`              | View/manage posted jobs       | `GET /jobs/recruiter`, `DELETE /jobs/:id`                      | Search, filter by type/mode/status, pagination, edit/delete actions                       |
| PostJobPage `/post-job`                   | Create a new job posting      | `POST /jobs`, `GET /enums/job-types`, `GET /enums/work-modes`  | Full form with skills, salary, type, work mode                                            |
| EditJobPage `/edit-job/:id`               | Edit existing job             | `GET /jobs/:id`, `PUT /jobs/:id`                               | Pre-filled form, same fields as PostJob                                                   |
| JobApplicantsPage `/applicants/:jobId`    | View all applicants for a job | `GET /applications/job/:jobId`, `PUT /applications/:id/status` | Applicant table with status update dropdown, resume filename + preview + download per row |

---

# Routing System

## Public Routes

- /login
- /register

## Recruiter Routes

- /recruiter-dashboard
- /post-job
- /edit-job/:id
- /manage-jobs
- /applicants/:jobId

## Candidate Routes

- /find-jobs
- /jobs/:id
- /skill-management
- /skill-gap/:jobId
- /my-applications
- /profile
- /resume-analyzer

## Route Protection

Protected routes use:

- `ProtectedRoute` component — checks JWT token **and** user role
- Recruiter routes enforce `role="RECRUITER"`, candidate routes enforce `role="CANDIDATE"`
- Wrong-role access redirects to the user's own dashboard (not login)
- Prevents back-button cross-role navigation after logout

Unauthorized users (no token) redirect to:

- /login

## Layout System

- RecruiterLayout → recruiter pages
- CandidateLayout → candidate pages

## Database Tables

users
skills
user_skills
jobs
job_skills
applications
resumes

## System Architecture

Frontend (React) → REST APIs → Spring Boot Backend → PostgreSQL Database

# Environment Variables

## Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Backend `application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/job_matcher_db
spring.datasource.username=postgres
spring.datasource.password=your_password

jwt.secret=your_jwt_secret

# Email (SMTP — e.g. Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Frontend URL — embedded in notification emails
app.frontend.url=http://localhost:3000

# NVIDIA NIM — AI Resume Analyzer & Career Insights
nvidia.nim.api.key=your_nvidia_nim_api_key
nvidia.nim.api.url=https://integrate.api.nvidia.com/v1/chat/completions
nvidia.nim.model=meta/llama-3.1-8b-instruct

# ATS score weights (must sum to 100)
ats.weight.skills=60
ats.weight.experience=20
ats.weight.projects=10
ats.weight.strength=10
```

## Matching Formula

Match % = (Matched Skills / Total Job Skills) × 100

## AI Development Rules

- Extend existing code only
- Avoid rewriting unrelated files
- Maintain current architecture
- Reuse existing components
- Follow existing API structure
- Use service layer for API calls
- Keep UI responsive
- Follow current coding style
