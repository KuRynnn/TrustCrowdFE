// src/hooks/UseTestCases.ts
import { useState, useEffect, useCallback } from 'react';
import { testCaseService } from '@/services/TestCaseService';
import { TestCase, CreateTestCaseData, UpdateTestCaseData, TestCaseStatistics } from '@/types/TestCase';

// Hook for fetching test cases list
export function useTestCaseList(appId?: string, qaId?: string, priority?: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTestCases = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: TestCase[];
      
      if (appId) {
        data = await testCaseService.getTestCasesByApplication(appId);
      } else if (qaId) {
        data = await testCaseService.getTestCasesByQASpecialist(qaId);
      } else if (priority) {
        data = await testCaseService.getTestCasesByPriority(priority);
      } else {
        data = await testCaseService.getAllTestCases();
      }
      
      setTestCases(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch test cases'));
    } finally {
      setIsLoading(false);
    }
  }, [appId, qaId, priority]);

  useEffect(() => {
    fetchTestCases();
  }, [fetchTestCases]);

  const createTestCase = async (data: CreateTestCaseData) => {
    try {
      await testCaseService.createTestCase(data);
      fetchTestCases(); // Refetch after creation
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to create test case') 
      };
    }
  };

  const updateTestCase = async (id: string, data: UpdateTestCaseData) => {
    try {
      await testCaseService.updateTestCase(id, data);
      fetchTestCases(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update test case') 
      };
    }
  };

  const deleteTestCase = async (id: string) => {
    try {
      await testCaseService.deleteTestCase(id);
      fetchTestCases(); // Refetch after deletion
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to delete test case') 
      };
    }
  };

  return {
    testCases,
    isLoading,
    error,
    fetchTestCases,
    createTestCase,
    updateTestCase,
    deleteTestCase
  };
}

// Hook for fetching a single test case details
export function useTestCaseDetail(id: string) {
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [statistics, setStatistics] = useState<TestCaseStatistics | null>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(true);
  const [statisticsError, setStatisticsError] = useState<Error | null>(null);

  const fetchTestCase = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await testCaseService.getTestCaseById(id);
      setTestCase(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch test case'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoadingStatistics(true);
      const data = await testCaseService.getTestCaseStatistics(id);
      setStatistics(data);
      setStatisticsError(null);
    } catch (err) {
      setStatisticsError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
    } finally {
      setIsLoadingStatistics(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTestCase();
    fetchStatistics();
  }, [fetchTestCase, fetchStatistics]);

  const updateTestCase = async (data: UpdateTestCaseData) => {
    try {
      await testCaseService.updateTestCase(id, data);
      fetchTestCase(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update test case') 
      };
    }
  };

  return {
    testCase,
    isLoading,
    error,
    statistics,
    isLoadingStatistics,
    statisticsError,
    fetchTestCase,
    updateTestCase
  };
}
