import { 
  AirGapStatusData, 
  TaskStatusResponse, 
  TaskResultData,
  ModelRegistrySummary,
  ReviewDraft,
  ConfidenceStats,
  AuditLogEntry
} from '../types';

const API_BASE = '';

let currentUserRole = 'admin';

export function setUserRole(role: 'admin' | 'engineer' | 'viewer') {
  currentUserRole = role;
}

export function getUserRole(): string {
  return currentUserRole;
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'X-User-Role': currentUserRole,
    ...extraHeaders
  };
}

export async function fetchAirGapStatus(): Promise<AirGapStatusData> {
  const res = await fetch(`${API_BASE}/monitor/status`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch air-gap status');
  return res.json();
}

export async function fetchModelRegistry(): Promise<ModelRegistrySummary> {
  const res = await fetch(`${API_BASE}/api/model-registry`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch model registry profile');
  return res.json();
}

export async function submitTask(taskDescription: string, files: string[] = []): Promise<{ task_id: string; model_used: string; routing_reason: string }> {
  const res = await fetch(`${API_BASE}/api/task`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ task_description: taskDescription, files }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to submit task');
  }
  return res.json();
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`${API_BASE}/api/task/${taskId}/status`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch task status');
  return res.json();
}

export async function getTaskResult(taskId: string): Promise<TaskResultData> {
  const res = await fetch(`${API_BASE}/api/task/${taskId}/result`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch task result');
  return res.json();
}

export async function fetchReviewDrafts(status?: string): Promise<ReviewDraft[]> {
  const url = status ? `${API_BASE}/api/reviews?status=${status}` : `${API_BASE}/api/reviews`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch review drafts');
  return res.json();
}

export async function fetchReviewDetail(reviewId: string): Promise<ReviewDraft> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch review detail');
  return res.json();
}

export async function approveReviewDraft(reviewId: string, comment: string = ''): Promise<ReviewDraft> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/approve`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: 'approved', comment })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to approve draft');
  }
  return res.json();
}

export async function rejectReviewDraft(reviewId: string, comment: string = ''): Promise<ReviewDraft> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/reject`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: 'rejected', comment })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to reject draft');
  }
  return res.json();
}

export async function fetchConfidenceStats(): Promise<ConfidenceStats> {
  const res = await fetch(`${API_BASE}/api/confidence/stats`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch confidence stats');
  return res.json();
}

export async function fetchAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/api/audit/logs?limit=${limit}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function uploadFile(file: File): Promise<{ filename: string; saved_path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { 'X-User-Role': currentUserRole },
    body: formData,
  });
  if (!res.ok) throw new Error('File upload failed');
  return res.json();
}

