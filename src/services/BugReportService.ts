// src/services/BugReportService.ts

import apiClient from "@/lib/ApiClient";
import {
  BugReport,
  CreateBugReportData,
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

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bug-reports/${id}`);
  },
  
  uploadScreenshot: async (bugId: string, formData: FormData): Promise<BugReport> => {
    const res = await apiClient.post(`/bug-reports/${bugId}/screenshot`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  }
};