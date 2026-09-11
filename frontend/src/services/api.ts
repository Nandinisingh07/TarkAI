import { AirGapStatusData, TaskStatusResponse, TaskResultData } from '../types';

const API_BASE = '';

export async function fetchAirGapStatus(): Promise<AirGapStatusData> {
  const res = await fetch(`${API_BASE}/monitor/status`);
  if (!res.ok) throw new Error('Failed to fetch air-gap status');
  return res.json();
}

export async function submitTask(taskDescription: string, files: string[] = []): Promise<{ task_id: string; model_used: string; routing_reason: string }> {
  const res = await fetch(`${API_BASE}/api/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_description: taskDescription, files }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to submit task');
  }
  return res.json();
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`${API_BASE}/api/task/${taskId}/status`);
  if (!res.ok) throw new Error('Failed to fetch task status');
  return res.json();
}

export async function getTaskResult(taskId: string): Promise<TaskResultData> {
  const res = await fetch(`${API_BASE}/api/task/${taskId}/result`);
  if (!res.ok) throw new Error('Failed to fetch task result');
  return res.json();
}

export async function uploadFile(file: File): Promise<{ filename: string; saved_path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('File upload failed');
  return res.json();
}
