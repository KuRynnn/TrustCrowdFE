// src/app/client/application/[id]/page.tsx
"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useApplicationDetail } from '@/hooks/UseApplications';
import { applicationService } from '@/services/ApplicationService';
import Link from 'next/link';
import ClientSidebar from '@/components/organisms/sidebar/ClientSidebar';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Bug, 
  TrendingUp,
  Users,
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckSquare
} from 'lucide-react';

// Acceptance criteria definitions
const acceptanceCriteria = [
  {
    status: "Accept",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "text-green-500 bg-green-500/20",
    borderColor: "border-green-500",
    description: "No bugs found. Application passed all tests.",
    action: "Ready for production deployment",
    requirement: "0 bugs of any severity"
  },
  {
    status: "Provisional Acceptance",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "text-blue-500 bg-blue-500/20",
    borderColor: "border-blue-500",
    description: "Only cosmetic (Low severity) bugs found.",
    action: "Can deploy without fixes if acceptable",
    requirement: "Only Low severity bugs"
  },
  {
    status: "Conditional Acceptance",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "text-yellow-500 bg-yellow-500/20",
    borderColor: "border-yellow-500",
    description: "Medium severity bugs affecting secondary functions.",
    action: "Accept with commitment to fix within timeframe",
    requirement: "Medium severity bugs (no High/Critical)"
  },
  {
    status: "Rework",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "text-orange-500 bg-orange-500/20",
    borderColor: "border-orange-500",
    description: "High severity bugs affecting main functions.",
    action: "Must fix and retest before acceptance",
    requirement: "High severity bugs (no Critical)"
  },
  {
    status: "Rejected",
    icon: <XCircle className="w-6 h-6" />,
    color: "text-red-500 bg-red-500/20",
    borderColor: "border-red-500",
    description: "Critical bugs causing system failure.",
    action: "Major rework required",
    requirement: "Critical severity bugs"
  }
];

export default function ClientApplicationDetailPage() {
  const { id } = useParams();
  const { application, isLoading, error, statistics, isLoadingStatistics, progress, isLoadingProgress } = useApplicationDetail(id as string);
  
  const [finalReport, setFinalReport] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showCriteriaInfo, setShowCriteriaInfo] = useState(false);
  const [expandedTestCase, setExpandedTestCase] = useState<string | null>(null);
  
  // Fetch final report
  useEffect(() => {
    if (id && progress?.percentage === 100) {
      fetchFinalReport();
    }
  }, [id, progress?.percentage]);
  
  const fetchFinalReport = async () => {
    try {
      setIsLoadingReport(true);
      setReportError(null);
      const report = await applicationService.getFinalReport(id as string);
      setFinalReport(report);
    } catch (err: any) {
      setReportError(err.message || 'Failed to fetch final report');
    } finally {
      setIsLoadingReport(false);
    }
  };
  
  // Determine acceptance status color and icon
  const getAcceptanceStatusStyle = (status: string) => {
    const criteria = acceptanceCriteria.find(c => c.status === status);
    return criteria || acceptanceCriteria[4]; // Default to rejected if not found
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64"><ClientSidebar /></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !application) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64"><ClientSidebar /></div>
        <div className="flex-1 p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md">
            {error?.message || 'Application not found'}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{application.app_name}</h1>
            <p className="text-gray-400 mt-1">Application Testing Dashboard</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/client/application/${id}/edit`}
              className="px-4 py-2 bg-gray-700 rounded-md text-white font-medium hover:bg-gray-600"
            >
              Edit Application
            </Link>
            <Link
              href="/client/application"
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
            >
              Back to List
            </Link>
          </div>
        </div>
        
        {/* Main Status Card - Show if testing is complete */}
        {progress?.percentage === 100 && finalReport && (
          <div className={`mb-6 p-6 rounded-xl border-2 ${getAcceptanceStatusStyle(finalReport.acceptance_status?.status).borderColor} ${getAcceptanceStatusStyle(finalReport.acceptance_status?.status).color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getAcceptanceStatusStyle(finalReport.acceptance_status?.status).icon}
                <div>
                  <h2 className="text-2xl font-bold">UAT Status: {finalReport.acceptance_status?.status}</h2>
                  <p className="text-sm mt-1">{finalReport.acceptance_status?.description}</p>
                  <p className="text-xs mt-2 opacity-75">Recommendation: {finalReport.acceptance_status?.recommendation}</p>
                </div>
              </div>
              {finalReport.generated_at && (
                <div className="text-right">
                  <p className="text-xs opacity-75">Report Generated</p>
                  <p className="text-sm">{new Date(finalReport.generated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Top row - Basic info and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Application Details */}
          <div className="bg-[#001333] p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center gap-2">
              <FileText size={20} />
              Application Details
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-400">URL:</dt>
                <dd>
                  <a href={application.app_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    {application.app_url}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-400">Platform:</dt>
                <dd className="text-white">{application.platform}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-400">Status:</dt>
                <dd>
                  <span className={`px-2 py-1 rounded text-xs ${
                    application.status === 'Ready for Testing' ? 'bg-blue-500/20 text-blue-300' :
                    application.status === 'active' ? 'bg-green-500/20 text-green-300' :
                    application.status === 'completed' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {application.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-400">Max Testers:</dt>
                <dd className="text-white flex items-center gap-2">
                  <Users size={16} />
                  {application.current_workers || 0}/{application.max_testers}
                </dd>
              </div>
              {application.description && (
                <div className="pt-3">
                  <dt className="text-gray-400 mb-2">Description:</dt>
                  <dd className="text-white text-sm bg-gray-800 p-3 rounded">{application.description}</dd>
                </div>
              )}
            </dl>
          </div>
          
          {/* Testing Progress */}
          <div className="bg-[#001333] p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center gap-2">
              <TrendingUp size={20} />
              Testing Progress
            </h2>
            {isLoadingProgress ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
              </div>
            ) : progress ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Overall Completion</span>
                    <span className="text-white font-bold">{progress.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-white">{progress.total_test_cases || 0}</p>
                    <p className="text-xs text-gray-400">Total Test Cases</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-green-300">{progress.completed_test_cases || 0}</p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-2xl font-bold text-yellow-300">{progress.in_progress_test_cases || 0}</p>
                    <p className="text-xs text-gray-400">In Progress</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-2xl font-bold text-gray-300">{progress.not_started_test_cases || 0}</p>
                    <p className="text-xs text-gray-400">Not Started</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400">No progress data available</p>
            )}
          </div>
        </div>
        
        {/* Bug Statistics */}
        <div className="bg-[#001333] p-6 rounded-xl shadow-xl mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center gap-2">
            <Bug size={20} />
            Bug Statistics
          </h2>
          {isLoadingStatistics ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
            </div>
          ) : statistics && statistics.summary ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm mb-1">Total Bugs</p>
                  <p className="text-3xl font-bold text-white">{statistics.summary.total_bugs || 0}</p>
                </div>
                <div className="bg-red-900/30 p-4 rounded-lg text-center border border-red-800">
                  <p className="text-red-300 text-sm mb-1">Critical</p>
                  <p className="text-3xl font-bold text-red-400">{statistics.summary.critical_bugs || 0}</p>
                </div>
                <div className="bg-green-900/30 p-4 rounded-lg text-center border border-green-800">
                  <p className="text-green-300 text-sm mb-1">Valid Bugs</p>
                  <p className="text-3xl font-bold text-green-400">{statistics.summary.valid_bugs || 0}</p>
                </div>
                <div className="bg-red-900/30 p-4 rounded-lg text-center border border-red-800">
                  <p className="text-red-300 text-sm mb-1">Invalid</p>
                  <p className="text-3xl font-bold text-red-400">{statistics.summary.invalid_bugs || 0}</p>
                </div>
                <div className="bg-yellow-900/30 p-4 rounded-lg text-center border border-yellow-800">
                  <p className="text-yellow-300 text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">{statistics.summary.pending_validation || 0}</p>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg text-center border border-blue-800">
                  <p className="text-blue-300 text-sm mb-1">Test Cases</p>
                  <p className="text-3xl font-bold text-blue-400">{statistics.summary.total_test_cases || 0}</p>
                </div>
              </div>
              
              {/* Test Case Details */}
              {statistics.test_case_statistics && statistics.test_case_statistics.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Test Case Breakdown</h3>
                  <div className="space-y-2">
                    {statistics.test_case_statistics.map((testCase) => (
                      <div key={testCase.test_id} className="bg-gray-800 rounded-lg p-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedTestCase(expandedTestCase === testCase.test_id ? null : testCase.test_id)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedTestCase === testCase.test_id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <h4 className="font-medium text-white">{testCase.test_title}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              testCase.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                              testCase.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {testCase.priority} Priority
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">{testCase.crowdworkers_count} testers</span>
                            <span className="text-gray-400">{testCase.total_bugs} bugs</span>
                          </div>
                        </div>
                        
                        {expandedTestCase === testCase.test_id && (
                          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-400">Tasks</p>
                              <p className="text-white">Total: {testCase.tasks_by_status.total}</p>
                              <p className="text-green-300">Verified: {testCase.tasks_by_status.verified}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Bug Severity</p>
                              <p className="text-red-300">Critical: {testCase.critical_bugs}</p>
                              <p className="text-orange-300">High: {testCase.high_bugs}</p>
                              <p className="text-yellow-300">Medium: {testCase.medium_bugs}</p>
                              <p className="text-green-300">Low: {testCase.low_bugs}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Validation</p>
                              <p className="text-green-300">Valid: {testCase.valid_bugs}</p>
                              <p className="text-red-300">Invalid: {testCase.invalid_bugs}</p>
                              <p className="text-yellow-300">Pending: {testCase.pending_validation}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Progress</p>
                              <p className="text-blue-300">Completed: {testCase.tasks_by_status.completed}</p>
                              <p className="text-yellow-300">In Progress: {testCase.tasks_by_status.in_progress}</p>
                              <p className="text-gray-300">Assigned: {testCase.tasks_by_status.assigned}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-400">No statistics available yet</p>
          )}
        </div>
        
        {/* Acceptance Criteria Information */}
        <div className="bg-[#001333] p-6 rounded-xl shadow-xl">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowCriteriaInfo(!showCriteriaInfo)}
          >
            <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
              <Info size={20} />
              UAT Acceptance Criteria Guide
            </h2>
            {showCriteriaInfo ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          
          {showCriteriaInfo && (
            <div className="mt-4 space-y-3">
              {acceptanceCriteria.map((criteria, index) => (
                <div key={index} className={`p-4 rounded-lg border ${criteria.borderColor} ${criteria.color}`}>
                  <div className="flex items-start gap-3">
                    {criteria.icon}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{criteria.status}</h3>
                      <p className="text-sm mt-1 opacity-90">{criteria.description}</p>
                      <p className="text-xs mt-2 opacity-75">
                        <span className="font-medium">Requirement:</span> {criteria.requirement}
                      </p>
                      <p className="text-xs mt-1 opacity-75">
                        <span className="font-medium">Action:</span> {criteria.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Download Report Button - Show when testing is complete */}
        {progress?.percentage === 100 && finalReport && (
          <div className="mt-6 flex justify-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium">
              <Download size={20} />
              Download Final Report (PDF)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}