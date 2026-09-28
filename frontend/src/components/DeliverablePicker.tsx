import React, { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, Layers, FileType, Download, FileCheck2 } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { createDeliverable } from '../services/api';

interface CreatedFile {
  filename: string;
  download_url: string;
  needs_review?: boolean;
}

const OPTIONS = [
  { fmt: 'docx', label: 'Word Document', hint: '.docx', Icon: FileText },
  { fmt: 'pdf', label: 'PDF', hint: '.pdf', Icon: FileType },
  { fmt: 'xlsx', label: 'Spreadsheet', hint: '.xlsx', Icon: FileSpreadsheet },
  { fmt: 'pptx', label: 'PowerPoint', hint: '.pptx', Icon: Layers },
];

const linkStyle: React.CSSProperties = {
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: 'var(--accent-blue)',
};

const DownloadLink = (file: CreatedFile) =>
  React.createElement(
    'a',
    { href: file.download_url, download: file.filename, style: linkStyle },
    <Download size={12} />,
    ' ' + file.filename
  );

export const DeliverablePicker: React.FC = () => {
  const { resultData, taskStatus } = useTaskContext() as any;
  const liveId: string | undefined = resultData?.task_id ?? resultData?.result?.task_id;
  const liveDone = taskStatus === 'completed' && !!liveId;

  useEffect(() => {
    if (liveDone && liveId) {
      try { localStorage.setItem('tarkai_last_task_id', liveId); } catch { /* ignore */ }
    }
  }, [liveDone, liveId]);

  let storedId: string | undefined;
  try { storedId = localStorage.getItem('tarkai_last_task_id') || undefined; } catch { /* ignore */ }

  const taskId: string | undefined = liveDone ? liveId : storedId;
  const isDone = !!taskId;

  const [busy, setBusy] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, CreatedFile>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    setFiles({});
    setError('');
  }, [taskId]);

  const generate = async (fmt: string) => {
    if (!taskId) return;
    setBusy(fmt);
    setError('');
    try {
      const res = await createDeliverable(taskId, fmt);
      setFiles((prev) => ({ ...prev, [fmt]: res }));
    } catch (e: any) {
      setError(e.message || 'Could not create the file');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 32px', position: 'relative', zIndex: 60 }}>
      <div className="instrument-card blue-border">
        <div className="card-header-bar">
          <div className="card-title">
            <FileCheck2 size={16} color="var(--accent-blue)" />
            <span>Choose deliverable format</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {isDone ? 'For your latest completed task' : 'No completed task yet'}
          </span>
        </div>

        {!isDone && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Run a task from the AI Assistant page first. When it finishes, come back here to pick Word, PDF, Excel or PowerPoint.
          </div>
        )}

        {isDone && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {OPTIONS.map(({ fmt, label, hint, Icon }) => {
              const created = files[fmt];
              return (
                <div key={fmt} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={busy !== null}
                    onClick={() => generate(fmt)}
                  >
                    <Icon size={14} color="var(--accent-blue)" />
                    <span>{busy === fmt ? 'Creating...' : label + ' (' + hint + ')'}</span>
                  </button>
                  {created && DownloadLink(created)}
                  {created?.needs_review && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sent to Approvals for review</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626' }}>{error}</div>}
      </div>
    </div>
  );
};