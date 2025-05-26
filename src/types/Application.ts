// src/types/Application.ts
import { TestCase } from './TestCase';
import { ClientUser } from './Auth';

export interface Application {
  app_id: string;
  client_id?: string;
  app_name: string;
  app_url?: string;
  platform: string;
  description?: string;
  status: 'pending' | 'active' | 'Ready for Testing' | 'completed' | 'on-hold';
  max_testers: number;
  current_workers?: number;
  created_at: string;
  updated_at?: string;
  client?: Partial<ClientUser>;
  test_cases?: TestCase[];
  test_cases_count?: number;
}

export interface CreateApplicationData {
  client_id: string;
  app_name: string;
  app_url?: string;
  platform: string;
  description?: string;
  status?: 'pending' | 'active' | 'Ready for Testing' | 'completed' | 'on-hold';
  max_testers: number;
}

export interface UpdateApplicationData {
  app_name?: string;
  app_url?: string;
  platform?: string;
  description?: string;
  status?: 'pending' | 'active' | 'Ready for Testing' | 'completed' | 'on-hold';
  max_testers?: number;
}

export interface ApplicationStatistics {
  test_case_statistics: TestCaseStatistic[];
  summary: {
    total_bugs: number;
    critical_bugs: number;
    valid_bugs: number;
    invalid_bugs: number;
    pending_validation: number;
    total_test_cases: number;
  };
}

export interface TestCaseStatistic {
  test_id: string;
  test_title: string;
  priority: string;
  crowdworkers_count: number;
  tasks_by_status: {
    total: number;
    assigned: number;
    in_progress: number;
    completed: number;
    revision_required: number;
    verified: number;
    rejected: number;
  };
  total_bugs: number;
  critical_bugs: number;
  high_bugs: number;
  medium_bugs: number;
  low_bugs: number;
  valid_bugs: number;
  invalid_bugs: number;
  pending_validation: number;
}

export interface ApplicationProgress {
  tasks_by_status?: {
    total: number;
    assigned: number;
    in_progress: number;
    completed: number;
    revision_required: number;
    verified: number;
    rejected: number;
  };
  total_crowdworkers?: number;
  total_test_cases: number;
  total_possible_tasks?: number;
  percentage: number;
  completed_test_cases: number;
  in_progress_test_cases: number;
  not_started_test_cases: number;
  total_bugs?: number;
  valid_bugs?: number;
  invalid_bugs?: number;
  completed_tasks?: number;
  timeline?: {
    created_at: string;
    updated_at: string;
    estimated_completion: string;
  };
}