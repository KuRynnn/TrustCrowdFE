// src/types/BugReport.ts
import { BugSeverity } from "@/constants";
import { TestEvidence } from "./TestEvidence";

export interface BugReport {
  bug_id: string;
  task_id: string;
  worker_id: string;
  bug_description: string;
  steps_to_reproduce: string;
  severity: BugSeverity;
  screenshot_url?: string; // Keep for backward compatibility
  created_at: string;
  updated_at: string;
  // Add revision tracking fields
  is_revision: boolean;
  revision_number: number;
  original_bug_id?: string;
  // Add evidence collection
  evidence?: TestEvidence[];
  // Relationships
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
  // For revision relationships
  original_bug_report?: BugReport;
  revisions?: BugReport[];
}

export interface CreateBugReportData {
  task_id: string;
  worker_id: string;
  bug_description: string;
  steps_to_reproduce: string;
  severity: BugSeverity;
  screenshot_url?: string; // Keep for backward compatibility
}

export interface CreateBugRevisionData {
  original_bug_id: string;
  bug_description: string;
  steps_to_reproduce: string;
  severity: BugSeverity;
  screenshot_url?: string; // Keep for backward compatibility
}

// Update this interface to allow null values for steps_to_reproduce
export interface UpdateBugReportData {
  task_id?: string;
  worker_id?: string;
  bug_description?: string;
  steps_to_reproduce?: string | null;  // Allow null here
  severity?: BugSeverity;
  screenshot_url?: string;
}