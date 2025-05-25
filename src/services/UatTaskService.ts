// src/services/UatTaskService.ts
import apiClient from '@/lib/ApiClient';
import { UATTask, CreateUATTaskData, UpdateUATTaskData, UATTaskProgress, UATTaskFilters } from '@/types/UATTask';

export const uatTaskService = {
  getAllTasks: async (filters?: UATTaskFilters): Promise<UATTask[]> => {
    const response = await apiClient.get('/uat-tasks', { params: filters });
    return response.data.data;
  },

  getTaskById: async (id: string): Promise<UATTask> => {
    const response = await apiClient.get(`/uat-tasks/${id}`);
    return response.data.data;
  },

  getTasksByApplication: async (appId: string): Promise<UATTask[]> => {
    const response = await apiClient.get(`/uat-tasks/application/${appId}`);
    return response.data.data;
  },

  // Updated method name to match your backend service
  getTasksByCrowdworker: async (workerId: string): Promise<UATTask[]> => {
    try {
      const response = await apiClient.get(`/uat-tasks/worker/${workerId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching tasks by worker (${workerId}):`, error);
      throw error;
    }
  },

  // Keep this for backward compatibility
  getTasksByWorker: async (workerId: string): Promise<UATTask[]> => {
    return uatTaskService.getTasksByCrowdworker(workerId);
  },

  getTasksByStatus: async (status: string): Promise<UATTask[]> => {
    try {
      const response = await apiClient.get(`/uat-tasks/status/${status}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching tasks by status (${status}):`, error);
      
      // Fallback to filtering with query params
      console.log(`Falling back to query params filter with status=${status}`);
      try {
        const response = await apiClient.get('/uat-tasks', { 
          params: { status } 
        });
        return response.data.data;
      } catch (fallbackError) {
        console.error(`Fallback also failed:`, fallbackError);
        return []; // Return empty array to prevent UI crashes
      }
    }
  },

  createTask: async (taskData: CreateUATTaskData): Promise<UATTask> => {
    const response = await apiClient.post('/uat-tasks', taskData);
    return response.data.data;
  },

  updateTask: async (id: string, taskData: UpdateUATTaskData): Promise<UATTask> => {
    const response = await apiClient.put(`/uat-tasks/${id}`, taskData);
    return response.data.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/uat-tasks/${id}`);
  },

  startTask: async (id: string): Promise<UATTask> => {
    const response = await apiClient.put(`/uat-tasks/${id}/start`, {});
    return response.data.data;
  },

  completeTask: async (id: string): Promise<UATTask> => {
    const response = await apiClient.put(`/uat-tasks/${id}/complete`, {});
    return response.data.data;
  },

  getTaskProgress: async (id: string): Promise<UATTaskProgress> => {
    const response = await apiClient.get(`/uat-tasks/${id}/progress`);
    return response.data.data;
  },

  getBugReports: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/uat-tasks/${id}/bug-reports`);
    return response.data.data;
  },

  // Add these new methods
  getTaskRevisionHistory: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/uat-tasks/${id}/revision-history`);
    return response.data.data;
  },

  startRevision: async (id: string): Promise<UATTask> => {
    const response = await apiClient.put(`/uat-tasks/${id}/start-revision`, {});
    return response.data.data;
  },
};