// src/app/applications/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useApplicationDetail } from '@/hooks/UseApplications';
import Link from 'next/link';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { 
    application, 
    isLoading, 
    error,
    statistics,
    isLoadingStatistics,
    progress,
    isLoadingProgress
  } = useApplicationDetail(id as string);
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading application...</div>;
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading application: {error.message}
      </div>
    );
  }
  
  if (!application) {
    return <div className="p-8 text-center">Application not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{application.app_name}</h1>
        
        <div className="flex space-x-3">
          <Link
            href={`/applications/${id}/edit`}
            className="px-4 py-2 bg-yellow-600 rounded-md text-white font-medium hover:bg-yellow-700"
          >
            Edit
          </Link>
          <Link
            href="/applications"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Application Details</h2>
          
          <dl className="grid grid-cols-1 gap-y-4">
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">URL:</dt>
              <dd className="col-span-2">
                <a
                  href={application.app_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {application.app_url}
                </a>
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Platform:</dt>
              <dd className="col-span-2 text-white">{application.platform}</dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Status:</dt>
              <dd className="col-span-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  application.status === 'active' ? 'bg-green-500/20 text-green-300' :
                  application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                  application.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Created:</dt>
              <dd className="col-span-2 text-white">
                {new Date(application.created_at).toLocaleDateString()}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Client:</dt>
              <dd className="col-span-2 text-white">
                {application.client?.name || 'N/A'}
                {application.client?.company && ` (${application.client.company})`}
              </dd>
            </div>
            
            <div className="col-span-3">
              <dt className="text-gray-400 mb-2">Description:</dt>
              <dd className="text-white bg-gray-700 p-3 rounded">
                {application.description || 'No description provided.'}
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Testing Progress</h2>
          
          {isLoadingProgress ? (
            <p className="text-center py-4">Loading progress data...</p>
          ) : progress ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Overall Progress</span>
                  <span className="text-gray-300">{progress.percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${progress.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <dl className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <dt className="text-gray-400 text-sm">Test Cases</dt>
                  <dd className="text-2xl font-bold text-white">{progress.total_test_cases || 0}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-sm">Completed</dt>
                  <dd className="text-2xl font-bold text-green-300">{progress.completed_test_cases || 0}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-sm">In Progress</dt>
                  <dd className="text-2xl font-bold text-yellow-300">{progress.in_progress_test_cases || 0}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-sm">Not Started</dt>
                  <dd className="text-2xl font-bold text-gray-300">{progress.not_started_test_cases || 0}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-400">No progress data available</p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Testing Statistics</h2>
        
        {isLoadingStatistics ? (
          <p className="text-center py-4">Loading statistics...</p>
        ) : statistics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Bug Reports</p>
              <p className="text-2xl font-bold text-white">{statistics.total_bug_reports || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Critical Bugs</p>
              <p className="text-2xl font-bold text-red-300">{statistics.critical_bugs || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Validated Bugs</p>
              <p className="text-2xl font-bold text-green-300">{statistics.validated_bugs || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Testers</p>
              <p className="text-2xl font-bold text-blue-300">{statistics.total_testers || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-400">No statistics available</p>
        )}
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">
          Test Cases
          <span className="ml-2 px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300">
            {application.test_cases?.length || 0}
          </span>
        </h2>
        
        {application.test_cases?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {application.test_cases.map((testCase) => (
                  <tr key={testCase.test_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {testCase.test_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {testCase.test_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/test-cases/${testCase.test_id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-400">No test cases available</p>
        )}
        
        <div className="mt-4 flex justify-end">
          <Link
            href={`/test-cases/new?app_id=${id}`}
            className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700"
          >
            Add Test Case
          </Link>
        </div>
      </div>
    </div>
  );
}