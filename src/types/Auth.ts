export type UserRole = "client" | "crowdworker" | "qa_specialist";

export interface BaseUser {
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ClientUser extends BaseUser {
  client_id: string;
  company: string;
  status: "active" | "inactive";
}

export interface CrowdworkerUser extends BaseUser {
  worker_id: string;
  skills: string;
  completed_tasks_count?: number;
  total_bug_reports?: number;
}

export interface QASpecialistUser extends BaseUser {
  qa_id: string;
  expertise: string;
}

export type AuthUser  = 
  | ({ role: "client" } & ClientUser)
  | ({ role: "crowdworker" } & CrowdworkerUser)
  | ({ role: "qa_specialist" } & QASpecialistUser);
