import React from 'react';
import { Shield, Zap, Layers, HardDrive, Lock, Wrench, FileCheck, Eye, Cpu } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { TaskForm } from '../components/TaskForm';
import { ModelBadge } from '../components/ModelBadge';
import { AgentTraceView } from '../components/AgentTraceView';
import { ResultView } from '../components/ResultView';
import { RequirementGrid } from '../components/RequirementGrid';

export const DashboardPage: React.FC = () => {
  const {
    modelUsed,
    routingReason,
    taskStatus,
    currentStep,
    trace,
    resultData,
    deliverable,
    isLoading,
    handleTaskSubmit
  } = useTaskContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Strategic Hero Section */}
      <section className="hero-section">
        <div className="hero-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-secure" style={{ fontSize: '0.72rem' }}>
                <Shield size={13} /> AIR-GAPPED ON-PREMISE AI INFRASTRUCTURE
              </span>
              <span className="badge" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--border-strong)', fontSize: '0.72rem' }}>
                <Cpu size={13} /> CPU-ONLY EXECUTION MODE
              </span>
            </div>
            <h2 className="hero-title">National Confidential AI Operations Platform</h2>
            <p className="hero-desc">
              Sovereign, air-gapped agentic AI workbench built for confidential industrial work (SIH PS26117). Features automated task classification, 8-step ReAct reasoning loops, 6 sandboxed tools, IntelliMesh RAG grounding, and official deliverable document generation with zero outbound network egress.
            </p>
          </div>
        </div>

        <div className="feature-chips">
          <span className="chip"><Lock size={13} color="var(--accent-emerald)" /> Zero Egress Audit Guard</span>
          <span className="chip"><Zap size={13} color="var(--accent-cyan)" /> TaskRouter Auto-Model Selection</span>
          <span className="chip"><Layers size={13} color="var(--accent-blue)" /> 8-Step ReAct Agent Loop</span>
          <span className="chip"><Wrench size={13} color="var(--accent-amber)" /> 6 Sandboxed Industrial Tools</span>
          <span className="chip"><FileCheck size={13} color="var(--accent-cyan)" /> Deliverables (.docx, .pptx, .xlsx)</span>
          <span className="chip"><HardDrive size={13} color="var(--accent-emerald)" /> IntelliMesh RAG SOP Grounding</span>
          <span className="chip"><Eye size={13} color="var(--accent-amber)" /> Multimodal Moondream2 Vision & OCR</span>
        </div>
      </section>

      {/* Capabilities Quick Grid Overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Lock size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Air-Gapped Isolation</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Strict localhost execution on Ollama server (<code>127.0.0.1:11434</code>) with live <code>psutil</code> daemon connection auditing.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Zap size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Multi-Model Router</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Rule-based TaskRouter classifying coding tasks (<code>qwen2.5-coder:1.5b</code>) vs reasoning/SOP tasks (<code>phi3:mini</code>).
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Layers size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Agentic ReAct Loop</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Multi-step ReAct framework (<code>Thought -&gt; Action -&gt; Observation</code>) parsing structured JSON tool parameters.
          </p>
        </div>
      </section>

      {/* Live Working Agent Workspace */}
      <main className="workbench-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TaskForm onSubmit={handleTaskSubmit} isLoading={isLoading} />
          {modelUsed && <ModelBadge modelName={modelUsed} reason={routingReason} />}
        </div>

        <div>
          <AgentTraceView trace={trace} currentStep={currentStep} status={taskStatus} />
        </div>
      </main>

      {/* Deliverable Result Section */}
      {resultData && <ResultView result={resultData} deliverable={deliverable} />}

      {/* Requirements Compliance Matrix */}
      <RequirementGrid />
    </div>
  );
};
