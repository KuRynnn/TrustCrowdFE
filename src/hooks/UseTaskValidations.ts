import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TaskValidation, CreateTaskValidationRequest } from '@/types/TaskValidation';
import TaskValidationService from '@/services/TaskValidationService';
import { useAuth } from '@/context/AuthContext';

export const useTaskValidations = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [taskValidation, setTaskValidation] = useState<TaskValidation | null>(null);
  const [taskReadiness, setTaskReadiness] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();

  const createTaskValidation = useCallback(async (data: CreateTaskValidationRequest) => {
    setLoading(true);
    setError(null);
    try {
      // If user is a QA Specialist, automatically set the qa_id
      const validationData = {
        ...data,
        qa_id: user?.role === 'qa_specialist' ? (user as any).qa_id : data.qa_id
      };
      
      const result = await TaskValidationService.createTaskValidation(validationData);
      setTaskValidation(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task validation');
      setLoading(false);
      throw err;
    }
  }, [user]);

  const getTaskValidation = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await TaskValidationService.getTaskValidation(taskId);
      setTaskValidation(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      // If 404, it means the task hasn't been validated yet
      if (err.response?.status === 404) {
        setTaskValidation(null);
        setLoading(false);
        return null;
      }
      
      setError(err.response?.data?.message || 'Failed to get task validation');
      setLoading(false);
      throw err;
    }
  }, []);

  const checkTaskReadiness = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await TaskValidationService.checkTaskReadiness(taskId);
      setTaskReadiness(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check task readiness');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    taskValidation,
    taskReadiness,
    createTaskValidation,
    getTaskValidation,
    checkTaskReadiness
  };
};

export default useTaskValidations;
