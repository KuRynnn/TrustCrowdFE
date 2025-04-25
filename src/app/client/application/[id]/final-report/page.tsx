'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApplicationDetail } from '@/hooks/UseApplications';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { ClipboardCheck, AlertTriangle, CheckCircle, XCircle, FileText, ArrowLeft } from 'lucide-react';
import ClientSidebar from '@/components/organisms/sidebar/ClientSidebar';

export default function FinalReportPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    application, 
    isLoading: isLoadingApp,
    finalReport, 
    isLoadingFinalReport, 
    finalReportError,
    fetchFinalReport
  } = useApplicationDetail(id);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'client') {
        router.push('/dashboard');
        return;
      }
      
      // Fetch the final report with client_id
      if (user.role === 'client') {
        fetchFinalReport(user.client_id);
      } else {
        fetchFinalReport();
      }
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router, fetchFinalReport]);

  if (authLoading || isLoadingApp || isLoadingFinalReport) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <ClientSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (finalReportError) {
      return (
        <div className="p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{finalReportError.message}</p>
          </div>
          <Link
            href={`/client/application/${id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Application
          </Link>
        </div>
      );
    }

    if (!finalReport) {
      return (
        <div className="p-6">
          <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Report Not Available</h2>
            <p>The final report for this application is not available yet. This could be because:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Testing is still in progress</li>
              <li>QA specialists have not validated all tasks</li>
              <li>The application has not been fully tested</li>
            </ul>
          </div>
          <Link
            href={`/client/application/${id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Application
          </Link>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Final Test Report</h1>
            <p className="text-gray-400">
              {application?.app_name || 'Application'} - {application?.platform || 'Platform'}
            </p>
          </div>
          <Link
            href={`/client/application/${id}`}
            className="inline-flex items-center px-4 py-2 bg-gray-700 rounded-md text-white font-medium hover:bg-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Application
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Test Summary</h2>
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Tasks:</span>
                <span className="text-white font-medium">{finalReport.total_tasks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completed Tasks:</span>
                <span className="text-white font-medium">{finalReport.completed_tasks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completion Rate:</span>
                <span className="text-white font-medium">
                  {finalReport.completion_percentage ? `${finalReport.completion_percentage}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Test Duration:</span>
                <span className="text-white font-medium">
                  {finalReport.test_duration ? `${finalReport.test_duration} days` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Bug Statistics</h2>
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Bugs:</span>
                <span className="text-white font-medium">{finalReport.total_bugs || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valid Bugs:</span>
                <span className="text-white font-medium">{finalReport.valid_bugs || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Critical Bugs:</span>
                <span className="text-red-400 font-medium">{finalReport.critical_bugs || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">High Severity:</span>
                <span className="text-orange-400 font-medium">{finalReport.high_severity_bugs || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Test Results</h2>
              <ClipboardCheck className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Passed Tasks:</span>
                <span className="text-green-400 font-medium">{finalReport.passed_tasks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Failed Tasks:</span>
                <span className="text-red-400 font-medium">{finalReport.failed_tasks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pass Rate:</span>
                <span className="text-white font-medium">
                  {finalReport.pass_rate ? `${finalReport.pass_rate}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  finalReport.overall_status === 'Passed' ? 'bg-green-900/30 text-green-300' :
                  finalReport.overall_status === 'Failed' ? 'bg-red-900/30 text-red-300' :
                  'bg-yellow-900/30 text-yellow-300'
                }`}>
                  {finalReport.overall_status || 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QA Notes */}
        {finalReport.qa_notes && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">QA Specialist Notes</h2>
            <div className="bg-gray-700 p-4 rounded-md text-gray-300">
              <p>{finalReport.qa_notes}</p>
            </div>
          </div>
        )}

        {/* Bug Details */}
        {finalReport.bugs && finalReport.bugs.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Validated Bug Reports</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">QA Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {finalReport.bugs.map((bug: any, index: number) => (
                    <tr key={bug.bug_id || index} className="hover:bg-gray-700/50">
                      <td className="px-4 py-4 text-sm text-white">
                        {bug.description}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          bug.severity === 'Critical' ? 'bg-red-900/30 text-red-300' :
                          bug.severity === 'High' ? 'bg-orange-900/30 text-orange-300' :
                          bug.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                          'bg-blue-900/30 text-blue-300'
                        }`}>
                          {bug.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          bug.validation_status === 'Valid' ? 'bg-red-900/30 text-red-300' :
                          bug.validation_status === 'Invalid' ? 'bg-green-900/30 text-green-300' :
                          'bg-yellow-900/30 text-yellow-300'
                        }`}>
                          {bug.validation_status === 'Valid' ? (
                            <XCircle className="w-3 h-3 mr-1" />
                          ) : bug.validation_status === 'Invalid' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {bug.validation_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-300">
                        {bug.validation_comments || 'No comments'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {finalReport.recommendations && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Recommendations</h2>
            <div className="bg-gray-700 p-4 rounded-md text-gray-300">
              <ul className="list-disc list-inside space-y-2">
                {Array.isArray(finalReport.recommendations) ? (
                  finalReport.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))
                ) : (
                  <li>{finalReport.recommendations}</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}
