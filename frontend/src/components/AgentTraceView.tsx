import React, { useState } from 'react';
import { Activity, Wrench, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { TraceStep } from '../types';

interface Props {
  trace: TraceStep[];
  currentStep: number;
  status: string;
}

export const AgentTraceView: React.FC<Props> = ({ trace, currentStep, status }) => {
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const [showTechnicalParams, setShowTechnicalParams] = useState<Record<number, boolean>>({});

  const toggleTechnical = (stepNum: number) => {
    setShowTechnicalParams(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const getToolDisplayName = (actionName: string) => {
    switch (actionName) {
      case 'search_knowledge_base': return 'Knowledge Base Verification';
      case 'execute_code': return 'Local Code Execution';
      case 'extract_text': return 'Document OCR Reading';
      case 'describe_image': return 'Visual Image Analysis';
      case 'write_file': return 'File System Write';
      case 'read_file': return 'File System Read';
      case 'write_spreadsheet': return 'Excel Data Formatting';
      default: return actionName;
    }
  };

  return (
    <div className="instrument-card">
      <div className="card-header-bar">
        <div className="card-title">
          <Activity size={16} color="var(--accent-blue)" />
          <span>Task Execution Progress</span>
        </div>
        <div className="status-badge nominal">
          <span className={`health-dot ${isRunning ? 'pulse' : ''}`} />
          <span>{isRunning ? `Processing Step ${currentStep}...` : isCompleted ? 'Task Processing Complete' : 'Ready'}</span>
        </div>
      </div>

      {/* IDLE — no task ever submitted */}
      {status === 'idle' && trace.length === 0 && (
        <div className="standby-row">
          <span className="idle-dot" />
          <span style={{ color: 'var(--text-secondary)' }}>No active execution. Submit a task to begin AI task processing.</span>
        </div>
      )}

      {/* RUNNING but trace not yet populated — first polling cycle */}
      {isRunning && trace.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <Loader2 size={16} className="spin" style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
          <span>Initialising AI task pipeline — first trace step incoming…</span>
        </div>
      )}

      {/* TRACE STEPS — shown whenever there are steps, regardless of status */}
      {trace.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
          {trace.map((step) => {
            const isTechOpen = !!showTechnicalParams[step.step];

            return (
              <div
                key={step.step}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px' }}>
                      Step {step.step}
                    </span>
                    {step.action && step.action !== 'FINAL_ANSWER' && (
                      <span className="status-badge nominal" style={{ fontSize: '11px' }}>
                        <Wrench size={11} /> {getToolDisplayName(step.action)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTechnical(step.step)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{isTechOpen ? 'Hide Technical Params' : 'Technical Params'}</span>
                    {isTechOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  <strong style={{ color: '#60a5fa' }}>AI Reason:</strong> {step.thought}
                </div>

                {isTechOpen && step.action_input && (
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: '#080d1a', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    <strong>JSON Input:</strong> {typeof step.action_input === 'object' ? JSON.stringify(step.action_input, null, 2) : String(step.action_input)}
                  </div>
                )}

                {step.observation && (
                  <div style={{ fontSize: '12px', color: '#34d399', background: 'rgba(16, 185, 129, 0.08)', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid var(--accent-emerald)' }}>
                    <strong>Observation:</strong> {step.observation.length > 200 ? step.observation.substring(0, 200) + '...' : step.observation}
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
