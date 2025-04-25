'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { testCaseService } from '@/services/TestCaseService';
import { applicationService } from '@/services/ApplicationService';
import { TestCase, CreateTestCaseData, UpdateTestCaseData } from '@/types/TestCase';
import { Application } from '@/types/Application';
import { PRIORITY_OPTIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';

interface TestCaseFormProps {
  initialData?: TestCase;
  isEditing?: boolean;
  applicationId?: string;
}

export default function TestCaseForm({ initialData, isEditing = false, applicationId }: TestCaseFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  
  const [formData, setFormData] = useState<CreateTestCaseData>({
    app_id: initialData?.app_id || applicationId || '',
    qa_id: initialData?.qa_id || (user?.role === 'qa_specialist' ? user.qa_id : ''),
    test_title: initialData?.test_title || '',
    test_steps: initialData?.test_steps || '',
    expected_result: initialData?.expected_result || '',
    priority: initialData?.priority || 'Medium',
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
    
    if (!formData.test_title.trim()) {
      newErrors.test_title = 'Test title is required';
    }
    
    if (!formData.test_steps.trim()) {
      newErrors.test_steps = 'Test steps are required';
    }
    
    if (!formData.expected_result.trim()) {
      newErrors.expected_result = 'Expected result is required';
    }
    
    if (!formData.app_id) {
      newErrors.app_id = 'Application is required';
    }
    
    if (!formData.qa_id) {
      newErrors.qa_id = 'QA Specialist is required';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
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
        // If editing, update the test case
        await testCaseService.updateTestCase(initialData.test_id, formData as UpdateTestCaseData);
      } else {
        // If creating a new test case
        await testCaseService.createTestCase(formData);
      }
      
      // Redirect to test cases page or application detail page
      if (applicationId) {
        router.push(`/applications/${applicationId}`);
      } else {
        router.push('/test-cases');
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
        <label htmlFor="test_title" className="block text-sm font-medium text-gray-200">
          Test Title *
        </label>
        <input
          type="text"
          id="test_title"
          name="test_title"
          value={formData.test_title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {errors.test_title && (
          <p className="mt-1 text-sm text-red-500">{errors.test_title}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="test_steps" className="block text-sm font-medium text-gray-200">
          Test Steps *
        </label>
        <textarea
          id="test_steps"
          name="test_steps"
          value={formData.test_steps}
          onChange={handleChange}
          rows={6}
          placeholder="1. Navigate to login page&#10;2. Enter valid credentials&#10;3. Click login button"
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {errors.test_steps && (
          <p className="mt-1 text-sm text-red-500">{errors.test_steps}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Enter each step on a new line, preferably numbered.
        </p>
      </div>
      
      <div>
        <label htmlFor="expected_result" className="block text-sm font-medium text-gray-200">
          Expected Result *
        </label>
        <textarea
          id="expected_result"
          name="expected_result"
          value={formData.expected_result}
          onChange={handleChange}
          rows={3}
          placeholder="User should be successfully logged in and redirected to dashboard"
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {errors.expected_result && (
          <p className="mt-1 text-sm text-red-500">{errors.expected_result}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-200">
          Priority *
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.priority && (
          <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
        )}
      </div>
      
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
            : (isEditing ? 'Update Test Case' : 'Create Test Case')}
        </button>
      </div>
    </form>
  );
}
