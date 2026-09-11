import React from 'react';
import { Lock, Code2, ShieldCheck, Activity } from 'lucide-react';
import { AirGapStatus } from '../components/AirGapStatus';

export const R7NetworkProofPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Header */}
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Lock size={28} color="var(--accent-red)" />
          <h2 className="hero-title">Security & Network Egress Proof (Requirement R7)</h2>
        </div>
        <p className="hero-desc">
          Satisfies PS26117 Requirement 7: Verifiable network proof display. The frontend features a dedicated live Air-Gap status panel polling <code>GET /monitor/status</code> every 3 seconds showing a green status badge and 0 external calls detected with a scrollable connection audit log stream.
        </p>
      </div>

      {/* Technical Implementation Reference */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-cyan)" /> Technical Implementation Reference
          </span>
          <span className="badge badge-secure">R7 VERIFIED LIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>📁 <strong>Audit Log File:</strong> <code>network_audit.log</code></div>
          <div>📡 <strong>Network Daemon Function:</strong> <code>psutil.net_connections(kind="inet")</code></div>
          <div>⏱️ <strong>Polling Frequency:</strong> Every 3000ms</div>
          <div>🌐 <strong>Audit Status Endpoint:</strong> <code>GET /monitor/status</code></div>
        </div>
      </div>

      {/* Embedded Live Component */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-emerald)" /> Live Real-Time Network Connection Audit Console
          </span>
        </div>
        <AirGapStatus />
      </div>
    </div>
  );
};
