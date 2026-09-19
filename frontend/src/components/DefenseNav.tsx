import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Terminal,
  ShieldCheck,
  Zap,
  GitCommit,
  Wrench,
  FileCheck,
  Database,
  ShieldAlert,
  Lock,
  Cpu
} from 'lucide-react';

export const DefenseNav: React.FC = () => {
  const mainNav = [
    { to: '/', label: 'System Overview', icon: LayoutGrid },
    { to: '/dashboard', label: 'Mission Console', icon: Terminal },
    { to: '/review', label: 'Approval Gate', icon: FileCheck },
    { to: '/operations', label: 'Model Operations & Security', icon: Cpu },
  ];

  const moduleNav = [
    { to: '/requirements/r1', label: 'Air-Gap Security', icon: ShieldCheck },
    { to: '/requirements/r2', label: 'Model Router', icon: Zap },
    { to: '/requirements/r3', label: 'Agentic Engine', icon: GitCommit },
    { to: '/requirements/r4', label: 'Multimodal Tools', icon: Wrench },
    { to: '/requirements/r5', label: 'Deliverables', icon: FileCheck },
    { to: '/requirements/r6', label: 'Knowledge Base', icon: Database },
    { to: '/requirements/r7', label: 'Security & Audit', icon: ShieldAlert },
  ];

  return (
    <aside className="module-rail">
      <div>
        <div style={{ padding: '4px 18px 16px 18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Tark AI
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            National Confidential Platform
          </div>
        </div>

        <div className="rail-section-title">CONTROL CONSOLE</div>
        <nav className="rail-nav-list">
          {mainNav.map((item) => {
            const IconComp = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `rail-nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComp size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rail-section-title" style={{ marginTop: '20px' }}>SYSTEM MODULES</div>
        <nav className="rail-nav-list">
          {moduleNav.map((item) => {
            const IconComp = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rail-nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComp size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="rail-footer">
        <div className="health-dot pulse" />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>AIR-GAP OPERATIONAL</span>
      </div>
    </aside>
  );
};
