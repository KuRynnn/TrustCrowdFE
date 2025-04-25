// src/app/client/applications/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useApplicationDetail } from '@/hooks/UseApplications';
import Link from 'next/link';
import ClientSidebar from '@/components/organisms/sidebar/ClientSidebar';

export default function ClientApplicationDetailPage() {
  const { id } = useParams();
  const { application, isLoading, error, statistics, isLoadingStatistics, progress, isLoadingProgress } = useApplicationDetail(id as string);

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="p-8 text-center text-white">Loading application...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading application: {error.message}
          </div>
        ) : !application ? (
          <div className="p-8 text-center text-white">Application not found</div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">{application.app_name}</h1>

              <div className="flex space-x-3">
                <Link
                  href={`/client/application/${id}/final-report`}
                  className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700"
                >
                  View Final Report
                </Link>
                <Link
                  href={`/client/application/${id}/edit`}
                  className="px-4 py-2 bg-yellow-600 rounded-md text-white font-medium hover:bg-yellow-700"
                >
                  Edit
                </Link>
                <Link
                  href="/client/application"
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
                      <a href={application.app_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
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
                    <dd className="col-span-2 text-white">{new Date(application.created_at).toLocaleDateString()}</dd>
                  </div>
                  <div className="col-span-3">
                    <dt className="text-gray-400 mb-2">Description:</dt>
                    <dd className="text-white bg-gray-700 p-3 rounded">{application.description || 'No description provided.'}</dd>
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
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress.percentage || 0}%` }}></div>
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-4 mt-4">
                      <div><dt className="text-gray-400 text-sm">Test Cases</dt><dd className="text-2xl font-bold text-white">{progress.total_test_cases || 0}</dd></div>
                      <div><dt className="text-gray-400 text-sm">Completed</dt><dd className="text-2xl font-bold text-green-300">{progress.completed_test_cases || 0}</dd></div>
                      <div><dt className="text-gray-400 text-sm">In Progress</dt><dd className="text-2xl font-bold text-yellow-300">{progress.in_progress_test_cases || 0}</dd></div>
                      <div><dt className="text-gray-400 text-sm">Not Started</dt><dd className="text-2xl font-bold text-gray-300">{progress.not_started_test_cases || 0}</dd></div>
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
          </>
        )}
      </div>
    </div>
  );
}
