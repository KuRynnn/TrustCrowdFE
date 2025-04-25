// src/components/organisms/task-validation/TaskValidationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskValidationService from '@/services/TaskValidationService';
import { uatTaskService } from '@/services/UatTaskService';
import { TaskValidation, CreateTaskValidationRequest } from '@/types/TaskValidation';
import { TASK_VALIDATION_STATUS_OPTIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import useTaskValidations from '@/hooks/UseTaskValidations';

interface TaskValidationFormProps {
  initialData?: TaskValidation;
  isEditing?: boolean;
  taskId?: string;
  onValidationSuccess?: () => void; // Add callback for in-page validation
}

export default function TaskValidationForm({ 
  initialData, 
  isEditing = false, 
  taskId,
  onValidationSuccess 
}: TaskValidationFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { checkTaskReadiness } = useTaskValidations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uatTask, setUatTask] = useState<any | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [taskReadiness, setTaskReadiness] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  
  const [formData, setFormData] = useState<CreateTaskValidationRequest>({
    task_id: initialData?.task_id || taskId || '',
    qa_id: initialData?.qa_id || (user?.role === 'qa_specialist' ? (user as any).qa_id : ''),
    validation_status: initialData?.validation_status || 'Pass Verified',
    comments: initialData?.comments || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!formData.task_id) return;
      
      try {
        setIsLoadingTask(true);
        // Fetch task data
        const taskData = await uatTaskService.getTaskById(formData.task_id);
        setUatTask(taskData);
        
        // Check task readiness
        const readiness = await checkTaskReadiness(formData.task_id);
        setTaskReadiness(readiness);
        setIsReady(readiness.is_ready);
      } catch (error) {
        console.error('Failed to fetch task data:', error);
      } finally {
        setIsLoadingTask(false);
      }
    };
    
    fetchTaskData();
  }, [formData.task_id, checkTaskReadiness]);
  
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
    
    if (!formData.task_id) {
      newErrors.task_id = 'Task is required';
    }
    
    if (!formData.qa_id) {
      newErrors.qa_id = 'QA Specialist is required';
    }
    
    if (!formData.validation_status) {
      newErrors.validation_status = 'Validation status is required';
    }
    
    if (!formData.comments?.trim()) {
      newErrors.comments = 'Comments are required';
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
        // If editing, update the validation (not implemented in the service yet)
        // await TaskValidationService.updateTaskValidation(initialData.validation_id, formData);
        throw new Error('Editing task validations is not supported yet');
      } else {
        // If creating a new validation
        await TaskValidationService.createTaskValidation(formData);
      }
      
      // If callback provided, use it instead of navigation
      if (onValidationSuccess) {
        onValidationSuccess();
      } else {
        // Redirect to appropriate page
        if (taskId) {
          router.push(`/uat-tasks/${taskId}`);
        } else {
          router.push('/qa-specialist/applications');
        }
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
  
  // Different styling when used in validation page vs standalone page
  const isIntegratedView = !!onValidationSuccess;
  
  return (
    <form onSubmit={handleSubmit} className={isIntegratedView ? "" : "space-y-6 max-w-2xl mx-auto"}>
      {errors.general && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">
          {errors.general}
        </div>
      )}
      
      {!isReady && taskReadiness && !isIntegratedView && (
        <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded mb-4">
          <h3 className="text-lg font-medium mb-2">Task is not ready for validation</h3>
          <p>All bug reports must be validated before validating the task.</p>
          <ul className="mt-2 list-disc list-inside">
            <li>Total bug reports: {taskReadiness.total_bug_reports}</li>
            <li>Validated bug reports: {taskReadiness.validated_bug_reports}</li>
            <li>Unvalidated bug reports: {taskReadiness.unvalidated_bug_reports}</li>
            <li>Task status: {taskReadiness.task_status}</li>
          </ul>
        </div>
      )}
      
      {uatTask && !isIntegratedView && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-white mb-2">UAT Task Details</h3>
          <div className="grid grid-cols-1 gap-y-2">
            <div className="flex items-center">
              <span className="text-gray-400 w-24">ID:</span>
              <span className="text-white">{uatTask.task_id}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Status:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                uatTask.status === 'Completed' ? 'bg-green-900/30 text-green-300' :
                uatTask.status === 'In Progress' ? 'bg-blue-900/30 text-blue-300' :
                'bg-gray-900/30 text-gray-300'
              }`}>
                {uatTask.status}
              </span>
            </div>
            {uatTask.test_case && (
              <div>
                <span className="text-gray-400 block mb-1">Test Case:</span>
                <div className="text-white bg-gray-700 p-2 rounded text-sm">
                  {uatTask.test_case.test_title || 'No title available'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {isReady && taskReadiness && taskReadiness.bug_validations && taskReadiness.bug_validations.length > 0 && !isIntegratedView && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Bug Validations</h3>
          <div className="space-y-3">
            {taskReadiness.bug_validations.map((validation: any, index: number) => (
              <div key={validation.bug_id} className="bg-gray-700 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Bug #{index + 1}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    validation.validation_status === 'Valid' ? 'bg-red-900/30 text-red-300' :
                    validation.validation_status === 'Invalid' ? 'bg-green-900/30 text-green-300' :
                    'bg-yellow-900/30 text-yellow-300'
                  }`}>
                    {validation.validation_status}
                  </span>
                </div>
                {validation.comments && (
                  <p className="text-sm text-gray-300">{validation.comments}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="validation_status" className="block text-sm font-medium text-gray-200 mb-1">
          Validation Status *
        </label>
        <select
          id="validation_status"
          name="validation_status"
          value={formData.validation_status}
          onChange={handleChange}
          disabled={!isReady}
          className={isIntegratedView 
            ? "block w-full rounded-md bg-[#1a1a2e] border-gray-700 text-white p-2 focus:border-[#4c0e8f] focus:outline-none disabled:opacity-70" 
            : "mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70"
          }
        >
          {TASK_VALIDATION_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.validation_status && (
          <p className="mt-1 text-sm text-red-500">{errors.validation_status}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-200 mb-1">
          Comments *
        </label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments || ''}
          onChange={handleChange}
          rows={5}
          disabled={!isReady}
          placeholder="Provide detailed comments about the task validation..."
          className={isIntegratedView 
            ? "block w-full rounded-md bg-[#1a1a2e] border-gray-700 text-white p-2 focus:border-[#4c0e8f] focus:outline-none disabled:opacity-70" 
            : "mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70"
          }
        />
        {errors.comments && (
          <p className="mt-1 text-sm text-red-500">{errors.comments}</p>
        )}
      </div>
      
      <div className={isIntegratedView ? "flex justify-end mt-4" : "flex justify-end space-x-3"}>
        {!isIntegratedView && (
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !isReady}
          className={isIntegratedView 
            ? "px-4 py-2 bg-[#4c0e8f] rounded-md text-white font-medium hover:bg-[#3a0b6b] disabled:opacity-50 disabled:cursor-not-allowed"
            : "px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          }
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Validating...') 
            : (isEditing ? 'Update Validation' : 'Submit Validation')}
        </button>
      </div>
    </form>
  );
}