# Electric Sence — Electrical Engineering Educational Platform

**Electric Sence** is an educational platform designed specifically for Electrical and Electronics Engineering (EEE) students. It features core subject exploration, engineering tools, study materials, project blueprints, and a persistent AI-ready chat assistant.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 (light neutral engineering palette, subtle blue accents)
- **Icons**: Lucide React
- **Typography**: Inter & JetBrains Mono

### Backend (Phase 1)
- **Runtime**: Node.js (TypeScript via `tsx`)
- **Framework**: Express 5
- **Database**: SQLite (via Node's native synchronous `node:sqlite` engine)
- **Persistence Location**: `server/data/electric_sence.db`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm run server
```
The backend server runs on `http://localhost:3001` with SQLite database migrations automatically applied on boot.

### 3. Start the Frontend Development Server
In a separate terminal:
```bash
npm run dev
```
The frontend is accessible at `http://localhost:5173`. Requests to `/api/*` are automatically proxied by Vite to the backend on port 3001.

---

## 🗄️ Database Schema

The SQLite database (`server/data/electric_sence.db`) contains the following persistent tables:

### `users`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `email` (TEXT UNIQUE)
- `created_at` (TEXT NOT NULL)

### `conversations`
- `id` (TEXT PRIMARY KEY)
- `title` (TEXT NOT NULL)
- `subject` (TEXT DEFAULT 'General Electrical')
- `created_at` (TEXT NOT NULL)
- `updated_at` (TEXT NOT NULL)

### `messages`
- `id` (TEXT PRIMARY KEY)
- `conversation_id` (TEXT NOT NULL, FOREIGN KEY REFERENCES `conversations(id)` ON DELETE CASCADE)
- `role` (TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')))
- `content` (TEXT NOT NULL)
- `created_at` (TEXT NOT NULL)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check and database connectivity status |
| `GET` | `/api/conversations` | List all conversation sessions with message counts, sorted by `updated_at DESC` |
| `POST` | `/api/conversations` | Create a new conversation session (optional initial message) |
| `GET` | `/api/conversations/:id` | Fetch conversation details and all associated messages |
| `POST` | `/api/conversations/:id/messages` | Append a message to a conversation; updates `updated_at` |
| `PATCH` | `/api/conversations/:id` | Rename conversation title or change subject |
| `DELETE` | `/api/conversations/:id` | Delete conversation and cascade-delete its messages |

---

## ⚡ Current Status & Next Steps (Phase 2)

- **AI Integration**: The system currently maintains an honest **AI Offline** status banner. Chat messages and queries are securely persisted to the SQLite database.
- **Next Phase**: Integrate an electrical engineering domain RAG pipeline and language model API endpoint for real mathematical problem solving, circuit analysis derivations, and numerical guidance.
