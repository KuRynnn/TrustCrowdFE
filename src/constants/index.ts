// ✅ File: src/constants/index.ts

export const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];
  
  export const PLATFORM_OPTIONS = [
    { value: "web", label: "Web" },
    { value: "android", label: "Android" },
    { value: "ios", label: "iOS" },
  ];
  
  export const SEVERITY_OPTIONS = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ];
  
  export type BugSeverity = "Low" | "Medium" | "High" | "Critical";
  
export const VALIDATION_STATUS_OPTIONS = [
    { value: "Pending", label: "Pending" },
    { value: "Validated", label: "Validated" },
    { value: "Rejected", label: "Rejected" },
  ];
  
export const PRIORITY_OPTIONS = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];
  
export type TestCasePriority = "Low" | "Medium" | "High";

export const UAT_TASK_STATUS_OPTIONS = [
    { value: "Assigned", label: "Assigned" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];
  
export type UATTaskStatus = "Assigned" | "In Progress" | "Completed";

export const BUG_VALIDATION_STATUS_OPTIONS = [
    { value: "Valid", label: "Valid" },
    { value: "Invalid", label: "Invalid" },
    { value: "Needs More Info", label: "Needs More Info" },
  ];
  
export type ValidationStatus = "Valid" | "Invalid" | "Needs More Info";

export const TASK_VALIDATION_STATUS_OPTIONS = [
  { value: "Pass Verified", label: "Pass Verified" },
  { value: "Rejected", label: "Rejected" },
  { value: "Need Revision", label: "Need Revision" },
];

export type TaskValidationStatus = "Pass Verified" | "Rejected" | "Need Revision";
