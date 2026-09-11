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
  ShieldAlert
} from 'lucide-react';

export const DefenseNav: React.FC = () => {
  const mainNav = [
    { to: '/', label: 'System Overview', icon: LayoutGrid, id: '00' },
    { to: '/dashboard', label: 'Mission Console', icon: Terminal, id: '00' },
  ];

  const moduleNav = [
    { to: '/requirements/r1', label: 'Air-Gap Boundary', icon: ShieldCheck, id: 'R1' },
    { to: '/requirements/r2', label: 'Model Router', icon: Zap, id: 'R2' },
    { to: '/requirements/r3', label: 'Agentic Engine', icon: GitCommit, id: 'R3' },
    { to: '/requirements/r4', label: 'Multimodal Tools', icon: Wrench, id: 'R4' },
    { to: '/requirements/r5', label: 'Deliverables', icon: FileCheck, id: 'R5' },
    { to: '/requirements/r6', label: 'Knowledge RAG', icon: Database, id: 'R6' },
    { to: '/requirements/r7', label: 'Security SOC', icon: ShieldAlert, id: 'R7' },
  ];

  return (
    <aside className="module-rail">
      <div>
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
                <IconComp size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rail-section-title" style={{ marginTop: '16px' }}>SYSTEM MODULES</div>
        <nav className="rail-nav-list">
          {moduleNav.map((item) => {
            const IconComp = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rail-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-id">{item.id}</span>
                <IconComp size={14} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="rail-footer">
        <div className="health-dot pulse" />
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AIR-GAP NOMINAL</span>
      </div>
    </aside>
  );
};
