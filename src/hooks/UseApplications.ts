// src/hooks/use-applications.ts
import { useState, useEffect, useCallback } from 'react';
import { applicationService } from '@/services/ApplicationService';
import { Application, CreateApplicationData, UpdateApplicationData, ApplicationStatistics, ApplicationProgress } from '@/types/Application';

// Hook for fetching applications list
export function useApplicationList(clientId?: string, platform?: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: Application[];
      
      // Only fetch client-specific applications if clientId is provided
      if (clientId) {
        data = await applicationService.getApplicationsByClient(clientId);
      } else if (platform) {
        data = await applicationService.getApplicationsByPlatform(platform);
      } else {
        data = await applicationService.getAllApplications();
      }
      
      setApplications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
      setApplications([]); // Set empty array on error to prevent undefined issues
    } finally {
      setIsLoading(false);
    }
  }, [clientId, platform]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const createApplication = async (data: CreateApplicationData) => {
    try {
      await applicationService.createApplication(data);
      fetchApplications(); // Refetch after creation
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to create application') 
      };
    }
  };

  const updateApplication = async (id: string, data: UpdateApplicationData) => {
    try {
      await applicationService.updateApplication(id, data);
      fetchApplications(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update application') 
      };
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      await applicationService.deleteApplication(id);
      fetchApplications(); // Refetch after deletion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to delete application') 
      };
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await applicationService.updateApplicationStatus(id, status);
      fetchApplications(); // Refetch after status update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update status') 
      };
    }
  };

  return {
    applications,
    isLoading,
    error,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus
  };
}

// Modified hook for fetching a single application details
export function useApplicationDetail(id: string, workerId?: string) {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [statistics, setStatistics] = useState<ApplicationStatistics | null>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(true);
  const [statisticsError, setStatisticsError] = useState<Error | null>(null);
  
  const [progress, setProgress] = useState<ApplicationProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState<Error | null>(null);
  
  const [finalReport, setFinalReport] = useState<any>(null);
  const [isLoadingFinalReport, setIsLoadingFinalReport] = useState(true);
  const [finalReportError, setFinalReportError] = useState<Error | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await applicationService.getApplicationById(id);
      setApplication(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch application'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoadingStatistics(true);
      const data = await applicationService.getApplicationStatistics(id);
      setStatistics(data);
      setStatisticsError(null);
    } catch (err) {
      setStatisticsError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
    } finally {
      setIsLoadingStatistics(false);
    }
  }, [id]);

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoadingProgress(true);
      // Pass worker_id as a parameter if available
      const data = workerId 
        ? await applicationService.getApplicationProgressForWorker(id, workerId)
        : await applicationService.getApplicationProgress(id);
      setProgress(data);
      setProgressError(null);
    } catch (err) {
      setProgressError(err instanceof Error ? err : new Error('Failed to fetch progress'));
    } finally {
      setIsLoadingProgress(false);
    }
  }, [id, workerId]); // Add workerId as dependency
  
  const fetchFinalReport = useCallback(async (clientId?: string) => {
    try {
      setIsLoadingFinalReport(true);
      const data = await applicationService.getFinalReport(id, clientId);
      setFinalReport(data);
      setFinalReportError(null);
    } catch (err) {
      setFinalReportError(err instanceof Error ? err : new Error('Failed to fetch final report'));
    } finally {
      setIsLoadingFinalReport(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
    fetchStatistics();
    fetchProgress(); // This will now use workerId if available
  }, [fetchApplication, fetchStatistics, fetchProgress]);

  const updateApplication = async (data: UpdateApplicationData) => {
    try {
      await applicationService.updateApplication(id, data);
      fetchApplication(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update application') 
      };
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await applicationService.updateApplicationStatus(id, status);
      fetchApplication(); // Refetch after status update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update status') 
      };
    }
  };

  return {
    application,
    isLoading,
    error,
    statistics,
    isLoadingStatistics,
    statisticsError,
    progress,
    isLoadingProgress,
    progressError,
    finalReport,
    isLoadingFinalReport,
    finalReportError,
    fetchApplication,
    fetchFinalReport,
    updateApplication,
    updateStatus
  };
}

export function useAvailableApplications(workerId: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workerId) {
          setError(new Error('Worker ID is required to fetch available applications'));
          setIsLoading(false);
          return;
        }
        
        const apps = await applicationService.getAvailableForCrowdworker(workerId);
        setApplications(apps);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load applications'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (workerId) {
      fetchData();
    }
  }, [workerId]);

  return { applications, isLoading, error };
}
