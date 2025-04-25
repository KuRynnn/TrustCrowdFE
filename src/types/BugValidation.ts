// src/types/BugValidation.ts

import { ValidationStatus } from '@/constants';

export interface BugValidation {
  validation_id: string;
  bug_id: string;
  qa_id: string;
  validation_status: ValidationStatus;
  comments: string;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  validation_time?: number;
  bug_report?: {
    bug_id: string;
    bug_description: string;
    severity: string;
    steps_to_reproduce: string;
    screenshot_url?: string;
  };
  qa_specialist?: {
    qa_id: string;
    name: string;
    email: string;
  };
  application_details?: {
    app_name: string;
    app_id: string;
  };
}

export interface CreateBugValidationData {
  bug_id: string;
  qa_id: string;
  validation_status: ValidationStatus;
  comments: string;
  validated_at?: string;
}

export interface UpdateBugValidationData {
  qa_id?: string;
  validation_status?: ValidationStatus;
  comments?: string;
  validated_at?: string;
}

export interface BugValidationStatistics {
  total_validations: number;
  valid_bugs: number;
  invalid_bugs: number;
  needs_more_info: number;
  average_validation_time: number;
}
