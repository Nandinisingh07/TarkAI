export interface AirGapStatusData {
  air_gapped: boolean;
  external_calls_detected: number;
  status: 'SECURE' | 'WARNING';
  log: string[];
  timestamp: string;
}

export interface TraceStep {
  step: number;
  thought: string;
  action: string;
  action_input: any;
  observation: string;
  status: 'in_progress' | 'completed';
}

export interface DeliverableInfo {
  format: 'docx' | 'pptx' | 'xlsx' | 'text';
  filename: string;
  download_url: string;
}

export interface TaskResultData {
  task_id: string;
  status: 'running' | 'completed' | 'failed' | string;
  model_used: string;
  routing_reason?: string;
  current_step?: number;
  trace?: TraceStep[];
  result?: {
    task_id: string;
    model_used: string;
    routing_reason: string;
    status: string;
    final_answer: {
      output_format: 'text' | 'docx' | 'pptx' | 'xlsx';
      content: any;
    };
    raw_response?: string;
  };
  deliverable?: DeliverableInfo;
}

export type TaskStatusResponse = TaskResultData;

export interface ModelRegistrySummary {
  profile_name: string;
  general_model: string;
  coding_model: string;
  vision_model: string;
  ocr_engine: string;
  object_detection_model: string;
  confidence_threshold: number;
  loaded_from: string;
}

export interface ReviewDraft {
  review_id: string;
  job_id: string;
  title: string;
  deliverable_type: string;
  content: any;
  reasoning_trace: TraceStep[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  mandatory_review: boolean;
  created_at: string;
  reviewed_at?: string;
  reviewer_role?: string;
  review_comment?: string;
}

export interface ConfidenceStats {
  total_calls: number;
  average_confidence: number;
  low_confidence_pct: number;
  flagged_count: number;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  action: string;
  resource: string;
  user_role: string;
  status: string;
  details: Record<string, any>;
}

export interface TaskTimings {
  total_duration_seconds: number;
  agent_reasoning_seconds: number;
  deliverable_generation_seconds: number;
}

