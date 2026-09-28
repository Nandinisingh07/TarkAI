import React from 'react';
import {
  FileCheck,
  FileText,
  Presentation,
  Table,
  CheckCircle2,
  FolderOpen,
  Download,
  ArrowRight,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { ResultView } from '../components/ResultView';
import '../styles/workspace-reference.css';

export const DeliverablesPage: React.FC = () => {
  const { resultData, deliverable } = useTaskContext();
  const hasOutput = Boolean(resultData || deliverable);

  const formats = [
    {
      no: '01',
      code: 'DOCX',
      title: 'Word Report',
      icon: FileText,
      description: 'Structured reports generated from the local AI workflow.',
      engine: 'python-docx',
    },
    {
      no: '02',
      code: 'PPTX',
      title: 'Presentation',
      icon: Presentation,
      description: 'Presentation-ready slides from structured agent output.',
      engine: 'python-pptx',
    },
    {
      no: '03',
      code: 'XLSX',
      title: 'Spreadsheet',
      icon: Table,
      description: 'Structured workbooks with formatted data and columns.',
      engine: 'openpyxl',
    },
  ];

  return (
    <main className="workspace-reference-page">
      <div className="workspace-shell">

        <div className="workspace-eyebrow">
          Workspace / Deliverables
        </div>

        <header className="workspace-header">
          <div>
            <h1>Deliverables</h1>
            <p>Generated files and local output workspace for completed AI tasks.</p>
          </div>

          <div className="workspace-environment">
            <span className="workspace-environment-dot" />
            Local output workspace
          </div>
        </header>

        <section className="workspace-format-grid">
          {formats.map((format) => {
            const Icon = format.icon;

            return (
              <article className="workspace-format-card" key={format.code}>
                <div className="workspace-format-top">
                  <Icon size={22} color="#0b4d80" />
                  <span className="workspace-format-code">
                    {format.no} · {format.code}
                  </span>
                </div>

                <h3>{format.title}</h3>

                <p>{format.description}</p>

                <div className="workspace-format-footer">
                  <span>{format.engine}</span>
                  <CheckCircle2 size={15} color="#14763d" />
                </div>
              </article>
            );
          })}
        </section>

        <section className="workspace-panel" style={{ marginTop: 18 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 18,
          }}>
            <div>
              <div className="workspace-panel-title">
                <FolderOpen size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                Live Deliverable Workspace
              </div>

              <div className="workspace-panel-subtitle">
                Generated outputs are shown here when an AI task produces a result.
              </div>
            </div>

            {hasOutput && (
              <span className="workspace-live">
                <span className="workspace-live-dot" />
                READY
              </span>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            {resultData ? (
              <ResultView
                result={resultData}
                deliverable={deliverable}
              />
            ) : (
              <div className="workspace-empty">
                <Download size={24} style={{ marginBottom: 10 }} />
                <div style={{ fontWeight: 700, color: '#2d5272', marginBottom: 6 }}>
                  No deliverable yet
                </div>
                <div>
                  Submit a task from the AI Assistant and the generated result will appear here.
                </div>

                <div style={{ marginTop: 14, color: '#6d879f', fontSize: 12 }}>
                  Example: Draft Boiler Safety SOP docx
                  <ArrowRight size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="workspace-panel">
          <div className="workspace-panel-title">Local output implementation</div>

          <div className="workspace-technical" style={{ marginTop: 16 }}>
            <div className="workspace-tech-item">
              <span>GENERATOR</span>
              <code>backend/app/output_generator.py</code>
            </div>

            <div className="workspace-tech-item">
              <span>OUTPUT LOCATION</span>
              <code>outputs/</code>
            </div>

            <div className="workspace-tech-item">
              <span>DOWNLOAD ROUTE</span>
              <code>GET /outputs/filename</code>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};
