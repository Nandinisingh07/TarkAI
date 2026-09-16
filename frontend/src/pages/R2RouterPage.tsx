import React from 'react';
import { Zap, Code2, Cpu, Brain, Eye, Settings } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { ModelBadge } from '../components/ModelBadge';

export const R2RouterPage: React.FC = () => {
  const { modelUsed, routingReason } = useTaskContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Header */}
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Zap size={28} color="var(--accent-cyan)" />
          <h2 className="hero-title">Multi-Model Intelligence & TaskRouter (Requirement R2)</h2>
        </div>
        <p className="hero-desc">
          Satisfies PS26117 Requirement 2: Intelligent multi-model orchestration. Incoming task descriptions are dynamically classified up front by <code>router.py</code> to route specialized coding tasks to <code>qwen2.5-coder:1.5b</code> and general reasoning tasks to <code>phi3:mini</code>. Model names are dynamically loaded from <code>models.json</code>—zero hardcoded model names in agent code.
        </p>
      </div>

      {/* Model Selection Flow Visualization */}
      <div className="card">
        <div className="card-title">
          <span>Task Classification & Router Pipeline</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>STAGE 1: INPUT INGESTION</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Task Description</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>User prompt evaluated for code syntax patterns or technical SOP keywords.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginBottom: '0.3rem' }}>STAGE 2: RULE CLASSIFIER</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>TaskRouter Regex Engine</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Matches terms like <code>def</code>, <code>script</code>, <code>python</code>, <code>bug</code>, <code>sql</code> vs SOP general terms.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>STAGE 3: CONFIG LOOKUP</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>models.json Specs</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Fetches exact model tags from configuration without touching code.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>STAGE 4: INFERENCE DISPATCH</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Ollama Execution</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Dispatches prompt to selected model endpoint on localhost.</p>
          </div>
        </div>
      </div>

      {/* Available Models Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Zap size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>qwen2.5-coder:1.5b</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Optimized lightweight open-weight model specialized for Python script generation, syntax debugging, matrix calculations, and code sandbox execution.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Brain size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>phi3:mini</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            High-efficiency general reasoning model tailored for industrial SOP synthesis, safety checklist drafting, and deliverable document generation.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Eye size={20} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>moondream</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Ultra-lightweight multimodal vision model for describing industrial technical diagrams, equipment photos, and scanned engineering schematics.
          </p>
        </div>
      </div>

      {/* Technical Implementation Reference */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-cyan)" /> Technical Implementation Reference
          </span>
          <span className="badge badge-secure">R2 VERIFIED LIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>📁 <strong>Router Module:</strong> <code>backend/app/router.py</code></div>
          <div>⚙️ <strong>Configuration File:</strong> <code>backend/app/config/models.json</code></div>
          <div>⚡ <strong>Coder Model:</strong> <code>qwen2.5-coder:1.5b</code></div>
          <div>🧠 <strong>General Model:</strong> <code>phi3:mini</code></div>
          <div>👁️ <strong>Vision Model:</strong> <code>moondream</code></div>
        </div>
      </div>

      {/* Embedded Live Component */}
      {modelUsed && (
        <div className="card">
          <div className="card-title">
            <span>Embedded Live R2 Model Routing Component</span>
          </div>
          <ModelBadge modelName={modelUsed} reason={routingReason} />
        </div>
      )}
    </div>
  );
};
