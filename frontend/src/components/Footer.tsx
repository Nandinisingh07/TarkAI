import React from 'react';
import { Shield, Lock, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  const lastUpdated = new Date().toISOString().slice(0, 10);

  return (
    <footer className="site-footer-gov">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={14} color="#FF9933" />
          <span style={{ color: '#fff', fontWeight: 600 }}>
            Sovereign On-Premise Agentic AI Workbench — MRPL (SIH PS26117)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span><Lock size={12} style={{ display: 'inline', marginRight: 4 }} /> Air-Gapped Deployment</span>
          <span><Server size={12} style={{ display: 'inline', marginRight: 4 }} /> Local Ollama Inference</span>
        </div>
      </div>

      <div className="footer-links">
        <a href="#">Sitemap</a>
        <a href="#">Terms of Use</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Accessibility Statement</a>
        <a href="#">Copyright Policy</a>
      </div>

      <div style={{ fontSize: '11px', opacity: 0.7 }}>
        Content owned and maintained by MRPL &nbsp;•&nbsp; Last Updated: {lastUpdated} &nbsp;•&nbsp;
        This site conforms to GIGW 3.0 guidelines
      </div>
    </footer>
  );
};