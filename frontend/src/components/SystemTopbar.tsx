import React, { useState, useEffect } from 'react';
import { Lock, Activity, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchAirGapStatus, setUserRole, getUserRole } from '../services/api';
import { AirGapStatusData } from '../types';

export const SystemTopbar: React.FC = () => {
  const [data, setData] = useState<AirGapStatusData | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [clockStr, setClockStr] = useState<string>('');
  const [currentRole, setCurrentRoleState] = useState<'admin' | 'engineer' | 'viewer'>('admin');

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'admin' | 'engineer' | 'viewer';
    setCurrentRoleState(newRole);
    setUserRole(newRole);
  };

  // Clock timer
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Air gap polling
  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const res = await fetchAirGapStatus();
        if (isMounted) setData(res);
      } catch (err) {
        // silent fallback
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isSecure = data?.external_calls_detected === 0 || data === null;

  return (
    <header className="system-topbar">
      <div className="topbar-left">
        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px', letterSpacing: '-0.01em' }}>
          Tark AI
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          National Confidential AI Operations Platform
        </span>
        <span style={{ color: 'var(--border-medium)' }}>|</span>
        <span className={`status-badge ${isSecure ? 'nominal' : 'fault'}`}>
          <Lock size={12} />
          {isSecure ? 'AIR-GAP: SECURE' : `WARNING: ${data?.external_calls_detected} EGRESS DETECTED`}
        </span>
      </div>

      <div className="topbar-right" style={{ gap: '10px' }}>
        {/* Feature 5: RBAC Interactive Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>ROLE:</span>
          <select
            value={currentRole}
            onChange={handleRoleChange}
            style={{
              background: '#060d1f',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            <option value="admin">ADMIN (FULL ACCESS)</option>
            <option value="engineer">ENGINEER (CREATE/SUBMIT)</option>
            <option value="viewer">VIEWER (READ-ONLY)</option>
          </select>
        </div>

        <button
          onClick={() => setShowLogs(!showLogs)}
          className="btn-outline"
          style={{ fontSize: '10px', padding: '2px 8px', fontFamily: 'var(--font-mono)' }}
        >
          <Activity size={12} color="var(--accent-amber)" />
          <span>AUDIT LOG ({data?.log?.length || 0})</span>
          {showLogs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-teal)' }}>
          {clockStr || '2026-09-10 12:30:00 UTC'}
        </span>
      </div>


      {showLogs && (
        <div
          style={{
            position: 'absolute',
            top: '36px',
            right: '16px',
            width: '560px',
            maxWidth: '92vw',
            zIndex: 99999,
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-amber)',
            borderRadius: '2px',
            padding: '16px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={14} color="var(--accent-amber)" />
              <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                PSUTIL NETWORK EGRESS AUDIT DAEMON
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              POLLING localhost:8000/monitor/status
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div className="telemetry-tile">
              <span className="telemetry-label">OUTBOUND CALLS</span>
              <span className={`telemetry-val ${isSecure ? 'teal' : 'fault'}`}>
                {data?.external_calls_detected ?? 0}
              </span>
            </div>
            <div className="telemetry-tile">
              <span className="telemetry-label">LOCAL INFERENCE HOST</span>
              <span className="telemetry-val" style={{ fontSize: '12px', color: 'var(--accent-amber)' }}>
                127.0.0.1:11434 (OLLAMA)
              </span>
            </div>
          </div>

          <div className="terminal-log">
            {!data?.log?.length && <div style={{ color: 'var(--text-secondary)' }}>Awaiting audit events...</div>}
            {data?.log?.map((entry: string, idx: number) => {
              const isErr = entry.includes('WARNING') || entry.includes('EXTERNAL');
              return (
                <div key={idx} className="log-row">
                  <span className={`log-msg ${isErr ? 'red' : 'teal'}`}>{entry}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
