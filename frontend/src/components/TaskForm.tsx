import React, { useState } from 'react';
import { Play, Square, Upload, FileText, Sparkles, Shield, BookOpen, FileSpreadsheet, Calculator, FileCheck2 } from 'lucide-react';
import { uploadFile, setDesiredFormat } from '../services/api';
import { useTaskContext } from '../context/TaskContext';

interface Props {
  onSubmit: (prompt: string, files: string[]) => void;
  isLoading: boolean;
}

export const TaskForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const { wantDeliverable, setWantDeliverable, cancelTask } = useTaskContext();
  const [prompt, setPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [format, setFormat] = useState("auto");

  const quickActions = [
    { label: "Draft Inspection SOP", prompt: "Draft a refinery boiler safety inspection SOP document in docx format based on SOP-302.", icon: BookOpen },
    { label: "Analyze Equipment Data", prompt: "Search knowledge base for SOP-409 turbine vibration analysis guidelines and summarize key action thresholds.", icon: Shield },
    { label: "Run Technical Calculation", prompt: "Execute python code using execute_code tool to compute math: calculate the difference between 485°C auto trip temp and 450°C max operating temp.", icon: Calculator },
    { label: "Generate Plant Audit", prompt: "Generate an industrial maintenance audit spreadsheet in xlsx format with equipment checks and frequency.", icon: FileSpreadsheet }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      setUploadedFiles((prev) => [...prev, res.filename]);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      cancelTask();
      return;
    }
    if (!prompt.trim()) return;
    onSubmit(prompt, uploadedFiles);
  };

  return (
    <div className="instrument-card blue-border">
      <div className="card-header-bar">
        <div className="card-title">
          <Sparkles size={16} color="var(--accent-blue)" />
          <span>What would you like Tark AI to do?</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Confidential Air-Gapped Processing
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <textarea
          className="cmd-input"
          style={{ height: '110px', resize: 'vertical' }}
          placeholder="Enter your task or request... (e.g., 'Draft a refinery boiler inspection SOP document', 'Search SOP-409 guidelines', 'Analyze scanned report image')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />

        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {quickActions.map((action, idx) => {
              const IconComp = action.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  className="btn-outline"
                  onClick={() => setPrompt(action.prompt)}
                  disabled={isLoading}
                >
                  <IconComp size={14} color="var(--accent-blue)" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: isLoading ? 'default' : 'pointer',
            padding: '10px 12px',
            borderRadius: '8px',
            background: wantDeliverable ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-input)',
            border: `1px solid ${wantDeliverable ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
            transition: 'all 0.15s ease',
          }}
        >
          <input
            type="checkbox"
            checked={wantDeliverable}
            onChange={(e) => setWantDeliverable(e.target.checked)}
            disabled={isLoading}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }}
          />
          <FileCheck2 size={16} color={wantDeliverable ? 'var(--accent-blue)' : 'var(--text-muted)'} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: wantDeliverable ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
            Generate Deliverable Document for this task
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {wantDeliverable ? 'Will create a reviewable file' : 'Answer only, no file'}
          </span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Output format</span>
          <select
            className="cmd-input"
            style={{ width: 'auto', padding: '6px 10px' }}
            value={format}
            disabled={isLoading}
            onChange={(e) => {
              const v = e.target.value;
              setFormat(v);
              setDesiredFormat(v);
              if (v !== 'auto') setWantDeliverable(true);
            }}
          >
            <option value="auto">Auto (detect from prompt)</option>
            <option value="docx">Word (.docx)</option>
            <option value="pptx">PowerPoint (.pptx)</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <label className="btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isLoading || isUploading} />
            <Upload size={14} color="var(--text-secondary)" />
            <span>{isUploading ? 'Uploading file...' : 'Attach Technical File / Log'}</span>
          </label>

          <button
            type="submit"
            className={isLoading ? 'btn-stop' : 'btn-blue'}
            disabled={!isLoading && !prompt.trim()}
          >
            {isLoading ? <Square size={14} /> : <Play size={14} />}
            <span>{isLoading ? 'Stop Task' : 'Run Task'}</span>
          </button>
        </div>

        {uploadedFiles.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {uploadedFiles.map((f, i) => (
              <span key={i} className="status-badge nominal font-mono" style={{ fontSize: '11px' }}>
                <FileText size={12} /> {f}
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};