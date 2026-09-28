import React from 'react';

interface LogoProps {
  size?: number;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 34, showTagline = false }) => {
  return (
    <div className="logo-mark">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="44" height="44" rx="10" fill="#0B3D6B" />
        <path
          d="M14 16H34M24 16V32"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="32" r="3.4" fill="#FF9933" />
        <circle cx="14" cy="16" r="2.4" fill="#FF9933" />
        <circle cx="34" cy="16" r="2.4" fill="#FF9933" />
      </svg>

      <div className="logo-wordmark">
        <span className="logo-text">
          Tark<span className="logo-accent">AI</span>
        </span>
        <span className="logo-mrpl-tag">MRPL</span>
        {showTagline && (
          <span className="logo-tagline">Sovereign Agentic Workbench</span>
        )}
      </div>
    </div>
  );
};
