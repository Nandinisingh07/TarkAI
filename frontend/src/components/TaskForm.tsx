import React, { useState } from 'react';
import { Play, Upload, FileText, Terminal, Shield, BookOpen, FileSpreadsheet } from 'lucide-react';
import { uploadFile } from '../services/api';

interface Props {
  onSubmit: (prompt: string, files: string[]) => void;
  isLoading: boolean;
}

export const TaskForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const presets = [
    { label: "Draft Boiler Inspection SOP (.docx)", prompt: "Draft a refinery boiler safety inspection SOP document in docx format based on SOP-302.", icon: BookOpen },
    { label: "Audit Turbine Vibration Data", prompt: "Search knowledge base for SOP-409 turbine vibration analysis guidelines and summarize key action thresholds.", icon: Shield },
    { label: "Execute Matrix Math Script", prompt: "Write a python script to calculate matrix multiplication and test it using code execution.", icon: Terminal },
    { label: "Generate Plant Audit (.xlsx)", prompt: "Generate an industrial maintenance audit spreadsheet in xlsx format with equipment checks and frequency.", icon: FileSpreadsheet }
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
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt, uploadedFiles);
  };

  return (
    <div className="instrument-card amber-border">
      <div className="card-header-bar">
        <div className="card-title">
          <Terminal size={14} color="var(--accent-amber)" />
          <span>COMMAND INPUT CONSOLE</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          MAX 8 REACT STEPS
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          className="cmd-input"
          style={{ height: '100px', resize: 'vertical' }}
          placeholder="ENTER REFINERY OPERATIONAL INSTRUCTION (e.g. 'Draft boiler inspection SOP in docx format', 'Search SOP-409 knowledge base')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />

        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            OPERATIONAL PRESETS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {presets.map((preset, idx) => {
              const IconComp = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  className="btn-outline"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => setPrompt(preset.prompt)}
                  disabled={isLoading}
                >
                  <IconComp size={12} color="var(--accent-amber)" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <label className="btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isLoading || isUploading} />
            <Upload size={13} color="var(--text-secondary)" />
            <span style={{ fontSize: '11px' }}>{isUploading ? 'UPLOADING...' : 'ATTACH TECHNICAL FILE / LOG'}</span>
          </label>

          <button type="submit" className="btn-amber" disabled={!prompt.trim() || isLoading}>
            <Play size={13} />
            <span>{isLoading ? 'PROCESSING...' : 'EXECUTE'}</span>
          </button>
        </div>

        {uploadedFiles.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {uploadedFiles.map((f, i) => (
              <span key={i} className="status-badge nominal font-mono" style={{ fontSize: '10px' }}>
                <FileText size={10} /> {f}
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
