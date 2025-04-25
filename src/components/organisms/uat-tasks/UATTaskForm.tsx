'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uatTaskService } from '@/services/UatTaskService';
import { applicationService } from '@/services/ApplicationService';
import { testCaseService } from '@/services/TestCaseService';
import { UATTask, CreateUATTaskData, UpdateUATTaskData } from '@/types/UATTask';
import { Application } from '@/types/Application';
import { TestCase } from '@/types/TestCase';
import { UAT_TASK_STATUS_OPTIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';

interface UATTaskFormProps {
  initialData?: UATTask;
  isEditing?: boolean;
  applicationId?: string;
  testCaseId?: string;
}

export default function UATTaskForm({ initialData, isEditing = false, applicationId, testCaseId }: UATTaskFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [crowdworkers, setCrowdworkers] = useState<any[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(false);
  const [isLoadingCrowdworkers, setIsLoadingCrowdworkers] = useState(false);
  
  const [formData, setFormData] = useState<CreateUATTaskData>({
    app_id: initialData?.app_id || applicationId || '',
    test_id: initialData?.test_id || testCaseId || '',
    worker_id: initialData?.worker_id || '',
    status: initialData?.status || 'Assigned',
    started_at: initialData?.started_at || undefined,
    completed_at: initialData?.completed_at || undefined
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoadingApplications(true);
        const data = await applicationService.getAllApplications();
        setApplications(data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoadingApplications(false);
      }
    };
    
    fetchApplications();
  }, []);
  
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        setIsLoadingTestCases(true);
        let data: TestCase[];
        
        if (formData.app_id) {
          data = await testCaseService.getTestCasesByApplication(formData.app_id);
        } else {
          data = await testCaseService.getAllTestCases();
        }
        
        setTestCases(data);
      } catch (error) {
        console.error('Failed to fetch test cases:', error);
      } finally {
        setIsLoadingTestCases(false);
      }
    };
    
    fetchTestCases();
  }, [formData.app_id]);
  
  useEffect(() => {
    const fetchCrowdworkers = async () => {
      try {
        setIsLoadingCrowdworkers(true);
        // This is a placeholder. In a real application, you would have a service to fetch crowdworkers
        // For now, we'll use a mock list
        setCrowdworkers([
          { worker_id: '1', name: 'John Doe' },
          { worker_id: '2', name: 'Jane Smith' },
          { worker_id: '3', name: 'Bob Johnson' }
        ]);
      } catch (error) {
        console.error('Failed to fetch crowdworkers:', error);
      } finally {
        setIsLoadingCrowdworkers(false);
      }
    };
    
    fetchCrowdworkers();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.app_id) {
      newErrors.app_id = 'Application is required';
    }
    
    if (!formData.test_id) {
      newErrors.test_id = 'Test case is required';
    }
    
    if (!formData.worker_id) {
      newErrors.worker_id = 'Crowdworker is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    if (formData.started_at && formData.completed_at) {
      const startDate = new Date(formData.started_at);
      const endDate = new Date(formData.completed_at);
      
      if (endDate < startDate) {
        newErrors.completed_at = 'Completion date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && initialData) {
        // If editing, update the UAT task
        await uatTaskService.updateTask(initialData.task_id, formData as UpdateUATTaskData);
      } else {
        // If creating a new UAT task
        await uatTaskService.createTask(formData);
      }
      
      // Redirect to UAT tasks page or test case detail page
      if (testCaseId) {
        router.push(`/test-cases/${testCaseId}`);
      } else if (applicationId) {
        router.push(`/applications/${applicationId}`);
      } else {
        router.push('/uat-tasks');
      }
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.message || 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {errors.general && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded">
          {errors.general}
        </div>
      )}
      
      <div>
        <label htmlFor="app_id" className="block text-sm font-medium text-gray-200">
          Application *
        </label>
        <select
          id="app_id"
          name="app_id"
          value={formData.app_id}
          onChange={handleChange}
          disabled={!!applicationId || isLoadingApplications}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70"
        >
          <option value="">Select Application</option>
          {applications.map((app) => (
            <option key={app.app_id} value={app.app_id}>
              {app.app_name}
            </option>
          ))}
        </select>
        {errors.app_id && (
          <p className="mt-1 text-sm text-red-500">{errors.app_id}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="test_id" className="block text-sm font-medium text-gray-200">
          Test Case *
        </label>
        <select
          id="test_id"
          name="test_id"
          value={formData.test_id}
          onChange={handleChange}
          disabled={!!testCaseId || isLoadingTestCases || !formData.app_id}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70"
        >
          <option value="">Select Test Case</option>
          {testCases.map((testCase) => (
            <option key={testCase.test_id} value={testCase.test_id}>
              {testCase.test_title}
            </option>
          ))}
        </select>
        {errors.test_id && (
          <p className="mt-1 text-sm text-red-500">{errors.test_id}</p>
        )}
        {!formData.app_id && !testCaseId && (
          <p className="mt-1 text-xs text-gray-400">
            Select an application first to see available test cases.
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="worker_id" className="block text-sm font-medium text-gray-200">
          Crowdworker *
        </label>
        <select
          id="worker_id"
          name="worker_id"
          value={formData.worker_id}
          onChange={handleChange}
          disabled={isLoadingCrowdworkers}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70"
        >
          <option value="">Select Crowdworker</option>
          {crowdworkers.map((worker) => (
            <option key={worker.worker_id} value={worker.worker_id}>
              {worker.name}
            </option>
          ))}
        </select>
        {errors.worker_id && (
          <p className="mt-1 text-sm text-red-500">{errors.worker_id}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-200">
          Status *
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        >
          {UAT_TASK_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-500">{errors.status}</p>
        )}
      </div>
      
      {(isEditing || formData.status !== 'Assigned') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="started_at" className="block text-sm font-medium text-gray-200">
              Start Date
            </label>
            <input
              type="datetime-local"
              id="started_at"
              name="started_at"
              value={formData.started_at?.slice(0, 16) || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.started_at && (
              <p className="mt-1 text-sm text-red-500">{errors.started_at}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="completed_at" className="block text-sm font-medium text-gray-200">
              Completion Date
            </label>
            <input
              type="datetime-local"
              id="completed_at"
              name="completed_at"
              value={formData.completed_at?.slice(0, 16) || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
            {errors.completed_at && (
              <p className="mt-1 text-sm text-red-500">{errors.completed_at}</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Creating...') 
            : (isEditing ? 'Update UAT Task' : 'Create UAT Task')}
        </button>
      </div>
    </form>
  );
}
