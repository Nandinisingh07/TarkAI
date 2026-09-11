import React from 'react';
import { Activity, Wrench } from 'lucide-react';
import { TraceStep } from '../types';

interface Props {
  trace: TraceStep[];
  currentStep: number;
  status: string;
}

export const AgentTraceView: React.FC<Props> = ({ trace, currentStep, status }) => {
  const isRunning = status === 'running';

  return (
    <div className="instrument-card">
      <div className="card-header-bar">
        <div className="card-title">
          <Activity size={14} color="var(--accent-amber)" />
          <span>REACT AGENT INSTRUMENTATION STREAM</span>
        </div>
        <div className="status-badge font-mono" style={{ fontSize: '10px' }}>
          <span className={`health-dot ${isRunning ? 'pulse amber' : 'teal'}`} />
          STATUS: {status.toUpperCase()} (STEP {currentStep})
        </div>
      </div>

      {!trace.length ? (
        <div className="standby-row">
          <span className="idle-dot" />
          <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>Awaiting command</span>
        </div>
      ) : (
        <div className="terminal-log" style={{ maxHeight: '480px' }}>
          {trace.map((step) => {
            const stepTime = new Date().toISOString().substring(11, 19);
            return (
              <div key={step.step} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="log-ts">{stepTime} [STEP-{step.step}]</span>
                  {step.action && (
                    <span className="status-badge nominal font-mono" style={{ fontSize: '9px' }}>
                      <Wrench size={10} /> TOOL: {step.action}
                    </span>
                  )}
                </div>

                <div className="log-msg" style={{ marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--accent-amber)' }}>THOUGHT:</strong> {step.thought}
                </div>

                {step.action_input && (
                  <div className="log-msg" style={{ color: 'var(--text-secondary)', fontSize: '11px', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', marginBottom: '4px' }}>
                    <strong>INPUT:</strong> {typeof step.action_input === 'object' ? JSON.stringify(step.action_input) : String(step.action_input)}
                  </div>
                )}

                {step.observation && (
                  <div className="log-msg teal" style={{ fontSize: '11px', background: 'rgba(61, 140, 125, 0.08)', padding: '4px 8px', borderLeft: '2px solid var(--accent-teal)' }}>
                    <strong>OBSERVATION:</strong> {step.observation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
