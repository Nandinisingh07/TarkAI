import React from 'react';
import { Download, FileText, Presentation, Table, CheckCircle2 } from 'lucide-react';
import { DeliverableInfo } from '../types';

interface Props {
  result: any;
  deliverable?: DeliverableInfo;
}

export const ResultView: React.FC<Props> = ({ result, deliverable }) => {
  if (!result && !deliverable) {
    return (
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <FileText size={14} color="var(--text-secondary)" />
            <span>DELIVERABLE OUTPUT VIEWER</span>
          </div>
        </div>
        <div className="standby-row">
          <span className="idle-dot" />
          <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>No documents generated yet</span>
        </div>
      </div>
    );
  }

  const finalAnswer = result?.final_answer || {};
  const content = typeof finalAnswer === 'object' ? finalAnswer.content || JSON.stringify(finalAnswer) : String(finalAnswer || '');

  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case 'docx': return <FileText size={16} color="var(--accent-amber)" />;
      case 'pptx': return <Presentation size={16} color="var(--accent-amber)" />;
      case 'xlsx': return <Table size={16} color="var(--accent-teal)" />;
      default: return <FileText size={16} color="var(--accent-teal)" />;
    }
  };

  return (
    <div className="instrument-card amber-border">
      <div className="card-header-bar">
        <div className="card-title">
          <CheckCircle2 size={14} color="var(--accent-teal)" />
          <span>TASK EXECUTION COMPLETE — DELIVERABLE OUTPUT</span>
        </div>

        {deliverable && (
          <a
            href={deliverable.download_url}
            download
            className="btn-teal"
            style={{ textDecoration: 'none', padding: '4px 10px', fontSize: '11px' }}
          >
            <Download size={12} />
            <span>DOWNLOAD {deliverable.filename}</span>
          </a>
        )}
      </div>

      {deliverable && (
        <div style={{ background: 'rgba(61, 140, 125, 0.08)', border: '1px solid var(--border-teal)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {getFormatIcon(deliverable.format)}
            <div>
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                {deliverable.filename}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                FORMAT: {deliverable.format.toUpperCase()} | CONFIDENTIAL AIR-GAPPED OUTPUT
              </div>
            </div>
          </div>
          <a href={deliverable.download_url} download className="font-mono" style={{ color: 'var(--accent-amber)', fontSize: '11px', textDecoration: 'none' }}>
            DOWNLOAD FILE &rarr;
          </a>
        </div>
      )}

      {content && (
        <div className="terminal-log" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: '360px' }}>
          {typeof content === 'object' ? JSON.stringify(content, null, 2) : content}
        </div>
      )}
    </div>
  );
};
