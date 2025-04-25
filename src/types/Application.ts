// src/types/Application.ts
export interface Application {
  app_id: string;
  app_name: string;
  app_url: string;
  platform: string;
  description: string;
  status: string;
  created_at: string;
  client?: {
    client_id: string;
    name: string;
    company: string;
  };
  test_cases?: Array<{
    test_id: string;
    test_title: string;
    test_steps: string;
    expected_result: string;
    priority: string;
    qa_id: string;
    qa_specialist?: {
      qa_id: string;
      name: string;
      email: string;
    };
  }>;
  
}

export interface CreateApplicationData {
app_name: string;
app_url: string;
platform: string;
description: string;
client_id: string;
status?: string;
}

export interface UpdateApplicationData {
app_name?: string;
app_url?: string;
platform?: string;
description?: string;
status?: string;
}

export interface ApplicationStatistics {
total_bug_reports: number;
critical_bugs: number;
validated_bugs: number;
total_testers: number;
// Add the new properties from your backend response
total_tasks?: number;
completed_tasks?: number;
in_progress_tasks?: number;
pending_validation?: number;
total_bugs?: number;
bugs_by_severity?: {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
};
bugs_by_status?: {
  Valid: number;
  Invalid: number;
  Pending: number;
};
}

export interface ApplicationProgress {
percentage: number;
total_test_cases: number;
completed_test_cases: number;
in_progress_test_cases: number;
not_started_test_cases: number;
// Add the new properties from your backend response
progress_percentage?: number;
total_bugs?: number;
valid_bugs?: number;
completed_tasks?: number;
timeline?: {
  created_at: string;
  updated_at: string;
  estimated_completion: string;
};
}