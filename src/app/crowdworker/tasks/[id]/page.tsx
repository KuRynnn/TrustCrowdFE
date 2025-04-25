// src/app/crowdworker/tasks/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import { BugReportService } from '@/services/BugReportService';
import { UATTask } from '@/types/UATTask';
import { BugReport } from '@/types/BugReport';
import { BugSeverity } from '@/constants';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';
import Link from 'next/link';
import { 
  CheckCircle, 
  ArrowLeft, 
  Bug, 
  AlertTriangle, 
  Clock, 
  Upload, 
  XCircle,
  Camera,
  AlertCircle
} from 'lucide-react';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [task, setTask] = useState<UATTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | undefined>(undefined);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [bugReportText, setBugReportText] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [bugSeverity, setBugSeverity] = useState<BugSeverity>('Medium');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSendingBug, setIsSendingBug] = useState(false);
  const [showBugForm, setShowBugForm] = useState(false);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [isLoadingBugs, setIsLoadingBugs] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set workerId when user data is available
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'crowdworker') {
        router.push('/dashboard');
        return;
      }
      
      if (user.role === 'crowdworker' && user.worker_id) {
        setWorkerId(user.worker_id);
      }
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!id || !workerId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const taskData = await uatTaskService.getTaskById(id as string);
        
        // Verify that this task belongs to the current worker
        if (taskData.worker_id !== workerId) {
          setError("You don't have permission to view this task");
          return;
        }
        
        setTask(taskData);
        
        // Fetch bug reports for this task
        fetchBugReports(taskData.task_id);
      } catch (err: any) {
        console.error("Failed to fetch task details:", err);
        setError(err.message || "Failed to load task details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && workerId) {
      fetchTaskDetails();
    }
  }, [id, workerId]);
  
  // Fetch bug reports separately
  const fetchBugReports = async (taskId: string) => {
    try {
      setIsLoadingBugs(true);
      
      // Using the specific endpoint for task bug reports
      const reports = await BugReportService.getAll();
      const taskReports = reports.filter(report => report.task_id === taskId);
      setBugReports(taskReports);
    } catch (err) {
      console.error("Failed to fetch bug reports:", err);
      // Don't set error state to prevent blocking the whole page
    } finally {
      setIsLoadingBugs(false);
    }
  };

  // Handle starting a task
  const handleStartTask = async () => {
    if (!task) return;
    
    setUpdatingStatus(true);
    try {
      const updatedTask = await uatTaskService.startTask(task.task_id);
      setTask(updatedTask);
    } catch (err: any) {
      alert(`Failed to start task: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle completing a task
  const handleCompleteTask = async () => {
    if (!task) return;
    
    setUpdatingStatus(true);
    try {
      const updatedTask = await uatTaskService.completeTask(task.task_id);
      setTask(updatedTask);
    } catch (err: any) {
      alert(`Failed to complete task: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Handle screenshot upload
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setScreenshotFile(file);
  };
  
  // Handle removing screenshot
  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Reset the bug form
  const resetBugForm = () => {
    setBugReportText('');
    setStepsToReproduce('');
    setBugSeverity('Medium');
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle submitting a bug report
const handleSubmitBugReport = async () => {
    if (!task || !bugReportText.trim() || !workerId) return;
    
    setIsSendingBug(true);
    try {
      // First, create the bug report
      const bugReportData = {
        task_id: task.task_id,
        worker_id: workerId,
        bug_description: bugReportText.trim(),
        steps_to_reproduce: stepsToReproduce.trim() || 'No steps provided',
        severity: bugSeverity
      };
      
      const newBugReport = await BugReportService.create(bugReportData);
      
      // If there's a screenshot, upload it
      if (screenshotFile && newBugReport.bug_id) {
        try {
          // Create a FormData to upload the file
          const formData = new FormData();
          formData.append('screenshot', screenshotFile);
          
          // Upload the screenshot
          await BugReportService.uploadScreenshot(newBugReport.bug_id, formData);
        } catch (uploadErr) {
          console.error("Failed to upload screenshot:", uploadErr);
          // Continue anyway, the bug report is already created
        }
      }
      
      // Refresh bug reports
      fetchBugReports(task.task_id);
      
      // Clear form and hide it
      resetBugForm();
      setShowBugForm(false);
      
      // Show success message
      alert('Bug report submitted successfully!');
    } catch (err: any) {
      console.error("Bug report submission error:", err);
      if (err.response && err.response.data) {
        console.error("Validation errors:", err.response.data.errors);
      }
      alert(`Failed to submit bug report: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSendingBug(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        <div className="flex-1 p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#5460ff] rounded-md text-white font-medium hover:bg-[#4450dd]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        <div className="flex-1 p-6 text-white text-center">
          Task not found
        </div>
      </div>
    );
  }

  // Get task status icon
  const getStatusIcon = () => {
    switch (task.status) {
      case 'Completed':
        return <CheckCircle size={20} className="text-green-300" />;
      case 'In Progress':
        return <Clock size={20} className="text-yellow-300" />;
      case 'Assigned':
        return <AlertTriangle size={20} className="text-blue-300" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <CrowdworkerSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <Link href="/crowdworker/applications" className="hover:text-white">
              My Applications
            </Link>
            <span className="mx-2">›</span>
            {task.application && (
              <>
                <Link href={`/crowdworker/applications/${task.app_id}/tasks`} className="hover:text-white">
                  {task.application.app_name}
                </Link>
                <span className="mx-2">›</span>
              </>
            )}
            <span className="text-white">Task Details</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              {task.test_case?.test_title || 'Test Case'}
            </h1>
            <Link
              href={task.application 
                ? `/crowdworker/applications/${task.app_id}/tasks` 
                : '/crowdworker/tasks'
              }
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft size={16} />
              <span>Back to All Tasks</span>
            </Link>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                task.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                task.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {task.status}
              </span>
              
              {task.started_at && (
                <span className="text-sm text-gray-400">
                  Started: {new Date(task.started_at).toLocaleString()}
                </span>
              )}
              
              {task.completed_at && (
                <span className="text-sm text-gray-400">
                  Completed: {new Date(task.completed_at).toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {task.status === 'Assigned' && (
                <button
                  onClick={handleStartTask}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] disabled:opacity-50 flex items-center gap-1"
                >
                  {updatingStatus ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} />
                      <span>Start Testing</span>
                    </>
                  )}
                </button>
              )}
              
              {task.status === 'In Progress' && (
                <>
                  <button
                    onClick={() => setShowBugForm(!showBugForm)}
                    className="px-4 py-2 bg-[#d13030] text-white rounded-md hover:bg-[#b22a2a] flex items-center gap-1"
                  >
                    <Bug size={16} />
                    <span>Report Bug</span>
                  </button>
                  
                  <button
                    onClick={handleCompleteTask}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-[#2cba57] text-white rounded-md hover:bg-[#25a34b] disabled:opacity-50 flex items-center gap-1"
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        <span>Completing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Bug Report Form */}
        {showBugForm && (
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Bug size={18} className="text-red-400" />
              Report a Bug
            </h2>
            
            {/* Bug Description */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Bug Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={bugReportText}
                onChange={(e) => setBugReportText(e.target.value)}
                placeholder="Describe the bug you found..."
                className="w-full px-3 py-2 bg-[#0a1e3b] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5460ff]"
                rows={3}
              ></textarea>
            </div>
            
            {/* Steps to Reproduce */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Steps to Reproduce
              </label>
              <textarea
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                placeholder="1. Go to login page
2. Enter username and password
3. Click login button
4. Observe the error"
                className="w-full px-3 py-2 bg-[#0a1e3b] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5460ff]"
                rows={4}
              ></textarea>
            </div>
            
            {/* Severity Selection */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Bug Severity <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  type="button"
                  onClick={() => setBugSeverity('Low')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    bugSeverity === 'Low' 
                      ? 'bg-blue-900/40 border-blue-500 text-blue-300' 
                      : 'border-gray-700 text-gray-400 hover:border-blue-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Low</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setBugSeverity('Medium')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    bugSeverity === 'Medium' 
                      ? 'bg-yellow-900/40 border-yellow-500 text-yellow-300' 
                      : 'border-gray-700 text-gray-400 hover:border-yellow-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Medium</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setBugSeverity('High')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    bugSeverity === 'High' 
                      ? 'bg-orange-900/40 border-orange-500 text-orange-300' 
                      : 'border-gray-700 text-gray-400 hover:border-orange-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>High</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setBugSeverity('Critical')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    bugSeverity === 'Critical' 
                      ? 'bg-red-900/40 border-red-500 text-red-300' 
                      : 'border-gray-700 text-gray-400 hover:border-red-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Critical</span>
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span><strong>Low</strong>: Minor issue, doesn't affect functionality</span>
                </span>
                <span className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span><strong>Medium</strong>: Affects functionality but has workarounds</span>
                </span>
                <span className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span><strong>High</strong>: Major functionality broken, no workaround</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span><strong>Critical</strong>: System crash, data loss, security issue</span>
                </span>
              </div>
            </div>
            
            {/* Screenshot Upload */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Screenshot (Optional)
              </label>
              
              {screenshotPreview ? (
                <div className="relative border border-gray-700 rounded-md overflow-hidden">
                  <img 
                    src={screenshotPreview} 
                    alt="Bug screenshot" 
                    className="max-h-60 max-w-full object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="absolute top-2 right-2 p-1 bg-red-900/80 text-white rounded-full hover:bg-red-800"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-md p-6 cursor-pointer hover:border-gray-500 transition-colors"
                >
                  <Camera size={32} className="text-gray-500 mb-2" />
                  <p className="text-gray-500 text-sm">Click to upload a screenshot</p>
                  <p className="text-gray-600 text-xs mt-1">PNG, JPG up to 10MB</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleScreenshotChange}
                accept="image/png, image/jpeg"
                className="hidden"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  resetBugForm();
                  setShowBugForm(false);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBugReport}
                disabled={isSendingBug || !bugReportText.trim()}
                className="px-4 py-2 bg-[#d13030] text-white rounded-md hover:bg-[#b22a2a] disabled:opacity-50 flex items-center gap-1"
              >
                {isSendingBug ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Bug size={16} />
                    <span>Submit Bug Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Application Info */}
        {task.application && (
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Application Information
            </h2>
            <div className="flex flex-col md:flex-row md:gap-8">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <p className="text-gray-400 text-sm mb-1">Name</p>
                <p className="text-white">{task.application.app_name}</p>
              </div>
              <div className="md:w-1/2">
                <p className="text-gray-400 text-sm mb-1">URL</p>
                <a 
                  href={task.application.app_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300"
                >
                  {task.application.app_url}
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* Test Case Details */}
        {task.test_case && (
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Test Case Details
            </h2>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-medium">{task.test_case.test_title}</h3>
                {task.test_case.priority && (
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                    task.test_case.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                    task.test_case.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {task.test_case.priority} Priority
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-gray-400 text-sm mb-2">Test Steps:</h3>
              <div className="bg-[#0a1e3b] p-4 rounded-md">
                <pre className="text-white text-sm whitespace-pre-wrap">
                  {task.test_case.test_steps || 'No steps provided'}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Expected Result:</h3>
              <div className="bg-[#0a1e3b] p-4 rounded-md">
                <p className="text-white text-sm">
                  {task.test_case.expected_result || 'No expected result provided'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Bug Reports */}
        {bugReports.length > 0 ? (
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Bug size={18} className="text-red-400" />
              Bug Reports ({bugReports.length})
            </h2>
            
            <div className="space-y-4">
              {bugReports.map(bug => (
                <div key={bug.bug_id} className="bg-[#0a1e3b] p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      bug.severity === 'Critical' ? 'bg-red-500/20 text-red-300' :
                      bug.severity === 'High' ? 'bg-orange-500/20 text-orange-300' :
                      bug.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {bug.severity} Severity
                    </span>
                    <span className="text-gray-400 text-xs">
                      Reported: {new Date(bug.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-white whitespace-pre-wrap mt-2">
                    {bug.bug_description}
                  </p>
                  
                  {bug.steps_to_reproduce && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <h4 className="text-xs text-gray-400 mb-1">Steps to Reproduce:</h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {bug.steps_to_reproduce}
                      </p>
                    </div>
                  )}
                  
                  {bug.screenshot_url && (
                    <div className="mt-3">
                      <h4 className="text-xs text-gray-400 mb-1">Screenshot:</h4>
                      <a 
                        href={bug.screenshot_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mt-2 border border-gray-700 rounded-md overflow-hidden"
                      >
                        <img 
                          src={bug.screenshot_url} 
                          alt="Bug screenshot" 
                          className="max-h-40 max-w-full object-contain"
                        />
                      </a>
                    </div>
                  )}
                  
                  {bug.validation_status && (
                    <div className="mt-3 pt-3 border-t border-gray-700 flex items-center">
                      <span className="text-xs text-gray-400">Status: </span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        bug.validation_status === 'Valid' ? 'bg-green-500/20 text-green-300' :
                        bug.validation_status === 'Invalid' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {bug.validation_status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : isLoadingBugs ? (
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-5 w-5 border-2 border-blue-300 rounded-full border-t-transparent mr-3"></div>
              <span className="text-gray-400">Loading bug reports...</span>
            </div>
          </div>
        ) : (
          task.status !== 'Assigned' && (
            <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
              <div className="flex items-center text-gray-400 gap-2 justify-center py-8">
                <AlertCircle size={18} />
                <span>No bug reports have been submitted for this task.</span>
              </div>
              {task.status === 'In Progress' && (
                <div className="text-center">
                  <button
                    onClick={() => setShowBugForm(true)}
                    className="px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] mt-2"
                  >
                    Report a Bug
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}