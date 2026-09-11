import React from 'react';
import { Eye, Code2, Folder, Terminal, HardDrive, FileText, CheckCircle2, FileCheck } from 'lucide-react';

export const R4ToolsPage: React.FC = () => {
  const toolsList = [
    {
      name: 'file_io',
      file: 'backend/app/tools/file_io.py',
      functions: 'read_file(path), write_file(path, content)',
      desc: 'Sandboxed file operations restricted to data/sandbox/ directory with path traversal protection.',
      icon: Folder,
      color: 'var(--accent-cyan)',
    },
    {
      name: 'code_sandbox',
      file: 'backend/app/tools/code_sandbox.py',
      functions: 'execute_code(code, language)',
      desc: 'Subprocess code runner with 10s timeout in isolated temp folder with scrubbed network env.',
      icon: Terminal,
      color: 'var(--accent-blue)',
    },
    {
      name: 'doc_search',
      file: 'backend/app/tools/doc_search.py',
      functions: 'search_knowledge_base(query)',
      desc: 'Wraps IntelliMesh RAG pipeline (BM25 + TF-IDF + RRF + MMR) over local industrial SOPs.',
      icon: HardDrive,
      color: 'var(--accent-emerald)',
    },
    {
      name: 'ocr_tool',
      file: 'backend/app/tools/ocr_tool.py',
      functions: 'extract_text(file_path)',
      desc: 'OCR text extraction using pytesseract/pdf2image with pypdf fallback for scanned documents.',
      icon: FileText,
      color: 'var(--accent-amber)',
    },
    {
      name: 'vision_tool',
      file: 'backend/app/tools/vision_tool.py',
      functions: 'describe_image(file_path, prompt)',
      desc: 'Multimodal vision inspection via local moondream2 model using Ollama /api/generate base64 API.',
      icon: Eye,
      color: 'var(--accent-cyan)',
    },
    {
      name: 'output_generator',
      file: 'backend/app/output_generator.py',
      functions: 'generate_docx(), generate_pptx(), generate_xlsx()',
      desc: 'Deliverable document generation for Word, PowerPoint, and Excel files stored in outputs/.',
      icon: FileCheck,
      color: 'var(--accent-emerald)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Header */}
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Eye size={28} color="var(--accent-cyan)" />
          <h2 className="hero-title">Multimodal AI & 6-Tool Modular Suite (Requirement R4)</h2>
        </div>
        <p className="hero-desc">
          Satisfies PS26117 Requirement 4: Comprehensive suite of 6 air-gapped industrial tools. Includes multimodal vision inspection via <code>moondream2</code>, OCR text extraction via Tesseract/pypdf for scanned engineering documents, and sandboxed code execution.
        </p>
      </div>

      {/* Multimodal & OCR Visual Pipeline Diagram */}
      <div className="card">
        <div className="card-title">
          <span>Multimodal OCR & Vision Understanding Pipeline</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>STEP 1: UPLOAD</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Document / Image</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Scanned PDF, diagram PNG/JPG uploaded via <code>POST /api/upload</code>.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginBottom: '0.3rem' }}>STEP 2: OCR / VISION</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Tesseract & Moondream2</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Extracts text raster pixels or analyzes visual diagram features locally.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>STEP 3: CONTEXT INGEST</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Agent Context Feed</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Extracted text or visual analysis passed into ReAct observation state.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>STEP 4: RESULT</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Structured Insight</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Incorporated into final deliverable report or code execution.</p>
          </div>
        </div>
      </div>

      {/* Technical Implementation Reference */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-cyan)" /> Technical Implementation Reference
          </span>
          <span className="badge badge-secure">R4 VERIFIED LIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>📁 <strong>Tool Suite Location:</strong> <code>backend/app/tools/</code></div>
          <div>🛠️ <strong>Registered Tools Count:</strong> 6 sandboxed tools</div>
          <div>🔒 <strong>Sandbox Timeout:</strong> 10s execution timeout on subprocesses</div>
        </div>
      </div>

      {/* 6 Tool Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {toolsList.map((t, idx) => {
          const IconComp = t.icon;
          return (
            <div key={idx} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <IconComp size={20} color={t.color} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{t.name}</h3>
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                <code>{t.file}</code>
              </div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.6rem' }}>
                {t.functions}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                {t.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
