import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  GitCommit,
  Wrench,
  FileCheck,
  Database,
  Play,
  Activity,
  Cpu,
  CheckCircle2,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { fetchAirGapStatus, fetchReviewDrafts } from '../services/api';
import { ImageSlideshow } from '../components/ImageSlideshow';

const homeSlides = [
  { src: '/images/home/home1.jpg', alt: 'MRPL / government infrastructure', caption: 'Sovereign On-Premise Agentic AI Workbench' },
  { src: '/images/home/home2.jpg', alt: 'MRPL / government infrastructure' },
  { src: '/images/home/home3.jpg', alt: 'MRPL / government infrastructure' },
];

export const HomePage: React.FC = () => {
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
      <ImageSlideshow slides={homeSlides} height="68vh" />

      <div className="page-header-strip">
        <div>
          <h1 className="page-title">
            System Overview
          </h1>
          <p className="page-subtitle">
            Sovereign On-Premise Agentic AI Workbench — Operational Readiness & Security Status
          </p>
        </div>

        <button
          className="btn-blue"
          onClick={() => navigate('/assistant')}
        >
          <Play size={15} />
          <span>Open AI Assistant</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

        <div className="instrument-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <ShieldCheck size={20} color={isSecure ? '#34d399' : '#f87171'} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                System Security
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

        <div className="instrument-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Cpu size={20} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                AI Models Status
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

        <div className="instrument-card" onClick={() => navigate('/approvals')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <FileCheck size={20} color={pendingReviews > 0 ? '#fbbf24' : '#34d399'} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Approval Gate Queue
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>

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

          <button className="btn-outline" onClick={() => navigate('/assistant')} style={{ marginTop: '8px' }}>
            <span>Go to AI Assistant</span>
            <ArrowRight size={14} />
          </button>
        </div>

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

      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-title">
            <span>System Modules Navigation</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { title: 'Air-Gap & Network Monitor', path: '/air-gap', icon: ShieldCheck, desc: 'Local Socket Monitoring' },
            { title: 'Model Router', path: '/router', icon: Zap, desc: 'Auto Model Classifier' },
            { title: 'Agent Reasoning', path: '/reasoning', icon: GitCommit, desc: 'Multi-Step ReAct Loop' },
            { title: 'Tool Registry', path: '/tools', icon: Wrench, desc: 'OCR, Vision & Sandboxes' },
            { title: 'Deliverables', path: '/deliverables', icon: FileCheck, desc: '.docx, .pptx, .xlsx Factory' },
            { title: 'Knowledge Search', path: '/knowledge', icon: Database, desc: 'Local SOP Retrieval' },
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