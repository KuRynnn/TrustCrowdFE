// src/types/BugReport.ts
import { BugSeverity } from "@/constants";

export interface BugReport {
  bug_id: string;
  task_id: string;
  worker_id: string;
  bug_description: string;
  steps_to_reproduce: string;
  severity: BugSeverity;
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
  // Remove validation_status directly on the bug report as it doesn't exist in your model
  uat_task?: {
    task_id: string;
    task_title: string;
    application?: {
      app_id: string;
      app_name: string;
    };
  };
  crowdworker?: {
    worker_id: string;
    name: string;
  };
  validation?: {
    validation_id: string;
    bug_id: string;
    qa_id: string;
    validation_status: string;
    comments: string;
    validated_at: string;
    created_at: string;
    updated_at: string;
    qaSpecialist?: {
      qa_id: string;
      name: string;
    };
  };
}

export interface CreateBugReportData {
  task_id: string;
  worker_id: string;
  bug_description: string;
  steps_to_reproduce: string;
  severity: BugSeverity;
  screenshot_url?: string;
}

export interface UpdateBugReportData extends Partial<CreateBugReportData> {}