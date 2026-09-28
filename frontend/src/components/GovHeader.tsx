import React from 'react';
import { Logo } from './Logo';

export const GovHeader: React.FC = () => {
  return (
    <>
      <div className="tarkai-live-feed">
        <div className="tarkai-live-label">
          <span className="tarkai-live-dot" />
          LIVE
        </div>

        <div className="tarkai-ticker-window">
          <div className="tarkai-ticker-track">
            <span>TARKAI OPERATIONAL FEED</span>
            <span>•</span>
            <span>AIR-GAP SECURE</span>
            <span>•</span>
            <span>0 EXTERNAL CALLS</span>
            <span>•</span>
            <span>LOCAL AI INFERENCE ACTIVE</span>
            <span>•</span>
            <span>REACT AGENT READY</span>
            <span>•</span>
            <span>HUMAN APPROVAL GATE ACTIVE</span>
            <span>•</span>
            <span>KNOWLEDGE BASE ONLINE</span>
            <span>•</span>
            <span>AUDIT MONITORING ACTIVE</span>
            <span>•</span>

            <span>TARKAI OPERATIONAL FEED</span>
            <span>•</span>
            <span>AIR-GAP SECURE</span>
            <span>•</span>
            <span>0 EXTERNAL CALLS</span>
            <span>•</span>
            <span>LOCAL AI INFERENCE ACTIVE</span>
            <span>•</span>
            <span>REACT AGENT READY</span>
            <span>•</span>
            <span>HUMAN APPROVAL GATE ACTIVE</span>
            <span>•</span>
            <span>KNOWLEDGE BASE ONLINE</span>
            <span>•</span>
            <span>AUDIT MONITORING ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="tricolor-strip">
        <span className="saffron" />
        <span className="white" />
        <span className="green" />
      </div>

      <header className="gov-header">
        <div className="gov-header-brand">
          <Logo size={38} />

          <div className="gov-header-titles">
            <h1>Mangalore Refinery and Petrochemicals Limited</h1>
            <p>
              Sovereign On-Premise Agentic AI Workbench
              &nbsp;•&nbsp;
              A Government of India Enterprise (ONGC Subsidiary)
            </p>
          </div>
        </div>
      </header>
    </>
  );
};
