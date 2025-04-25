'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUATTaskDetail } from '@/hooks/UseUATTasks';
import Link from 'next/link';
import { Loader2, Play, CheckCircle } from 'lucide-react';

export default function UATTaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { 
    task, 
    isLoading, 
    error,
    statistics,
    isLoadingStatistics,
    startTask,
    completeTask
  } = useUATTaskDetail(id as string);
  
  const handleStartTask = async () => {
    const result = await startTask();
    if (!result.success) {
      alert(`Failed to start task: ${result.error?.message || 'Unknown error'}`);
    }
  };
  
  const handleCompleteTask = async () => {
    const result = await completeTask();
    if (!result.success) {
      alert(`Failed to complete task: ${result.error?.message || 'Unknown error'}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
        <p>Loading UAT task...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading UAT task: {error.message}
      </div>
    );
  }
  
  if (!task) {
    return <div className="p-8 text-center">UAT task not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          UAT Task: {task.test_case?.test_title || 'N/A'}
        </h1>
        
        <div className="flex space-x-3">
          {task.status === 'Assigned' && (
            <button
              onClick={handleStartTask}
              className="px-4 py-2 bg-green-600 rounded-md text-white font-medium hover:bg-green-700 inline-flex items-center gap-2"
            >
              <Play size={18} />
              <span>Start Task</span>
            </button>
          )}
          
          {task.status === 'In Progress' && (
            <button
              onClick={handleCompleteTask}
              className="px-4 py-2 bg-green-600 rounded-md text-white font-medium hover:bg-green-700 inline-flex items-center gap-2"
            >
              <CheckCircle size={18} />
              <span>Complete Task</span>
            </button>
          )}
          
          <Link
            href={`/uat-tasks/${id}/edit`}
            className="px-4 py-2 bg-yellow-600 rounded-md text-white font-medium hover:bg-yellow-700"
          >
            Edit
          </Link>
          <Link
            href="/uat-tasks"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Task Details</h2>
          
          <dl className="grid grid-cols-1 gap-y-4">
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Application:</dt>
              <dd className="col-span-2 text-white">
                {task.application?.app_name || 'N/A'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Test Case:</dt>
              <dd className="col-span-2 text-white">
                {task.test_case?.test_title || 'N/A'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Crowdworker:</dt>
              <dd className="col-span-2 text-white">
                {task.crowdworker?.name || 'N/A'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Status:</dt>
              <dd className="col-span-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  task.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                  task.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {task.status}
                </span>
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Created:</dt>
              <dd className="col-span-2 text-white">
                {new Date(task.created_at).toLocaleDateString()}
              </dd>
            </div>
            
            {task.started_at && (
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-gray-400">Started:</dt>
                <dd className="col-span-2 text-white">
                  {new Date(task.started_at).toLocaleString()}
                </dd>
              </div>
            )}
            
            {task.completed_at && (
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-gray-400">Completed:</dt>
                <dd className="col-span-2 text-white">
                  {new Date(task.completed_at).toLocaleString()}
                </dd>
              </div>
            )}
            
            {task.duration !== undefined && (
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-gray-400">Duration:</dt>
                <dd className="col-span-2 text-white">
                  {task.duration} minutes
                </dd>
              </div>
            )}
          </dl>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Test Case Details</h2>
          
          {task.test_case ? (
            <dl className="grid grid-cols-1 gap-y-4">
              <div className="col-span-1">
                <dt className="text-gray-400 mb-2">Test Steps:</dt>
                <dd className="text-white bg-gray-700 p-3 rounded whitespace-pre-line">
                  {task.test_case.test_steps}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-center py-4 text-gray-400">No test case details available</p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">
          Bug Reports
          <span className="ml-2 px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300">
            {task.bug_reports?.length || 0}
          </span>
        </h2>
        
        {task.bug_reports?.length ? (
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
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {task.bug_reports.map((bug) => (
                  <tr key={bug.bug_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {bug.bug_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {bug.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bug.severity === 'Critical' ? 'bg-red-500/20 text-red-300' :
                        bug.severity === 'High' ? 'bg-orange-500/20 text-orange-300' :
                        bug.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {bug.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/bug-reports/${bug.bug_id}`}
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
          <p className="text-center py-4 text-gray-400">No bug reports available</p>
        )}
        
        <div className="mt-4 flex justify-end">
          <Link
            href={`/bug-reports/new?task_id=${id}`}
            className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700"
          >
            Report Bug
          </Link>
        </div>
      </div>
    </div>
  );
}
