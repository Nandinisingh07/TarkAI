import React, { useState } from 'react';
import { X, GitBranch, Layers3, Share2 } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { ModelBadge } from './ModelBadge';
import { AgentTraceView } from './AgentTraceView';
import { CitationGraph } from './CitationGraph';

interface Props {
  open: boolean;
  onClose: () => void;
}

type TabKey = 'router' | 'trace' | 'graph';

export const SidePanel: React.FC<Props> = ({ open, onClose }) => {
  const { modelUsed, routingReason, trace, currentStep, taskStatus, resultData } = useTaskContext();
  const [tab, setTab] = useState<TabKey>('trace');

  const tabs: { key: TabKey; label: string; icon: React.FC<any> }[] = [
    { key: 'router', label: 'Model Router', icon: GitBranch },
    { key: 'trace', label: 'Agent Trace', icon: Layers3 },
    { key: 'graph', label: 'Knowledge Graph', icon: Share2 },
  ];

  return (
    <>
      <div className={`side-panel-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`side-panel ${open ? 'open' : ''}`}>
        <div className="side-panel-head">
          <strong>Reasoning & Diagnostics</strong>
          <button className="side-panel-close" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>
        </div>

        <div className="side-panel-tabs">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                className={`side-panel-tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="side-panel-body">
          {tab === 'router' && (
            <div className="side-panel-section">
              {modelUsed ? (
                <ModelBadge modelName={modelUsed} reason={routingReason} />
              ) : (
                <p className="side-panel-empty">No task routed yet.</p>
              )}
            </div>
          )}

          {tab === 'trace' && (
            <div className="side-panel-section">
              <AgentTraceView trace={trace} currentStep={currentStep} status={taskStatus} />
            </div>
          )}

          {tab === 'graph' && (
            <div className="side-panel-section">
              <CitationGraph
                trace={trace}
                content={resultData?.final_answer?.content || ''}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};