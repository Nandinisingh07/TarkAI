import React, { useState } from 'react';
import { Download, FileText, Presentation, Table, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, Layers } from 'lucide-react';
import { DeliverableInfo } from '../types';

interface Props {
  result: any;
  deliverable?: DeliverableInfo;
}

// Turns plain agent text into lightweight HTML-ish structure:
// lines starting with #/##/### become headings, "- "/"* "/"1." become list items.
function renderCleanAnswer(text: string) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length) {
      blocks.push(
        <ul key={key}>
          {listBuffer.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) { flushList(`ul-${idx}`); return; }

    if (/^-\s+|^\*\s+|^\d+\.\s+/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s+|^\d+\.\s+/, ''));
      return;
    }
    flushList(`ul-${idx}`);

    if (line.startsWith('### ')) blocks.push(<h3 key={idx}>{line.slice(4)}</h3>);
    else if (line.startsWith('## ')) blocks.push(<h2 key={idx}>{line.slice(3)}</h2>);
    else if (line.startsWith('# ')) blocks.push(<h1 key={idx}>{line.slice(2)}</h1>);
    else blocks.push(<p key={idx} style={{ margin: '4px 0' }}>{line}</p>);
  });
  flushList('ul-end');

  return blocks;
}

export const ResultView: React.FC<Props> = ({ result, deliverable }) => {
  const [showTechDetails, setShowTechDetails] = useState(false);

  if (!result && !deliverable) {
    return (
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <FileText size={16} color="var(--text-muted)" />
            <span>Task Output & Deliverables</span>
          </div>
        </div>
        <div className="standby-row">
          <span className="idle-dot" />
          <span style={{ color: 'var(--text-secondary)' }}>No active tasks. Ready to process operational requests.</span>
        </div>
      </div>
    );
  }

  const finalAnswer = result?.final_answer || {};
  const rawContent = typeof finalAnswer === 'object'
    ? (finalAnswer.content || JSON.stringify(finalAnswer))
    : String(finalAnswer || '');

  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case 'docx': return <FileText size={18} color="var(--accent-blue)" />;
      case 'pptx': return <Presentation size={18} color="var(--accent-amber)" />;
      case 'xlsx': return <Table size={18} color="var(--accent-emerald)" />;
      default: return <FileText size={18} color="var(--accent-teal)" />;
    }
  };

  return (
    <div className="instrument-card blue-border">
      <div className="card-header-bar">
        <div className="card-title">
          <CheckCircle2 size={18} color="var(--accent-emerald)" />
          <span>TarkAI Response</span>
        </div>

        {deliverable && (
          <a href={deliverable.download_url}
            download
            className="btn-teal"
            style={{ textDecoration: 'none', padding: '6px 14px', fontSize: '12px' }}
          >
            <Download size={14} />
            <span>Download {deliverable.format.toUpperCase()} Deliverable</span>
          </a>
        )}
      </div>

      {deliverable && (
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--border-emerald)', borderRadius: '6px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {getFormatIcon(deliverable.format)}
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                {deliverable.filename}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Format: {deliverable.format.toUpperCase()} | Official Air-Gapped Confidential Output Document
              </div>
            </div>
          </div>
          <a href={deliverable.download_url} download style={{ color: 'var(--accent-emerald)', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Download Document</span>
            <ArrowRight size={14} />
          </a>
        </div>
      )}

      {/* Clean, direct answer - no fabricated executive sections */}
      <div className="clean-answer-card">
        <div className="clean-answer-text">
          {renderCleanAnswer(rawContent)}
        </div>
      </div>

      {/* Technical details, collapsed by default */}
      <div style={{ marginTop: '8px' }}>
        <button
          type="button"
          className="accordion-header"
          style={{ width: '100%' }}
          onClick={() => setShowTechDetails(!showTechDetails)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Layers size={14} color="var(--text-muted)" />
            <span>Technical Execution & Model Details</span>
          </div>
          {showTechDetails ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
        </button>

        {showTechDetails && (
          <div className="accordion-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model Used</div>
                <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>{result?.model_used || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Routing Reason</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{result?.routing_reason || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Status</div>
                <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '2px' }}>{result?.status || '—'}</div>
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Raw Technical Response Text:
            </div>
            <div className="terminal-log" style={{ whiteSpace: 'pre-wrap', maxHeight: '280px' }}>
              {rawContent}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
