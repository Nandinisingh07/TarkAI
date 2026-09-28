import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Activity,
  LockKeyhole,
  Server,
  MonitorCheck,
  Network,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { AirGapStatus } from '../components/AirGapStatus';
import '../styles/workspace-reference.css';

export const AirGapMonitorPage: React.FC = () => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const checkBackend = async () => {
      try {
        const response = await fetch('/monitor/status', {
          cache: 'no-store',
        });

        if (active) {
          setBackendOnline(response.ok);
        }
      } catch {
        if (active) {
          setBackendOnline(false);
        }
      }
    };

    void checkBackend();

    const interval = window.setInterval(checkBackend, 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="workspace-reference-page">
      <div className="workspace-shell">

        {/* Header */}
        <div className="workspace-eyebrow">
          Operations / Security
        </div>

        <header className="workspace-header">
          <div>
            <h1>Air-Gap Monitor</h1>
            <p>
              Monitor the local network boundary, model services and
              connection activity.
            </p>
          </div>

          <div className="workspace-environment">
            <span
              className={`workspace-environment-dot ${
                backendOnline === false ? 'error' : ''
              }`}
            />

            {backendOnline === true
              ? 'Local environment'
              : backendOnline === false
                ? 'Monitor unavailable'
                : 'Checking local environment'}
          </div>
        </header>

        {/* Live security status */}
        <section className="workspace-status-grid">

          <article className="workspace-status-card">
            <LockKeyhole size={21} color="#0b4d80" />
            <h3>Network Mode</h3>
            <p>
              Air-gapped local processing boundary.
            </p>
          </article>

          <article className="workspace-status-card">
            <Server size={21} color="#0b4d80" />
            <h3>Inference</h3>
            <p>
              Local model inference through the configured Ollama service.
            </p>
          </article>

          <article className="workspace-status-card">
            <Activity size={21} color="#0b4d80" />
            <h3>Monitoring</h3>
            <p>
              Network monitor state is refreshed every 3 seconds.
            </p>
          </article>

        </section>

        {/* Architecture */}
        <h2 className="workspace-section-title">
          Security architecture
        </h2>

        <section className="workspace-flow-grid">

          <article className="workspace-flow-card">
            <div className="workspace-flow-top">
              <MonitorCheck size={21} color="#0b4d80" />
              <span className="workspace-format-code">01</span>
            </div>

            <h3>Client Workstation</h3>

            <p>
              Prompts and local document attachments enter the processing
              environment directly.
            </p>
          </article>

          <article className="workspace-flow-card">
            <div className="workspace-flow-top">
              <Server size={21} color="#0b4d80" />
              <span className="workspace-format-code">02</span>
            </div>

            <h3>FastAPI Server</h3>

            <p>
              Local orchestration and task processing run through the
              on-premise backend.
            </p>
          </article>

          <article className="workspace-flow-card">
            <div className="workspace-flow-top">
              <Radio size={21} color="#0b4d80" />
              <span className="workspace-format-code">03</span>
            </div>

            <h3>Ollama Server</h3>

            <p>
              Local model inference is served through the configured
              localhost endpoint.
            </p>
          </article>

          <article className="workspace-flow-card">
            <div className="workspace-flow-top">
              <Network size={21} color="#0b4d80" />
              <span className="workspace-format-code">04</span>
            </div>

            <h3>Network Monitor</h3>

            <p>
              Socket activity is inspected by the local monitoring service.
            </p>
          </article>

        </section>

        {/* Actual live monitor */}
        <h2 className="workspace-section-title">
          Live connection audit
        </h2>

        <section className="workspace-panel">

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '18px',
            }}
          >
            <div>
              <div className="workspace-panel-title">
                <Activity
                  size={17}
                  style={{
                    verticalAlign: 'middle',
                    marginRight: 7,
                  }}
                />
                Live Network Connection Audit
              </div>

              <div className="workspace-panel-subtitle">
                Real-time connection state from the local monitoring service.
              </div>
            </div>

            <span className="workspace-live">
              <span className="workspace-live-dot" />
              LIVE
            </span>
          </div>

          <div style={{ marginTop: '20px' }}>
            <AirGapStatus />
          </div>

        </section>

        {/* Technical details */}
        <section className="workspace-panel">

          <div className="workspace-panel-title">
            Security controls
          </div>

          <div
            className="workspace-technical"
            style={{ marginTop: '16px' }}
          >

            <div className="workspace-tech-item">
              <span>MONITOR</span>
              <code>backend/app/network_monitor.py</code>
            </div>

            <div className="workspace-tech-item">
              <span>SOCKET AUDIT</span>
              <code>
                psutil.net_connections(kind="inet")
              </code>
            </div>

            <div className="workspace-tech-item">
              <span>API ENDPOINT</span>
              <code>GET /monitor/status</code>
            </div>

            <div className="workspace-tech-item">
              <span>POLLING</span>
              <code>3000ms</code>
            </div>

            <div className="workspace-tech-item">
              <span>LOCAL MODEL</span>
              <code>127.0.0.1:11434</code>
            </div>

            <div className="workspace-tech-item">
              <span>BOUNDARY</span>
              <code>Air-gapped environment</code>
            </div>

          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              color: '#5f7892',
              fontSize: '12px',
            }}
          >
            {backendOnline === true ? (
              <>
                <CheckCircle2 size={15} color="#14763d" />
                <span>Monitor endpoint is reachable.</span>
              </>
            ) : backendOnline === false ? (
              <>
                <ShieldCheck size={15} color="#a63d3d" />
                <span>Monitor endpoint is currently unavailable.</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} color="#7188a0" />
                <span>Checking monitor endpoint...</span>
              </>
            )}
          </div>

        </section>

      </div>
    </main>
  );
};
