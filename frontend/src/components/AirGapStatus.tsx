import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Activity, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { fetchAirGapStatus } from '../services/api';
import { AirGapStatusData } from '../types';

export const AirGapStatus: React.FC = () => {
  const [data, setData] = useState<AirGapStatusData | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const res = await fetchAirGapStatus();
        if (isMounted) {
          setData(res);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError('Network audit daemon offline');
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isSecure = data?.external_calls_detected === 0;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className={`badge ${isSecure ? 'badge-secure' : 'badge-warning'}`}>
          <div className="pulse-dot" />
          {isSecure ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
          <span>
            {isSecure ? 'AIR-GAPPED: SECURE (0 EGRESS)' : `WARNING: ${data?.external_calls_detected} CALLS`}
          </span>
        </div>

        <button
          onClick={() => setShowLogs(!showLogs)}
          className="btn-preset"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            background: showLogs ? 'rgba(0, 242, 254, 0.15)' : undefined,
            borderColor: showLogs ? 'var(--accent-cyan)' : undefined
          }}
        >
          <Activity size={14} color="var(--accent-cyan)" />
          <span>Audit Log ({data?.log?.length || 0})</span>
          {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {showLogs && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.75rem)',
            right: 0,
            width: '560px',
            maxWidth: '92vw',
            zIndex: 99999,
            backgroundColor: '#0c1527',
            border: '2px solid var(--accent-cyan)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-overlay)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Lock size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                psutil Network Connection Audit Daemon
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Polls every 3s
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#060b18', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                OUTBOUND EGRESS CALLS
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isSecure ? 'var(--accent-emerald)' : 'var(--accent-red)', marginTop: '0.1rem' }}>
                {data?.external_calls_detected ?? 0}
              </div>
            </div>

            <div style={{ background: '#060b18', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                INFERENCE HOST
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                127.0.0.1 (LOCAL OLLAMA)
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#030712',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.85rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.76rem',
              maxHeight: '260px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6'
            }}
          >
            {error && <div style={{ color: 'var(--accent-red)', fontWeight: 600 }}>❌ {error}</div>}
            {!data?.log?.length && !error && <div style={{ color: 'var(--text-secondary)' }}>Listening for active socket connections...</div>}
            
            {data?.log?.map((entry, idx) => {
              const isWarning = entry.includes('WARNING') || entry.includes('EXTERNAL');
              const isOk = entry.includes('OK') || entry.includes('LOCAL');

              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: '0.35rem',
                    paddingBottom: '0.35rem',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: isWarning ? 'var(--accent-red)' : isOk ? 'var(--accent-emerald)' : 'var(--text-primary)',
                    fontWeight: isWarning ? 700 : 500
                  }}
                >
                  {isWarning ? '⚠️ ' : isOk ? '🛡️ ' : 'ℹ️ '}
                  {entry}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
