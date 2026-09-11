import React from 'react';
import { Cpu } from 'lucide-react';

interface Props {
  modelName: string;
  reason?: string;
}

export const ModelBadge: React.FC<Props> = ({ modelName, reason }) => {
  if (!modelName) return null;

  const isCoder = modelName.includes('coder') || modelName.includes('qwen');
  const tagReason = isCoder ? 'coding-intent' : 'general-reasoning';

  return (
    <div className="instrument-card" style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={16} color="var(--accent-amber)" />
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              ROUTER SELECTION
            </div>
            <div className="font-mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {modelName}
            </div>
          </div>
        </div>

        <span className="status-badge nominal font-mono" style={{ fontSize: '10px' }}>
          {reason || tagReason}
        </span>
      </div>
    </div>
  );
};
