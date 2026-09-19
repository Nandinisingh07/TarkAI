import React from 'react';
import { Terminal, ShieldCheck, Plus } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { TaskForm } from '../components/TaskForm';
import { ModelBadge } from '../components/ModelBadge';
import { AgentTraceView } from '../components/AgentTraceView';
import { ResultView } from '../components/ResultView';
import { CitationGraph } from '../components/CitationGraph';
export const DashboardPage: React.FC = () => {
  const {
    modelUsed,
    routingReason,
    taskStatus,
    currentStep,
    trace,
    resultData,
    deliverable,
    isLoading,
    handleTaskSubmit,
    resetTask,
  } = useTaskContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header Strip */}
      <div className="page-header-strip">
        <div>
          <h1 className="page-title">
            <Terminal size={22} color="var(--accent-blue)" />
            Mission Console
          </h1>
          <p className="page-subtitle">
            Submit operational tasks, review AI analysis, and generate official confidential deliverables.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {taskStatus !== 'idle' && (
            <button
              id="new-task-btn"
              className="btn-outline"
              onClick={resetTask}
              disabled={isLoading}
              title="Clear current task and start a new one"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          )}
          <div className="status-badge nominal" style={{ padding: '6px 14px' }}>
            <ShieldCheck size={14} />
            <span>Air-Gapped Sovereign Workspace</span>
          </div>
        </div>
      </div>

      {/* Mission Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TaskForm onSubmit={handleTaskSubmit} isLoading={isLoading} />
          {modelUsed && <ModelBadge modelName={modelUsed} reason={routingReason} />}
        </div>

        <div>
          <AgentTraceView trace={trace} currentStep={currentStep} status={taskStatus} />
        </div>
      </div>

      {/* Deliverable & Executive Results Briefing */}
            {resultData && <ResultView result={resultData} deliverable={deliverable} />}
      {resultData && (
        <CitationGraph trace={trace} content={resultData?.final_answer?.content || ''} />
      )}
    </div>
  );
};
