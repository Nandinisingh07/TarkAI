import React from 'react';
import { Layers, Code2, Terminal, CheckCircle2, Wrench, ArrowRight } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { AgentTraceView } from '../components/AgentTraceView';

export const R3ReActPage: React.FC = () => {
  const { trace, currentStep, taskStatus } = useTaskContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Header */}
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Layers size={28} color="var(--accent-blue)" />
          <h2 className="hero-title">Agentic ReAct AI Engine (Requirement R3)</h2>
        </div>
        <p className="hero-desc">
          Satisfies PS26117 Requirement 3: ReAct-style agentic reasoning framework (<code>{"Thought -> Action -> Action Input -> Observation"}</code>) capped at 8 steps. The agent dynamically parses structured JSON tool parameters, receives tool execution outputs back into its reasoning context, and self-corrects until generating a <code>FINAL_ANSWER</code> action.
        </p>
      </div>

      {/* ReAct Execution Cycle Diagram */}
      <div className="card">
        <div className="card-title">
          <span>Agentic ReAct Step Cycle (Max 8 Iterations)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>PHASE 1: THOUGHT</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>LLM Reasoning</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Analyzes goal and context to plan next logical tool call.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginBottom: '0.3rem' }}>PHASE 2: ACTION</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>JSON Tool Dispatch</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Selects tool name & generates structured JSON parameters.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', marginBottom: '0.3rem' }}>PHASE 3: OBSERVATION</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Tool Execution Result</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Executes tool (code, file, RAG, OCR) and captures output.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>PHASE 4: FINAL DELIVERABLE</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>FINAL_ANSWER Action</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Terminates loop and produces downloadable deliverable.</p>
          </div>
        </div>
      </div>

      {/* Technical Implementation Reference */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-cyan)" /> Technical Implementation Reference
          </span>
          <span className="badge badge-secure">R3 VERIFIED LIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>📁 <strong>Agent Loop Engine:</strong> <code>backend/app/agent.py</code></div>
          <div>⏱️ <strong>Max Iterations:</strong> 8 ReAct steps limit</div>
          <div>🔄 <strong>Execution Pattern:</strong> <code>{"Thought -> Action -> Action Input -> Observation"}</code></div>
          <div>🏁 <strong>Termination Action:</strong> <code>FINAL_ANSWER</code></div>
        </div>
      </div>

      {/* Embedded Live Component */}
      <div className="card">
        <div className="card-title">
          <span>Embedded Live R3 ReAct Trace Stream</span>
        </div>
        <AgentTraceView trace={trace} currentStep={currentStep} status={taskStatus} />
      </div>
    </div>
  );
};
