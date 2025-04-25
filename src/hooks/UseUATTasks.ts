// src/hooks/UseUATTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { uatTaskService } from '@/services/UatTaskService';
import { UATTask, CreateUATTaskData, UpdateUATTaskData, UATTaskStatistics } from '@/types/UATTask';

// Hook for fetching UAT tasks list
export function useUATTaskList(appId?: string, testId?: string, workerId?: string, status?: string) {
  const [tasks, setTasks] = useState<UATTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: UATTask[];
      
      if (appId) {
        data = await uatTaskService.getTasksByApplication(appId);
      } else if (testId) {
        data = await uatTaskService.getTasksByTestCase(testId);
      } else if (workerId) {
        data = await uatTaskService.getTasksByWorker(workerId);
      } else if (status) {
        data = await uatTaskService.getTasksByStatus(status);
      } else {
        data = await uatTaskService.getAllTasks();
      }
      
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch UAT tasks'));
    } finally {
      setIsLoading(false);
    }
  }, [appId, testId, workerId, status]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: CreateUATTaskData) => {
    try {
      await uatTaskService.createTask(data);
      fetchTasks(); // Refetch after creation
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to create UAT task') 
      };
    }
  };

  const updateTask = async (id: string, data: UpdateUATTaskData) => {
    try {
      await uatTaskService.updateTask(id, data);
      fetchTasks(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update UAT task') 
      };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await uatTaskService.deleteTask(id);
      fetchTasks(); // Refetch after deletion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to delete UAT task') 
      };
    }
  };

  const startTask = async (id: string) => {
    try {
      await uatTaskService.startTask(id);
      fetchTasks(); // Refetch after starting
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to start UAT task') 
      };
    }
  };

  const completeTask = async (id: string) => {
    try {
      await uatTaskService.completeTask(id);
      fetchTasks(); // Refetch after completion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to complete UAT task') 
      };
    }
  };

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    startTask,
    completeTask
  };
}

// Hook for fetching a single UAT task details
export function useUATTaskDetail(id: string) {
  const [task, setTask] = useState<UATTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [statistics, setStatistics] = useState<UATTaskStatistics | null>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(true);
  const [statisticsError, setStatisticsError] = useState<Error | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await uatTaskService.getTaskById(id);
      setTask(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch UAT task'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoadingStatistics(true);
      const data = await uatTaskService.getTaskStatistics(id);
      setStatistics(data);
      setStatisticsError(null);
    } catch (err) {
      setStatisticsError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
    } finally {
      setIsLoadingStatistics(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
    fetchStatistics();
  }, [fetchTask, fetchStatistics]);

  const updateTask = async (data: UpdateUATTaskData) => {
    try {
      await uatTaskService.updateTask(id, data);
      fetchTask(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update UAT task') 
      };
    }
  };

  const startTask = async () => {
    try {
      await uatTaskService.startTask(id);
      fetchTask(); // Refetch after starting
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to start UAT task') 
      };
    }
  };

  const completeTask = async () => {
    try {
      await uatTaskService.completeTask(id);
      fetchTask(); // Refetch after completion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to complete UAT task') 
      };
    }
  };

  return {
    task,
    isLoading,
    error,
    statistics,
    isLoadingStatistics,
    statisticsError,
    fetchTask,
    updateTask,
    startTask,
    completeTask
  };
}
