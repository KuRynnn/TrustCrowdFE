'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBugValidationDetail } from '@/hooks/UseBugValidations';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function BugValidationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { 
    validation, 
    isLoading, 
    error,
    statistics,
    isLoadingStatistics
  } = useBugValidationDetail(id as string);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Valid':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'Invalid':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'Needs More Info':
        return <HelpCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-900/30 text-green-300';
      case 'Invalid':
        return 'bg-red-900/30 text-red-300';
      case 'Needs More Info':
        return 'bg-yellow-900/30 text-yellow-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
        <p>Loading validation...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading validation: {error.message}
      </div>
    );
  }
  
  if (!validation) {
    return <div className="p-8 text-center">Validation not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          Bug Validation
          <span className={`ml-3 px-3 py-1 text-sm rounded-full inline-flex items-center gap-1.5 ${getStatusClass(validation.validation_status)}`}>
            {getStatusIcon(validation.validation_status)}
            {validation.validation_status}
          </span>
        </h1>
        
        <div className="flex space-x-3">
          <Link
            href={`/bug-validations/${id}/edit`}
            className="px-4 py-2 bg-yellow-600 rounded-md text-white font-medium hover:bg-yellow-700"
          >
            Edit
          </Link>
          <Link
            href="/bug-validations"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Validation Details</h2>
          
          <dl className="grid grid-cols-1 gap-y-4">
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">QA Specialist:</dt>
              <dd className="col-span-2 text-white">
                {validation.qa_specialist?.name || 'N/A'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Status:</dt>
              <dd className="col-span-2">
                <span className={`px-2 py-1 rounded text-xs ${getStatusClass(validation.validation_status)}`}>
                  {validation.validation_status}
                </span>
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Validated At:</dt>
              <dd className="col-span-2 text-white">
                {validation.validated_at 
                  ? new Date(validation.validated_at).toLocaleString() 
                  : 'Not validated yet'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Created:</dt>
              <dd className="col-span-2 text-white">
                {new Date(validation.created_at).toLocaleDateString()}
              </dd>
            </div>
            
            {validation.validation_time !== undefined && (
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-gray-400">Validation Time:</dt>
                <dd className="col-span-2 text-white">
                  {validation.validation_time} minutes
                </dd>
              </div>
            )}
            
            <div className="col-span-3">
              <dt className="text-gray-400 mb-2">Comments:</dt>
              <dd className="text-white bg-gray-700 p-3 rounded whitespace-pre-line">
                {validation.comments}
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Bug Report Details</h2>
          
          {validation.bug_report ? (
            <dl className="grid grid-cols-1 gap-y-4">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-gray-400">Bug ID:</dt>
                <dd className="col-span-2 text-white">
                  <Link 
                    href={`/bug-reports/${validation.bug_id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {validation.bug_id}
                  </Link>
                </dd>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-gray-400">Severity:</dt>
                <dd className="col-span-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    validation.bug_report.severity === 'Critical' ? 'bg-red-900/30 text-red-300' :
                    validation.bug_report.severity === 'High' ? 'bg-orange-900/30 text-orange-300' :
                    validation.bug_report.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-blue-900/30 text-blue-300'
                  }`}>
                    {validation.bug_report.severity}
                  </span>
                </dd>
              </div>
              
              <div className="col-span-3">
                <dt className="text-gray-400 mb-2">Description:</dt>
                <dd className="text-white bg-gray-700 p-3 rounded text-sm">
                  {validation.bug_report.bug_description}
                </dd>
              </div>
              
              <div className="col-span-3">
                <dt className="text-gray-400 mb-2">Steps to Reproduce:</dt>
                <dd className="text-white bg-gray-700 p-3 rounded text-sm">
                  {validation.bug_report.steps_to_reproduce}
                </dd>
              </div>
              
              {validation.bug_report.screenshot_url && (
                <div className="col-span-3">
                  <dt className="text-gray-400 mb-2">Screenshot:</dt>
                  <dd>
                    <img 
                      src={validation.bug_report.screenshot_url} 
                      alt="Bug Screenshot" 
                      className="max-w-full h-auto rounded border border-gray-700"
                    />
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-center py-4 text-gray-400">No bug report details available</p>
          )}
        </div>
      </div>
      
      {statistics && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Validation Statistics</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Total Validations</p>
              <p className="text-2xl font-bold text-white">{statistics.total_validations}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Valid Bugs</p>
              <p className="text-2xl font-bold text-green-300">{statistics.valid_bugs}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Invalid Bugs</p>
              <p className="text-2xl font-bold text-red-300">{statistics.invalid_bugs}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Needs More Info</p>
              <p className="text-2xl font-bold text-yellow-300">{statistics.needs_more_info}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Avg. Time</p>
              <p className="text-2xl font-bold text-blue-300">{statistics.average_validation_time} min</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
