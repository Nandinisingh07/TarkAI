import React from 'react';
import { Shield, Lock, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={14} color="var(--accent-amber)" />
        <span style={{ color: 'var(--text-primary)' }}>SOVEREIGN INDUSTRIAL AI WORKBENCH (SIH PS26117)</span>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <span><Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> AIR-GAPPED CONTROL ROOM</span>
        <span><Server size={12} style={{ display: 'inline', marginRight: '4px' }} /> LOCAL OLLAMA INFERENCE</span>
      </div>
    </footer>
  );
};
