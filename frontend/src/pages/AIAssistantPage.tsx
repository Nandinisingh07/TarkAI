import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal,
  ShieldCheck,
  Plus,
  Activity,
  Cpu,
  GitBranch,
  FileCheck2,
  Radio,
  CheckCircle2,
  Clock3,
  PanelRightOpen,
} from 'lucide-react';

import { useTaskContext } from '../context/TaskContext';
import { TaskForm } from '../components/TaskForm';
import { ResultView } from '../components/ResultView';
import { SidePanel } from '../components/SidePanel';

import '../styles/ai-assistant.css';
import '../styles/side-panel.css';

export const AIAssistantPage: React.FC = () => {
  const {
    modelUsed,
    taskStatus,
    currentStep,
    trace,
    resultData,
    deliverable,
    isLoading,
    handleTaskSubmit,
    resetTask,
  } = useTaskContext();

  const [panelOpen, setPanelOpen] = useState(false);
  const navigate = useNavigate();

  const isRunning = taskStatus === 'running' || isLoading;
  const isCompleted = taskStatus === 'completed';
  const hasTask = taskStatus !== 'idle';

  return (
    <main className="ai-command-page">

      {/* LIVE STATUS HEADER */}
      <section className="ai-live-strip">
        <div className="ai-live-left">
          <span className="ai-live-dot" />
          <strong>AI OPERATIONS LIVE</strong>
          <span className="ai-divider">•</span>
          <span>CONFIDENTIAL WORKSPACE</span>
        </div>

        <div className="ai-live-right">
          <span>
            <ShieldCheck size={13} />
            AIR-GAP SECURE
          </span>

          <span>
            <Radio size={13} />
            LOCAL INFERENCE
          </span>
        </div>
      </section>

      {/* PAGE HERO */}
      <section className="ai-page-hero">

        <div className="ai-hero-copy">

          <div className="ai-eyebrow">
            <Terminal size={15} />
            TARKAI AI OPERATIONS CONSOLE
          </div>

          <h1>
            Ask TarkAI.
            <span> Execute Intelligence Locally.</span>
          </h1>

          <p>
            Submit confidential operational tasks and receive verified outputs —
            without moving sensitive data outside the environment.
          </p>

          <div className="ai-hero-status">
            <div><CheckCircle2 size={15} /><span>Local Models</span></div>
            <div><CheckCircle2 size={15} /><span>Agentic Execution</span></div>
            <div><CheckCircle2 size={15} /><span>Human Control</span></div>
          </div>

        </div>

        <div className="ai-command-status">

          <div className="command-status-head">
            <div>
              <span className="mini-label">MISSION STATUS</span>
              <strong>
                {isRunning ? 'PROCESSING' : isCompleted ? 'MISSION COMPLETE' : 'STANDBY'}
              </strong>
            </div>

            <Activity size={22} className={isRunning ? 'status-icon-running' : 'status-icon'} />
          </div>

          <div className="command-status-line">
            <span>Execution steps</span>
            <strong>{trace.length}</strong>
          </div>

          <div className="command-status-line">
            <span>Current step</span>
            <strong>{currentStep || '—'}</strong>
          </div>

          <div className="command-status-line">
            <span>Model</span>
            <strong>{modelUsed || 'Auto-select'}</strong>
          </div>

        </div>

      </section>

      {/* 4 LIVE CONSOLE CARDS */}
      <section className="ai-metrics">

        <div className="ai-metric-card live">
          <div className="ai-metric-icon blue"><Cpu size={18} /></div>
          <div>
            <span>MODEL ROUTING</span>
            <strong>{modelUsed || 'AUTO'}</strong>
          </div>
        </div>

        <div className="ai-metric-card live">
          <div className="ai-metric-icon teal"><GitBranch size={18} /></div>
          <div>
            <span>AGENT STEPS</span>
            <strong>{trace.length} STEPS</strong>
          </div>
        </div>

        <div className="ai-metric-card live">
          <div className="ai-metric-icon green"><ShieldCheck size={18} /></div>
          <div>
            <span>DATA BOUNDARY</span>
            <strong>LOCAL ONLY</strong>
          </div>
        </div>

        <div className="ai-metric-card live">
          <div className="ai-metric-icon orange"><FileCheck2 size={18} /></div>
          <div>
            <span>DELIVERABLE</span>
            <strong>{deliverable ? 'READY' : 'NONE'}</strong>
          </div>
        </div>

      </section>

      {/* TASK INPUT */}
      <section className="ai-workspace" style={{ gridTemplateColumns: '1fr' }}>
        <div className="ai-input-column">

          <div className="ai-section-header">
            <div>
              <h2>What should TarkAI do?</h2>
              <p>Submit a task using confidential files, operational data, SOPs or natural-language instructions.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="reasoning-toggle-btn" onClick={() => setPanelOpen(true)}>
                <PanelRightOpen size={14} />
                View Reasoning
              </button>

              {hasTask && (
                <button className="ai-new-task" onClick={resetTask} disabled={isLoading}>
                  <Plus size={14} />
                  New Mission
                </button>
              )}
            </div>
          </div>

          <div className="ai-task-shell">
            <TaskForm onSubmit={handleTaskSubmit} isLoading={isLoading} />
          </div>

        </div>
      </section>

      {/* CLEAN ANSWER */}
      {resultData && (
        <section className="ai-results-area">

          <div className="ai-result-heading">
            <div>
              <h2>Mission Results</h2>
              <p>Final response and generated deliverables.</p>
            </div>

            <div className="result-complete">
              <CheckCircle2 size={15} />
              VERIFIED OUTPUT
            </div>
          </div>

          <div className="ai-result-card">
            <ResultView result={resultData} deliverable={deliverable} />
            <div style={{ marginTop: '14px' }}>
              <button type="button" className="btn-blue" onClick={() => navigate('/deliverables')}>
                <FileCheck2 size={14} />
                <span>Get Deliverable (Word / PDF / Excel / PPT)</span>
              </button>
            </div>
          </div>

        </section>
      )}

      {/* EMPTY STATE */}
      {!resultData && !isRunning && (
        <section className="ai-ready-panel">
          <div className="ready-icon"><Clock3 size={23} /></div>
          <div>
            <span className="ai-section-kicker">SYSTEM READY</span>
            <h3>TarkAI is waiting for an operational mission.</h3>
            <p>Submit a request above to activate model routing, agentic reasoning and local tool execution.</p>
          </div>
          <div className="ready-status"><span />READY</div>
        </section>
      )}

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} />

    </main>
  );
};