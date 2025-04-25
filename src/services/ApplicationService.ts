// src/services/ApplicationService.ts
import apiClient from '@/lib/ApiClient';
import { Application, CreateApplicationData, UpdateApplicationData, ApplicationStatistics, ApplicationProgress } from '@/types/Application';

export const applicationService = {
  getAllApplications: async (): Promise<Application[]> => {
    const response = await apiClient.get('/applications');
    return response.data.data;
  },

  getApplicationById: async (id: string): Promise<Application> => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data.data;
  },

  getApplicationsByClient: async (clientId: string): Promise<Application[]> => {
    try {
      // Validate clientId before making the request
      if (!clientId) {
        console.warn('getApplicationsByClient called with empty clientId');
        return [];
      }
      
      const response = await apiClient.get(`/applications/client/${clientId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching applications by client:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  getApplicationsByPlatform: async (platform: string): Promise<Application[]> => {
    const response = await apiClient.get(`/applications/platform/${platform}`);
    return response.data.data;
  },

  createApplication: async (data: CreateApplicationData): Promise<Application> => {
    // Ensure client_id is included in the request
    if (!data.client_id) {
      throw new Error('Client ID is required to create an application');
    }
    
    const response = await apiClient.post('/applications', data);
    return response.data.data;
  },

  updateApplication: async (id: string, data: UpdateApplicationData): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data.data;
  },

  deleteApplication: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },

  updateApplicationStatus: async (id: string, status: string): Promise<Application> => {
    const response = await apiClient.patch(`/applications/${id}/status`, { status });
    return response.data.data;
  },

  getApplicationStatistics: async (id: string): Promise<ApplicationStatistics> => {
    try {
      const response = await apiClient.get(`/applications/${id}/statistics`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching statistics for application ${id}:`, error);
      // Return a default statistics object to prevent UI errors
      return {
        total_bug_reports: 0,
        critical_bugs: 0,
        validated_bugs: 0,
        total_testers: 0,
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        pending_validation: 0,
        total_bugs: 0,
        bugs_by_severity: {
          Critical: 0,
          High: 0,
          Medium: 0,
          Low: 0
        },
        bugs_by_status: {
          Valid: 0,
          Invalid: 0,
          Pending: 0
        }
      };
    }
  },

  getApplicationProgress: async (id: string): Promise<ApplicationProgress> => {
    try {
      const response = await apiClient.get(`/applications/${id}/progress`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching progress for application ${id}:`, error);
      // Return a default progress object to prevent UI errors
      return {
        percentage: 0,
        total_test_cases: 0,
        completed_test_cases: 0,
        in_progress_test_cases: 0,
        not_started_test_cases: 0,
        progress_percentage: 0,
        total_bugs: 0,
        valid_bugs: 0,
        completed_tasks: 0,
        timeline: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          estimated_completion: 'Not started'
        }
      };
    }
  },

  getAvailableForCrowdworker: async (workerId: string): Promise<Application[]> => {
    // Ensure worker_id is included in the request
    if (!workerId) {
      throw new Error('Worker ID is required to get available applications');
    }
    
    const response = await apiClient.get(`/applications/available-for-crowdworker`, {
      params: { worker_id: workerId }
    });
    return response.data.data;
  },
  
  getFinalReport: async (id: string, clientId?: string): Promise<any> => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await apiClient.get(`/applications/${id}/final-report`, { params });
    return response.data.data;
  },
  
  pickApplication: async (id: string, workerId: string): Promise<any> => {
    if (!workerId) {
      throw new Error('Worker ID is required to pick an application');
    }
    
    const response = await apiClient.post(`/applications/${id}/pick`, { worker_id: workerId });
    return response.data.data;
  }
};