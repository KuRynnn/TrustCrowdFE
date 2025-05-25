// src/types/TestCase.ts
import { TestCasePriority } from '@/constants';

export interface TestCase {
  test_id: string;
  app_id: string;
  qa_id: string;
  test_title: string;
  given_context: string;  // Changed from test_steps
  when_action: string;    // New field
  then_result: string;    // Changed from expected_result
  priority: TestCasePriority;
  created_at: string;
  updated_at: string;
  application?: {
    app_id: string;
    app_name: string;
    app_url: string;
  };
  qa_specialist?: {
    qa_id: string;
    name: string;
    email: string;
  };
  uat_tasks?: Array<{
    task_id: string;
    status: string;
    assigned_to: string;
    completed_at: string | null;
  }>;
}

export interface CreateTestCaseData {
  app_id: string;
  qa_id: string;
  test_title: string;
  given_context: string;  // Changed from test_steps
  when_action: string;    // New field
  then_result: string;    // Changed from expected_result
  priority: TestCasePriority;
}

export interface UpdateTestCaseData {
  app_id?: string;
  qa_id?: string;
  test_title?: string;
  given_context?: string;  // Changed from test_steps
  when_action?: string;    // New field
  then_result?: string;    // Changed from expected_result
  priority?: TestCasePriority;
}

export interface TestCaseStatistics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  not_started_tasks: number;
  bug_reports: number;
}