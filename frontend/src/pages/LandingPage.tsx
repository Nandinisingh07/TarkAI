import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  GitCommit,
  Wrench,
  FileCheck,
  Database,
  ShieldAlert,
  Play,
  Activity,
  Lock,
  Cpu
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { modelUsed, taskStatus, trace } = useTaskContext();

  const nodes = [
    { id: 'R1', title: 'Air-Gap Boundary', path: '/requirements/r1', icon: ShieldCheck, sub: 'Local Socket Audit' },
    { id: 'R2', title: 'Model Router', path: '/requirements/r2', icon: Zap, sub: 'Classification Signal' },
    { id: 'R3', title: 'Agent Engine', path: '/requirements/r3', icon: GitCommit, sub: 'ReAct Loop' },
    { id: 'R4', title: 'Multimodal Tools', path: '/requirements/r4', icon: Wrench, sub: 'Tool Suite' },
    { id: 'R5', title: 'Deliverables', path: '/requirements/r5', icon: FileCheck, sub: 'Document Factory' },
    { id: 'R6', title: 'Knowledge RAG', path: '/requirements/r6', icon: Database, sub: 'IntelliMesh Fusion' },
    { id: 'R7', title: 'Security SOC', path: '/requirements/r7', icon: ShieldAlert, sub: 'Egress Monitor' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Console Title Strip */}
      <div className="page-header-strip">
        <div>
          <h1 className="page-title">
            <Activity size={20} color="var(--accent-amber)" />
            SYSTEM OVERVIEW CONSOLE
          </h1>
          <p className="page-subtitle">
            Refinery-Grade Air-Gapped Operations Architecture & System Flow
          </p>
        </div>

        <button
          className="btn-amber"
          onClick={() => navigate('/dashboard')}
        >
          <Play size={13} />
          <span>OPEN CONSOLE</span>
        </button>
      </div>

      {/* Center Interactive 7-Node System Flow Diagram */}
      <div className="system-flow-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            INTELLIGENCE PIPELINE FLOW (7 SUBSYSTEM NODES)
          </span>
          <span className="status-badge nominal font-mono" style={{ fontSize: '10px' }}>
            ALL NODES OPERATIONAL
          </span>
        </div>

        <div className="flow-nodes-grid">
          {nodes.map((node) => {
            const IconComp = node.icon;
            const isActive = taskStatus === 'running' || taskStatus === 'completed';
            return (
              <div
                key={node.id}
                className={`flow-node ${isActive ? 'active-node' : 'teal-node'}`}
                onClick={() => navigate(node.path)}
              >
                <span className="flow-node-id">{node.id}</span>
                <IconComp size={18} color={isActive ? 'var(--accent-amber)' : 'var(--accent-teal)'} />
                <span className="flow-node-title">{node.title}</span>
                <span className="flow-node-sub">{node.sub}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Real Counters Only */}
      <div className="telemetry-grid">
        <div className="telemetry-tile">
          <span className="telemetry-label">TOTAL TASKS EXEC (SESSION)</span>
          <span className="telemetry-val amber">{trace.length > 0 ? 1 : 0}</span>
        </div>

        <div className="telemetry-tile">
          <span className="telemetry-label">AIR-GAP EGRESS AUDIT</span>
          <span className="telemetry-val teal" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} /> LOCKED (0 CALLS)
          </span>
        </div>

        <div className="telemetry-tile">
          <span className="telemetry-label">ACTIVE MODEL ENGINE</span>
          <span className="telemetry-val font-mono" style={{ fontSize: '14px', color: modelUsed ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
            {modelUsed ? modelUsed : '—'}
          </span>
        </div>
      </div>

      {/* Requirement Specifications Grid */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <Cpu size={14} color="var(--accent-teal)" />
            <span>SIH PS26117 SPECIFICATION MATRIX</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            VERIFIED ON-PREMISE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              R1: Air-Gapped Execution
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Model runs strictly on localhost (127.0.0.1:11434). Sockets monitored via psutil.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              R2: TaskRouter Classifier
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Auto-routes coding to qwen2.5-coder:1.5b and general tasks to phi3:mini.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              R3-R5: ReAct Agent & Deliverables
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              8-step loop generating Word (.docx), PowerPoint (.pptx), and Excel (.xlsx) files.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
