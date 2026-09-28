# TarkAI

### Sovereign On-Premise Agentic AI Workbench for Confidential Industrial Work

> **Intelligence that stays where your data stays.**

Built for **Smart India Hackathon 2026**, Problem Statement **SIH26117**, by **Mangalore Refinery and Petrochemicals Limited (MRPL)**.
Team: **818_RubixCode**

---

## Table of Contents

1. [The Problem](#the-problem)
2. [Our Solution](#our-solution)
3. [Key Features](#key-features)
4. [Innovation Highlights](#innovation-highlights)
5. [How It Works](#how-it-works)
6. [Tech Stack](#tech-stack)
7. [Application Pages](#application-pages)
8. [Demo Scenarios](#demo-scenarios)
9. [Proof of Air-Gap](#proof-of-air-gap)
10. [Getting Started](#getting-started)
11. [Hardware and Models](#hardware-and-models)
12. [Security and Standards](#security-and-standards)
13. [Research Background](#research-background)
14. [Limitations](#limitations)
15. [Roadmap](#roadmap)
16. [Team](#team)

---

## The Problem

Refineries, PSUs, defence-linked units and government offices do a lot of sensitive knowledge work: approval notes, engineering calculations, code for internal tools, and review of scanned drawings and inspection reports.

This data is confidential (P&IDs, financials, vendor negotiations, unreleased designs). It cannot go to cloud AI assistants. So people do one of two things:

- Work **manually**, and lose productivity.
- **Quietly paste** confidential data into public tools.

Both are bad. According to IBM's Cost of a Data Breach 2026 report, the average data breach in India costs **₹25.5 crore**, and unapproved AI use ("shadow AI") adds about **₹1.79 crore** more.

**MRPL needs a third option:** a Claude-like assistant that runs entirely inside the organization.

---

## Our Solution

**TarkAI** is a self-hosted, air-gapped AI workbench. It runs fully on the organization's own machine. Nothing leaves the premises.

It maps directly to the six needs in the problem statement:

| # | Need from SIH26117 | How TarkAI meets it |
|---|--------------------|---------------------|
| 1 | Air-gapped, on-premise | Local inference with Ollama, Docker network isolation |
| 2 | Multiple open-weight models, auto-selected per task | Two-stage Model Router, new model = one config entry |
| 3 | A real agent (plan, use tools, iterate) | ReAct agent with 8-step cap and loop detection |
| 4 | Multimodal (scans, images) | Local OCR plus a local vision model |
| 5 | Real deliverables grounded in company SOPs | Word, Excel, PPT files built from a local knowledge base |
| 6 | Proof that nothing goes out | Live Air-Gap Monitor showing every connection |

---

## Key Features

### 1. Intelligent Model Router
Picks the right local model for each task. A coding request and a document question are handled by different models. Routing is two-stage: a fast keyword and file-type check first, and a small model classifies the ambiguous cases. Adding a new model is a single config entry, with no code redesign.

### 2. Agentic Reasoning Engine (ReAct)
The agent **thinks, acts, observes and retries**. It has an **8-step limit** and **loop detection** so it stops when stuck. Every step is visible in the Agent Reasoning page.

### 3. Knowledge Intelligence (Hybrid RAG)
Answers come from the organization's own SOPs and manuals, not from model memory. Search combines **keyword search and vector (meaning-based) search**, and every answer shows its **source citation**.

### 4. Multimodal Intelligence
Scanned documents and images are read with **local OCR and a local vision model**. Low-confidence results are **flagged for human review**.

### 5. Deliverable Factory
Generates real **Word, Excel and PowerPoint** files, with the **reasoning trace embedded** so calculations can be checked step by step.

### 6. Human Approval Gate (HITL)
Sensitive or low-confidence outputs wait for an engineer's approval. Nothing is final until a human signs off.

### 7. Air-Gap Monitor
A live network monitor lists every connection made by the system. This is the evidence for the sovereign claim, not just a statement.

---

## Innovation Highlights

- **Two-stage Model Router** with config-only model onboarding
- **ReAct agent** with step cap and loop detection
- **Hybrid search** (keyword plus vector) with citations
- **Deliverables with reasoning trace** embedded in the file
- **Citation-backed knowledge graph**
- **Voice input** and **multilingual support**
- **Parallel consoles** so multiple users can work at the same time
- **One-command Docker deployment**
- **Confidence-based flagging** that sends uncertain results to a human

---

## How It Works

```
 01 Confidential Input      Files, telemetry, images or operational queries
          |
 02 Local Model Router      Selects the right on-premise model
          |
 03 ReAct Agent             Reasons, uses tools, executes controlled steps
          |
 04 Knowledge + Tools       Retrieves SOPs, processes data, runs sandboxed code
          |
 05 Human Approval          Engineer reviews sensitive or low-confidence results
          |
 06 Verified Output         Final operational deliverable (docx / xlsx / pptx)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | FastAPI (Python) |
| Local LLM runtime | Ollama |
| OCR | PyTesseract |
| Vision model | moondream |
| Router / general model | phi3:mini |
| Coding model | ~1.5B-parameter coder model |
| Network monitoring | psutil |
| Storage | SQLite |
| Deployment | Docker |

> Demo models are small so they run on CPU. See [Hardware and Models](#hardware-and-models).

---

## Application Pages

| Page | Purpose |
|------|---------|
| **Home** | Command center with live status: external calls, local models, approvals |
| **AI Assistant** | Chat interface to ask, analyze and generate locally |
| **Model Router** | Shows which model was chosen for each task, and why |
| **Agent Reasoning** | Step-by-step trace of the agent's plan, actions and results |
| **Tool Registry** | Local tools available to the agent |
| **Knowledge Search** | Searches approved SOPs and shows the source passage |
| **Deliverables** | Generated Word, Excel and PPT files |
| **Air-Gap Monitor** | Live network connections and security events |
| **Operations** | Current and past tasks |
| **Approvals** | Human review queue for sensitive outputs |

---

## Demo Scenarios

The demo uses **public sample data only**. No proprietary data is used.

| # | Task | What it shows |
|---|------|---------------|
| Q1 | *"What is the maximum allowed vibration on Turbine #1 according to SOP-701? Cite the source."* | Knowledge base answer with a citation, opened in Knowledge Search |
| Q2 | *"Write a Python function to compute the RMS of a vibration signal, test it on a synthetic 50 Hz sine wave with amplitude 2, and print the result."* | Coding task run in a sandbox. Result is about 1.41. Router picks the coding model |
| Q3 | Attach a scanned inspection report or gauge panel, list the key findings, and write an approval note as a Word file | End-to-end agentic task: OCR and vision, findings, Word deliverable, human approval |
| Proof | Open the Air-Gap Monitor | Live connections, with external calls at zero |

Q1 and Q2 together show **automatic model selection across two task types**.

---

## Proof of Air-Gap

The problem statement asks for proof through logs or a visible network monitor. TarkAI provides:

- **Live Air-Gap Monitor** page listing all active connections (built on `psutil`)
- **Docker network isolation** for the deployed stack
- **Audit trail** of tasks and approvals
- **Local-only inference** through Ollama, with no cloud API keys in the project

To verify during a demo: open the Air-Gap Monitor while a task is running and check that every connection is local.

---

## Getting Started

> Replace the placeholders below (`<repo-url>`, ports, file names) with your actual values before publishing.

### Prerequisites

- Docker and Docker Compose
- [Ollama](https://ollama.com) with the required models pulled
- Tesseract OCR (bundled in the Docker image, or installed locally)

### Option 1: Docker (recommended)

```bash
git clone <repo-url>
cd tarkai
docker compose up --build
```

Then open `http://localhost:5173`.

### Option 2: Run locally

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

**Models (one-time, needs internet only for the download)**

```bash
ollama pull phi3:mini
ollama pull moondream
# pull your coding model here
```

After the models are downloaded, the system runs fully offline.

### Adding a new model

Add one entry to the model registry config, with the model name and the task types it should handle. The router picks it up with no code changes.

---

## Hardware and Models

| Setup | Hardware | Models |
|-------|----------|--------|
| **Demo (this repo)** | CPU only, single workstation | Small models (phi3:mini, ~1.5B coder, moondream) |
| **Production** | Mid-range GPU server | Larger open-weight models, same codebase |

The problem statement allows a smaller open-weight model when GPU hardware is not available at the venue. On CPU, each answer can take **20 to 60 seconds**.

---

## Security and Standards

- All inference, search, OCR and file generation happen **on the local machine**.
- Human approval is required before outputs are final.
- Every task and approval is logged.
- TarkAI follows the **principles** of **IEC 62443** (industrial automation security) and **NIST SP 800-82** (ICS security). **Formal certification is a future step, not a current claim.**

---

## Research Background

The design choices are supported by recent work on on-premise and air-gapped AI:

- *A Cost-Benefit Analysis of On-Premise LLM Deployment* (arXiv 2509.18101): trade-offs between cloud, on-prem and hybrid.
- *Design and Evaluation of a Secure Air-Gapped LLM-Based Intelligence Analysis Framework* (ResearchSquare **preprint**, not peer-reviewed): offline architecture, RAG, audit logging and human-in-the-loop. In this preprint, RAG reduced hallucination from 38.7% to 12.2%.
- *Securing Intelligence: The Strategic Necessity of Air-Gapped LLMs* (MIT DSpace): third-party APIs expose prompts and metadata to the provider.
- Hardware and quantization benchmarks for private LLM servers (arXiv 2512.23029).

Requirements drawn from this work: fully offline operation, local RAG from access-controlled documents, audit logs with human approval, quantized models for limited hardware, and encryption with data kept inside India.

---

## Limitations

Being honest about where we are:

- Demo models are small, so answers are slower and less capable than production-class models.
- OCR and vision accuracy depends on scan quality. Uncertain results are flagged for a human, not trusted blindly.
- No research paper we reviewed is specific to Indian refineries or OT/ICS environments. Standards alignment is by principle, not certification.
- Demo data is public sample material, not real plant data.

---

## Roadmap

- Move from CPU demo models to GPU-class open-weight models
- Formal alignment review against IEC 62443 and NIST SP 800-82
- Wider file and drawing support (P&IDs, handwritten notes)
- Deeper integration with the organization's own document stores
- Role-based access control and encryption at rest

---

## Team

**Team 818_RubixCode**

- Nandini Singh
- Resham
- Anjali
- Dhairya
- Yaduraj
- Samarth

---

## Note on Deployed Links

If a cloud-hosted link is provided for this project, it is a **UI preview only**. The full system, including local models and the Air-Gap Monitor, runs **on-premise**.

---

*TarkAI: When the data cannot leave, the intelligence must come to it.*
