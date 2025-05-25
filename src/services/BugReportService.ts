// src/services/BugReportService.ts

import apiClient from "@/lib/ApiClient";
import {
  BugReport,
  CreateBugReportData,
  CreateBugRevisionData,
  UpdateBugReportData,
} from "@/types/BugReport";

export const BugReportService = {
  getAll: async (): Promise<BugReport[]> => {
    const res = await apiClient.get("/bug-reports");
    return res.data.data;
  },

  getById: async (id: string): Promise<BugReport> => {
    const res = await apiClient.get(`/bug-reports/${id}`);
    return res.data.data;
  },
  
  getByTask: async (taskId: string): Promise<BugReport[]> => {
    const res = await apiClient.get(`/bug-reports/task/${taskId}`);
    return res.data.data;
  },

  create: async (data: CreateBugReportData): Promise<BugReport> => {
    const res = await apiClient.post("/bug-reports", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateBugReportData): Promise<BugReport> => {
    const res = await apiClient.put(`/bug-reports/${id}`, data);
    return res.data.data;
  },

  // Renamed from delete to deleteBugReport for clarity
  deleteBugReport: async (id: string): Promise<void> => {
    await apiClient.delete(`/bug-reports/${id}`);
  },
  
  uploadScreenshot: async (bugId: string, formData: FormData): Promise<BugReport> => {
    const res = await apiClient.post(`/bug-reports/${bugId}/screenshot`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  },

  createRevision: async (bugId: string, data: CreateBugRevisionData): Promise<BugReport> => {
    const res = await apiClient.post(`/bug-reports/${bugId}/revise`, data);
    return res.data.data;
  },

  getBugHistory: async (bugId: string): Promise<any> => {
    const res = await apiClient.get(`/bug-reports/${bugId}/history`);
    return res.data.data;
  }
};