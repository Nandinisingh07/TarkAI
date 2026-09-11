# Sovereign On-Premise Agentic AI Workbench (SIH PS26117)

> **Phase 1 Implementation**: Fully air-gapped, CPU-optimized, confidential industrial agentic workbench powered by open-weight multimodal LLMs via Ollama.

---

## 🛡️ Key Features & Hard Requirement Fulfillment

1. **AIR-GAPPED AUDIT LOGGING**: Zero external API or network calls. Features a background `NetworkMonitor` service (`psutil.net_connections()`) that continuously audits connections to `network_audit.log` and exposes `GET /monitor/status`.
2. **MULTI-MODEL AUTO-SELECTION**: Rule-based `TaskRouter` module (`backend/app/router.py`) auto-classifies user prompts. Routes coding tasks to `qwen2.5-coder:1.5b` and general industrial/reasoning tasks to `phi3:mini`. Model names are fully dynamic in `backend/app/config/models.json`—zero code changes required to add/swap models.
3. **ReAct AGENTIC LOOP**: Multi-step ReAct agent engine (`backend/app/agent.py`) supporting up to 8 iterations of `Thought -> Action -> Observation -> Final Answer`.
4. **MODULAR TOOL REGISTRY**:
   - `file_io.py`: Sandboxed file read/write operations within `data/sandbox/`.
   - `code_sandbox.py`: Subprocess code execution with 10s timeout in isolated temp environment.
   - `doc_search.py`: IntelliMesh RAG pipeline (BM25 + TF-IDF Vector Space + RRF + MMR) over local SOPs with source citations.
   - `ocr_tool.py`: Text extraction for scanned PDFs and industrial documents.
   - `vision_tool.py`: Multimodal image description via `moondream2`.
5. **DELIVERABLE GENERATION**: Generates downloadable industrial documents (`.docx`, `.pptx`, `.xlsx`, `.txt`) using `python-docx`, `python-pptx`, and `openpyxl`.
6. **KNOWLEDGE BASE GROUNDING**: Grounded responses based on local SOPs in `data/knowledge_base/` with inline citations.
7. **AIR-GAP GUARD PANEL**: React UI panel polling `/monitor/status` every 3 seconds with active green shield and live audit logs.

---

## 💻 Hardware Requirements

- **CPU**: Standard x86_64 / ARM CPU (no GPU required for Phase 1).
- **RAM**: Minimum 8 GB RAM (16 GB recommended).
- **Disk Space**: ~6 GB free space (for Ollama lightweight models `qwen2.5-coder:1.5b`, `phi3:mini`, and `moondream2`).

---

## 🚀 Quick Start with Docker Compose

1. **Clone & Launch**:
   ```bash
   docker-compose up --build
   ```
2. **Access Web Application**:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000) (or `http://localhost:5173`)
   - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Air-Gap Monitor Status**: [http://localhost:8000/monitor/status](http://localhost:8000/monitor/status)

---

## ⚡ Local Development (Without Docker)

### Backend:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Phase 2 GPU Upgrade Guide (Zero Code Changes)

To upgrade the workbench for Phase 2 GPU deployment or swap to larger models (e.g. `qwen2.5-coder:7b`, `llama3.1:8b`, `llava:7b`), simply update `backend/app/config/models.json` or `.env`:

```json
{
  "coder_model": "qwen2.5-coder:7b",
  "general_model": "llama3.1:8b",
  "vision_model": "llava:7b",
  "ollama_base_url": "http://localhost:11434"
}
```

No code modifications are required in `agent.py`, `router.py`, or tool modules.
