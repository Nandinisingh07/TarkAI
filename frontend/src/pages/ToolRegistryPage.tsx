import React, { useEffect, useState } from 'react';
import {
  Eye,
  Code2,
  Folder,
  Terminal,
  HardDrive,
  FileText,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import '../styles/workspace-reference.css';

type ToolStatus = {
  name: string;
  status: 'READY' | 'ERROR';
  module: string;
  functions?: string[];
  details?: string;
};

type ToolsResponse = {
  status: string;
  count: number;
  ready: number;
  tools: ToolStatus[];
};

const toolMeta: Record<string, {
  icon: React.ElementType;
  title: string;
  description: string;
  constraint: string;
}> = {
  file_io: {
    icon: Folder,
    title: 'File I/O',
    description: 'Read and write files in approved workspace locations.',
    constraint: 'Limited to explicitly permitted directories and file types.',
  },
  code_sandbox: {
    icon: Terminal,
    title: 'Code Sandbox',
    description: 'Run isolated code for bounded analysis tasks.',
    constraint: 'No network access; execution limits are policy-defined.',
  },
  doc_search: {
    icon: HardDrive,
    title: 'Document Search / RAG',
    description: 'Retrieve passages from the connected internal knowledge collection.',
    constraint: 'Uses the indexed local corpus and Qwen3-Embedding retrieval stack.',
  },
  ocr_tool: {
    icon: FileText,
    title: 'OCR',
    description: 'Extract text from supported scanned documents.',
    constraint: 'Output quality depends on scan clarity and language support.',
  },
  vision_tool: {
    icon: Eye,
    title: 'Vision',
    description: 'Interpret supported images using the configured local vision model.',
    constraint: 'Requires the configured local vision-capable model.',
  },
  output_generator: {
    icon: FileCheck,
    title: 'Output Generator',
    description: 'Generate DOCX, PPTX and XLSX deliverables in the local output workspace.',
    constraint: 'Files are generated and stored inside the configured local outputs directory.',
  },
};

export const ToolRegistryPage: React.FC = () => {
  const [data, setData] = useState<ToolsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTools = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/tools/status');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();

    const timer = window.setInterval(loadTools, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const backendOnline = data?.status === 'online';

  return (
    <main className="workspace-reference-page">
      <div className="workspace-shell">

        <div className="workspace-eyebrow">
          Workspace / Capabilities
        </div>

        <header className="workspace-header">
          <div>
            <h1>Tool Registry</h1>
            <p>Approved local tools and their operating constraints.</p>
          </div>

          <div className="workspace-environment">
            <span className={`workspace-environment-dot ${error ? 'error' : ''}`} />
            {backendOnline ? 'Local environment' : loading ? 'Checking local environment' : 'Backend unavailable'}
          </div>
        </header>

        <div className="workspace-toolbar">
          <div className="workspace-count">
            {data ? `${data.ready} of ${data.count} tools ready` : 'Checking tool registry'}
          </div>

          <button className="workspace-refresh" onClick={loadTools} disabled={loading}>
            <RefreshCw size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="workspace-error">
            Backend connection error: {error}
          </div>
        )}

        <section className="workspace-list">
          {Object.entries(toolMeta).map(([name, meta], index) => {
            const tool = data?.tools.find((item) => item.name === name);
            const Icon = meta.icon;
            const ready = tool?.status === 'READY';

            return (
              <article className="workspace-tool-card" key={name}>
                <div className="workspace-icon">
                  <Icon size={21} />
                </div>

                <div className="workspace-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="workspace-tool-main">
                  <h2 className="workspace-tool-title">{meta.title}</h2>

                  <p className="workspace-tool-desc">
                    {meta.description}
                  </p>

                  <div className="workspace-constraint">
                    <strong>CONSTRAINT</strong>
                    <span>{meta.constraint}</span>
                  </div>

                  {tool && (
                    <div className="workspace-meta">
                      {tool.module}
                      {tool.functions?.length
                        ? ` · ${tool.functions.join(', ')}`
                        : ''}
                    </div>
                  )}
                </div>

                <div className={`workspace-status ${ready ? 'ready' : tool ? 'error' : ''}`}>
                  {tool ? (
                    ready ? (
                      <>
                        <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                        READY
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                        ERROR
                      </>
                    )
                  ) : loading ? 'CHECKING' : 'UNAVAILABLE'}
                </div>
              </article>
            );
          })}
        </section>

        <section className="workspace-panel" style={{ marginTop: 18 }}>
          <div className="workspace-panel-title">
            Live backend registry
          </div>
          <div className="workspace-panel-subtitle">
            Status is read from <code>GET /api/tools/status</code>. Tool definitions and readiness are not hardcoded.
          </div>
        </section>

      </div>
    </main>
  );
};
