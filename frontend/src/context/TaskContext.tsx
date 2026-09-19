import React, { createContext, useContext, useState, useEffect } from 'react';
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
  handleTaskSubmit: (prompt: string, files: string[]) => Promise<void>;
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

    // Poll active task status
  useEffect(() => {
    if (!taskId || taskStatus === 'completed' || taskStatus === 'failed') return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await getTaskStatus(taskId);
        if (!isMounted) return;

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

  // Fetch final result once task is completed (separate effect avoids
  // the polling-interval's isMounted cleanup racing with this await)
  useEffect(() => {
    if (!taskId || taskStatus !== 'completed') return;

    let isMounted = true;
    (async () => {
      try {
        const resData = await getTaskResult(taskId);
        if (isMounted) {
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
    setIsLoading(true);
    setResultData(null);
    setDeliverable(undefined);
    setTrace([]);
    setTaskStatus('running');

    try {
      const res = await submitTask(prompt, files);
      setTaskId(res.task_id);
      setModelUsed(res.model_used);
      setRoutingReason(res.routing_reason);
    } catch (err: any) {
      alert('Task submission failed: ' + err.message);
      setIsLoading(false);
      setTaskStatus('failed');
    }
  };

  const resetTask = () => {
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
        handleTaskSubmit,
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
