import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Zap,
  GitCommit,
  Wrench,
  FileCheck,
  Database,
  ShieldCheck,
  Cpu,
  ClipboardCheck
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const mainNav = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  ];

  const moduleNav = [
    { to: '/router', label: 'Model Router', icon: Zap },
    { to: '/reasoning', label: 'Agent Reasoning', icon: GitCommit },
    { to: '/tools', label: 'Tool Registry', icon: Wrench },
    { to: '/knowledge', label: 'Knowledge Search', icon: Database },
    { to: '/deliverables', label: 'Deliverables', icon: FileCheck },
    { to: '/air-gap', label: 'Air-Gap & Network Monitor', icon: ShieldCheck },
  ];

  const governanceNav = [
    { to: '/operations', label: 'Model Operations & Security', icon: Cpu },
    { to: '/approvals', label: 'Approval Gate', icon: ClipboardCheck },
  ];

  const renderGroup = (items: typeof mainNav) =>
    items.map((item) => {
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
    });

  return (
    <aside className="module-rail">
      <div>
        <div style={{ padding: '4px 18px 16px 18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Tark AI
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Sovereign On-Premise Agentic Workbench
          </div>
        </div>

        <div className="rail-section-title">WORKSPACE</div>
        <nav className="rail-nav-list">{renderGroup(mainNav)}</nav>

        <div className="rail-section-title" style={{ marginTop: '20px' }}>SYSTEM MODULES</div>
        <nav className="rail-nav-list">{renderGroup(moduleNav)}</nav>

        <div className="rail-section-title" style={{ marginTop: '20px' }}>GOVERNANCE</div>
        <nav className="rail-nav-list">{renderGroup(governanceNav)}</nav>
      </div>

      <div className="rail-footer">
        <div className="health-dot pulse" />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>AIR-GAP OPERATIONAL</span>
      </div>
    </aside>
  );
};