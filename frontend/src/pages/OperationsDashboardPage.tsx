import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Activity, Cpu, Lock, Terminal } from 'lucide-react';
import { fetchModelRegistry, fetchConfidenceStats, fetchAuditLogs } from '../services/api';
import { ModelRegistrySummary, ConfidenceStats, AuditLogEntry } from '../types';

export const OperationsDashboardPage: React.FC = () => {
  const [registry, setRegistry] = useState<ModelRegistrySummary | null>(null);
  const [confStats, setConfStats] = useState<ConfidenceStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadData = async () => {
    try {
      setLoading(true);
      const [reg, conf, audit] = await Promise.all([
        fetchModelRegistry(),
        fetchConfidenceStats(),
        fetchAuditLogs(30)
      ]);
      setRegistry(reg);
      setConfStats(conf);
      setAuditLogs(audit);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header Strip */}
      <div className="page-header-strip">
        <div>
          <h1 className="page-title">
            <Cpu size={22} color="var(--accent-blue)" />
            Model Operations & Security
          </h1>
          <p className="page-subtitle">
            Local model registry management, confidence analytics, and append-only security audit trail.
          </p>
        </div>

        <div className="status-badge nominal" style={{ padding: '6px 14px' }}>
          <ShieldCheck size={14} />
          <span>Active Profile: {registry?.profile_name || 'CPU Demo'}</span>
        </div>
      </div>

      {/* Local Model Registry Card */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <Cpu size={16} color="var(--accent-blue)" />
            <span>Local Model Configuration Registry</span>
          </div>
          <span className="status-badge nominal font-mono" style={{ fontSize: '11px' }}>
            CONFIG-DRIVEN REGISTRY
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GENERAL REASONING MODEL</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {registry?.general_model || 'phi3:mini'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CODING MODEL</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {registry?.coding_model || 'qwen2.5-coder:1.5b'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MULTIMODAL VISION MODEL</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {registry?.vision_model || 'moondream:latest'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OCR ENGINE</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {registry?.ocr_engine || 'PyTesseract'}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence & Logging Stats */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <Activity size={16} color="var(--accent-teal)" />
            <span>Confidence & Quality Telemetry</span>
          </div>
          <span className="status-badge nominal font-mono" style={{ fontSize: '11px' }}>
            SQLITE PERSISTED
          </span>
        </div>

        <div className="telemetry-grid">
          <div className="telemetry-tile">
            <span className="telemetry-label">TOTAL OCR / VISION CALLS</span>
            <span className="telemetry-val blue">{confStats?.total_calls ?? 0}</span>
          </div>

          <div className="telemetry-tile">
            <span className="telemetry-label">AVERAGE CONFIDENCE SCORE</span>
            <span className="telemetry-val teal">{confStats?.average_confidence ?? 0.92}</span>
          </div>

          <div className="telemetry-tile">
            <span className="telemetry-label">LOW CONFIDENCE %</span>
            <span className="telemetry-val" style={{ color: (confStats?.low_confidence_pct || 0) > 15 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
              {confStats?.low_confidence_pct ?? 0}%
            </span>
          </div>

          <div className="telemetry-tile">
            <span className="telemetry-label">FLAGGED FOR REVIEW</span>
            <span className="telemetry-val" style={{ color: 'var(--accent-amber)' }}>{confStats?.flagged_count ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <Lock size={16} color="var(--accent-blue)" />
            <span>Security Audit Log Trail</span>
          </div>
          <span className="status-badge nominal font-mono" style={{ fontSize: '11px' }}>
            APPEND-ONLY AUDIT DB
          </span>
        </div>

        <div className="terminal-log" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {auditLogs.length === 0 && (
            <div className="standby-row">
              <span className="idle-dot" />
              <span>Awaiting security audit events...</span>
            </div>
          )}
          {auditLogs.map((log) => {
            const isDenied = log.status === 'DENIED' || log.status === 'BLOCKED';
            return (
              <div key={log.id} className="log-row" style={{ fontSize: '12px', display: 'flex', gap: '8px', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>[{log.timestamp.substring(0, 19).replace('T', ' ')}]</span>
                <span className={`status-badge ${isDenied ? 'fault' : 'nominal'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                  {log.user_role.toUpperCase()}
                </span>
                <span style={{ fontWeight: 600, color: isDenied ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                  {log.action}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{log.resource}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
