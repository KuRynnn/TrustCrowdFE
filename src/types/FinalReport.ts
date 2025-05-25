// src/types/FinalReport.ts
export interface FinalReport {
    application: {
      app_id: string;
      app_name: string;
      app_url: string;
      platform: string;
      description: string;
      status: string;
    };
    test_coverage: {
      total_test_cases: number;
      completed_tasks: number;
      completion_percentage: number;
    };
    bug_summary: {
      total_bugs: number;
      by_severity: {
        Critical: number;
        High: number;
        Medium: number;
        Low: number;
      };
      detailed_bugs: Array<{
        bug_id: string;
        bug_description: string;
        severity: string;
        steps_to_reproduce: string;
      }>;
    };
    acceptance_status: {
      status: 'Accept' | 'Provisional Acceptance' | 'Conditional Acceptance' | 'Rework' | 'Rejected';
      description: string;
      recommendation: string;
    };
    generated_at: string;
  }