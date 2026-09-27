# TarkAI

**A Sovereign, Air-Gapped, On-Premise Agentic AI Workbench**

Built for **PS26117** — Mangalore Refinery and Petrochemicals Limited (MRPL), Smart India Hackathon 2026

---

## Problem Statement

Refineries, PSUs, and defence-linked manufacturing units generate large volumes of sensitive knowledge work — approval notes, engineering calculations, scanned drawings, inspection reports — that cannot be processed by cloud AI tools like Claude or Codex due to confidentiality constraints. PS26117 calls for a **self-hosted, air-gapped AI workbench** that:

- Runs entirely on the organization's own infrastructure, with zero external calls
- Supports multiple open-weight models and automatically selects the right one per task
- Allows new models to be added later **without redesigning the system**
- Acts as a genuine agent — planning, using tools, and iterating on multi-step work
- Handles multimodal input (scanned PDFs, handwriting, engineering drawings)
- Produces real deliverables (Word/Excel/PPT, working code), not just chat replies
- Grounds itself in the organization's own SOPs and documents
- **Proves** — via logs or a live network monitor — that no external calls are made

---

## What TarkAI Does

TarkAI is a self-hosted agentic AI workbench designed to meet every requirement above.

- **Secure, Air-Gapped AI** — Runs fully on-premise with zero external calls, keeping sensitive data protected and verifiably inside the organization.
- **Intelligent Model Routing** — Automatically selects the most suitable local AI model for each task, such as coding or reasoning.
- **ReAct-Based Task Automation** — Uses Reason → Act → Observation loops to plan, execute, observe, and refine multi-step tasks until completion.
- **Multimodal & Organization-Grounded** — Processes text, scans, handwriting, and drawings using the organization's own internal knowledge.
- **From Task to Deliverable** — Generates ready-to-use reports, documents, PPTs, spreadsheets, and working code from user tasks.
- **Verifiable Security & Deployment** — A live network monitor visibly proves that no data leaves the system, with one-command on-premise deployment.

---

## Architecture

User → React frontend → Task Router (rule-based + LLM fallback) → ReAct Agent (Thought → Action → Observation) → local tools (file I/O, code sandbox, spreadsheet, OCR, knowledge-base search) → local Ollama models → deliverable generation (docx/pptx/xlsx/code), all logged and verified by a live network monitor.

Full component diagram: see `/docs/architecture.puml` (PlantUML source in this repo).

---

## Tech Stack

### Currently Implemented (CPU-only, verified from source)

| Component | Model / Tool |
|---|---|
| Reasoning / General | `phi3:mini` |
| Coding | `qwen2.5-coder:1.5b` |
| Vision | `qwen3-vl:4b` |
| Task Router | Stage 1: rule-based keyword/file-type match · Stage 2: `phi3:mini` (LLM tie-breaker) |
| Embedding | `qwen3-embedding:0.6b` (~1.2GB, CPU-viable) |
| Retrieval | Hybrid — BM25 + Dense Vector Search + Reciprocal Rank Fusion |
| Vector Store | ChromaDB (persistent) |
| OCR | PaddleOCR |
| Drawing / Symbol Detection | RF-DETR (fine-tuned) |
| Document Generation | python-docx, python-pptx, openpyxl |
| Backend | FastAPI + Uvicorn |
| Frontend | React + Vite |
| Model Serving | Ollama (local inference) |
| Deployment | Docker Compose |
| Security | psutil-based live network monitor |

### Production Target (Mid-Range GPU, per PS26117's own spec)

Only the reasoning, coding, and vision models change — everything else in the stack above is unchanged.

| Component | CPU (Demo) | Mid-Range GPU (Target) |
|---|---|---|
| Reasoning / Agent | phi3:mini | Qwen3.6-27B (~17GB VRAM, Q4) |
| Coding | qwen2.5-coder:1.5b | qwen3-coder:30b (~19GB VRAM, Q4) |
| Vision | qwen3-vl:4b | Qwen3-VL-8B (~6GB VRAM, Q4) |

**Extendable by design:** switching tiers is a 2–3 line change in `.env` / `models.json`. No code touch — directly satisfying PS26117's requirement that new models be addable without redesigning the system.

---

## RAG & Grounding Pipeline (code-verified)

1. **Ingestion** — `.txt`, `.pdf`, `.docx`, `.xlsx`, and image files parsed from the local knowledge base
2. **Chunking** — 400-word windows, 80-word overlap
3. **Embedding** — each chunk encoded via `qwen3-embedding:0.6b`, called through Ollama's `/api/embeddings` endpoint
4. **Storage** — embeddings upserted into a persistent ChromaDB collection (cosine HNSW index)
5. **Retrieval** — hybrid search: BM25 (keyword) + dense vector search, merged via Reciprocal Rank Fusion
6. **Grounded response** — retrieved passages are injected into the agent's prompt history as tool observations, and the model answers only from retrieved context, citing the source

This pipeline was traced end-to-end against the live source (`rag_pipeline.py`, `orchestrator.py`) — every step is implemented, with no stubs or placeholders.

---

## Security — Verifiable, Not Claimed

Per PS26117: *"show, through logs or a visible network monitor, that no external calls are made at any point — that's the actual proof of the sovereign claim, not just a statement of it."*

TarkAI includes a live network monitor that:
- Polls active sockets via `psutil.net_connections()` every 3 seconds
- Classifies every connection as local/private vs. external
- Logs every check — a warning line is written immediately if any external call is ever detected
- Enforcement is architectural: no external SDKs exist in the codebase, and Ollama only ever calls `localhost`

---

## Getting Started

```bash
git clone <repo-url>
cd tarkai
docker-compose up
```

This starts the FastAPI backend, React frontend, and Ollama model server together. See `cpu_tier.env` for the default CPU-only model configuration.

---

## Demo Scenario

1. Live air-gap network monitor running throughout
2. End-to-end agentic task: OCR a scanned inspection report → cross-check against SOPs via RAG → draft a Word approval note
3. Router classification shown live for multiple task types
4. RAG question with citations, plus one deliberate negative test (question outside the knowledge base)
5. Coding task, executed and verified in a sandbox
6. Multimodal task → auto-generated PowerPoint briefing

---

## Roadmap

The following are **planned extensions, not yet implemented** in the current codebase:

- **Knowledge Graph with Citations** — linking related SOPs, drawings, and records into a traceable graph for richer grounding
- **Voice Integration** — hands-free interaction via voice commands and spoken responses
- **Multilingual Support** — native support for Hindi and other regional languages alongside English
- **Multiple Consoles** — parallel chat sessions/tabs so a user can run independent tasks side by side

---

## Team & Repository

- Problem Statement: PS26117 — MRPL, Smart India Hackathon 2026
- GitHub: `<repo-link>`
