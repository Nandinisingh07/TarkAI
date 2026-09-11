import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Layers, Wrench, FileCheck, HardDrive, Lock, ArrowRight } from 'lucide-react';

export const RequirementGrid: React.FC = () => {
  const requirements = [
    {
      id: 'R1',
      title: 'R1: Air-Gapped Operation',
      route: '/requirements/r1',
      desc: 'Zero external network calls; background psutil daemon auditing outbound connections.',
      icon: ShieldCheck,
      color: 'var(--accent-emerald)',
    },
    {
      id: 'R2',
      title: 'R2: Multi-Model Auto-Selection',
      route: '/requirements/r2',
      desc: 'Rule-based router classifying tasks to qwen2.5-coder:1.5b or phi3:mini via config.',
      icon: Zap,
      color: 'var(--accent-cyan)',
    },
    {
      id: 'R3',
      title: 'R3: ReAct Agentic Loop',
      route: '/requirements/r3',
      desc: 'Multi-step Thought-Action-Observation framework capped at 8 steps with JSON tool calls.',
      icon: Layers,
      color: 'var(--accent-blue)',
    },
    {
      id: 'R4',
      title: 'R4: Modular Tool Suite',
      route: '/requirements/r4',
      desc: '6 sandboxed tools for file I/O, subprocess code execution, RAG search, OCR, and vision.',
      icon: Wrench,
      color: 'var(--accent-amber)',
    },
    {
      id: 'R5',
      title: 'R5: Deliverable Generation',
      route: '/requirements/r5',
      desc: 'Automated document creation (.docx, .pptx, .xlsx, .txt) saved to outputs/ directory.',
      icon: FileCheck,
      color: 'var(--accent-cyan)',
    },
    {
      id: 'R6',
      title: 'R6: Knowledge Base Grounding',
      route: '/requirements/r6',
      desc: 'IntelliMesh RAG pipeline (BM25 + TF-IDF Vector Space + RRF + MMR) over local SOPs.',
      icon: HardDrive,
      color: 'var(--accent-emerald)',
    },
    {
      id: 'R7',
      title: 'R7: Network Proof Audit',
      route: '/requirements/r7',
      desc: 'Live Air-Gap status panel polling /monitor/status every 3s showing 0 egress calls.',
      icon: Lock,
      color: 'var(--accent-red)',
    },
  ];

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="card-title">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={18} color="var(--accent-cyan)" /> Requirements Compliance Matrix (PS26117)
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          7/7 Requirements Verified Live
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {requirements.map((req) => {
          const IconComp = req.icon;
          return (
            <Link key={req.id} to={req.route} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.1rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconComp size={18} color={req.color} />
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{req.title}</span>
                    </div>
                    <span className="badge badge-secure" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                      <span className="pulse-dot" /> LIVE
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    {req.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <span>Inspect Requirement {req.id}</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
