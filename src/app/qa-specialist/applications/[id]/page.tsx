// src/app/qa-specialist/applications/[id]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useApplicationDetail } from '@/hooks/UseApplications';
import Link from 'next/link';
import { testCaseService } from '@/services/TestCaseService';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import QASpecialistSidebar from '@/components/organisms/sidebar/QASpecialistSidebar';

export default function QAApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    application,
    isLoading,  
    error,
    statistics,
    isLoadingStatistics,
    progress,
    isLoadingProgress
  } = useApplicationDetail(id as string);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteTestCase = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test case?")) return;
    
    // Check if user is a QA specialist
    if (!user || user.role !== 'qa_specialist') {
      setDeleteError("You must be logged in as a QA specialist to delete test cases");
      return;
    }
    
    try {
      setDeletingId(testId);
      setDeleteError(null);
      
      // Pass the qa_id for ownership verification
      await testCaseService.deleteTestCase(testId, user.qa_id);
      
      // Reload the page to show updated list
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete test case:", err);
      if (err.response?.status === 403) {
        setDeleteError("You don't have permission to delete this test case");
      } else {
        setDeleteError(err.message || "Failed to delete test case");
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0b1e] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        {/* Sidebar */}
        <div className="w-64">
          <QASpecialistSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error.message}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#4c0e8f] rounded-md text-white font-medium hover:bg-[#3a0b6b]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        {/* Sidebar */}
        <div className="w-64">
          <QASpecialistSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6 text-white text-center">
          Application not found
        </div>
      </div>
    );
  }

  // Check if user is a QA specialist
  const isQASpecialist = user?.role === "qa_specialist";
  // Safely access qa_id only if user is a QA specialist
  const currentQaId = isQASpecialist && user ? user.qa_id : null;

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <QASpecialistSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{application.app_name}</h1>

          <Link
            href="/qa-specialist/applications"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>

        {deleteError && (
          <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4">
            {deleteError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-md">
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
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-gray-400">Client:</dt>
                <dd className="col-span-2 text-white">
                  {application.client?.name || 'N/A'}
                  {application.client?.company && ` (${application.client.company})`}
                </dd>
              </div>
              <div className="col-span-3">
                <dt className="text-gray-400 mb-2">Description:</dt>
                <dd className="text-white bg-[#212145] p-3 rounded">{application.description || 'No description provided.'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-md">
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
                  <div className="w-full bg-[#212145] rounded-full h-2">
                    <div className="bg-[#4c0e8f] h-2 rounded-full" style={{ width: `${progress.percentage || 0}%` }}></div>
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

        <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Testing Statistics</h2>
          {isLoadingStatistics ? (
            <p className="text-center py-4">Loading statistics...</p>
          ) : statistics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-[#212145] p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Bug Reports</p>
                <p className="text-2xl font-bold text-white">{statistics.total_bug_reports || 0}</p>
              </div>
              <div className="bg-[#212145] p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Critical Bugs</p>
                <p className="text-2xl font-bold text-red-300">{statistics.critical_bugs || 0}</p>
              </div>
              <div className="bg-[#212145] p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Validated Bugs</p>
                <p className="text-2xl font-bold text-green-300">{statistics.validated_bugs || 0}</p>
              </div>
              <div className="bg-[#212145] p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Testers</p>
                <p className="text-2xl font-bold text-blue-300">{statistics.total_testers || 0}</p>
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-400">No statistics available</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-200">Test Cases</h2>
          <Link
            href={`/qa-specialist/applications/${id}/test-cases/new`}
            className="px-4 py-2 bg-[#4c0e8f] text-white rounded-md hover:bg-[#3a0b6b]"
          >
            Add Test Case
          </Link>
        </div>

        <div className="mt-4 bg-[#1a1a2e] p-6 rounded-lg shadow-md">
          {application.test_cases?.length ? (
            <ul className="space-y-4">
              {application.test_cases.map(tc => {
                // Check if current user owns this test case
                const isOwner = isQASpecialist && currentQaId && tc.qa_id === currentQaId;
                
                return (
                  <li key={tc.test_id} className="text-white border-b border-gray-700 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/qa-specialist/applications/${id}/test-cases/${tc.test_id}`} className="hover:underline">
                          <h3 className="font-semibold text-lg">{tc.test_title}</h3>
                        </Link>
                        {tc.test_steps && (
                          <p className="text-sm text-gray-300 whitespace-pre-wrap mt-1">{tc.test_steps.slice(0, 100)}{tc.test_steps.length > 100 ? '...' : ''}</p>
                        )}
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            tc.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                            tc.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {tc.priority}
                          </span>
                          
                          <span className="text-gray-400">
                            Created by: {isOwner ? 'You' : (tc.qa_specialist?.name || 'Unknown QA Specialist')}
                          </span>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex flex-col items-end space-y-2">
                          <Link
                            href={`/qa-specialist/applications/${id}/test-cases/${tc.test_id}/edit`}
                            className="text-sm text-blue-400 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteTestCase(tc.test_id)}
                            disabled={deletingId === tc.test_id}
                            className="text-sm text-red-400 hover:underline disabled:opacity-50"
                          >
                            {deletingId === tc.test_id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-400">No test cases created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}