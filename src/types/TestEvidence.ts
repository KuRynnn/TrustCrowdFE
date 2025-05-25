// src/types/TestEvidence.ts
export interface TestEvidence {
  evidence_id: string;
  bug_id?: string;
  task_id?: string;
  step_number: number;
  step_description: string;
  screenshot_url: string;
  notes?: string;
  context?: string;  // New field to specify which part of Given-When-Then
  created_at: string;
  updated_at: string;
}

export interface CreateTestEvidenceData {
  step_number: number;
  step_description: string;
  notes?: string;
  context?: 'given' | 'when' | 'then';  // New field to specify which part of Given-When-Then
  screenshot: File;  // Added file field for uploads
}

// New interface for updating evidence
export interface UpdateTestEvidenceData {
  step_number?: number;
  step_description?: string;
  notes?: string | null;
  context?: 'given' | 'when' | 'then';  // Allow updating the context field
}