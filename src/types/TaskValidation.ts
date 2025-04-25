export interface TaskValidation {
  validation_id: string;
  task_id: string;
  qa_id: string;
  validation_status: 'Pass Verified' | 'Rejected' | 'Need Revision';
  comments?: string;
  validated_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskValidationRequest {
  task_id: string;
  qa_id: string;
  validation_status: 'Pass Verified' | 'Rejected' | 'Need Revision';
  comments?: string;
}

export interface TaskValidationResponse {
  status: string;
  message: string;
  data: TaskValidation;
}

export interface TaskReadinessResponse {
  status: string;
  message: string;
  data: {
    is_ready: boolean;
    total_bug_reports: number;
    validated_bug_reports: number;
    unvalidated_bug_reports: number;
    task_status: string;
    bug_validations: Array<{
      bug_id: string;
      validation_status: string;
      comments: string;
    }>;
  };
}
