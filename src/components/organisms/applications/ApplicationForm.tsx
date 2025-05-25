// src/components/applications/ApplicationForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { applicationService } from '@/services/ApplicationService';
import { Application, CreateApplicationData, UpdateApplicationData } from '@/types/Application';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Info } from 'lucide-react';

interface ApplicationFormProps {
  initialData?: Application;
  isEditing?: boolean;
}

export default function ApplicationForm({ initialData, isEditing = false }: ApplicationFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateApplicationData>({
    app_name: initialData?.app_name || '',
    app_url: initialData?.app_url || '',
    platform: initialData?.platform || '',
    description: initialData?.description || '',
    client_id: initialData?.client?.client_id || (user?.role === 'client' ? user.client_id : ''),
    status: initialData?.status || undefined,
    max_testers: initialData?.max_testers || 10
  });
  
  // Update client_id when user changes
  useEffect(() => {
    if (user?.role === 'client' && !formData.client_id) {
      setFormData(prev => ({
        ...prev,
        client_id: user.client_id
      }));
    }
  }, [user, formData.client_id]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'max_testers') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
    
    if (!formData.app_name.trim()) {
      newErrors.app_name = 'Application name is required';
    }
    
    if (!(formData.app_url || '').trim()) {
      newErrors.app_url = 'Application URL is required';
    } else if (!/^https?:\/\//.test(formData.app_url || '')) {
      newErrors.app_url = 'URL must start with http:// or https://';
    }    
    
    if (!formData.platform.trim()) {
      newErrors.platform = 'Platform is required';
    }
    
    if (!formData.client_id) {
      newErrors.client_id = 'Client ID is required';
    }
    
    // Validate max_testers
    if (formData.max_testers < 1) {
      newErrors.max_testers = 'At least 1 tester must be allowed';
    } else if (formData.max_testers > 100) {
      newErrors.max_testers = 'Maximum 100 testers allowed';
    }
    
    // Check if editing and trying to reduce below current workers
    if (isEditing && initialData?.current_workers && formData.max_testers < initialData.current_workers) {
      newErrors.max_testers = `Cannot set below ${initialData.current_workers} as there are already ${initialData.current_workers} testers working`;
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
        // If editing, update the application
        await applicationService.updateApplication(initialData.app_id, formData as UpdateApplicationData);
      } else {
        // If creating a new application
        await applicationService.createApplication(formData);
      }
      
      // Redirect to applications page
      router.push('/client/application');
    } catch (error: any) {
      console.error("Application creation error:", error);
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
        <label htmlFor="app_name" className="block text-sm font-medium text-gray-200">
          Application Name *
        </label>
        <input
          type="text"
          id="app_name"
          name="app_name"
          value={formData.app_name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {errors.app_name && (
          <p className="mt-1 text-sm text-red-500">{errors.app_name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="app_url" className="block text-sm font-medium text-gray-200">
          Application URL *
        </label>
        <input
          type="url"
          id="app_url"
          name="app_url"
          value={formData.app_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          placeholder="https://example.com"
        />
        {errors.app_url && (
          <p className="mt-1 text-sm text-red-500">{errors.app_url}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-gray-200">
          Platform *
        </label>
        <select
          id="platform"
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        >
          <option value="">Select Platform</option>
          <option value="web">Web</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="desktop">Desktop</option>
          <option value="hybrid">Hybrid</option>
        </select>
        {errors.platform && (
          <p className="mt-1 text-sm text-red-500">{errors.platform}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="max_testers" className="block text-sm font-medium text-gray-200">
          Maximum Testers *
        </label>
        <div className="mt-1 relative">
          <input
            type="number"
            id="max_testers"
            name="max_testers"
            value={formData.max_testers}
            onChange={handleChange}
            min="1"
            max="100"
            className="block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
          {isEditing && initialData?.current_workers !== undefined && (
            <div className="mt-2 flex items-start gap-2 text-sm text-blue-300">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <span>Currently {initialData.current_workers} tester{initialData.current_workers !== 1 ? 's' : ''} working on this application</span>
            </div>
          )}
        </div>
        {errors.max_testers && (
          <p className="mt-1 text-sm text-red-500">{errors.max_testers}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Set the maximum number of testers allowed to work on this application (1-100)
        </p>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-200">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
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
            : (isEditing ? 'Update Application' : 'Create Application')}
        </button>
      </div>
    </form>
  );
}