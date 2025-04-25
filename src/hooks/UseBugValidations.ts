// src/hooks/UseBugValidations.ts
import { useState, useEffect, useCallback } from 'react';
import { bugValidationService } from '@/services/BugValidationService';
import { BugValidation, CreateBugValidationData, UpdateBugValidationData, BugValidationStatistics } from '@/types/BugValidation';

// Hook for fetching bug validations list
export function useBugValidationList(bugId?: string, qaId?: string, status?: string, appId?: string) {
  const [validations, setValidations] = useState<BugValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchValidations = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: BugValidation[];
      
      if (bugId) {
        data = await bugValidationService.getValidationsByBugReport(bugId);
      } else if (qaId) {
        data = await bugValidationService.getValidationsByQASpecialist(qaId);
      } else if (status) {
        data = await bugValidationService.getValidationsByStatus(status);
      } else if (appId) {
        data = await bugValidationService.getValidationsByApplication(appId);
      } else {
        data = await bugValidationService.getAllValidations();
      }
      
      setValidations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bug validations'));
    } finally {
      setIsLoading(false);
    }
  }, [bugId, qaId, status, appId]);

  useEffect(() => {
    fetchValidations();
  }, [fetchValidations]);

  const createValidation = async (data: CreateBugValidationData) => {
    try {
      await bugValidationService.createValidation(data);
      fetchValidations(); // Refetch after creation
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to create bug validation') 
      };
    }
  };

  const updateValidation = async (id: string, data: UpdateBugValidationData) => {
    try {
      await bugValidationService.updateValidation(id, data);
      fetchValidations(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update bug validation') 
      };
    }
  };

  const deleteValidation = async (id: string) => {
    try {
      await bugValidationService.deleteValidation(id);
      fetchValidations(); // Refetch after deletion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to delete bug validation') 
      };
    }
  };

  const completeValidation = async (id: string, status: string, comments: string) => {
    try {
      await bugValidationService.completeValidation(id, status, comments);
      fetchValidations(); // Refetch after completion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to complete bug validation') 
      };
    }
  };

  return {
    validations,
    isLoading,
    error,
    fetchValidations,
    createValidation,
    updateValidation,
    deleteValidation,
    completeValidation
  };
}

// Hook for fetching a single bug validation details
export function useBugValidationDetail(id: string) {
  const [validation, setValidation] = useState<BugValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [statistics, setStatistics] = useState<BugValidationStatistics | null>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(true);
  const [statisticsError, setStatisticsError] = useState<Error | null>(null);

  const fetchValidation = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bugValidationService.getValidationById(id);
      setValidation(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bug validation'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoadingStatistics(true);
      // If the validation is by a QA specialist, get their statistics
      if (validation?.qa_id) {
        const data = await bugValidationService.getValidationStatistics(validation.qa_id);
        setStatistics(data);
      } else {
        // Otherwise get general statistics
        const data = await bugValidationService.getValidationStatistics();
        setStatistics(data);
      }
      setStatisticsError(null);
    } catch (err) {
      setStatisticsError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
    } finally {
      setIsLoadingStatistics(false);
    }
  }, [validation?.qa_id]);

  useEffect(() => {
    fetchValidation();
  }, [fetchValidation]);

  useEffect(() => {
    if (validation) {
      fetchStatistics();
    }
  }, [validation, fetchStatistics]);

  const updateValidation = async (data: UpdateBugValidationData) => {
    try {
      await bugValidationService.updateValidation(id, data);
      fetchValidation(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update bug validation') 
      };
    }
  };

  const completeValidation = async (status: string, comments: string) => {
    try {
      await bugValidationService.completeValidation(id, status, comments);
      fetchValidation(); // Refetch after completion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to complete bug validation') 
      };
    }
  };

  return {
    validation,
    isLoading,
    error,
    statistics,
    isLoadingStatistics,
    statisticsError,
    fetchValidation,
    updateValidation,
    completeValidation
  };
}

// Hook for fetching bug validation statistics
export function useBugValidationStatistics(qaId?: string) {
  const [statistics, setStatistics] = useState<BugValidationStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bugValidationService.getValidationStatistics(qaId);
      setStatistics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch validation statistics'));
    } finally {
      setIsLoading(false);
    }
  }, [qaId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    isLoading,
    error,
    fetchStatistics
  };
}
