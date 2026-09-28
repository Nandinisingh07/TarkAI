import React, { useState } from 'react';
import {
  Zap,
  Code2,
  Brain,
  Eye,
  ArrowRight,
  ShieldCheck,
  Activity,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Network,
  LockKeyhole,
  Database
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { ModelBadge } from '../components/ModelBadge';
import '../styles/model-router.css';

const stages = [
  {
    number: '01',
    label: 'INPUT',
    title: 'Task Ingestion',
    desc: 'Natural-language request enters the local routing engine.',
    icon: Database,
    tone: 'blue'
  },
  {
    number: '02',
    label: 'CLASSIFY',
    title: 'Task Classification',
    desc: 'Keywords and task type determine the required capability.',
    icon: Network,
    tone: 'cyan'
  },
  {
    number: '03',
    label: 'SELECT',
    title: 'Model Selection',
    desc: 'Configuration maps the task to the appropriate local model.',
    icon: Cpu,
    tone: 'green'
  },
  {
    number: '04',
    label: 'DISPATCH',
    title: 'Local Inference',
    desc: 'Prompt is dispatched to Ollama on the local machine.',
    icon: Zap,
    tone: 'amber'
  }
];

const models = [
  {
    icon: Code2,
    name: 'qwen2.5-coder:1.5b',
    type: 'CODING',
    status: 'READY',
    tone: 'blue',
    desc: 'Python generation, debugging, calculations and code execution.',
    capabilities: ['Python', 'Debugging', 'Code']
  },
  {
    icon: Brain,
    name: 'phi3:mini',
    type: 'GENERAL REASONING',
    status: 'READY',
    tone: 'green',
    desc: 'SOP analysis, reasoning, summaries and operational documents.',
    capabilities: ['SOP', 'Reasoning', 'Text']
  },
  {
    icon: Eye,
    name: 'moondream',
    type: 'VISION',
    status: 'READY',
    tone: 'amber',
    desc: 'Local visual understanding of equipment images and diagrams.',
    capabilities: ['Images', 'OCR', 'Vision']
  }
];

export const ModelRouterPage: React.FC = () => {
  const { modelUsed, routingReason } = useTaskContext();
  const [activeStage, setActiveStage] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const currentModel = selectedModel || modelUsed;

  return (
    <div className="tarkai-router-page">

      {/* HERO */}
      <section className="router-hero">
        <div className="router-hero-grid">
          <div className="router-hero-copy">
            <div className="router-eyebrow">
              <span className="live-dot" />
              R2 · INTELLIGENT MODEL ROUTER
            </div>

            <h1>
              The right model.
              <span> For every mission.</span>
            </h1>

            <p>
              TarkAI classifies each operational request and dispatches it
              to the appropriate local model without sending confidential
              data outside the environment.
            </p>

            <div className="router-hero-actions">
              <div className="hero-status">
                <ShieldCheck size={17} />
                <span>AIR-GAPPED ROUTING</span>
              </div>

              <div className="hero-status">
                <LockKeyhole size={16} />
                <span>LOCAL INFERENCE</span>
              </div>
            </div>
          </div>

          <div className="router-command-card">
            <div className="command-top">
              <div>
                <span className="command-kicker">ROUTER STATUS</span>
                <strong>OPERATIONAL</strong>
              </div>
              <div className="command-pulse">
                <span />
                LIVE
              </div>
            </div>

            <div className="command-stat">
              <span>Active Models</span>
              <strong>03</strong>
            </div>

            <div className="command-stat">
              <span>External Calls</span>
              <strong>00</strong>
            </div>

            <div className="command-stat">
              <span>Inference Location</span>
              <strong>LOCAL</strong>
            </div>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="router-section">
        <div className="section-heading">
          <div>
            <span className="section-number">ROUTING PIPELINE</span>
            <h2>How TarkAI decides</h2>
            <p>Follow the request from input to local model inference.</p>
          </div>

          <div className="pipeline-live">
            <Activity size={15} />
            ROUTER ENGINE LIVE
          </div>
        </div>

        <div className="router-pipeline">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const active = activeStage === index;

            return (
              <React.Fragment key={stage.number}>
                <button
                  type="button"
                  className={`pipeline-node ${active ? 'active' : ''} tone-${stage.tone}`}
                  onClick={() => setActiveStage(index)}
                >
                  <div className="pipeline-node-top">
                    <span>{stage.number}</span>
                    <Icon size={19} />
                  </div>

                  <div className="pipeline-label">{stage.label}</div>
                  <h3>{stage.title}</h3>
                  <p>{stage.desc}</p>

                  <div className="pipeline-more">
                    VIEW STAGE <ChevronRight size={13} />
                  </div>
                </button>

                {index < stages.length - 1 && (
                  <div className="pipeline-arrow">
                    <ArrowRight size={19} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="stage-detail">
          <div className="stage-detail-icon">
            {React.createElement(stages[activeStage].icon, { size: 22 })}
          </div>

          <div>
            <span>ACTIVE PIPELINE STAGE · {stages[activeStage].number}</span>
            <strong>{stages[activeStage].title}</strong>
            <p>{stages[activeStage].desc}</p>
          </div>

          <div className="stage-progress">
            {stages.map((_, i) => (
              <span key={i} className={i <= activeStage ? 'filled' : ''} />
            ))}
          </div>
        </div>
      </section>

      {/* MODEL FLEET */}
      <section className="router-section">
        <div className="section-heading">
          <div>
            <span className="section-number">LOCAL MODEL FLEET</span>
            <h2>Mission-ready intelligence</h2>
            <p>Each model has a defined operational role inside TarkAI.</p>
          </div>
        </div>

        <div className="model-fleet">
          {models.map((model) => {
            const Icon = model.icon;
            const active = currentModel === model.name;

            return (
              <button
                type="button"
                key={model.name}
                className={`model-card tone-${model.tone} ${active ? 'selected' : ''}`}
                onClick={() => setSelectedModel(model.name)}
              >
                <div className="model-card-glow" />

                <div className="model-card-header">
                  <div className="model-icon">
                    <Icon size={23} />
                  </div>

                  <div className="model-status">
                    <span />
                    {model.status}
                  </div>
                </div>

                <div className="model-type">{model.type}</div>

                <h3>{model.name}</h3>

                <p>{model.desc}</p>

                <div className="capability-row">
                  {model.capabilities.map((cap) => (
                    <span key={cap}>{cap}</span>
                  ))}
                </div>

                <div className="model-card-footer">
                  <span>{active ? 'ACTIVE ROUTE' : 'LOCAL MODEL'}</span>
                  <ChevronRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* LIVE ROUTING RESULT */}
      <section className="live-routing-panel">
        <div className="live-routing-header">
          <div>
            <span className="section-number">LIVE ROUTING DECISION</span>
            <h2>Current dispatch</h2>
          </div>

          <div className="verified-pill">
            <CheckCircle2 size={15} />
            LOCAL POLICY VERIFIED
          </div>
        </div>

        {modelUsed ? (
          <div className="routing-result-content">
            <div className="route-source">
              <span>REQUEST</span>
              <strong>Operational Task</strong>
            </div>

            <ArrowRight className="route-result-arrow" size={24} />

            <div className="route-model">
              <span>SELECTED MODEL</span>
              <ModelBadge
                modelName={modelUsed}
                reason={routingReason}
              />
            </div>

            <div className="route-reason">
              <span>ROUTING REASON</span>
              <strong>{routingReason || 'Policy-based local model selection'}</strong>
            </div>
          </div>
        ) : (
          <div className="no-route-state">
            <div className="no-route-icon">
              <Zap size={24} />
            </div>
            <div>
              <strong>Router standing by</strong>
              <p>
                Submit a task from the Mission Console to see the live
                model-selection decision here.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* TECHNICAL TRUST */}
      <section className="router-trust-grid">
        <div className="trust-card">
          <div className="trust-icon"><Code2 size={20} /></div>
          <span>ROUTER MODULE</span>
          <strong>backend/app/router.py</strong>
          <p>Classification and model dispatch logic.</p>
        </div>

        <div className="trust-card">
          <div className="trust-icon"><Database size={20} /></div>
          <span>MODEL POLICY</span>
          <strong>config/models.json</strong>
          <p>Local model configuration and routing targets.</p>
        </div>

        <div className="trust-card">
          <div className="trust-icon"><ShieldCheck size={20} /></div>
          <span>SECURITY BOUNDARY</span>
          <strong>OLLAMA · LOCALHOST</strong>
          <p>Inference remains inside the local environment.</p>
        </div>
      </section>

    </div>
  );
};
