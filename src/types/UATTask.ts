// src/types/UATTask.ts
import { UATTaskStatus } from '@/constants';
import { TestCase } from './TestCase';
import { BugReport } from './BugReport';
import { TestEvidence } from './TestEvidence';

export interface UATTask {
  task_id: string;
  app_id: string;
  test_id: string;
  worker_id: string;
  status: UATTaskStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // New revision tracking fields
  revision_count?: number;
  revision_status?: string; // 'None', 'Requested', 'In Progress', 'Completed'
  revision_comments?: string | null;
  last_revised_at?: string | null;
  // Original fields
  duration?: number;
  bug_reports_count?: number;
  // Add evidence collection
  evidence?: TestEvidence[];
  evidence_count?: number;
  application?: {
    app_id: string;
    app_name: string;
    app_url: string;
  };
  test_case?: TestCase;
  crowdworker?: {
    worker_id: string;
    name: string;
    email: string;
  };
  // Use the full BugReport type instead of a limited inline type
  bug_reports?: BugReport[];
  task_validation?: {
    validation_id: string;
    task_id: string;
    qa_id: string;
    validation_status: string;
    comments?: string;
    validated_at: string;
  };
}

export interface CreateUATTaskData {
  app_id: string;
  test_id: string;
  worker_id: string;
  status: UATTaskStatus;
  started_at?: string;
  completed_at?: string;
}

export interface UpdateUATTaskData {
  app_id?: string;
  test_id?: string;
  worker_id?: string;
  status?: UATTaskStatus;
  started_at?: string;
  completed_at?: string;
}

export interface UATTaskStatistics {
  total_tasks: number;
  assigned_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  average_duration: number;
  total_bug_reports: number;
}

export interface UATTaskProgress {
  task_status: string;
  percentage: number;
  duration_minutes: number | null;
  started_at: string | null;
  bugs_found: number;
  completion_eta?: string | null;
}

export interface UATTaskFilters {
  status?: UATTaskStatus;
  app_id?: string;
  worker_id?: string;
  page?: number;
  per_page?: number;
}