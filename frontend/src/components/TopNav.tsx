import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Play,
  Zap,
  GitCommit,
  Wrench,
  Database,
  FileCheck,
  ShieldCheck,
  Cpu,
  ClipboardCheck
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/assistant', label: 'AI Assistant', icon: Play },
  { to: '/router', label: 'Model Router', icon: Zap },
  { to: '/reasoning', label: 'Agent Reasoning', icon: GitCommit },
  { to: '/tools', label: 'Tool Registry', icon: Wrench },
  { to: '/knowledge', label: 'Knowledge Search', icon: Database },
  { to: '/deliverables', label: 'Deliverables', icon: FileCheck },
  { to: '/air-gap', label: 'Air-Gap Monitor', icon: ShieldCheck },
  { to: '/operations', label: 'Operations', icon: Cpu },
  { to: '/approvals', label: 'Approvals', icon: ClipboardCheck },
];

export const TopNav: React.FC = () => {
  return (
    <nav className="top-nav">
      {navItems.map((item) => {
        const IconComp = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}
          >
            <IconComp size={14} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};