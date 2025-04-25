// src/services/BugValidationService.ts
import apiClient from '@/lib/ApiClient';
import { BugValidation, CreateBugValidationData, UpdateBugValidationData, BugValidationStatistics } from '@/types/BugValidation';

export const bugValidationService = {
  getAllValidations: async (): Promise<BugValidation[]> => {
    const response = await apiClient.get('/bug-validations');
    return response.data.data;
  },

  getValidationById: async (id: string): Promise<BugValidation> => {
    const response = await apiClient.get(`/bug-validations/${id}`);
    return response.data.data;
  },

  getValidationsByBugReport: async (bugId: string): Promise<BugValidation[]> => {
    const response = await apiClient.get(`/bug-validations/bug-report/${bugId}`);
    return response.data.data;
  },

  getValidationsByQASpecialist: async (qaId: string): Promise<BugValidation[]> => {
    const response = await apiClient.get(`/bug-validations/qa-specialist/${qaId}`);
    return response.data.data;
  },

  getValidationsByStatus: async (status: string): Promise<BugValidation[]> => {
    const response = await apiClient.get(`/bug-validations/status/${status}`);
    return response.data.data;
  },

  getValidationsByApplication: async (appId: string): Promise<BugValidation[]> => {
    const response = await apiClient.get(`/bug-validations/application/${appId}`);
    return response.data.data;
  },

  createValidation: async (data: CreateBugValidationData): Promise<BugValidation> => {
    const response = await apiClient.post('/bug-validations', data);
    return response.data.data;
  },

  updateValidation: async (id: string, data: UpdateBugValidationData): Promise<BugValidation> => {
    const response = await apiClient.put(`/bug-validations/${id}`, data);
    return response.data.data;
  },

  deleteValidation: async (id: string): Promise<void> => {
    await apiClient.delete(`/bug-validations/${id}`);
  },

  completeValidation: async (id: string, status: string, comments: string): Promise<BugValidation> => {
    const response = await apiClient.put(`/bug-validations/${id}/complete`, {
      validation_status: status,
      comments: comments,
      validated_at: new Date().toISOString()
    });
    return response.data.data;
  },

  getValidationStatistics: async (qaId?: string): Promise<BugValidationStatistics> => {
    const url = qaId 
      ? `/bug-validations/statistics?qa_id=${qaId}` 
      : '/bug-validations/statistics';
    const response = await apiClient.get(url);
    return response.data.data;
  }
};
