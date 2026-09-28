import React from 'react';
import {
  BrainCircuit,
  Workflow,
  Lightbulb,
  Zap,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Terminal,
  ArrowRight,
  Cpu,
  Clock3
} from 'lucide-react';

import '../styles/agent-reasoning.css';
import { useTaskContext } from '../context/TaskContext';

export const AgentReasoningPage: React.FC = () => {
  const {
    taskStatus,
    currentStep,
    trace,
    modelUsed,
    routingReason
  } = useTaskContext();

  const steps = [
    {
      number: '01',
      title: 'THOUGHT',
      subtitle: 'Reasoning',
      icon: Lightbulb,
      color: 'blue',
      description: 'The agent analyses the objective and determines the next reasoning step.'
    },
    {
      number: '02',
      title: 'ACTION',
      subtitle: 'Tool Selection',
      icon: Zap,
      color: 'teal',
      description: 'The agent selects the appropriate local tool for the current task.'
    },
    {
      number: '03',
      title: 'OBSERVATION',
      subtitle: 'Tool Result',
      icon: Eye,
      color: 'green',
      description: 'Tool output is returned to the reasoning loop as new context.'
    },
    {
      number: '04',
      title: 'DECISION',
      subtitle: 'Next Step',
      icon: BrainCircuit,
      color: 'amber',
      description: 'The agent evaluates the result and continues or produces the final answer.'
    }
  ];

  const status =
    taskStatus === 'running'
      ? 'LIVE EXECUTION'
      : taskStatus === 'completed'
        ? 'EXECUTION COMPLETE'
        : 'ENGINE READY';

  return (
    <div className="r3-redesign">

      {/* HERO */}
      <section className="r3-hero">
        <div className="r3-hero-glow" />

        <div className="r3-hero-content">
          <div className="r3-eyebrow">
            <span className="r3-live-dot" />
            R3 · AGENTIC REASONING ENGINE
          </div>

          <h1>
            ReAct AI
            <span> Reasoning Engine</span>
          </h1>

          <p>
            A local, multi-step reasoning loop that transforms an operational
            objective into verified actions, tool observations and a final
            answer — without sending confidential data outside the environment.
          </p>

          <div className="r3-hero-status">
            <div>
              <Activity size={15} />
              <span>{status}</span>
            </div>

            <div>
              <ShieldCheck size={15} />
              <span>LOCAL INFERENCE</span>
            </div>

            <div>
              <Workflow size={15} />
              <span>MAX 8 STEPS</span>
            </div>
          </div>
        </div>

        <div className="r3-hero-engine">
          <div className="r3-engine-ring ring-one" />
          <div className="r3-engine-ring ring-two" />
          <div className="r3-engine-core">
            <BrainCircuit size={38} />
            <strong>ReAct</strong>
            <small>ENGINE</small>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="r3-section">
        <div className="r3-section-heading">
          <div>
            <span>REASONING PIPELINE</span>
            <h2>How TarkAI thinks</h2>
          </div>

          <div className="r3-mini-badge">
            THOUGHT → ACTION → OBSERVATION
          </div>
        </div>

        <div className="r3-pipeline">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <React.Fragment key={step.number}>
                <div className={`r3-pipeline-card ${step.color}`}>
                  <div className="r3-card-top">
                    <span className="r3-step-number">
                      {step.number}
                    </span>

                    <Icon size={21} />
                  </div>

                  <div className="r3-pipeline-title">
                    {step.title}
                  </div>

                  <div className="r3-pipeline-subtitle">
                    {step.subtitle}
                  </div>

                  <p>{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight className="r3-pipeline-arrow" size={18} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* LIVE TRACE */}
      <section className="r3-section">

        <div className="r3-section-heading">
          <div>
            <span>LIVE AGENT TRACE</span>
            <h2>Reasoning Execution</h2>
          </div>

          <div className={`r3-execution-status ${taskStatus}`}>
            <span />
            {status}
          </div>
        </div>

        <div className="r3-trace-shell">

          <div className="r3-trace-header">
            <div>
              <Terminal size={17} />
              <strong>ReAct Execution Timeline</strong>
            </div>

            <div className="r3-step-counter">
              STEP {currentStep || 0} / 8
            </div>
          </div>

          <div className="r3-trace-body">

            {trace && trace.length > 0 ? (
              trace.map((item: any, index: number) => {

                const thought =
                  item.thought ||
                  item.Thought ||
                  item.reasoning ||
                  '';

                const action =
                  item.action ||
                  item.Action ||
                  '';

                const observation =
                  item.observation ||
                  item.Observation ||
                  item.result ||
                  '';

                return (
                  <div className="r3-trace-item" key={index}>

                    <div className="r3-timeline-marker">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <div className="r3-trace-card">

                      <div className="r3-trace-card-header">
                        <div>
                          <span className="r3-trace-index">
                            ITERATION {String(index + 1).padStart(2, '0')}
                          </span>

                          <strong>
                            Agent Reasoning Cycle
                          </strong>
                        </div>

                        <CheckCircle2 size={18} />
                      </div>

                      <div className="r3-reasoning-grid">

                        <div className="r3-reasoning-box thought">
                          <div className="r3-box-label">
                            <Lightbulb size={14} />
                            THOUGHT
                          </div>

                          <div className="r3-box-content">
                            {thought || 'Reasoning context generated by local model.'}
                          </div>
                        </div>

                        <div className="r3-reasoning-box action">
                          <div className="r3-box-label">
                            <Zap size={14} />
                            ACTION
                          </div>

                          <div className="r3-box-content">
                            {action || 'Awaiting tool decision.'}
                          </div>
                        </div>

                        <div className="r3-reasoning-box observation">
                          <div className="r3-box-label">
                            <Eye size={14} />
                            OBSERVATION
                          </div>

                          <div className="r3-box-content">
                            {observation || 'Waiting for tool execution result.'}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="r3-empty-state">
                <div className="r3-empty-icon">
                  <BrainCircuit size={28} />
                </div>

                <h3>Reasoning engine ready</h3>

                <p>
                  Start a task from the Mission Console to observe
                  the live Thought → Action → Observation loop here.
                </p>

                <div className="r3-empty-flow">
                  <span>INPUT</span>
                  <ArrowRight size={14} />
                  <span>REASON</span>
                  <ArrowRight size={14} />
                  <span>ACT</span>
                  <ArrowRight size={14} />
                  <span>VERIFY</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ENGINE STATUS */}
      <section className="r3-engine-grid">

        <div className="r3-status-card">
          <div className="r3-status-icon blue">
            <Cpu size={20} />
          </div>

          <div>
            <span>ACTIVE MODEL</span>
            <strong>{modelUsed || 'Awaiting task'}</strong>
            <small>{routingReason || 'Model selected by TarkAI router'}</small>
          </div>
        </div>

        <div className="r3-status-card">
          <div className="r3-status-icon teal">
            <Workflow size={20} />
          </div>

          <div>
            <span>REASONING MODE</span>
            <strong>ReAct Agent Loop</strong>
            <small>Dynamic tool selection and observation feedback</small>
          </div>
        </div>

        <div className="r3-status-card">
          <div className="r3-status-icon green">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>EXECUTION BOUNDARY</span>
            <strong>On-Premise</strong>
            <small>No external inference dependency</small>
          </div>
        </div>

        <div className="r3-status-card">
          <div className="r3-status-icon amber">
            <Clock3 size={20} />
          </div>

          <div>
            <span>MAX ITERATIONS</span>
            <strong>8 Steps</strong>
            <small>Self-correcting reasoning cycle</small>
          </div>
        </div>

      </section>

      {/* SECURITY */}
      <section className="r3-security">

        <div className="r3-security-main">
          <div className="r3-security-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <span>SECURE AGENTIC EXECUTION</span>
            <h2>Reasoning stays inside the sovereign workspace.</h2>
            <p>
              TarkAI executes model inference, tool calls and reasoning
              locally so confidential operational context remains inside
              the controlled environment.
            </p>
          </div>
        </div>

        <div className="r3-security-points">
          <div>✓ Local Model Inference</div>
          <div>✓ Controlled Tool Execution</div>
          <div>✓ Human Approval Ready</div>
          <div>✓ Auditable Reasoning Trace</div>
        </div>

      </section>

    </div>
  );
};
