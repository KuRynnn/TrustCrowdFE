// src/services/TestCaseService.ts
import apiClient from '@/lib/ApiClient';
import { TestCase, CreateTestCaseData, UpdateTestCaseData, TestCaseStatistics } from '@/types/TestCase';

export const testCaseService = {
  getAllTestCases: async (): Promise<TestCase[]> => {
    const response = await apiClient.get('/test-cases');
    return response.data.data;
  },

  getTestCaseById: async (id: string): Promise<TestCase> => {
    const response = await apiClient.get(`/test-cases/${id}`);
    return response.data.data;
  },

  getTestCasesByApplication: async (appId: string): Promise<TestCase[]> => {
    const response = await apiClient.get(`/test-cases/application/${appId}`);
    return response.data.data;
  },

  getTestCasesByQASpecialist: async (qaId: string): Promise<TestCase[]> => {
    const response = await apiClient.get(`/test-cases/qa-specialist/${qaId}`);
    return response.data.data;
  },

  getTestCasesByPriority: async (priority: string): Promise<TestCase[]> => {
    const response = await apiClient.get(`/test-cases/priority/${priority}`);
    return response.data.data;
  },

  createTestCase: async (data: CreateTestCaseData): Promise<TestCase> => {
    const response = await apiClient.post('/test-cases', data);
    return response.data.data;
  },

  updateTestCase: async (id: string, data: UpdateTestCaseData): Promise<TestCase> => {
    // Ensure qa_id is included in the request
    if (!data.qa_id) {
      throw new Error('QA ID is required to update a test case');
    }
    
    const response = await apiClient.put(`/test-cases/${id}`, data);
    return response.data.data;
  },

  deleteTestCase: async (id: string, qaId: string): Promise<void> => {
    // Pass qa_id in the request body for ownership verification
    if (!qaId) {
      throw new Error('QA ID is required to delete a test case');
    }
    
    await apiClient.delete(`/test-cases/${id}`, {
      data: { qa_id: qaId }
    });
  },

  getTestCaseStatistics: async (id: string): Promise<TestCaseStatistics> => {
    const response = await apiClient.get(`/test-cases/${id}/statistics`);
    return response.data.data;
  }
};