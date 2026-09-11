import React from 'react';
import { FileCheck, Code2, FileText, Presentation, Table, Download, CheckCircle2 } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { ResultView } from '../components/ResultView';

export const R5DeliverablesPage: React.FC = () => {
  const { resultData, deliverable } = useTaskContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Header */}
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FileCheck size={28} color="var(--accent-cyan)" />
          <h2 className="hero-title">Government Document Generation Workspace (Requirement R5)</h2>
        </div>
        <p className="hero-desc">
          Satisfies PS26117 Requirement 5: Professional deliverable document production workspace. Converts the agent's <code>FINAL_ANSWER</code> specifications into styled Word (<code>.docx</code>), PowerPoint (<code>.pptx</code>), and Excel (<code>.xlsx</code>) files saved in <code>outputs/</code> with direct download links.
        </p>
      </div>

      {/* Technical Implementation Reference */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-cyan)" /> Technical Implementation Reference
          </span>
          <span className="badge badge-secure">R5 VERIFIED LIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>📁 <strong>Output Generator Engine:</strong> <code>backend/app/output_generator.py</code></div>
          <div>📁 <strong>Deliverables Folder:</strong> <code>outputs/</code></div>
          <div>📥 <strong>Download Route:</strong> <code>GET /outputs/{'{filename}'}</code></div>
          <div>📦 <strong>Libraries Used:</strong> <code>python-docx</code>, <code>python-pptx</code>, <code>openpyxl</code></div>
        </div>
      </div>

      {/* Document Formats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <FileText size={22} color="var(--accent-cyan)" />
            <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>Word Report (.docx)</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Generated via <code>python-docx</code> with executive title banners, styled section headers, formatted paragraphs, and bullet points.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Presentation size={22} color="var(--accent-amber)" />
            <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>PowerPoint Slide (.pptx)</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Generated via <code>python-pptx</code> from JSON slide specifications with title slide layouts and bullet point frames.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Table size={22} color="var(--accent-emerald)" />
            <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>Excel Spreadsheet (.xlsx)</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Generated via <code>openpyxl</code> with styled header fills, thin cell borders, aligned data rows, and dynamic column widths.
          </p>
        </div>
      </div>

      {/* Embedded Live Component */}
      <div className="card">
        <div className="card-title">
          <span>Embedded Live R5 Deliverable Workspace</span>
        </div>
        {resultData ? (
          <ResultView result={resultData} deliverable={deliverable} />
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No active deliverable generated yet. Submit an industrial prompt on the Main Landing Page (e.g. "Draft Boiler Safety SOP docx") to generate a downloadable document.
          </div>
        )}
      </div>
    </div>
  );
};
