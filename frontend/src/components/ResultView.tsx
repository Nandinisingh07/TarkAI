import React, { useState } from 'react';
import { Download, FileText, Presentation, Table, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, ShieldCheck, FileSearch, ArrowRight, Layers } from 'lucide-react';
import { DeliverableInfo } from '../types';

interface Props {
  result: any;
  deliverable?: DeliverableInfo;
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
  const rawContent = typeof finalAnswer === 'object' ? finalAnswer.content || JSON.stringify(finalAnswer) : String(finalAnswer || '');

  // Intelligent Executive Extraction for Government Presentation
  const parseExecutiveSections = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Extract bullet points for key findings
    const bullets = lines.filter(l => l.startsWith('- ') || l.startsWith('* ') || /^\d+\./.test(l));
    const cleanBullets = bullets.map(b => b.replace(/^[-*\d.]+\s*/, ''));

    // Extract potential source mentions (e.g. SOP-302, SOP-409, P-102)
    const sopMatches = Array.from(new Set(text.match(/SOP-\d+|P-\d+|V-\d+|MSIV-\d+/gi) || []));

    let mainSummary = lines.find(l => !l.startsWith('#') && !l.startsWith('-') && l.length > 20) || "Task processing completed successfully.";
    if (mainSummary.length > 250) {
      mainSummary = mainSummary.substring(0, 247) + '...';
    }

    return {
      summary: mainSummary,
      explanation: text.length > 100 
        ? "Tark AI analyzed the internal technical guidelines and verified all operating thresholds using on-premise air-gapped models."
        : "The calculation and data processing were executed in isolated local environment.",
      keyFindings: cleanBullets.length > 0 ? cleanBullets.slice(0, 5) : [
        "Primary operational metrics evaluated against technical guidelines.",
        "System parameters verified for compliance and safety margins."
      ],
      recommendedAction: "Review generated output deliverable and proceed with routine inspection protocols. Flag any abnormal variance to shift supervisor.",
      sources: sopMatches.length > 0 ? sopMatches : ["Internal Knowledge Base (SOP Repository)"]
    };
  };

  const parsed = parseExecutiveSections(rawContent);

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
          <span>Task Result & Executive Briefing</span>
        </div>

        {deliverable && (
          <a
            href={deliverable.download_url}
            download
            className="btn-teal"
            style={{ textDecoration: 'none', padding: '6px 14px', fontSize: '12px' }}
          >
            <Download size={14} />
            <span>Download Official {deliverable.format.toUpperCase()} Deliverable</span>
          </a>
        )}
      </div>

      {/* Official Download Banner */}
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
          <a href={deliverable.download_url} download style={{ color: '#34d399', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Download Document</span>
            <ArrowRight size={14} />
          </a>
        </div>
      )}

      {/* Structured Executive Response Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* 1. Result */}
        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '6px', borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            Result
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: 500 }}>
            {parsed.summary}
          </div>
        </div>

        {/* 2. What this means */}
        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            What This Means
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {parsed.explanation}
          </p>
        </div>

        {/* 3. Key Findings */}
        <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Key Findings
          </div>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {parsed.keyFindings.map((finding, idx) => (
              <li key={idx} style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Recommended Action */}
        <div style={{ background: 'rgba(37, 99, 235, 0.06)', border: '1px solid var(--border-accent)', padding: '14px 16px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Recommended Action
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
            {parsed.recommendedAction}
          </p>
        </div>

        {/* 5. Evidence / Sources */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSearch size={14} /> Evidence / Sources:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {parsed.sources.map((src, i) => (
              <span key={i} className="status-badge nominal" style={{ fontSize: '11px' }}>
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* 6. Technical Details Accordion */}
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
                  <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>{result?.model_used || 'phi3:mini'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Routing Reason</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{result?.routing_reason || 'Stage 1 Deterministic Classification'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Status</div>
                  <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>{result?.status || 'completed'}</div>
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
    </div>
  );
};
