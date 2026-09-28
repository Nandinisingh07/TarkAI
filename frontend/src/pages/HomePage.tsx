import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  FileCheck,
  Activity,
  Database,
  Eye,
  Users,
  ArrowRight,
  Play,
  CheckCircle2,
  Radio,
  Bot,
  LockKeyhole,
  FileOutput,
  GitBranch,
} from 'lucide-react';

import { useTaskContext } from '../context/TaskContext';
import { fetchAirGapStatus, fetchReviewDrafts } from '../services/api';
import { ImageSlideshow } from '../components/ImageSlideshow';
import '../styles/tarkai-home.css';

const homeSlides = [
  {
    src: '/images/home/home1.jpg',
    alt: 'Government and critical infrastructure',
    caption: 'Sovereign AI Infrastructure',
  },
  {
    src: '/images/home/home2.jpg',
    alt: 'Industrial operations',
    caption: 'Intelligence for Critical Operations',
  },
  {
    src: '/images/home/home3.jpg',
    alt: 'Secure data infrastructure',
    caption: 'AI That Stays With Your Data',
  },
];

const hubs = [
  {
    title: 'AI Operations Assistant',
    description:
      'Interact with TarkAI through a secure local intelligence interface.',
    icon: Bot,
    path: '/assistant',
  },
  {
    title: 'Intelligent Model Router',
    description:
      'Automatically select the appropriate local model for each task.',
    icon: GitBranch,
    path: '/router',
  },
  {
    title: 'Agentic Reasoning Engine',
    description:
      'Execute multi-step ReAct workflows with observable execution traces.',
    icon: Cpu,
    path: '/reasoning',
  },
  {
    title: 'Multimodal Intelligence',
    description:
      'Process documents, images, OCR and visual operational data locally.',
    icon: Eye,
    path: '/tools',
  },
  {
    title: 'Knowledge Intelligence',
    description:
      'Retrieve grounded answers from approved local SOPs and knowledge bases.',
    icon: Database,
    path: '/knowledge',
  },
  {
    title: 'Approval Gate',
    description:
      'Keep sensitive and low-confidence outputs under human control.',
    icon: Users,
    path: '/approvals',
  },
  {
    title: 'Secure Operations',
    description:
      'Monitor air-gap status, network activity and security events.',
    icon: ShieldCheck,
    path: '/air-gap',
  },
  {
    title: 'Deliverable Factory',
    description:
      'Generate verified operational documents and reports locally.',
    icon: FileOutput,
    path: '/deliverables',
  },
];

const workflowSteps = [
  {
    number: '01',
    title: 'CONFIDENTIAL INPUT',
    description: 'Files, telemetry, images or operational queries',
  },
  {
    number: '02',
    title: 'LOCAL MODEL ROUTER',
    description: 'Select the appropriate on-premise model',
  },
  {
    number: '03',
    title: 'REACT AGENT',
    description: 'Reason, use tools and execute controlled steps',
  },
  {
    number: '04',
    title: 'KNOWLEDGE + TOOLS',
    description: 'Retrieve SOPs and process operational data',
  },
  {
    number: '05',
    title: 'HUMAN APPROVAL',
    description: 'Review sensitive or low-confidence results',
  },
  {
    number: '06',
    title: 'VERIFIED OUTPUT',
    description: 'Generate the final operational deliverable',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { taskStatus, trace, deliverable } = useTaskContext();

  const [airGapData, setAirGapData] = useState<any>(null);
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    fetchAirGapStatus()
      .then((res: any) => setAirGapData(res))
      .catch(() => { });

    fetchReviewDrafts('pending_review')
      .then((res: any[]) => {
        setPendingReviews(res?.length || 0);
      })
      .catch(() => { });
  }, []);

  const secure =
    airGapData?.external_calls_detected === 0 || airGapData === null;

  return (
    <main className="tarkai-home" id="main-content">

      <section className="tarkai-live-bar">
        <div className="tarkai-live-label">
          <span className="live-dot" />
          LIVE OPERATIONAL FEED
        </div>

        <div className="tarkai-live-message">
          <Radio size={14} />
          <span>
            {secure
              ? 'TarkAI operational • Local AI services active • External calls: 0'
              : 'Security monitoring requires attention'}
          </span>
        </div>

        <div className={secure ? 'status-ok' : 'status-alert'}>
          {secure ? 'SYSTEM SECURE' : 'CHECK STATUS'}
        </div>
      </section>

      <section className="tarkai-hero">

        <div className="tarkai-hero-copy">
          <div className="gov-tag">
            NATIONAL CONFIDENTIAL AI OPERATIONS PLATFORM
          </div>

          <h1>
            Intelligence That
            <span> Stays Where Your Data Stays.</span>
          </h1>

          <p>
            TarkAI is a sovereign, on-premise agentic AI platform designed
            for sensitive operational environments where confidential data
            cannot leave the organization.
          </p>

          <div className="hero-actions">
            <button
              className="hero-primary"
              onClick={() => navigate('/assistant')}
            >
              <Play size={16} />
              Run AI Operations
            </button>

            <button
              className="hero-secondary"
              onClick={() => navigate('/air-gap')}
            >
              View Security Status
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="hero-proof">
            <div>
              <strong>0</strong>
              <span>External Calls</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Local Processing</span>
            </div>

            <div>
              <strong>HITL</strong>
              <span>Human Control</span>
            </div>
          </div>
        </div>

        <div className="tarkai-hero-visual">
          <ImageSlideshow
            slides={homeSlides}
            height="420px"
          />
        </div>
      </section>

      <section className="tarkai-section">

        <div className="section-heading">
          <div>
            <span className="section-kicker">
              TARKAI PLATFORM
            </span>

            <h2>
              Secure Intelligence Command Center
            </h2>
          </div>

          <p>
            One controlled environment for local models, agentic reasoning,
            multimodal tools, knowledge retrieval and human approval.
          </p>
        </div>

        <div className="tarkai-metrics">

          <div className="metric-card">
            <ShieldCheck />
            <strong>0</strong>
            <span>External Calls</span>
            <small>Air-gap monitoring active</small>
          </div>

          <div className="metric-card">
            <Cpu />
            <strong>4</strong>
            <span>Local AI Models</span>
            <small>On-premise inference</small>
          </div>

          <div className="metric-card">
            <Activity />
            <strong>7</strong>
            <span>Security & AI Modules</span>
            <small>Integrated operations layer</small>
          </div>

          <div className="metric-card">
            <Users />
            <strong>HITL</strong>
            <span>Approval Control</span>
            <small>Human-in-the-loop workflow</small>
          </div>

        </div>
      </section>

      <section className="tarkai-assistant-panel">

        <div className="assistant-icon">
          <Bot size={28} />
        </div>

        <div className="assistant-content">

          <span className="section-kicker">
            TARKAI AI ASSISTANT
          </span>

          <h2>
            Ask. Analyze. Act. Locally.
          </h2>

          <p>
            Query operational data, search approved knowledge, analyze files
            and execute controlled AI workflows without sending sensitive
            information outside the environment.
          </p>

          <div className="assistant-examples">
            <span>Analyze telemetry</span>
            <span>Search SOPs</span>
            <span>Inspect documents</span>
            <span>Generate report</span>
          </div>

        </div>

        <button
          className="assistant-open"
          onClick={() => navigate('/assistant')}
        >
          Open Assistant
          <ArrowRight size={16} />
        </button>

      </section>

      <section className="tarkai-section">

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              CORE INTELLIGENCE HUBS
            </span>

            <h2>
              One Platform. Multiple Operational Capabilities.
            </h2>
          </div>

          <p>
            Every capability remains inside the controlled TarkAI environment.
          </p>

        </div>

        <div className="hub-grid">

          {hubs.map((hub) => {
            const Icon = hub.icon;

            return (
              <button
                key={hub.title}
                className="hub-card"
                onClick={() => navigate(hub.path)}
              >

                <div className="hub-icon">
                  <Icon size={20} />
                </div>

                <div className="hub-text">
                  <h3>{hub.title}</h3>
                  <p>{hub.description}</p>
                </div>

                <ArrowRight
                  className="hub-arrow"
                  size={17}
                />

              </button>
            );
          })}

        </div>
      </section>

      <section className="tarkai-workflow">

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              LIVE AI WORKFLOW
            </span>

            <h2>
              From Confidential Input to Verified Output
            </h2>
          </div>

        </div>

        <div className="workflow-line">

          {workflowSteps.map((step) => (
            <div
              className="workflow-step"
              key={step.number}
            >

              <div className="workflow-number">
                {step.number}
              </div>

              <h3>
                {step.title}
              </h3>

              <p>
                {step.description}
              </p>

            </div>
          ))}

        </div>
      </section>

      <section className="tarkai-section">

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              SYSTEM STATUS
            </span>

            <h2>
              Operational Readiness
            </h2>
          </div>

        </div>

        <div className="status-grid">

          <div className="status-card">

            <div className="status-card-head">
              <Activity size={19} />
              <span>Current Task</span>
            </div>

            <strong
              className={
                taskStatus === 'completed'
                  ? 'text-success'
                  : taskStatus === 'running'
                    ? 'text-running'
                    : ''
              }
            >
              {taskStatus === 'running'
                ? 'PROCESSING'
                : taskStatus === 'completed'
                  ? 'COMPLETED'
                  : 'STANDBY'}
            </strong>

            <p>
              {taskStatus === 'running'
                ? `${trace.length} execution steps recorded.`
                : 'No active operational task.'}
            </p>

            <button
              className="status-link"
              onClick={() => navigate('/assistant')}
            >
              Open Operations
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="status-card">

            <div className="status-card-head">
              <ShieldCheck size={19} />
              <span>Air-Gap Security</span>
            </div>

            <strong
              className={
                secure
                  ? 'text-success'
                  : 'text-alert'
              }
            >
              {secure ? 'SECURE' : 'ATTENTION'}
            </strong>

            <p>
              External calls detected:{' '}
              {airGapData?.external_calls_detected ?? 0}
            </p>

            <button
              className="status-link"
              onClick={() => navigate('/air-gap')}
            >
              Inspect Security
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="status-card">

            <div className="status-card-head">
              <FileCheck size={19} />
              <span>Approval Gate</span>
            </div>

            <strong
              className={
                pendingReviews > 0
                  ? 'text-warning'
                  : 'text-success'
              }
            >
              {pendingReviews > 0
                ? `${pendingReviews} PENDING`
                : 'CLEAR'}
            </strong>

            <p>
              Human review queue for sensitive outputs.
            </p>

            <button
              className="status-link"
              onClick={() => navigate('/approvals')}
            >
              Open Approval Gate
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="status-card">

            <div className="status-card-head">
              <FileOutput size={19} />
              <span>Latest Deliverable</span>
            </div>

            <strong>
              {deliverable ? 'AVAILABLE' : 'NONE'}
            </strong>

            <p>
              {deliverable
                ? deliverable.filename
                : 'No operational document generated yet.'}
            </p>

            {deliverable && (
              <a
                className="status-link"
                href={deliverable.download_url}
                download
              >
                Download
                <ArrowRight size={14} />
              </a>
            )}

          </div>

        </div>
      </section>

      <section className="security-banner">

        <div className="security-title">

          <LockKeyhole size={27} />

          <div>
            <span className="section-kicker">
              SECURITY ASSURANCE
            </span>

            <h2>
              Built for Data That Cannot Leave.
            </h2>
          </div>

        </div>

        <div className="security-points">

          <div>
            <CheckCircle2 />
            Local Model Inference
          </div>

          <div>
            <CheckCircle2 />
            Air-Gap Monitoring
          </div>

          <div>
            <CheckCircle2 />
            Human Approval Gate
          </div>

          <div>
            <CheckCircle2 />
            Audit Trail
          </div>

        </div>

      </section>

      <section className="tarkai-final">

        <div>

          <span className="section-kicker">
            NATIONAL CONFIDENTIAL AI OPERATIONS
          </span>

          <h2>
            When the data cannot leave,
            <br />
            the intelligence must come to it.
          </h2>

        </div>

        <button
          onClick={() => navigate('/assistant')}
          className="hero-primary"
        >
          Enter TarkAI
          <ArrowRight size={17} />
        </button>

      </section>

    </main>
  );
};
