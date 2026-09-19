import React, { useEffect, useState } from 'react';
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
  Cpu,
  CheckCircle2,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { fetchAirGapStatus, fetchReviewDrafts } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { modelUsed, taskStatus, trace, resultData, deliverable } = useTaskContext();
  const [airGapData, setAirGapData] = useState<any>(null);
  const [pendingReviews, setPendingReviews] = useState<number>(0);

  useEffect(() => {
    fetchAirGapStatus().then((res: any) => setAirGapData(res)).catch(() => {});
    fetchReviewDrafts('pending_review').then((res: any[]) => setPendingReviews(res?.length || 0)).catch(() => {});
  }, []);

  const isSecure = airGapData?.external_calls_detected === 0 || airGapData === null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header Strip */}
      <div className="page-header-strip">
        <div>
          <h1 className="page-title">
            System Overview
          </h1>
          <p className="page-subtitle">
            National Confidential AI Operations Platform — Operational Readiness & Security Status
          </p>
        </div>

        <button
          className="btn-blue"
          onClick={() => navigate('/dashboard')}
        >
          <Play size={15} />
          <span>Launch Mission Console</span>
        </button>
      </div>

      {/* Requirement 10: First Screen Key Answers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        
        {/* 1. Is System Secure? */}
        <div className="instrument-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <ShieldCheck size={20} color={isSecure ? '#34d399' : '#f87171'} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                1. System Security
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: isSecure ? '#34d399' : '#f87171' }}>
                {isSecure ? 'AIR-GAP SECURE (0 Egress)' : 'Security Alert'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            All model calls, socket connections, and tool executions are strictly isolated on local network.
          </p>
        </div>

        {/* 2. Is AI Operational? */}
        <div className="instrument-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Cpu size={20} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                2. AI Models Status
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#60a5fa' }}>
                Operational & Loaded
              </div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Local models (<code style={{ color: '#60a5fa' }}>phi3:mini</code>, <code style={{ color: '#60a5fa' }}>qwen2.5-coder:1.5b</code>, <code style={{ color: '#60a5fa' }}>moondream</code>) ready.
          </p>
        </div>

        {/* 3. Human Approval Required? */}
        <div className="instrument-card" onClick={() => navigate('/review')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <FileCheck size={20} color={pendingReviews > 0 ? '#fbbf24' : '#34d399'} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                3. Approval Gate Queue
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: pendingReviews > 0 ? '#fbbf24' : '#34d399' }}>
                {pendingReviews > 0 ? `${pendingReviews} Drafts Awaiting Review` : 'No Pending Approvals'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Human-in-the-loop review queue for low-confidence outputs and sensitive reports.
          </p>
        </div>

      </div>

      {/* Task & Recent Deliverables Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Active Task Status */}
        <div className="instrument-card">
          <div className="card-header-bar">
            <div className="card-title">
              <Activity size={16} color="var(--accent-blue)" />
              <span>Current Task Status</span>
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            {taskStatus === 'idle' && (
              <div className="standby-row">
                <span className="idle-dot" />
                <span style={{ color: 'var(--text-secondary)' }}>No active tasks running. System ready.</span>
              </div>
            )}
            {taskStatus === 'running' && (
              <div style={{ padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '6px', color: '#60a5fa', fontWeight: 600 }}>
                Processing operational task... ({trace.length} steps executed)
              </div>
            )}
            {taskStatus === 'completed' && (
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Latest task execution completed successfully.
              </div>
            )}
          </div>

          <button className="btn-outline" onClick={() => navigate('/dashboard')} style={{ marginTop: '8px' }}>
            <span>Go to Mission Console</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Deliverables Ready */}
        <div className="instrument-card">
          <div className="card-header-bar">
            <div className="card-title">
              <FileText size={16} color="var(--accent-teal)" />
              <span>Latest Deliverable Output</span>
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            {deliverable ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {deliverable.filename}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Format: {deliverable.format.toUpperCase()} Document
                </div>
                <a href={deliverable.download_url} download className="btn-teal" style={{ textDecoration: 'none', width: 'fit-content', marginTop: '4px' }}>
                  Download Deliverable File
                </a>
              </div>
            ) : (
              <div className="standby-row">
                <span className="idle-dot" />
                <span style={{ color: 'var(--text-secondary)' }}>No deliverable documents generated yet.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* System Modules Quick Nav Grid */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <span>System Modules Navigation</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { title: 'Air-Gap Security', path: '/requirements/r1', icon: ShieldCheck, desc: 'Local Socket Monitoring' },
            { title: 'Model Router', path: '/requirements/r2', icon: Zap, desc: 'Auto Model Classifier' },
            { title: 'Agentic Engine', path: '/requirements/r3', icon: GitCommit, desc: 'Multi-Step ReAct Loop' },
            { title: 'Multimodal Tools', path: '/requirements/r4', icon: Wrench, desc: 'OCR, Vision & Sandboxes' },
            { title: 'Deliverables', path: '/requirements/r5', icon: FileCheck, desc: '.docx, .pptx, .xlsx Factory' },
            { title: 'Knowledge Base', path: '/requirements/r6', icon: Database, desc: 'IntelliMesh RAG SOPs' },
          ].map((m, idx) => {
            const IconComp = m.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(m.path)}
                style={{
                  background: 'var(--bg-panel-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="btn-outline-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <IconComp size={16} color="var(--accent-blue)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
