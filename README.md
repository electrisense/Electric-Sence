# Electric Sence — Electrical Engineering LMS & RAG Platform

**Electric Sence** is a modern Learning Management System (LMS) and Retrieval-Augmented Generation (RAG) platform purpose-built for Electrical & Electronics Engineering (EEE) students and educators.

---

## ⚡ Key Highlights & Capabilities

1. **Learning Management System (LMS)**:
   - Complete 10-Subject Undergraduate EEE Curriculum.
   - Comprehensive lesson outlines with theoretical explanations, analytical formulas, and numerical practice problems.
   - Objective multiple-choice end-of-course quizzes with automated grading and explanatory solutions.
   - Persistent student enrollment and lesson completion progress in SQLite.

2. **Retrieval-Augmented Generation (RAG)**:
   - Real document ingestion supporting PDF, TXT, and Markdown files up to 15MB.
   - Page-aware PDF text extraction (`pdf-parse`) preserving accurate source page numbers.
   - Semantic text chunking (800–1200 characters with 150-character contextual overlap).
   - High-dimensional vector embeddings generated using Google's `models/gemini-embedding-001` (3072-dimensional `Float32Array`).
   - SQLite binary `BLOB` vector storage with an exact mathematical cosine similarity retrieval engine.
   - Targeted course and subject filtering for context retrieval.
   - Grounded LLM generation via Gemini with source citations (document title, page number, match score, and excerpt).
   - Strict academic factuality: when no matching library documents are retrieved, the assistant honestly notifies the student.

3. **Faculty / Admin Document Console**:
   - Authorized document upload with subject and course assignment.
   - Document metadata tracking: file size, page count, chunk count, and processing status (`pending` → `processing` → `indexed` / `failed`).
   - Secure verified download endpoint (`/api/documents/:id/download`).
   - Cascading document deletion that safely purges all associated vector chunks and embeddings without leaving orphaned records.
   - Retry mechanism for failed document processing jobs.

4. **10 Core Electrical Engineering Domains**:
   1. **Electrical Circuits** (EEE 101)
   2. **Electrical Machines** (EEE 201)
   3. **Power Systems** (EEE 301)
   4. **Power Electronics** (EEE 401)
   5. **Control Systems** (EEE 501)
   6. **Electrical Measurements** (EEE 601)
   7. **Renewable Energy** (EEE 701)
   8. **High Voltage Engineering** (EEE 801)
   9. **Electrical Protection** (EEE 901)
   10. **Electric Vehicles** (EEE 1001)

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Tooling**: Vite 8 with HTTP API proxying to `http://localhost:3001`
- **Styling**: Tailwind CSS v4 (clean engineering theme)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (TypeScript via `tsx`)
- **Web Framework**: Express 5
- **Database**: SQLite (Node's native synchronous `node:sqlite` in WAL mode)
- **Database Location**: `server/data/electric_sence.db`
- **AI Models**:
  - LLM Text Generation: `gemini-3.5-flash-lite`
  - Vector Embeddings: `models/gemini-embedding-001` (3072 dimensions)
- **Document Processing**: `multer` (file upload), `pdf-parse` (page-aware PDF extraction)

---

## 🚀 Quickstart & Setup

### 1. Environment Configuration
Ensure your `.env` file exists in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3001
VITE_API_URL=http://localhost:3001
```

### 2. Start the Backend Server
```bash
npm run server
```
The server will boot on `http://localhost:3001`, apply SQLite schema migrations, and automatically seed the 10 core EEE courses if empty.

### 3. Start the Frontend Development Server
In a separate terminal:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. All `/api/*` network calls are proxied to `http://localhost:3001`.

### 4. Run the Verification Test Suite
```bash
npx tsx server/test_e2e.ts
```
Executes all 24 automated unit and integration tests covering the 10 LMS courses, student progress persistence, quiz grading, 3072-dim embeddings, cosine similarity, document ingestion, page tracking, and cascading deletion.

---

## 🗄️ Database Architecture

The SQLite database (`server/data/electric_sence.db`) contains the following persistent relational tables:

```
users ───────────< enrollments >─────────── courses ───────────< lessons
  │                                           │                     │
  └─────────────< lesson_progress >───────────┘                     │
  │                                                                 │
  └─────────────< quiz_attempts >─────────── quizzes >─────── questions
                                              │
conversations ──< messages                    │
                                              │
documents ──────< document_chunks (BLOB Vector Embeddings)
```

### Table Definitions

| Table | Description | Key Fields |
|---|---|---|
| `courses` | LMS Course offerings | `id`, `code`, `title`, `subject`, `category`, `level`, `duration_weeks`, `instructor` |
| `lessons` | Course modules | `id`, `course_id`, `lesson_order`, `title`, `duration_mins`, `content`, `key_takeaways`, `practice_problem` |
| `enrollments` | Student course enrollments | `id`, `user_id`, `course_id`, `enrolled_at` |
| `lesson_progress` | Per-lesson completion status | `id`, `user_id`, `course_id`, `lesson_id`, `completed`, `completed_at` |
| `quizzes` | End-of-course assessments | `id`, `course_id`, `title`, `passing_score` |
| `questions` | Multiple-choice quiz questions | `id`, `quiz_id`, `question_order`, `question`, `options`, `correct_answer`, `explanation` |
| `quiz_attempts` | Submitted quiz scores | `id`, `user_id`, `quiz_id`, `score`, `total`, `passed`, `submitted_at` |
| `documents` | Uploaded reference materials | `id`, `title`, `subject`, `course_id`, `file_name`, `file_path`, `file_size`, `mime_type`, `page_count`, `processing_status`, `visibility` |
| `document_chunks` | RAG vector storage | `id`, `document_id`, `chunk_index`, `page_number`, `subject`, `course_id`, `chunk_text`, `embedding` (BLOB), `metadata` |
| `conversations` | AI Chat sessions | `id`, `title`, `subject`, `created_at`, `updated_at` |
| `messages` | Chat message history | `id`, `conversation_id`, `role`, `content`, `created_at` |

---

## 📡 API Reference

### Health & AI Status
- `GET /api/health` — Backend status and database connectivity.
- `GET /api/gemini/status` — Checks if `GEMINI_API_KEY` is present and configured.

### Chat & Grounded RAG
- `POST /api/gemini/chat` — Send prompt to Gemini with automatic vector search retrieval, citation generation, and course-targeted grounding.
  - Body: `{ conversation_id, message, history?, subject?, course_id?, use_rag? }`
- `GET /api/conversations` — List all conversations with message counts.
- `POST /api/conversations` — Create a new conversation session.
- `GET /api/conversations/:id` — Retrieve full conversation message history.
- `PATCH /api/conversations/:id` — Rename conversation title.
- `DELETE /api/conversations/:id` — Delete conversation session.

### LMS (Learning Management System)
- `GET /api/lms/subjects` — List all 10 subjects with course and document counts.
- `GET /api/lms/courses` — List all courses with student completion metrics.
- `GET /api/lms/courses/:id` — Fetch course syllabus outline and lesson list.
- `POST /api/lms/courses/:id/enroll` — Enroll student in course.
- `GET /api/lms/lessons/:id` — Fetch lesson theory, formula takeaways, and practice problem.
- `POST /api/lms/lessons/:id/progress` — Update lesson completion status.
- `GET /api/lms/quizzes/:id` — Fetch quiz questions (without answers exposed to client).
- `POST /api/lms/quizzes/:id/submit` — Submit answers; returns score, pass status, and question explanations.
- `GET /api/lms/stats` — Overall student metrics (enrolled, completed modules, average quiz score).

### Document Management & Ingestion (Admin & Public)
- `GET /api/documents` — Search and filter indexed documents (`subject`, `course_id`, `visibility`).
- `POST /api/documents/upload` — Multer upload (PDF/TXT/MD up to 15MB), page extraction, chunking, and 3072-dim embedding generation.
- `GET /api/documents/:id` — Retrieve document metadata and processing status.
- `GET /api/documents/:id/download` — Secure verified download of original file.
- `POST /api/documents/:id/retry` — Retry document extraction and embedding generation.
- `DELETE /api/documents/:id` — Delete document with cascading removal of vector chunks.

---

## 🔒 Security & Development Notice

- **Authentication Note**: Until a production identity provider (e.g., OAuth / JWT) is configured, the LMS uses a clearly marked development student profile (`usr_default_student`).
- **Faculty Admin Console**: The document upload and management interface is intended for authorized course instructors and administrators.
