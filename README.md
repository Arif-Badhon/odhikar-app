# ⚖️ Odhikar AI Paralegal

Odhikar is an AI-powered legal-aid paralegal assistant designed specifically for Bangladesh. It automates the initial client intake process by capturing spoken Bengali (Bangla) narratives, performing real-time legal analysis grounded in Bangladeshi law, and generating structured, actionable case reports for human paralegals to review.

## 🏗 System Architecture

The Odhikar platform is built on a microservices architecture, orchestrated via Docker Compose, to ensure separation of concerns, scalability, and robust performance.

### 1. Frontend & Client Intake (`Next.js`)
Located in `apps/web/`, the frontend is built using **Next.js (App Router)**, React, and Tailwind CSS.
- **Client-Facing Intake**: Provides an accessible, voice-first interface where users can record their legal issues in natural spoken Bengali.
- **Staff Dashboard**: A secure admin panel where human paralegals can view the queue of incoming cases, review AI-generated reports, and interact with the AI training simulator (`paralegal-ai-coach`).
- **Edge AI Orchestration**: Uses Next.js Server Actions to directly interface with the Google Gemini API for fast, edge-optimized speech-to-text and initial heuristic analysis.

### 2. Core API Backend (`Python / FastAPI`)
Located in `services/api/`, the backend is powered by **FastAPI (Python)** and connects to a **PostgreSQL** database.
- **Case Management**: Manages the lifecycle of legal cases (submission, queueing, status updates).
- **Structured Storage**: Stores complex AI extraction results in structured `JSONB` columns, allowing flexible querying of case metadata (missing fields, safety flags, confidence scores).
- **Audio Processing**: Handles the ingestion and storage of raw `.webm` audio files submitted by users.

### 3. Knowledge Base Ingestion (`Rust`)
Located in `crates/ingest/`, this is a high-performance **Rust** background service.
- **Data Seeding**: It automatically fetches verified legal knowledge (statutes, acts, and summaries based on official Bangladeshi laws) and inserts them into the PostgreSQL database.
- **Database Mapping**: It maps primary governing statutes (such as those from `bdlaws.minlaw.gov.bd`) to specific legal categories (e.g., Dowry, Dower & Maintenance, Land Disputes).
- **Grounding the AI**: By pre-loading the database with accurate, verified legal frameworks, the system ensures that the AI's subsequent analysis is legally sound and context-aware.

---

## 🧠 AI Integration (Google Gemini)

Odhikar leverages **Google Gemini (gemini-3.6-flash)** at the core of its intelligence pipeline to process complex, unstructured Bengali audio and text.

1. **Verbatim Speech-to-Text**: Raw `.webm` audio is streamed to Gemini to transcribe spoken Bengali accurately without summarizing or translating it to English.
2. **Contextual Analysis**: The raw transcript is passed to Gemini alongside a strict system prompt containing relevant Bangladeshi laws (injected dynamically based on the knowledge base). Gemini is tasked with:
   - **Classification**: Categorizing the issue (e.g., Unpaid Wages).
   - **Extraction**: Identifying key actors (applicants, respondents), dates, financial amounts, and claimed harm.
   - **Missing Information Detection**: Based strictly on the category, Gemini determines exactly what mandatory fields are missing from the narrative (e.g., if a wage dispute, it asks for the `dailyRate` and `daysWorked`) and generates follow-up questions.
   - **Safety Guardrails**: Detecting immediate threats to life or physical violence to flag the case for urgent human intervention.
3. **Report Generation**: Finally, Gemini synthesizes the transcript, the follow-up answers, and the legal context into a formal, structured Markdown report for the paralegal team.

---

## 🏛 Legal Grounding & BDLaw

Large Language Models are prone to hallucination, especially in niche legal jurisdictions. Odhikar solves this using a **Retrieval-Augmented Generation (RAG)** approach:

- The **Rust Ingest Service** acts as the bridge between official Bangladeshi law (referencing official statutes from websites like `bdlaws.minlaw.gov.bd`) and the application's memory.
- The `knowledge_sources` and `knowledge_articles` tables store verified, simplified summaries of the law in both Bengali and English.
- When a user submits a narrative, the system retrieves only the laws relevant to their specific classification and injects them into the Gemini prompt. This forces the AI to base its legal rights outlines and follow-up questions *only* on actual Bangladeshi legislation, completely eliminating generic or Western-centric legal advice.

---

## 🚀 Running the Project

The entire stack is containerized and can be launched with a single command.

### Prerequisites
- Docker & Docker Compose
- A Google Gemini API Key (`GEMINI_API_KEY`)

### Setup

1. Clone the repository and configure your environment variables:
   ```bash
   cp services/api/.env.example services/api/.env
   cp crates/ingest/.env.example crates/ingest/.env
   ```
2. Build and start the containers:
   ```bash
   docker compose up -d --build
   ```

### Services
- **Next.js Web UI**: `http://localhost:3001`
- **FastAPI Backend**: `http://localhost:8001`
- **PostgreSQL DB**: Port `5432`

---

## 👨‍💻 Development

- **Modifying the AI Prompts**: Navigate to `apps/web/src/lib/odhikar/ai.functions.ts` to adjust the Gemini schemas and system prompts.
- **Updating the Schema**: The database schema is managed via the `update_schema.py` script inside the API container.
- **Re-running Ingestion**: The Rust ingestion container runs automatically on boot. To manually trigger a re-ingestion of the legal knowledge base, restart the `ingest` container: `docker compose restart ingest`.
