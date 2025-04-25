// src/app/qa-specialist/uat-tasks/[id]/validate/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import Link from 'next/link';
import QASpecialistSidebar from '@/components/organisms/sidebar/QASpecialistSidebar';
import { AlertTriangle, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { UATTask } from '@/types/UATTask';
import { bugValidationService } from '@/services/BugValidationService';
import TaskValidationService from '@/services/TaskValidationService';
import { CreateBugValidationData } from '@/types/BugValidation';
import { BugReport } from '@/types/BugReport';

// Define the allowed validation status values to match the exact types
type BugValidationStatus = 'Valid' | 'Invalid' | 'Needs More Info';
type TaskValidationStatus = 'Pass Verified' | 'Rejected' | 'Need Revision';

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
  
  // Form states for bug validation - using the correct types
  const [bugValidationForm, setBugValidationForm] = useState<{
    validation_status: BugValidationStatus;
    comments: string;
  }>({
    validation_status: 'Valid',
    comments: ''
  });
  
  // Form states for task validation - using the correct types
  const [taskValidationForm, setTaskValidationForm] = useState<{
    validation_status: TaskValidationStatus;
    comments: string;
  }>({
    validation_status: 'Pass Verified',
    comments: ''
  });

  // Fetch task data and readiness
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!id || !user || user.role !== 'qa_specialist') return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the UAT task
        const taskData = await uatTaskService.getTaskById(id as string);
        setTask(taskData);
        
        // Check task readiness for validation
        const readinessData = await TaskValidationService.checkTaskReadiness(id as string);
        setTaskReadiness(readinessData);
        
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

  // Handle bug validation form changes with type safety
  const handleBugValidationChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'validation_status') {
      // Ensure the value is one of the allowed BugValidationStatus types
      const validStatus = value as BugValidationStatus;
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
      console.log("Submitting bug validation:", {
        bug_id: selectedBugReport.bug_id,
        qa_id: user.qa_id,
        validation_status: bugValidationForm.validation_status,
        comments: bugValidationForm.comments
      });
      
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
      console.log("Validation created:", result);
      
      // Reset form
      setBugValidationForm({
        validation_status: 'Valid',
        comments: ''
      });
      
      // Close bug validation form
      setSelectedBugReport(null);
      
      // Explicitly refresh the task data to get updated validations
      if (id && user) {
        try {
          // Fetch the UAT task with fresh data
          const refreshedTaskData = await uatTaskService.getTaskById(id as string);
          setTask(refreshedTaskData);
          
          // Re-check task readiness
          const refreshedReadinessData = await TaskValidationService.checkTaskReadiness(id as string);
          setTaskReadiness(refreshedReadinessData);
          
          console.log("Data refreshed after validation");
        } catch (err) {
          console.error("Failed to refresh data after validation:", err);
        }
      }
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
            <p className="mb-6">The task has been successfully validated.</p>
            <p className="text-sm text-gray-400">Redirecting to Task Validations...</p>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-300 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get bug reports from task
  const bugReports = task.bug_reports || [];
  const isReady = taskReadiness?.is_ready || false;

  // Render main content
  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
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
          <h2 className="text-xl font-semibold mb-4">Task Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-1">Application:</p>
              <p className="text-white text-lg font-medium mb-4">{task.application?.app_name || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Test Case:</p>
              <p className="text-white mb-4">{task.test_case?.test_title || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Priority:</p>
              <p className="text-white mb-4">{task.test_case?.priority || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Status:</p>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-900/30 text-green-300">
                {task.status}
              </span>
            </div>
            
            <div>
              <p className="text-gray-400 mb-1">Crowdworker:</p>
              <p className="text-white mb-4">{task.crowdworker?.name || 'N/A'}</p>
              
              <p className="text-gray-400 mb-1">Started:</p>
              <p className="text-white mb-4">
                {task.started_at ? new Date(task.started_at).toLocaleString() : 'N/A'}
              </p>
              
              <p className="text-gray-400 mb-1">Completed:</p>
              <p className="text-white mb-4">
                {task.completed_at ? new Date(task.completed_at).toLocaleString() : 'N/A'}
              </p>
              
              <p className="text-gray-400 mb-1">Bug Reports:</p>
              <p className="text-white">
                {bugReports.length} {bugReports.length === 1 ? 'report' : 'reports'}
              </p>
            </div>
          </div>
          
          {/* Test case details */}
          {task.test_case && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium mb-3">Test Case Details</h3>
              
              <div className="mb-4">
                <p className="text-gray-400 mb-1">Test Steps:</p>
                <p className="text-white bg-[#0e0b1e] p-3 rounded whitespace-pre-wrap">
                  {task.test_case.test_steps}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 mb-1">Expected Result:</p>
                <p className="text-white bg-[#0e0b1e] p-3 rounded whitespace-pre-wrap">
                  {task.test_case.expected_result}
                </p>
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
                    <p className="text-sm mt-1">All bug reports have been validated.</p>
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

        {/* Bug Reports Section */}
        {bugReports.length > 0 && (
          <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Bug Reports</h2>
            
            {selectedBugReport ? (
              // Bug validation form for selected bug report
              <div>
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <button 
                    onClick={() => setSelectedBugReport(null)}
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
                  
                  {selectedBugReport.screenshot_url && (
                    <div className="mb-4">
                      <p className="text-gray-400 mb-1">Screenshot:</p>
                      <div className="mt-2">
                        <a 
                          href={selectedBugReport.screenshot_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block bg-[#0e0b1e] p-2 rounded hover:bg-[#252540]"
                        >
                          <img 
                            src={selectedBugReport.screenshot_url} 
                            alt="Bug screenshot" 
                            className="max-h-48 rounded"
                          />
                        </a>
                      </div>
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
              // List of bug reports
              <div className="space-y-4">
                {bugReports.map((bugReport: any) => {
                  // Check if the bug report has a validation through the relationship
                  const hasValidation = bugReport.validation !== undefined && bugReport.validation !== null;
                  
                  return (
                    <div 
                      key={bugReport.bug_id} 
                      className={`p-4 rounded-md ${hasValidation ? 'bg-[#0a1e3b]' : 'bg-[#0e0b1e]'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">Bug Report #{bugReport.bug_id.slice(-6)}</h3>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full 
                              ${bugReport.severity === 'Critical' ? 'bg-red-900/30 text-red-300' :
                                bugReport.severity === 'High' ? 'bg-orange-900/30 text-orange-300' :
                                bugReport.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                                'bg-blue-900/30 text-blue-300'}`}>
                              {bugReport.severity}
                            </span>
                            
                            {hasValidation ? (
                              <span className={`inline-block px-2 py-0.5 text-xs rounded-full 
                                ${bugReport.validation.validation_status === 'Valid' ? 'bg-green-900/30 text-green-300' :
                                  bugReport.validation.validation_status === 'Invalid' ? 'bg-red-900/30 text-red-300' :
                                  'bg-yellow-900/30 text-yellow-300'}`}>
                                {bugReport.validation.validation_status}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                                Not Validated
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {bugReport.bug_description || 'No description provided.'}
                          </p>
                        </div>
                        
                        <div className="ml-4">
                          {hasValidation ? (
                            <div className="text-xs text-gray-400">
                              <p>Validated</p>
                              {bugReport.validation.validated_at && (
                                <p>
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
                      
                      {hasValidation && bugReport.validation.comments && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-gray-400 text-xs mb-1">Validation Comments:</p>
                          <p className="text-sm text-white">{bugReport.validation.comments}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Task Validation Form */}
        {isReady && !selectedBugReport && (
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
              </div>

              <div className="mb-6">
                <label htmlFor="task_comments" className="block text-gray-400 mb-1">
                  Comments
                </label>
                <textarea
                  id="task_comments"
                  name="comments"
                  value={taskValidationForm.comments}
                  onChange={handleTaskValidationChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded bg-[#0e0b1e] text-white border border-gray-700 focus:border-[#4c0e8f] focus:outline-none"
                  placeholder="Add your comments about this task..."
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