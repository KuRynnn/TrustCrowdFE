// src/types/UATTask.ts

import { UATTaskStatus } from '@/constants';
import { TestCase } from './TestCase';

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
  duration?: number;
  bug_reports_count?: number;
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
  bug_reports?: Array<{
    bug_id: string;
    title?: string;
    severity: string;
    steps_to_reproduce?: string;
    bug_description?: string; 
    created_at?: string;
    validation_status?: string;
  }>;
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