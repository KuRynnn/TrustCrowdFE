// src/components/organisms/bug-validation/BugValidationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bugValidationService } from '@/services/BugValidationService';
import { BugReportService } from '@/services/BugReportService';
import { BugValidation, CreateBugValidationData, UpdateBugValidationData } from '@/types/BugValidation';
import { BugReport } from '@/types/BugReport';
import { BUG_VALIDATION_STATUS_OPTIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';

interface BugValidationFormProps {
  initialData?: BugValidation;
  isEditing?: boolean;
  bugReportId?: string;
  onValidationSuccess?: () => void; // Add callback for in-page validation
}

export default function BugValidationForm({ 
  initialData, 
  isEditing = false, 
  bugReportId,
  onValidationSuccess 
}: BugValidationFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bugReport, setBugReport] = useState<BugReport | null>(null);
  const [isLoadingBugReport, setIsLoadingBugReport] = useState(false);
  
  const [formData, setFormData] = useState<CreateBugValidationData>({
    bug_id: initialData?.bug_id || bugReportId || '',
    qa_id: initialData?.qa_id || (user?.role === 'qa_specialist' ? user.qa_id : ''),
    validation_status: initialData?.validation_status || 'Valid',
    comments: initialData?.comments || '',
    validated_at: initialData?.validated_at || undefined
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchBugReport = async () => {
      if (!formData.bug_id) return;
      
      try {
        setIsLoadingBugReport(true);
        const data = await BugReportService.getById(formData.bug_id);
        setBugReport(data);
      } catch (error) {
        console.error('Failed to fetch bug report:', error);
      } finally {
        setIsLoadingBugReport(false);
      }
    };
    
    fetchBugReport();
  }, [formData.bug_id]);
  
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
    
    if (!formData.bug_id) {
      newErrors.bug_id = 'Bug report is required';
    }
    
    if (!formData.qa_id) {
      newErrors.qa_id = 'QA Specialist is required';
    }
    
    if (!formData.validation_status) {
      newErrors.validation_status = 'Validation status is required';
    }
    
    if (!formData.comments.trim()) {
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
        // If editing, update the validation
        await bugValidationService.updateValidation(initialData.validation_id, formData as UpdateBugValidationData);
      } else {
        // If creating a new validation
        await bugValidationService.createValidation({
          ...formData,
          validated_at: new Date().toISOString()
        });
      }
      
      // If callback provided, use it instead of navigation
      if (onValidationSuccess) {
        onValidationSuccess();
      } else {
        // Redirect to bug validations page or bug report detail page
        if (bugReportId) {
          router.push(`/bug-reports/${bugReportId}`);
        } else {
          router.push('/bug-validations');
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
      
      {bugReport && !isIntegratedView && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Bug Report Details</h3>
          <div className="grid grid-cols-1 gap-y-2">
            <div className="flex items-center">
              <span className="text-gray-400 w-24">ID:</span>
              <span className="text-white">{bugReport.bug_id}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Severity:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                bugReport.severity === 'Critical' ? 'bg-red-900/30 text-red-300' :
                bugReport.severity === 'High' ? 'bg-orange-900/30 text-orange-300' :
                bugReport.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                'bg-blue-900/30 text-blue-300'
              }`}>
                {bugReport.severity}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Description:</span>
              <div className="text-white bg-gray-700 p-2 rounded text-sm">
                {bugReport.bug_description}
              </div>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Steps to Reproduce:</span>
              <div className="text-white bg-gray-700 p-2 rounded text-sm">
                {bugReport.steps_to_reproduce}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!isEditing && !bugReportId && !isIntegratedView && (
        <div>
          <label htmlFor="bug_id" className="block text-sm font-medium text-gray-200">
            Bug Report ID *
          </label>
          <input
            type="text"
            id="bug_id"
            name="bug_id"
            value={formData.bug_id}
            onChange={handleChange}
            disabled={!!bugReportId || isLoadingBugReport}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70"
          />
          {errors.bug_id && (
            <p className="mt-1 text-sm text-red-500">{errors.bug_id}</p>
          )}
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
          className={isIntegratedView 
            ? "block w-full rounded-md bg-[#1a1a2e] border-gray-700 text-white p-2 focus:border-[#4c0e8f] focus:outline-none" 
            : "mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          }
        >
          {BUG_VALIDATION_STATUS_OPTIONS.map((option) => (
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
          value={formData.comments}
          onChange={handleChange}
          rows={5}
          placeholder="Provide detailed comments about the validation..."
          className={isIntegratedView 
            ? "block w-full rounded-md bg-[#1a1a2e] border-gray-700 text-white p-2 focus:border-[#4c0e8f] focus:outline-none" 
            : "mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
          disabled={isSubmitting}
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