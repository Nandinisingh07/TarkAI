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
  status: 'running' | 'completed' | 'failed';
  model_used: string;
  routing_reason?: string;
  result?: {
    task_id: string;
    model_used: string;
    routing_reason: string;
    status: string;
    final_answer: {
      output_format: 'text' | 'docx' | 'pptx' | 'xlsx';
      content: any;
    };
    raw_response: string;
  };
  deliverable?: DeliverableInfo;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'running' | 'completed' | 'failed';
  model_used: string;
  routing_reason: string;
  current_step: number;
  trace: TraceStep[];
}
