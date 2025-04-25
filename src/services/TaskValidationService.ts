import apiClient from '@/lib/ApiClient';
import { 
  TaskValidation, 
  TaskValidationResponse, 
  CreateTaskValidationRequest,
  TaskReadinessResponse
} from '@/types/TaskValidation';

export const TaskValidationService = {
  /**
   * Create a new task validation
   * @param data Task validation data
   * @returns Promise with the created task validation
   */
  createTaskValidation: async (data: CreateTaskValidationRequest): Promise<TaskValidation> => {
    try {
      const response = await apiClient.post<TaskValidationResponse>('/task-validations', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating task validation:', error);
      throw error;
    }
  },

  /**
   * Get a task validation by task ID
   * @param taskId The task ID
   * @returns Promise with the task validation
   */
  getTaskValidation: async (taskId: string): Promise<TaskValidation> => {
    try {
      const response = await apiClient.get<TaskValidationResponse>(`/task-validations/${taskId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting task validation:', error);
      throw error;
    }
  },

  /**
   * Check if a task is ready for validation
   * @param taskId The task ID
   * @returns Promise with the task readiness status
   */
  checkTaskReadiness: async (taskId: string) => {
    try {
      const response = await apiClient.get<TaskReadinessResponse>(`/task-validations/check-readiness/${taskId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error checking task readiness:', error);
      throw error;
    }
  }
};

export default TaskValidationService;
