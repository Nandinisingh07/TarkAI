import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { submitTask, getTaskStatus, getTaskResult } from '../services/api';
import { TraceStep, DeliverableInfo } from '../types';

interface TaskContextType {
  taskId: string | null;
  modelUsed: string;
  routingReason: string;
  taskStatus: string;
  currentStep: number;
  trace: TraceStep[];
  resultData: any;
  deliverable: DeliverableInfo | undefined;
  isLoading: boolean;
  wantDeliverable: boolean;
  setWantDeliverable: (v: boolean) => void;
  handleTaskSubmit: (prompt: string, files: string[]) => Promise<void>;
  cancelTask: () => void;
  resetTask: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [routingReason, setRoutingReason] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<string>('idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  const [deliverable, setDeliverable] = useState<DeliverableInfo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wantDeliverable, setWantDeliverable] = useState<boolean>(false);

  // When true, polling results are ignored (user pressed Stop).
  const cancelledRef = useRef<boolean>(false);

  useEffect(() => {
    if (!taskId || taskStatus === 'completed' || taskStatus === 'failed') return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      if (cancelledRef.current) return;
      try {
        const statusRes = await getTaskStatus(taskId);
        if (!isMounted || cancelledRef.current) return;

        setTaskStatus(statusRes.status);
        setCurrentStep(statusRes.current_step || 0);
        setTrace(statusRes.trace || []);
        setModelUsed(statusRes.model_used);
        setRoutingReason(statusRes.routing_reason || '');

        if (statusRes.status === 'completed') {
          clearInterval(pollInterval);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [taskId, taskStatus]);

  useEffect(() => {
    if (!taskId || taskStatus !== 'completed' || cancelledRef.current) return;

    let isMounted = true;
    (async () => {
      try {
        const resData = await getTaskResult(taskId);
        if (isMounted && !cancelledRef.current) {
          setResultData(resData.result);
          setDeliverable(resData.deliverable);
        }
      } catch (err) {
        console.error('Error fetching task result:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [taskId, taskStatus]);

  const handleTaskSubmit = async (prompt: string, files: string[]) => {
    cancelledRef.current = false;
    setIsLoading(true);
    setResultData(null);
    setDeliverable(undefined);
    setTrace([]);
    setTaskStatus('running');

    try {
      const res = await submitTask(prompt, files, wantDeliverable);
      setTaskId(res.task_id);
      setModelUsed(res.model_used);
      setRoutingReason(res.routing_reason);
    } catch (err: any) {
      alert('Task submission failed: ' + err.message);
      setIsLoading(false);
      setTaskStatus('failed');
    }
  };

  // Stops the UI from tracking/showing the current task. The backend's
  // background thread may still finish the Ollama call it already started
  // (no hard-kill of an in-flight model call in this architecture), but the
  // UI immediately stops polling and discards whatever result eventually
  // comes back for this task_id.
  const cancelTask = () => {
    cancelledRef.current = true;
    setIsLoading(false);
    setTaskStatus('idle');
    setCurrentStep(0);
  };

  const resetTask = () => {
    cancelledRef.current = false;
    setTaskId(null);
    setModelUsed('');
    setRoutingReason('');
    setTaskStatus('idle');
    setCurrentStep(0);
    setTrace([]);
    setResultData(null);
    setDeliverable(undefined);
    setIsLoading(false);
  };

  return (
    <TaskContext.Provider
      value={{
        taskId,
        modelUsed,
        routingReason,
        taskStatus,
        currentStep,
        trace,
        resultData,
        deliverable,
        isLoading,
        wantDeliverable,
        setWantDeliverable,
        handleTaskSubmit,
        cancelTask,
        resetTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};