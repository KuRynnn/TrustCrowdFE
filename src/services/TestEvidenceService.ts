// src/services/TestEvidenceService.ts
import apiClient from "@/lib/ApiClient";
import { TestEvidence, UpdateTestEvidenceData } from "@/types/TestEvidence";

export const TestEvidenceService = {
  // Upload evidence for a bug report
  uploadBugEvidence: async (
    bugId: string, 
    formData: FormData
  ): Promise<TestEvidence> => {
    const res = await apiClient.post(`/evidence/bugs/${bugId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  },
  
  // Upload evidence for a task
  uploadTaskEvidence: async (
    taskId: string, 
    formData: FormData
  ): Promise<TestEvidence> => {
    const res = await apiClient.post(`/evidence/tasks/${taskId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  },
  
  // Get all evidence for a bug report
  getBugEvidence: async (bugId: string): Promise<TestEvidence[]> => {
    const res = await apiClient.get(`/evidence/bugs/${bugId}`);
    return res.data.data;
  },
  
  // Get all evidence for a task
  getTaskEvidence: async (taskId: string): Promise<TestEvidence[]> => {
    const res = await apiClient.get(`/evidence/tasks/${taskId}`);
    return res.data.data;
  },
  
  // Delete an evidence item
  deleteEvidence: async (evidenceId: string): Promise<void> => {
    await apiClient.delete(`/evidence/${evidenceId}`);
  },
  
  // Update an evidence item (new method)
  updateEvidence: async (evidenceId: string, data: UpdateTestEvidenceData): Promise<TestEvidence> => {
    const res = await apiClient.put(`/evidence/${evidenceId}`, data);
    return res.data.data;
  }
};