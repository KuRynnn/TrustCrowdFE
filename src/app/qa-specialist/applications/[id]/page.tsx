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
  
  // Format priority with capitalized first letter
  const formatPriority = (priority: string): string => {
    if (!priority) return '';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
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
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-[#212145] p-3 rounded">
                    <h3 className="text-sm text-gray-300 mb-2">UAT Tasks Status</h3>
                    <dl className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <dt className="text-gray-400 text-sm">Total</dt>
                      <dd className="text-white font-semibold">{progress.tasks_by_status?.total || 0}</dd>
                      
                      <dt className="text-gray-400 text-sm">Assigned</dt>
                      <dd className="text-white">{progress.tasks_by_status?.assigned || 0}</dd>
                      
                      <dt className="text-gray-400 text-sm">In Progress</dt>
                      <dd className="text-yellow-300">{progress.tasks_by_status?.in_progress || 0}</dd>
                      
                      <dt className="text-gray-400 text-sm">Completed</dt>
                      <dd className="text-blue-300">{progress.tasks_by_status?.completed || 0}</dd>
                      
                      <dt className="text-gray-400 text-sm">Revision Required</dt>
                      <dd className="text-orange-300">{progress.tasks_by_status?.revision_required || 0}</dd>
                      
                      <dt className="text-gray-400 text-sm">Verified</dt>
                      <dd className="text-green-300">{progress.tasks_by_status?.verified || 0}</dd>
                      
                      <dt className="text-gray-400 text-sm">Rejected</dt>
                      <dd className="text-red-300">{progress.tasks_by_status?.rejected || 0}</dd>
                    </dl>
                  </div>
                  
                  <div className="bg-[#212145] p-3 rounded">
                    <h3 className="text-sm text-gray-300 mb-2">Participation</h3>
                    <dl className="grid grid-cols-1 gap-y-2">
                      <div>
                        <dt className="text-gray-400 text-sm">Test Cases</dt>
                        <dd className="text-white font-semibold">{progress.total_test_cases || 0}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-gray-400 text-sm">Crowdworkers</dt>
                        <dd className="text-white font-semibold">{progress.total_crowdworkers || 0}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-gray-400 text-sm">Total Possible Tasks</dt>
                        <dd className="text-white">
                          {progress.total_possible_tasks || 0} 
                          <span className="text-xs text-gray-400 ml-1">
                            ({progress.total_crowdworkers || 0} × {progress.total_test_cases || 0})
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
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
          ) : statistics && statistics.summary ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-[#212145] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Total Bugs</p>
                  <p className="text-2xl font-bold text-white">{statistics.summary.total_bugs || 0}</p>
                </div>
                <div className="bg-[#212145] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Critical Bugs</p>
                  <p className="text-2xl font-bold text-red-300">{statistics.summary.critical_bugs || 0}</p>
                </div>
                <div className="bg-[#212145] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Valid Bugs</p>
                  <p className="text-2xl font-bold text-green-300">{statistics.summary.valid_bugs || 0}</p>
                </div>
                <div className="bg-[#212145] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Pending Validation</p>
                  <p className="text-2xl font-bold text-yellow-300">{statistics.summary.pending_validation || 0}</p>
                </div>
              </div>
              
              {statistics.test_case_statistics && statistics.test_case_statistics.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <h3 className="text-lg font-medium text-gray-200 mb-3">Test Case Statistics</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-[#212145]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Test Case</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Crowdworkers</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Total Bugs</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Critical</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">High</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Medium</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Low</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Valid</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Invalid</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {statistics.test_case_statistics.map((tc) => (
                        <tr 
                          key={tc.test_id} 
                          className={`hover:bg-[#212145]/50 ${tc.critical_bugs > 0 ? 'bg-red-900/10' : ''}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">{tc.test_title}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              tc.priority.toLowerCase() === 'high' ? 'bg-red-500/20 text-red-300' :
                              tc.priority.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {tc.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">{tc.crowdworkers_count}</td>
                          <td className="px-4 py-3 text-center font-medium">{tc.total_bugs}</td>
                          <td className="px-4 py-3 text-center text-red-300 font-medium">{tc.critical_bugs}</td>
                          <td className="px-4 py-3 text-center text-orange-300">{tc.high_bugs}</td>
                          <td className="px-4 py-3 text-center text-yellow-300">{tc.medium_bugs}</td>
                          <td className="px-4 py-3 text-center text-blue-300">{tc.low_bugs}</td>
                          <td className="px-4 py-3 text-center text-green-300">{tc.valid_bugs}</td>
                          <td className="px-4 py-3 text-center text-gray-400">{tc.invalid_bugs}</td>
                          <td className="px-4 py-3 text-center text-yellow-300">{tc.pending_validation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-400">No statistics available</p>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Test Cases</h2>
          <Link
            href={`/qa-specialist/applications/${id}/test-cases/new`}
            className="px-4 py-2 bg-[#4c0e8f] text-white rounded-md hover:bg-[#3a0b6b]"
          >
            Add Test Case
          </Link>
        </div>
        
        {application.test_cases?.length ? (
          <div className="space-y-6">
            {application.test_cases.map(tc => {
              // Check if current user owns this test case
              const isOwner = isQASpecialist && currentQaId && tc.qa_id === currentQaId;
              
              return (
                <div key={tc.test_id} className="bg-[#1a1a2e] rounded-lg shadow-md border border-gray-700 overflow-hidden">
                  {/* Test case header */}
                  <div className="bg-[#212145] p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{tc.test_title}</h3>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          tc.priority === 'high' || tc.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                          tc.priority === 'medium' || tc.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {formatPriority(tc.priority)}
                        </span>
                        
                        <span className="text-gray-400">
                          Created by: {isOwner ? 'You' : (tc.qa_specialist?.name || 'Unknown QA Specialist')}
                        </span>
                      </div>
                    </div>
                    
                    {isOwner && (
                      <div className="flex space-x-3">
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
                  
                  {/* GWT Format */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-start">
                      <div className="w-20 h-8 bg-blue-900/30 flex items-center justify-center rounded-md">
                        <span className="text-blue-400 font-medium text-sm">GIVEN</span>
                      </div>
                      <div className="ml-4 text-gray-300 flex-grow">
                        <div className="whitespace-pre-wrap">{tc.given_context || 'No context provided'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-20 h-8 bg-green-900/30 flex items-center justify-center rounded-md">
                        <span className="text-green-400 font-medium text-sm">WHEN</span>
                      </div>
                      <div className="ml-4 text-gray-300 flex-grow">
                        <div className="whitespace-pre-wrap">{tc.when_action || 'No actions provided'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-20 h-8 bg-purple-900/30 flex items-center justify-center rounded-md">
                        <span className="text-purple-400 font-medium text-sm">THEN</span>
                      </div>
                      <div className="ml-4 text-gray-300 flex-grow">
                        <div className="whitespace-pre-wrap">{tc.then_result || 'No expected results provided'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-400">No test cases created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}