// src/hooks/UseTestCases.ts
import { useState, useEffect, useCallback } from 'react';
import { testCaseService } from '@/services/TestCaseService';
import { TestCase, CreateTestCaseData, UpdateTestCaseData, TestCaseStatistics } from '@/types/TestCase';
import { useAuth } from '@/context/AuthContext'; // Import Auth context to get current user

// Hook for fetching test cases list
export function useTestCaseList(appId?: string, qaId?: string, priority?: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth(); // Get current user to access qa_id if needed

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
      // Ensure priority is lowercase before sending to API
      const formattedData = {
        ...data,
        priority: data.priority.toLowerCase() as any
      };
      
      await testCaseService.createTestCase(formattedData);
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
      // Ensure priority is lowercase before sending to API if it exists
      const formattedData = {
        ...data,
        priority: data.priority ? data.priority.toLowerCase() as any : undefined
      };
      
      await testCaseService.updateTestCase(id, formattedData);
      fetchTestCases(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update test case') 
      };
    }
  };

  const deleteTestCase = async (id: string, qaId?: string) => {
    try {
      // First, try to use the provided qaId
      if (qaId) {
        await testCaseService.deleteTestCase(id, qaId);
      } 
      // If not provided, try to find qaId from the test case itself
      else {
        const testCase = testCases.find(tc => tc.test_id === id);
        if (testCase && testCase.qa_id) {
          await testCaseService.deleteTestCase(id, testCase.qa_id);
        }
        // If still not found, use the current user's qa_id if they are a QA specialist
        else if (user && user.role === 'qa_specialist' && user.qa_id) {
          await testCaseService.deleteTestCase(id, user.qa_id);
        }
        else {
          throw new Error('QA Specialist ID required to delete test case');
        }
      }
      
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
  const { user } = useAuth(); // Get current user for qa_id if needed
  
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
      // Ensure priority is lowercase before sending to API if it exists
      const formattedData = {
        ...data,
        priority: data.priority ? data.priority.toLowerCase() as any : undefined
      };
      
      // Pass qa_id if available in the test case
      if (testCase && testCase.qa_id) {
        await testCaseService.updateTestCase(id, {
          ...formattedData,
          qa_id: testCase.qa_id
        });
      } else if (user && user.role === 'qa_specialist' && user.qa_id) {
        // Use the current user's qa_id if they are a QA specialist
        await testCaseService.updateTestCase(id, {
          ...formattedData,
          qa_id: user.qa_id
        });
      } else {
        throw new Error('QA Specialist ID required to update test case');
      }
      
      fetchTestCase(); // Refetch after update
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update test case') 
      };
    }
  };

  const deleteTestCase = async () => {
    try {
      if (testCase && testCase.qa_id) {
        await testCaseService.deleteTestCase(id, testCase.qa_id);
        return { success: true };
      } else if (user && user.role === 'qa_specialist' && user.qa_id) {
        // Use the current user's qa_id if they are a QA specialist
        await testCaseService.deleteTestCase(id, user.qa_id);
        return { success: true };
      } else {
        throw new Error('QA Specialist ID required to delete test case');
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to delete test case') 
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
    updateTestCase,
    deleteTestCase
  };
}