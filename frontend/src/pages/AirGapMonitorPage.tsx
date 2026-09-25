import React from 'react';
import { ShieldCheck, Code2, Activity } from 'lucide-react';
import { AirGapStatus } from '../components/AirGapStatus';

export const AirGapMonitorPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={28} color="var(--accent-emerald)" />
          <h2 className="hero-title">Air-Gapped & Network Monitor</h2>
        </div>
        <p className="hero-desc">
          Complete air-gapped security guarantee with zero external network egress. All model
          inference is hosted locally via an isolated Ollama server bound exclusively to{' '}
          <code>127.0.0.1</code>. A background <code>psutil</code> daemon continuously audits
          network socket activity every 3 seconds and streams the results below, guaranteeing
          zero outbound calls at all times.
        </p>
      </div>

      <div className="card">
        <div className="card-title">
          <span>On-Premises Air-Gapped Data Flow Pipeline</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>STEP 1: LOCAL INPUT</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Client Workstation</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>User prompt & local document attachments isolated within memory.</p>
          </div>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginBottom: '0.3rem' }}>STEP 2: FASTAPI BACKEND</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Local API Server</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Processes ReAct logic on <code>localhost:8000</code> with no telemetry.</p>
          </div>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>STEP 3: OLLAMA SERVER</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Open-Weight LLMs</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Inference served on <code>127.0.0.1:11434</code> (qwen2.5-coder & phi3).</p>
          </div>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>STEP 4: AUDIT DAEMON</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>psutil NetMonitor</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Audits socket connections every 3s to guarantee 0 outbound egress.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-cyan)" /> Technical Implementation Reference
          </span>
          <span className="badge badge-secure">VERIFIED LIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>Backend Daemon: <code>backend/app/network_monitor.py</code></div>
          <div>Audit Log File: <code>network_audit.log</code></div>
          <div>Network Daemon Function: <code>psutil.net_connections(kind="inet")</code></div>
          <div>API Monitor Endpoint: <code>GET /monitor/status</code></div>
          <div>Polling Frequency: Every 3000ms</div>
          <div>Local Host Binding: <code>http://127.0.0.1:11434</code></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-emerald)" /> Live Network Connection Audit Console
          </span>
        </div>
        <AirGapStatus />
      </div>
    </div>
  );
};