// src/app/qa-specialist/uat-tasks/[id]/validate/page.tsx
"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import { TestEvidenceService } from '@/services/TestEvidenceService';
import { bugValidationService } from '@/services/BugValidationService';
import TaskValidationService from '@/services/TaskValidationService';
import Link from 'next/link';
import QASpecialistSidebar from '@/components/organisms/sidebar/QASpecialistSidebar';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Clock, 
  Info, 
  Camera, 
  ExternalLink, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Bug
} from 'lucide-react';
import { UATTask } from '@/types/UATTask';
import { CreateBugValidationData } from '@/types/BugValidation';
import { BugReport } from '@/types/BugReport';
import { TestEvidence } from '@/types/TestEvidence';
import { ValidationStatus } from '@/constants';

// Define TaskValidationStatus to match the exact expected types in your backend
type TaskValidationStatus = 'Pass Verified' | 'Rejected' | 'Need Revision';

// Define GWT context type
type GWTContext = 'given' | 'when' | 'then';

export default function ValidateUATTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [task, setTask] = useState<UATTask | null>(null);
  const [taskReadiness, setTaskReadiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [selectedBugReport, setSelectedBugReport] = useState<BugReport | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // For refreshing data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revisionsVisible, setRevisionsVisible] = useState(false);
  const [taskEvidence, setTaskEvidence] = useState<TestEvidence[]>([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<TestEvidence | null>(null);
  const [selectedBugEvidence, setSelectedBugEvidence] = useState<TestEvidence | null>(null);
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);
  
  // Form states for bug validation - using the correct types
  const [bugValidationForm, setBugValidationForm] = useState<{
    validation_status: ValidationStatus;
    comments: string;
  }>({
    validation_status: 'Valid', // Must match exactly with your constants
    comments: ''
  });
  
  // Form states for task validation - using the correct types
  const [taskValidationForm, setTaskValidationForm] = useState<{
    validation_status: TaskValidationStatus;
    comments: string;
  }>({
    validation_status: 'Pass Verified', // Must match exactly with your constants
    comments: ''
  });

  // Fetch task data, readiness, and evidence
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!id || !user || user.role !== 'qa_specialist') return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the UAT task
        const taskData = await uatTaskService.getTaskById(id as string);
        console.log("Full task data:", JSON.stringify(taskData, null, 2));
        console.log("Bug reports:", taskData.bug_reports);
        setTask(taskData);
        
        // Check task readiness for validation
        const readinessData = await TaskValidationService.checkTaskReadiness(id as string);
        setTaskReadiness(readinessData);
        
        // Fetch evidence
        await fetchTaskEvidence(id as string);
        
        console.log("Task data:", taskData);
        console.log("Bug reports:", taskData.bug_reports);
        console.log("Readiness:", readinessData);
        
      } catch (err: any) {
        console.error("Failed to fetch task data:", err);
        setError(err.message || "Failed to load task data");
      } finally {
        setIsLoading(false);
      }
    };
    if (!authLoading) {
      if (!user || user.role !== 'qa_specialist') {
        router.push('/dashboard');
        return;
      }
      fetchTaskData();
    }
  }, [id, user, authLoading, router, refreshKey]);
  
  // Fetch task evidence
  const fetchTaskEvidence = async (taskId: string) => {
    try {
      setIsLoadingEvidence(true);
      const evidence = await TestEvidenceService.getTaskEvidence(taskId);
      setTaskEvidence(evidence);
    } catch (err) {
      console.error("Failed to fetch task evidence:", err);
      // Don't set error state to prevent blocking the whole page
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  // Handle bug validation form changes with type safety
  const handleBugValidationChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'validation_status') {
      // Ensure the value is one of the allowed ValidationStatus types
      const validStatus = value as ValidationStatus;
      setBugValidationForm(prev => ({ ...prev, validation_status: validStatus }));
    } else {
      setBugValidationForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle task validation form changes with type safety
  const handleTaskValidationChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'validation_status') {
      // Ensure the value is one of the allowed TaskValidationStatus types
      const validStatus = value as TaskValidationStatus;
      setTaskValidationForm(prev => ({ ...prev, validation_status: validStatus }));
    } else {
      setTaskValidationForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle bug validation submission
  const handleBugValidationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'qa_specialist' || !selectedBugReport) return;
    
    setIsSubmitting(true);
    
    try {
      const validationData: CreateBugValidationData = {
        bug_id: selectedBugReport.bug_id,
        qa_id: user.qa_id,
        validation_status: bugValidationForm.validation_status,
        comments: bugValidationForm.comments
      };
      
      // Check if this bug already has a validation
      if (selectedBugReport.validation) {
        setError(`This bug report has already been validated with status: ${selectedBugReport.validation.validation_status}`);
        setIsSubmitting(false);
        return;
      }
      
      const result = await bugValidationService.createValidation(validationData);
      
      // Reset form
      setBugValidationForm({
        validation_status: 'Valid',
        comments: ''
      });
      
      // Close bug validation form
      setSelectedBugReport(null);
      setSelectedBugEvidence(null);
      
      // Refresh the data to get updated validations
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Failed to validate bug report:", err);
      
      // More detailed error handling
      if (err.response?.data) {
        console.error("Response data:", err.response.data);
        
        if (err.response.data.errors) {
          // Check for the specific unique validation error
          if (err.response.data.errors.bug_id && 
              err.response.data.errors.bug_id.includes('This bug report has already been validated')) {
            setError("This bug report has already been validated.");
          } else {
            const errorMessages = Object.entries(err.response.data.errors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join('; ');
            setError(`Validation error: ${errorMessages}`);
          }
        } else {
          setError(err.response.data.message || "Failed to validate bug report");
        }
      } else {
        setError(err.message || "Failed to validate bug report");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle task validation submission
  const handleTaskValidationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'qa_specialist' || !task || !taskReadiness?.is_ready) return;
    
    setIsSubmitting(true);
    
    try {
      // If requesting revision, make sure comments are provided
      if (taskValidationForm.validation_status === 'Need Revision' && !taskValidationForm.comments.trim()) {
        setError("Please provide comments explaining what needs to be revised.");
        setIsSubmitting(false);
        return;
      }
      
      await TaskValidationService.createTaskValidation({
        task_id: id as string,
        qa_id: user.qa_id,
        validation_status: taskValidationForm.validation_status,
        comments: taskValidationForm.comments
      });
      
      setValidationSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/qa-specialist/task-validations');
      }, 2000);
      
    } catch (err: any) {
      console.error("Failed to validate task:", err);
      setError(err.message || "Failed to validate task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render GWT context badge
  const renderContextBadge = (context?: string | null) => {
    if (!context) return null;
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs mr-1 ${
        context === 'given' ? 'bg-blue-500/20 text-blue-300' :
        context === 'when' ? 'bg-green-500/20 text-green-300' :
        context === 'then' ? 'bg-purple-500/20 text-purple-300' :
        'bg-gray-500/20 text-gray-300'
      }`}>
        {context.toUpperCase()}
      </span>
    );
  };
  
  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <QASpecialistSidebar />
        </div>
        
        <div className="flex-1 p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setRefreshKey(prev => prev + 1);
            }}
            className="px-4 py-2 bg-[#4c0e8f] rounded-md text-white font-medium hover:bg-[#3a0b6b] mr-2"
          >
            Try Again
          </button>
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

  // Task not found
  if (!task) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <QASpecialistSidebar />
        </div>
        
        <div className="flex-1 p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-4">Task not found</h2>
          <Link
            href="/qa-specialist/task-validations"
            className="px-4 py-2 bg-[#4c0e8f] rounded-md text-white font-medium hover:bg-[#3a0b6b]"
          >
            Back to Task Validations
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (validationSuccess) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <QASpecialistSidebar />
        </div>
        
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-green-500/20 text-green-300 p-8 rounded-xl text-center max-w-md">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Task Validated Successfully</h2>
            <p className="mb-6">
              {taskValidationForm.validation_status === 'Pass Verified' && 'The task has been verified and approved.'}
              {taskValidationForm.validation_status === 'Rejected' && 'The task has been rejected.'}
              {taskValidationForm.validation_status === 'Need Revision' && 'Your revision request has been sent to the crowdworker.'}
            </p>
            <p className="text-sm text-gray-400">Redirecting to Task Validations...</p>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-300 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen image view
  if (isFullScreenImage && (selectedEvidence || selectedBugEvidence)) {
    const currentEvidence = selectedEvidence || selectedBugEvidence;
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="p-4 flex justify-between items-center bg-[#0e0b1e]">
          <h3 className="text-white font-medium flex items-center">
            {selectedBugEvidence ? 'Bug Evidence' : `Step ${currentEvidence?.step_number}`}
            {/* Display context in fullscreen mode */}
            {currentEvidence?.context && (
              <span className="ml-2">{renderContextBadge(currentEvidence.context)}</span>
            )}
          </h3>
          <button 
            onClick={() => setIsFullScreenImage(false)}
            className="text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto p-4">
          <div className="max-w-full max-h-full">
            <img 
              src={currentEvidence?.screenshot_url} 
              alt={`${selectedBugEvidence ? 'Bug evidence' : `Step ${currentEvidence?.step_number}`}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
        {(currentEvidence?.notes || currentEvidence?.context) && (
          <div className="p-4 bg-[#0e0b1e]">
            {currentEvidence.context && (
              <p className="text-gray-400 text-sm mb-1">
                Context: <span className={
                  currentEvidence.context === 'given' ? 'text-blue-300' :
                  currentEvidence.context === 'when' ? 'text-green-300' :
                  'text-purple-300'
                }>{currentEvidence.context.toUpperCase()}</span>
              </p>
            )}
            {currentEvidence.notes && (
              <>
                <p className="text-gray-400 text-sm mb-1">Notes:</p>
                <p className="text-white">{currentEvidence.notes}</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Extract bug reports with null-safety check
  const bugReports = task?.bug_reports || [];
  const isReady = taskReadiness?.is_ready || false;
  
  // Check for previous revisions
  const hasRevisions = task.revision_count && task.revision_count > 0;
  
  // Check if the task has evidence but no bugs
  const hasEvidenceNoBugs = taskEvidence.length > 0 && bugReports.length === 0;

  // Render main content
  return (
    <div className="flex min-h-screen bg-[#0e0b1e]" suppressHydrationWarning={true}>
      {/* Sidebar */}
      <div className="w-64">
        <QASpecialistSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link 
              href="/qa-specialist/task-validations" 
              className="text-gray-400 hover:text-white flex items-center mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Task Validations
            </Link>
            <h1 className="text-2xl font-bold text-white">Validate UAT Task</h1>
          </div>
        </div>

        {/* Task Details */}
        <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Task Information</h2>
            
            {/* Revision badge */}
            {hasRevisions && (
              <div className="flex items-center">
                <button
                  onClick={() => setRevisionsVisible(!revisionsVisible)}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-900/30 text-amber-300 rounded-md hover:bg-amber-900/50"
                >
                  <Clock size={16} />
                  <span>
                    Revision History ({task.revision_count})
                  </span>
                </button>
              </div>
            )}
          </div>
          
          {/* Revision History Panel */}
          {hasRevisions && revisionsVisible && (
            <div className="mb-6 bg-amber-900/20 border border-amber-900/40 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3 text-amber-300">Revision History</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-900/40 rounded-full flex items-center justify-center">
                    <Clock size={16} className="text-amber-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Revision requested</p>
                    <p className="text-sm text-gray-400" suppressHydrationWarning={true}>
                      {task.last_revised_at ? new Date(task.last_revised_at).toLocaleString() : 'Unknown date'}
                    </p>
                    {task.revision_comments && (
                      <div className="mt-2 text-sm bg-black/30 p-3 rounded-md text-gray-300">
                        {task.revision_comments}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-1">Application:</p>
              <p className="text-white text-lg font-medium mb-4">{task.application?.app_name || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Test Case:</p>
              <p className="text-white mb-4">{task.test_case?.test_title || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Priority:</p>
              <p className="text-white mb-4">{task.test_case?.priority || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Status:</p>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                task.status === 'Completed' ? 'bg-green-900/30 text-green-300' :
                task.status === 'Revision Required' ? 'bg-amber-900/30 text-amber-300' :
                task.status === 'In Progress' ? 'bg-blue-900/30 text-blue-300' :
                'bg-gray-900/30 text-gray-300'
              }`}>
                {task.status}
              </span>
            </div>
            
            <div>
              <p className="text-gray-400 mb-1">Crowdworker:</p>
              <p className="text-white mb-4">{task.crowdworker?.name || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Started:</p>
              <p className="text-white mb-4" suppressHydrationWarning={true}>
                {task.started_at ? new Date(task.started_at).toLocaleString() : 'N/A'}
              </p>
              
              <p className="text-gray-400 mb-1">Completed:</p>
              <p className="text-white mb-4" suppressHydrationWarning={true}>
                {task.completed_at ? new Date(task.completed_at).toLocaleString() : 'N/A'}
              </p>
              
              <p className="text-gray-400 mb-1">Bug Reports:</p>
              <p className="text-white">
                {bugReports.length} {bugReports.length === 1 ? 'report' : 'reports'}
              </p>
              
              {taskEvidence.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-400 mb-1">Evidence Items:</p>
                  <p className="text-white flex items-center">
                    <Camera size={16} className="mr-2 text-blue-300" />
                    {taskEvidence.length} {taskEvidence.length === 1 ? 'screenshot' : 'screenshots'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Test case details in GWT format */}
          {task.test_case && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium mb-3">Test Case Details</h3>
              
              {/* GWT Format */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-20 h-8 bg-blue-900/30 flex items-center justify-center rounded-md">
                    <span className="text-blue-400 font-medium text-sm">GIVEN</span>
                  </div>
                  <div className="ml-4 text-gray-300 flex-grow">
                    <div className="whitespace-pre-wrap">
                      {task.test_case.given_context || 'No context provided'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-20 h-8 bg-green-900/30 flex items-center justify-center rounded-md">
                    <span className="text-green-400 font-medium text-sm">WHEN</span>
                  </div>
                  <div className="ml-4 text-gray-300 flex-grow">
                    <div className="whitespace-pre-wrap">
                      {task.test_case.when_action || 'No actions provided'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-20 h-8 bg-purple-900/30 flex items-center justify-center rounded-md">
                    <span className="text-purple-400 font-medium text-sm">THEN</span>
                  </div>
                  <div className="ml-4 text-gray-300 flex-grow">
                    <div className="whitespace-pre-wrap">
                      {task.test_case.then_result || 'No expected results provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Task readiness status */}
          {taskReadiness && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium mb-3">Validation Status</h3>
              
              {isReady ? (
                <div className="bg-green-900/30 text-green-300 p-4 rounded-md flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">This task is ready for validation</p>
                    {bugReports.length > 0 ? (
                      <p className="text-sm mt-1">All bug reports have been validated.</p>
                    ) : taskEvidence.length > 0 ? (
                      <p className="text-sm mt-1">Task has evidence and no bug reports.</p>
                    ) : (
                      <p className="text-sm mt-1">Task has completed testing with no issues found.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/30 text-yellow-300 p-4 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">This task is not ready for validation</p>
                    <p className="text-sm mt-1">
                      {taskReadiness.unvalidated_bug_reports} bug {taskReadiness.unvalidated_bug_reports === 1 ? 'report needs' : 'reports need'} validation before you can validate this task.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <div className="w-full bg-[#0e0b1e] rounded-full h-2.5">
                  <div 
                    className="bg-[#4c0e8f] h-2.5 rounded-full" 
                    style={{ 
                      width: taskReadiness.total_bug_reports ? 
                        `${(taskReadiness.validated_bug_reports / taskReadiness.total_bug_reports) * 100}%` : 
                        '100%' 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{taskReadiness.validated_bug_reports}/{taskReadiness.total_bug_reports} bug reports validated</span>
                  <span>{Math.round((taskReadiness.validated_bug_reports / Math.max(taskReadiness.total_bug_reports, 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Test Evidence Section - Always show if evidence exists */}
        {taskEvidence.length > 0 && !selectedBugReport && (
          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-300" />
              Test Evidence
            </h2>
            
            <p className="text-gray-300 mb-4">
              The crowdworker has submitted {taskEvidence.length} screenshots documenting their test execution.
              {bugReports.length === 0 && " No bugs were reported."}
            </p>
            
            {selectedEvidence ? (
              // Evidence detail view
              <div>
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <button 
                    onClick={() => setSelectedEvidence(null)}
                    className="text-gray-400 hover:text-white text-sm flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back to all evidence
                  </button>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium flex items-center">
                      Step {selectedEvidence.step_number}
                      {/* Display context badge */}
                      {selectedEvidence.context && (
                        <span className="ml-2">{renderContextBadge(selectedEvidence.context)}</span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsFullScreenImage(true)}
                        className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <Maximize className="h-4 w-4 mr-1" />
                        Fullscreen
                      </button>
                      <a 
                        href={selectedEvidence.screenshot_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open image
                      </a>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-400 mb-1">Description:</p>
                    <p className="text-white bg-[#0e0b1e] p-3 rounded">
                      {selectedEvidence.step_description}
                    </p>
                  </div>
                  
                  {/* Show context information if available */}
                  {selectedEvidence.context && (
                    <div className="mb-4">
                      <p className="text-gray-400 mb-1">Context:</p>
                      <p className={`p-3 rounded ${
                        selectedEvidence.context === 'given' ? 'bg-blue-900/20 text-blue-300' :
                        selectedEvidence.context === 'when' ? 'bg-green-900/20 text-green-300' :
                        'bg-purple-900/20 text-purple-300'
                      }`}>
                        {selectedEvidence.context === 'given' && 'GIVEN - Initial setup or preconditions'}
                        {selectedEvidence.context === 'when' && 'WHEN - Actions being performed during testing'}
                        {selectedEvidence.context === 'then' && 'THEN - Expected results or outcomes'}
                      </p>
                    </div>
                  )}
                  
                  {selectedEvidence.notes && (
                    <div className="mb-4">
                      <p className="text-gray-400 mb-1">Notes:</p>
                      <p className="text-white bg-[#0e0b1e] p-3 rounded">
                        {selectedEvidence.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 border border-gray-700 rounded-md overflow-hidden max-w-full">
                    <img 
                      src={selectedEvidence.screenshot_url} 
                      alt={`Step ${selectedEvidence.step_number}`} 
                      className="w-full object-contain max-h-[600px]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Grid of evidence
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {taskEvidence.sort((a, b) => a.step_number - b.step_number).map(evidence => (
                  <div 
                    key={evidence.evidence_id} 
                    className="bg-[#0e0b1e] border border-gray-700 rounded-md overflow-hidden cursor-pointer hover:border-blue-500/70 transition-colors"
                    onClick={() => setSelectedEvidence(evidence)}
                  >
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium text-white">Step {evidence.step_number}</span>
                        {/* Display context badge in the evidence grid */}
                        {evidence.context && (
                          <span className="ml-2">{renderContextBadge(evidence.context)}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(evidence.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="h-40 overflow-hidden bg-black/50">
                      <img 
                        src={evidence.screenshot_url} 
                        alt={`Step ${evidence.step_number}`} 
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-300 line-clamp-2">{evidence.step_description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bug Reports Section - Always display this section if bug reports exist */}
        {bugReports.length > 0 && (
          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-300" />
              Bug Reports
            </h2>
            
            {selectedBugReport ? (
              // Bug validation form for selected bug report
              <div>
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <button 
                    onClick={() => {
                      setSelectedBugReport(null);
                      setSelectedBugEvidence(null);
                    }}
                    className="text-gray-400 hover:text-white text-sm flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back to bug reports
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Bug Report</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 mb-1">Severity:</p>
                      <span className={`inline-block px-3 py-1 text-sm rounded-full 
                        ${selectedBugReport.severity === 'Critical' ? 'bg-red-900/30 text-red-300' :
                          selectedBugReport.severity === 'High' ? 'bg-orange-900/30 text-orange-300' :
                          selectedBugReport.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                          'bg-blue-900/30 text-blue-300'}`}>
                        {selectedBugReport.severity}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 mb-1">Reported By:</p>
                      <p className="text-white">{task.crowdworker?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  {/* Show revision badge if applicable */}
                  {selectedBugReport.is_revision && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-amber-900/30 text-amber-300 rounded-md inline-flex items-center">
                        <Clock size={14} className="mr-1" />
                        Rev #{selectedBugReport.revision_number || 1}
                      </span>
                      
                      {selectedBugReport.original_bug_id && (
                        <p className="text-xs text-gray-400 mt-1">
                          This is a revised version of a previous bug report.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Show GWT context */}
                  {selectedBugReport.evidence && selectedBugReport.evidence.length > 0 && selectedBugReport.evidence[0].context && (
                    <div className="mb-4">
                      <p className="text-gray-400 mb-1">Context:</p>
                      <p className={`px-3 py-1.5 rounded text-sm inline-block ${
                        selectedBugReport.evidence[0].context === 'given' ? 'bg-blue-900/20 text-blue-300' :
                        selectedBugReport.evidence[0].context === 'when' ? 'bg-green-900/20 text-green-300' :
                        'bg-purple-900/20 text-purple-300'
                      }`}>
                        {selectedBugReport.evidence[0].context === 'given' && 'GIVEN - Bug in initial setup or preconditions'}
                        {selectedBugReport.evidence[0].context === 'when' && 'WHEN - Bug occurs during user actions or interactions'}
                        {selectedBugReport.evidence[0].context === 'then' && 'THEN - Bug in results or expected outcomes'}
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-gray-400 mb-1">Description:</p>
                    <p className="text-white bg-[#0e0b1e] p-3 rounded whitespace-pre-wrap">
                      {selectedBugReport.bug_description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-400 mb-1">Steps to Reproduce:</p>
                    <p className="text-white bg-[#0e0b1e] p-3 rounded whitespace-pre-wrap">
                      {selectedBugReport.steps_to_reproduce || 'No steps provided.'}
                    </p>
                  </div>
                  
                  {/* Enhanced evidence display with GWT context */}
                  {selectedBugReport.evidence && selectedBugReport.evidence.length > 0 ? (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-300 font-medium">Evidence Screenshots ({selectedBugReport.evidence.length})</p>
                        {selectedBugEvidence && (
                          <button 
                            onClick={() => setSelectedBugEvidence(null)}
                            className="text-gray-400 hover:text-white text-sm flex items-center"
                          >
                            <ArrowLeft className="h-3 w-3 mr-1" /> View all screenshots
                          </button>
                        )}
                      </div>
                      
                      {selectedBugEvidence ? (
                        // Single evidence detail view
                        <div className="mt-4">
                          <div className="bg-[#0e0b1e] border border-gray-700 rounded-md overflow-hidden">
                            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="font-medium text-white">
                                  {selectedBugEvidence.step_description ? 
                                    selectedBugEvidence.step_description : 
                                    `Step ${selectedBugEvidence.step_number}`}
                                </span>
                                {/* Show context badge for bug evidence */}
                                {selectedBugEvidence.context && (
                                  <span className="ml-2">{renderContextBadge(selectedBugEvidence.context)}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setIsFullScreenImage(true)}
                                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  <Maximize size={14} className="mr-1" />
                                  <span className="hidden sm:inline">Fullscreen</span>
                                </button>
                                <a 
                                  href={selectedBugEvidence.screenshot_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  <ExternalLink size={14} className="mr-1" />
                                  <span className="hidden sm:inline">Open image</span>
                                </a>
                              </div>
                            </div>
                            <div className="relative">
                              <img 
                                src={selectedBugEvidence.screenshot_url} 
                                alt={`Bug evidence ${selectedBugEvidence.step_number}`}
                                className="w-full max-h-[500px] object-contain bg-black/60"
                              />
                            </div>
                            {/* Display context information */}
                            {(selectedBugEvidence.context || selectedBugEvidence.notes) && (
                              <div className="p-3 border-t border-gray-700">
                                {selectedBugEvidence.context && (
                                  <div className="mb-2">
                                    <p className="text-gray-400 text-sm mb-1">Context:</p>
                                    <p className={`px-3 py-1.5 rounded text-sm inline-block ${
                                      selectedBugEvidence.context === 'given' ? 'bg-blue-900/20 text-blue-300' :
                                      selectedBugEvidence.context === 'when' ? 'bg-green-900/20 text-green-300' :
                                      'bg-purple-900/20 text-purple-300'
                                    }`}>
                                      {selectedBugEvidence.context === 'given' && 'GIVEN - Initial setup or preconditions'}
                                      {selectedBugEvidence.context === 'when' && 'WHEN - Actions being performed during testing'}
                                      {selectedBugEvidence.context === 'then' && 'THEN - Expected results or outcomes'}
                                    </p>
                                  </div>
                                )}
                                {selectedBugEvidence.notes && (
                                  <>
                                    <p className="text-gray-400 text-sm mb-1">Notes:</p>
                                    <p className="text-white text-sm">{selectedBugEvidence.notes}</p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Navigation between evidence */}
                          {selectedBugReport.evidence && selectedBugReport.evidence.length > 1 && (
                            <div className="flex justify-between mt-4">
                              <button
                                onClick={() => {
                                  const currentIndex = selectedBugReport.evidence!.findIndex(e => e.evidence_id === selectedBugEvidence.evidence_id);
                                  const prevIndex = (currentIndex - 1 + selectedBugReport.evidence!.length) % selectedBugReport.evidence!.length;
                                  setSelectedBugEvidence(selectedBugReport.evidence![prevIndex]);
                                }}
                                className="px-3 py-1.5 bg-[#0e0b1e] hover:bg-[#171730] rounded-md text-white text-sm"
                              >
                                ← Previous
                              </button>
                              <span className="text-gray-400 text-sm self-center">
                                {selectedBugReport.evidence!.findIndex(e => e.evidence_id === selectedBugEvidence.evidence_id) + 1} of {selectedBugReport.evidence!.length}
                              </span>
                              <button
                                onClick={() => {
                                  const currentIndex = selectedBugReport.evidence!.findIndex(e => e.evidence_id === selectedBugEvidence.evidence_id);
                                  const nextIndex = (currentIndex + 1) % selectedBugReport.evidence!.length;
                                  setSelectedBugEvidence(selectedBugReport.evidence![nextIndex]);
                                }}
                                className="px-3 py-1.5 bg-[#0e0b1e] hover:bg-[#171730] rounded-md text-white text-sm"
                              >
                                Next →
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Evidence grid view with context badges
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {selectedBugReport.evidence.map(evidence => (
                            <div 
                              key={evidence.evidence_id}
                              className="bg-[#0e0b1e] border border-gray-700 rounded-md overflow-hidden cursor-pointer hover:border-blue-500/70 transition-colors"
                              onClick={() => setSelectedBugEvidence(evidence)}
                            >
                              <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-1 max-w-[80%]">
                                  <span className="text-sm text-white truncate">
                                    {evidence.step_description || `Screenshot ${evidence.step_number}`}
                                  </span>
                                  {/* Show context badge in grid view */}
                                  {evidence.context && renderContextBadge(evidence.context)}
                                </div>
                                <span className="text-xs text-blue-300">
                                  <ZoomIn size={14} />
                                </span>
                              </div>
                              <div className="h-32 overflow-hidden bg-black/60 flex items-center justify-center">
                                <img 
                                  src={evidence.screenshot_url} 
                                  alt={`Bug evidence ${evidence.step_number}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              {evidence.notes && (
                                <div className="p-2 text-xs text-gray-400 truncate">
                                  {evidence.notes.substring(0, 60)}{evidence.notes.length > 60 ? '...' : ''}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-[#0e0b1e] rounded-md text-gray-400 text-sm italic">
                      No evidence attached to this bug report.
                    </div>
                  )}
                </div>
                
                {/* Inline Bug Validation Form */}
                <form onSubmit={handleBugValidationSubmit} className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-medium mb-4">Bug Validation</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="validation_status" className="block text-gray-400 mb-1">
                      Validation Status
                    </label>
                    <select
                      id="validation_status"
                      name="validation_status"
                      value={bugValidationForm.validation_status}
                      onChange={handleBugValidationChange}
                      className="w-full px-4 py-2 rounded bg-[#0e0b1e] text-white border border-gray-700 focus:border-[#4c0e8f] focus:outline-none"
                      required
                    >
                      <option value="Valid">Valid</option>
                      <option value="Invalid">Invalid</option>
                      <option value="Needs More Info">Needs More Info</option>
                    </select>
                    <p className="text-gray-500 text-xs mt-1">
                      {bugValidationForm.validation_status === 'Valid' ? 
                        'Bug is reproducible and should be fixed' : 
                        bugValidationForm.validation_status === 'Invalid' ? 
                        'Not a bug or not reproducible' : 
                        'More information is needed from the tester'}
                    </p>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="comments" className="block text-gray-400 mb-1">
                      Validation Comments
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={bugValidationForm.comments}
                      onChange={handleBugValidationChange}
                      rows={4}
                      className="w-full px-4 py-2 rounded bg-[#0e0b1e] text-white border border-gray-700 focus:border-[#4c0e8f] focus:outline-none"
                      placeholder="Add your comments about this bug report..."
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[#4c0e8f] text-white rounded hover:bg-[#3a0b6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="mr-2">Submitting...</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        </span>
                      ) : (
                        'Submit Validation'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // List of bug reports - always display regardless of validation status
              <div className="space-y-4">
                {bugReports.length === 0 ? (
                  <p className="text-gray-400 italic">No bug reports have been submitted for this task.</p>
                ) : (
                  bugReports.map((bugReport) => (
                    <div 
                      key={bugReport.bug_id} 
                      className={`p-4 rounded-md ${bugReport.validation ? 'bg-[#0a1e3b]' : 'bg-[#0e0b1e]'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">Bug Report #{bugReport.bug_id.slice(-6)}</h3>
                            
                            {bugReport.is_revision && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-900/30 text-amber-300 inline-flex items-center">
                                <Clock size={12} className="mr-1" />
                                Rev #{bugReport.revision_number || 1}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full 
                              ${bugReport.severity === 'Critical' ? 'bg-red-900/30 text-red-300' :
                                bugReport.severity === 'High' ? 'bg-orange-900/30 text-orange-300' :
                                bugReport.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                                'bg-blue-900/30 text-blue-300'}`}>
                              {bugReport.severity}
                            </span>
                            
                            {/* Display GWT context badge if available */}
                            {bugReport.evidence && bugReport.evidence.length > 0 && bugReport.evidence[0].context && (
                              renderContextBadge(bugReport.evidence[0].context)
                            )}
                            
                            {bugReport.validation ? (
                              <span className={`inline-block px-2 py-0.5 text-xs rounded-full 
                                ${bugReport.validation.validation_status === 'Valid' ? 'bg-green-900/30 text-green-300' :
                                  bugReport.validation.validation_status === 'Invalid' ? 'bg-red-900/30 text-red-300' :
                                  bugReport.validation.validation_status === 'Needs More Info' ? 'bg-yellow-900/30 text-yellow-300' :
                                  'bg-gray-700 text-gray-300'}`}>
                                {bugReport.validation.validation_status}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                                Not Validated
                              </span>
                            )}
                            
                            {/* Evidence count badge - more prominent */}
                            {bugReport.evidence && bugReport.evidence.length > 0 && (
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-900/30 text-blue-300 flex items-center">
                                <Camera size={10} className="mr-1" />
                                {bugReport.evidence.length} {bugReport.evidence.length === 1 ? 'screenshot' : 'screenshots'}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {bugReport.bug_description || 'No description provided.'}
                          </p>
                          
                          {/* Preview of evidence if available */}
                          {bugReport.evidence && bugReport.evidence.length > 0 && (
                            <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                              {bugReport.evidence.slice(0, 3).map((evidence, index) => (
                                <div 
                                  key={evidence.evidence_id} 
                                  className="relative flex-shrink-0 cursor-pointer group"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBugReport(bugReport);
                                    setSelectedBugEvidence(evidence);
                                  }}
                                >
                                  <div className="w-16 h-16 border border-gray-700 rounded overflow-hidden">
                                    <img 
                                      src={evidence.screenshot_url} 
                                      alt={`Evidence thumbnail ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn size={14} className="text-white" />
                                  </div>
                                </div>
                              ))}
                              {bugReport.evidence.length > 3 && (
                                <div className="relative flex-shrink-0 w-16 h-16 border border-gray-700 rounded overflow-hidden bg-[#171730] flex items-center justify-center text-gray-400 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBugReport(bugReport);
                                  }}
                                >
                                  <span>+{bugReport.evidence.length - 3}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {bugReport.validation ? (
                            <div className="text-xs text-gray-400">
                              <p>Validated</p>
                              {bugReport.validation.validated_at && (
                                <p suppressHydrationWarning={true}>
                                  {new Date(bugReport.validation.validated_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedBugReport(bugReport)}
                              className="px-3 py-1.5 bg-[#4c0e8f] hover:bg-[#3a0b6b] rounded-md text-white text-sm"
                            >
                              Validate
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {bugReport.validation && bugReport.validation.comments && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-gray-400 text-xs mb-1">Validation Comments:</p>
                          <p className="text-sm text-white">{bugReport.validation.comments}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Task Validation Form with enhanced revision support */}
        {isReady && !selectedBugReport && !selectedEvidence && (
          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Validate Task</h2>
            
            <form onSubmit={handleTaskValidationSubmit}>
              <div className="mb-4">
                <label htmlFor="task_validation_status" className="block text-gray-400 mb-1">
                  Validation Status
                </label>
                <select
                  id="task_validation_status"
                  name="validation_status"
                  value={taskValidationForm.validation_status}
                  onChange={handleTaskValidationChange}
                  className="w-full px-4 py-2 rounded bg-[#0e0b1e] text-white border border-gray-700 focus:border-[#4c0e8f] focus:outline-none"
                  required
                >
                  <option value="Pass Verified">Pass Verified</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Need Revision">Need Revision</option>
                </select>
                
                <div className="mt-2">
                {taskValidationForm.validation_status === 'Pass Verified' && (
                  <p className="text-green-300 text-sm flex items-start">
                    <CheckCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>Task will be marked as verified and approved.</span>
                  </p>
                )}

                {taskValidationForm.validation_status === 'Rejected' && (
                  <p className="text-red-300 text-sm flex items-start">
                    <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>Task will be marked as rejected. This cannot be undone.</span>
                  </p>
                )}

                {taskValidationForm.validation_status === 'Need Revision' && (
                  <div className="bg-amber-900/20 p-3 rounded-md mt-2">
                    <p className="text-amber-300 text-sm flex items-start">
                      <Info size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                      <span>
                        Task will be sent back to the crowdworker for revision. They will be able to see your comments and fix the issues.
                        <br />
                        <strong>Please provide detailed feedback below.</strong>
                      </span>
                    </p>
                  </div>
                )}
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="task_comments" className="block text-gray-400 mb-1">
                  Comments
                  {taskValidationForm.validation_status === 'Need Revision' && (
                    <span className="text-amber-300">*</span>
                  )}
                </label>
                <textarea
                  id="task_comments"
                  name="comments"
                  value={taskValidationForm.comments}
                  onChange={handleTaskValidationChange}
                  rows={4}
                  className={`w-full px-4 py-2 rounded bg-[#0e0b1e] text-white 
                    border ${taskValidationForm.validation_status === 'Need Revision' && !taskValidationForm.comments.trim() 
                      ? 'border-red-500' 
                      : 'border-gray-700'} 
                    focus:border-[#4c0e8f] focus:outline-none`}
                  placeholder={taskValidationForm.validation_status === 'Need Revision' 
                    ? "Explain what needs to be fixed or improved (required)"
                    : "Add your comments about this task (optional)"}
                  required={taskValidationForm.validation_status === 'Need Revision'}
                />
                
                {taskValidationForm.validation_status === 'Need Revision' && !taskValidationForm.comments.trim() && (
                  <p className="text-red-400 text-xs mt-1">
                    Comments are required when requesting revisions
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || (taskValidationForm.validation_status === 'Need Revision' && !taskValidationForm.comments.trim())}
                  className="px-6 py-2 bg-[#4c0e8f] text-white rounded hover:bg-[#3a0b6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="mr-2">Submitting...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    </span>
                  ) : (
                    'Submit Validation'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Task not ready for validation */}
        {!isReady && !selectedBugReport && bugReports.length > 0 && (
          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg">
            <div className="flex items-start bg-yellow-900/30 text-yellow-300 p-4 rounded-md">
              <AlertCircle className="h-6 w-6 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-lg mb-1">Validation Required</h3>
                <p className="mb-2">
                  You need to validate all bug reports before you can validate this task.
                </p>
                <p className="text-sm">
                  {taskReadiness?.unvalidated_bug_reports} of {taskReadiness?.total_bug_reports} bug reports need validation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}