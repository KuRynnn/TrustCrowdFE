'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTestCaseDetail } from '@/hooks/UseTestCases';
import Link from 'next/link';

export default function TestCaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { 
    testCase, 
    isLoading, 
    error,
    statistics,
    isLoadingStatistics
  } = useTestCaseDetail(id as string);
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading test case...</div>;
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading test case: {error.message}
      </div>
    );
  }
  
  if (!testCase) {
    return <div className="p-8 text-center">Test case not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{testCase.test_title}</h1>
        
        <div className="flex space-x-3">
          <Link
            href={`/test-cases/${id}/edit`}
            className="px-4 py-2 bg-yellow-600 rounded-md text-white font-medium hover:bg-yellow-700"
          >
            Edit
          </Link>
          <Link
            href="/test-cases"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Test Case Details</h2>
          
          <dl className="grid grid-cols-1 gap-y-4">
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Application:</dt>
              <dd className="col-span-2 text-white">
                {testCase.application?.app_name || 'N/A'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">QA Specialist:</dt>
              <dd className="col-span-2 text-white">
                {testCase.qa_specialist?.name || 'N/A'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Priority:</dt>
              <dd className="col-span-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  testCase.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                  testCase.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {testCase.priority}
                </span>
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-gray-400">Created:</dt>
              <dd className="col-span-2 text-white">
                {new Date(testCase.created_at).toLocaleDateString()}
              </dd>
            </div>
            
            <div className="col-span-3">
              <dt className="text-gray-400 mb-2">Test Steps:</dt>
              <dd className="text-white bg-gray-700 p-3 rounded whitespace-pre-line">
                {testCase.test_steps}
              </dd>
            </div>
            
            <div className="col-span-3">
              <dt className="text-gray-400 mb-2">Expected Result:</dt>
              <dd className="text-white bg-gray-700 p-3 rounded">
                {testCase.expected_result}
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Testing Statistics</h2>
          
          {isLoadingStatistics ? (
            <p className="text-center py-4">Loading statistics...</p>
          ) : statistics ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{statistics.total_tasks || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-300">{statistics.completed_tasks || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-yellow-300">{statistics.in_progress_tasks || 0}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Not Started</p>
                <p className="text-2xl font-bold text-gray-300">{statistics.not_started_tasks || 0}</p>
              </div>
              <div className="col-span-2 bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Bug Reports</p>
                <p className="text-2xl font-bold text-red-300">{statistics.bug_reports || 0}</p>
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-400">No statistics available</p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">
          UAT Tasks
          <span className="ml-2 px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300">
            {testCase.uat_tasks?.length || 0}
          </span>
        </h2>
        
        {testCase.uat_tasks?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {testCase.uat_tasks.map((task) => (
                  <tr key={task.task_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {task.task_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {task.assigned_to.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Not completed'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/uat-tasks/${task.task_id}`}
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
          <p className="text-center py-4 text-gray-400">No UAT tasks available</p>
        )}
        
        <div className="mt-4 flex justify-end">
          <Link
            href={`/uat-tasks/new?test_id=${id}`}
            className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700"
          >
            Create UAT Task
          </Link>
        </div>
      </div>
    </div>
  );
}
