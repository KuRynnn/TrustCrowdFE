// src/app/crowdworker/tasks/[id]/page.tsx
"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import { BugReportService } from '@/services/BugReportService';
import { TestEvidenceService } from '@/services/TestEvidenceService';
import { UATTask } from '@/types/UATTask';
import { BugReport } from '@/types/BugReport';
import { TestEvidence } from '@/types/TestEvidence';
import { BugSeverity } from '@/constants';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';
import Link from 'next/link';
import TaskRevisionView from '@/components/organisms/task-revision/TaskRevisionView';
import BugReportRevisionForm from '@/components/organisms/bug-report/BugReportRevisionForm';
import EvidenceUploader from '@/components/molecules/EvidenceUploader';
import { 
  CheckCircle, 
  ArrowLeft, 
  Bug, 
  AlertTriangle, 
  Clock, 
  Upload, 
  XCircle,
  Camera,
  AlertCircle,
  PlusCircle,
  Edit,
  Trash,
  Check
} from 'lucide-react';

// GWT context type
type GWTContext = 'given' | 'when' | 'then';

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
  const [selectedBugForRevision, setSelectedBugForRevision] = useState<BugReport | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // New state for evidence handling
  const [taskEvidence, setTaskEvidence] = useState<TestEvidence[]>([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  
  // New state for editing evidence
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const [currentEvidenceStep, setCurrentEvidenceStep] = useState(1);
  const [editEvidenceDescription, setEditEvidenceDescription] = useState('');
  const [editEvidenceNotes, setEditEvidenceNotes] = useState('');
  const [showEditEvidenceForm, setShowEditEvidenceForm] = useState(false);
  const [isUpdatingEvidence, setIsUpdatingEvidence] = useState(false);
  
  // New state for editing bug reports
  const [editingBugId, setEditingBugId] = useState<string | null>(null);
  const [editBugDescription, setEditBugDescription] = useState('');
  const [editBugSteps, setEditBugSteps] = useState('');
  const [editBugSeverity, setEditBugSeverity] = useState<BugSeverity>('Medium');
  const [isUpdatingBug, setIsUpdatingBug] = useState(false);
  
  // State for GWT context (for evidence only)
  const [bugContext, setBugContext] = useState<GWTContext>('then'); // Default to 'then' for bugs
  const [editBugContext, setEditBugContext] = useState<GWTContext>('then');
  
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
        
        // Fetch evidence for this task
        fetchTaskEvidence(taskData.task_id);
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
  
  // Effect for refresh trigger
  useEffect(() => {
    const handleTaskRefresh = async () => {
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
        
        // Fetch evidence for this task
        fetchTaskEvidence(taskData.task_id);
      } catch (err: any) {
        console.error("Failed to refresh task details:", err);
        // Don't set error to avoid UI disruption during refresh
      } finally {
        setIsLoading(false);
      }
    };
    if (refreshTrigger > 0 && id && workerId) {
      handleTaskRefresh();
    }
  }, [refreshTrigger, id, workerId]);
  
  // Fetch bug reports
  const fetchBugReports = async (taskId: string) => {
    try {
      setIsLoadingBugs(true);
      
      // Using the specific endpoint for task bug reports
      const reports = await BugReportService.getByTask(taskId);
      console.log("Bug reports data:", reports);
      
      // Debug check if evidence is present
      if (reports.length > 0) {
        console.log("First bug report:", reports[0]);
        console.log("Evidence included?", reports[0].evidence ? `Yes (${reports[0].evidence.length} items)` : "No");
      }
      
      setBugReports(reports);
    } catch (err) {
      console.error("Failed to fetch bug reports:", err);
      // Rest of your error handling...
    } finally {
      setIsLoadingBugs(false);
    }
  };
  
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
    
    // Check if task has either bug reports or evidence
    if (bugReports.length === 0 && taskEvidence.length === 0) {
      alert("You must either report bugs or provide test evidence before completing this task.");
      return;
    }
    
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
    setBugContext('then'); // Reset to default
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
        // Note: No context field here as it's not on the BugReport model
      };
      
      const newBugReport = await BugReportService.create(bugReportData);
      
      // If there's a screenshot, upload it as evidence
      if (screenshotFile && newBugReport.bug_id) {
        try {
          // Create a FormData to upload the file
          const formData = new FormData();
          formData.append('screenshot', screenshotFile);
          formData.append('step_number', '1');
          formData.append('step_description', 'Bug screenshot');
          formData.append('notes', 'Uploaded during bug report creation');
          formData.append('context', bugContext); // Include context in the evidence
          
          // Upload the screenshot as evidence
          await TestEvidenceService.uploadBugEvidence(newBugReport.bug_id, formData);
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
  
  // Get the next step number for evidence
  const getNextStepNumber = () => {
    if (taskEvidence.length === 0) return 1;
    
    // Find the highest step number and add 1
    const maxStep = Math.max(...taskEvidence.map(evidence => evidence.step_number));
    return maxStep + 1;
  };
  
  // Handle deleting evidence
  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!confirm("Are you sure you want to delete this evidence?")) return;
    
    try {
      await TestEvidenceService.deleteEvidence(evidenceId);
      // Refresh evidence list
      if (task) {
        fetchTaskEvidence(task.task_id);
      }
      alert("Evidence deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete evidence:", err);
      alert(`Failed to delete evidence: ${err.message || 'Unknown error'}`);
    }
  };
  
  // Handle updating evidence
  const handleUpdateEvidence = async () => {
    if (!editingEvidenceId || !editEvidenceDescription.trim()) {
      alert("Description is required");
      return;
    }
    
    setIsUpdatingEvidence(true);
    
    try {
      // Create update data object
      const updateData = {
        step_description: editEvidenceDescription.trim(),
        notes: editEvidenceNotes.trim() || null
      };
      
      // Call API to update evidence
      await TestEvidenceService.updateEvidence(editingEvidenceId, updateData);
      
      // Refresh evidence and close form
      if (task) {
        fetchTaskEvidence(task.task_id);
      }
      
      setShowEditEvidenceForm(false);
      setEditingEvidenceId(null);
      setEditEvidenceDescription('');
      setEditEvidenceNotes('');
      
      alert("Evidence updated successfully");
    } catch (err: any) {
      console.error("Failed to update evidence:", err);
      alert(`Failed to update evidence: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUpdatingEvidence(false);
    }
  };
  
  // Handle deleting a bug report
  const handleDeleteBugReport = async (bugId: string) => {
    if (!confirm("Are you sure you want to delete this bug report?")) return;
    
    try {
      await BugReportService.deleteBugReport(bugId);
      // Refresh bug reports
      if (task) {
        fetchBugReports(task.task_id);
      }
      alert("Bug report deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete bug report:", err);
      alert(`Failed to delete bug report: ${err.message || 'Unknown error'}`);
    }
  };
  
  // Handle updating a bug report
  const handleUpdateBugReport = async () => {
    if (!editingBugId || !editBugDescription.trim()) {
      alert("Bug description is required");
      return;
    }
    
    setIsUpdatingBug(true);
    
    try {
      // Create update data object
      const updateData = {
        bug_description: editBugDescription.trim(),
        steps_to_reproduce: editBugSteps.trim() || null,
        severity: editBugSeverity
        // Note: No context field here
      };
      
      // Call API to update bug report
      await BugReportService.update(editingBugId, updateData);
      
      // TODO: Update evidence context separately if needed
      
      // Refresh bug reports and close form
      if (task) {
        fetchBugReports(task.task_id);
      }
      
      setEditingBugId(null);
      setEditBugDescription('');
      setEditBugSteps('');
      setEditBugSeverity('Medium');
      setEditBugContext('then'); // Reset to default
      
      alert("Bug report updated successfully");
    } catch (err: any) {
      console.error("Failed to update bug report:", err);
      alert(`Failed to update bug report: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUpdatingBug(false);
    }
  };
  
  // Helper function to get context from bug's evidence
  const getBugContext = (bug: BugReport): GWTContext | null => {
    if (bug.evidence && bug.evidence.length > 0 && bug.evidence[0].context) {
      return bug.evidence[0].context as GWTContext;
    }
    return null;
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
      case 'Revision Required':
        return <AlertTriangle size={20} className="text-amber-300" />;
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
                task.status === 'Revision Required' ? 'bg-amber-500/20 text-amber-300' :
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
                    onClick={handleCompleteTask}
                    disabled={updatingStatus || (bugReports.length === 0 && taskEvidence.length === 0)}
                    className="px-4 py-2 bg-[#2cba57] text-white rounded-md hover:bg-[#25a34b] disabled:opacity-50 flex items-center gap-1"
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        <span>Completing...</span>
                      </>
                    ) : bugReports.length === 0 && taskEvidence.length === 0 ? (
                      <>
                        <AlertCircle size={16} />
                        <span>Add Evidence First</span>
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
        
        {/* Revision Notice */}
        {task.revision_status && task.revision_status !== 'None' && (
          <TaskRevisionView 
            task={task} 
            onRevisionStarted={() => setRefreshTrigger(prev => prev + 1)} 
          />
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
        
        {/* Test Case Details in GWT Format */}
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
        
        {/* Test Evidence Section */}
        <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Camera size={18} className="text-blue-400" />
              Test Evidence
            </h2>
            
            {/* Add Evidence Button - shown even when evidence exists */}
            {task.status === 'In Progress' && !showEditEvidenceForm && (
              <button
                onClick={() => setShowEvidenceForm(true)}
                className="px-3 py-1 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] text-sm flex items-center gap-1"
              >
                <PlusCircle size={16} />
                <span>Add Step {getNextStepNumber()}</span>
              </button>
            )}
          </div>
          {isLoadingEvidence ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading evidence...</p>
            </div>
          ) : showEvidenceForm ? (
            <EvidenceUploader 
              taskId={task.task_id}
              existingEvidence={taskEvidence}
              stepNumber={getNextStepNumber()} 
              onEvidenceUpdated={() => {
                fetchTaskEvidence(task.task_id);
                setShowEvidenceForm(false);
              }}
              onCancel={() => setShowEvidenceForm(false)}
            />
          ) : taskEvidence.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskEvidence.sort((a, b) => a.step_number - b.step_number).map(evidence => (
                <div key={evidence.evidence_id} className="bg-[#0a1e3b] border border-gray-700 rounded-md overflow-hidden">
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <div>
                    <span className="text-white font-medium">Step {evidence.step_number}</span>
                    <p className="text-gray-400 text-sm mt-1">{evidence.step_description}</p>
                  </div>
                  {task.status === 'In Progress' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEvidenceId(evidence.evidence_id);
                          setCurrentEvidenceStep(evidence.step_number);
                          setEditEvidenceDescription(evidence.step_description);
                          setEditEvidenceNotes(evidence.notes || '');
                          setShowEditEvidenceForm(true);
                        }}
                        className="p-1 text-blue-400 hover:text-blue-300 rounded"
                        title="Edit evidence"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvidence(evidence.evidence_id)}
                        className="p-1 text-red-400 hover:text-red-300 rounded"
                        title="Delete evidence"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <a 
                  href={evidence.screenshot_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={evidence.screenshot_url} 
                    alt={`Step ${evidence.step_number}`} 
                    className="max-h-48 w-full object-cover"
                  />
                </a>
                {evidence.notes && (
                  <div className="p-3 text-gray-300 text-sm">
                    <p className="text-xs text-gray-500 mb-1">Notes:</p>
                    {evidence.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : task.status === 'In Progress' ? (
          <div className="mb-4 text-center py-4">
            <p className="text-gray-300 mb-4">
              Please provide evidence of your testing by uploading screenshots of each test step.
            </p>
          </div>
        ) : (
          <div className="flex items-center text-gray-400 gap-2 justify-center py-8">
            <AlertCircle size={18} />
            <span>No test evidence has been submitted for this task.</span>
          </div>
        )}
        
        {/* Edit Evidence Form Modal */}
        {showEditEvidenceForm && editingEvidenceId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#001333] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Edit Evidence for Step {currentEvidenceStep}</h3>
                
                <div className="space-y-4">
                  {/* Step Description */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Step Description <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editEvidenceDescription}
                      onChange={(e) => setEditEvidenceDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1e3b] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5460ff]"
                    />
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={editEvidenceNotes}
                      onChange={(e) => setEditEvidenceNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1e3b] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5460ff]"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowEditEvidenceForm(false);
                        setEditingEvidenceId(null);
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateEvidence()}
                      disabled={isUpdatingEvidence}
                      className="px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] disabled:opacity-50 flex items-center gap-1"
                    >
                      {isUpdatingEvidence ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Update Evidence</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bug Reports Section */}
      <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bug size={18} className="text-red-400" />
            Bug Reports {bugReports.length > 0 && `(${bugReports.length})`}
          </h2>
          
          {/* Report Bug Button */}
          {task.status === 'In Progress' && !showBugForm && !selectedBugForRevision && !editingBugId && (
            <button
              onClick={() => setShowBugForm(true)}
              className="px-3 py-1 bg-[#d13030] text-white rounded-md hover:bg-[#b22a2a] text-sm flex items-center gap-1"
            >
              <Bug size={16} />
              <span>Report Bug</span>
            </button>
          )}
        </div>
        
        {isLoadingBugs ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-blue-300 rounded-full border-t-transparent mr-3"></div>
            <span className="text-gray-400">Loading bug reports...</span>
          </div>
        ) : selectedBugForRevision ? (
          // Show the bug revision form
          <BugReportRevisionForm 
            originalBug={selectedBugForRevision}
            onCancel={() => setSelectedBugForRevision(null)}
            onSuccess={() => {
              setSelectedBugForRevision(null);
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        ) : editingBugId ? (
          // Show edit bug form
          <div className="mt-4">
            <h3 className="text-white font-medium mb-3">Edit Bug Report</h3>
            
            {/* Bug Context Selection - NEW ADDITION */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Bug Context
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => setEditBugContext('given')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    editBugContext === 'given' 
                      ? 'bg-blue-900/40 border-blue-500 text-blue-300' 
                      : 'border-gray-700 text-gray-400 hover:border-blue-500/50'
                  }`}
                >
                  <span>GIVEN</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setEditBugContext('when')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    editBugContext === 'when' 
                      ? 'bg-green-900/40 border-green-500 text-green-300' 
                      : 'border-gray-700 text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <span>WHEN</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setEditBugContext('then')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    editBugContext === 'then' 
                      ? 'bg-purple-900/40 border-purple-500 text-purple-300' 
                      : 'border-gray-700 text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  <span>THEN</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {editBugContext === 'given' && 'Bug in initial setup or preconditions'}
                {editBugContext === 'when' && 'Bug occurs during user actions or interactions'}
                {editBugContext === 'then' && 'Bug in results or expected outcomes'}
              </p>
            </div>
            
            {/* Bug Description */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Bug Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={editBugDescription}
                onChange={(e) => setEditBugDescription(e.target.value)}
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
                value={editBugSteps}
                onChange={(e) => setEditBugSteps(e.target.value)}
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
                  onClick={() => setEditBugSeverity('Low')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    editBugSeverity === 'Low' 
                      ? 'bg-blue-900/40 border-blue-500 text-blue-300' 
                      : 'border-gray-700 text-gray-400 hover:border-blue-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Low</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setEditBugSeverity('Medium')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    editBugSeverity === 'Medium' 
                      ? 'bg-yellow-900/40 border-yellow-500 text-yellow-300' 
                      : 'border-gray-700 text-gray-400 hover:border-yellow-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Medium</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setEditBugSeverity('High')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    editBugSeverity === 'High' 
                      ? 'bg-orange-900/40 border-orange-500 text-orange-300' 
                      : 'border-gray-700 text-gray-400 hover:border-orange-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>High</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setEditBugSeverity('Critical')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    editBugSeverity === 'Critical' 
                      ? 'bg-red-900/40 border-red-500 text-red-300' 
                      : 'border-gray-700 text-gray-400 hover:border-red-500/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Critical</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingBugId(null);
                  setEditBugDescription('');
                  setEditBugSteps('');
                  setEditBugSeverity('Medium');
                  setEditBugContext('then'); // Reset context
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBugReport}
                disabled={isUpdatingBug || !editBugDescription.trim()}
                className="px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] disabled:opacity-50 flex items-center gap-1"
              >
                {isUpdatingBug ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Update Bug Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : showBugForm ? (
          <div className="mt-4">
            <h3 className="text-white font-medium mb-3">Report a Bug</h3>
            
            {/* Bug Context Selection - NEW ADDITION */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Bug Context
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => setBugContext('given')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    bugContext === 'given' 
                      ? 'bg-blue-900/40 border-blue-500 text-blue-300' 
                      : 'border-gray-700 text-gray-400 hover:border-blue-500/50'
                  }`}
                >
                  <span>GIVEN</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setBugContext('when')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    bugContext === 'when' 
                      ? 'bg-green-900/40 border-green-500 text-green-300' 
                      : 'border-gray-700 text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <span>WHEN</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setBugContext('then')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    bugContext === 'then' 
                      ? 'bg-purple-900/40 border-purple-500 text-purple-300' 
                      : 'border-gray-700 text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  <span>THEN</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {bugContext === 'given' && 'Bug in initial setup or preconditions'}
                {bugContext === 'when' && 'Bug occurs during user actions or interactions'}
                {bugContext === 'then' && 'Bug in results or expected outcomes'}
              </p>
            </div>
            
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
        ) : bugReports.length > 0 ? (
          <div className="space-y-4">
            {bugReports.map(bug => (
              <div key={bug.bug_id} className="bg-[#0a1e3b] p-4 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      bug.severity === 'Critical' ? 'bg-red-500/20 text-red-300' :
                      bug.severity === 'High' ? 'bg-orange-500/20 text-orange-300' :
                      bug.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {bug.severity} Severity
                    </span>
                    
                    {/* Display GWT context badge - only if evidence has context */}
                    {bug.evidence && bug.evidence.length > 0 && bug.evidence[0].context && (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        bug.evidence[0].context === 'given' ? 'bg-blue-500/20 text-blue-300' :
                        bug.evidence[0].context === 'when' ? 'bg-green-500/20 text-green-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {bug.evidence[0].context.toUpperCase()}
                      </span>
                    )}
                    
                    {bug.is_revision && (
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300">
                        Revision #{bug.revision_number}
                      </span>
                    )}
                  </div>
                  
                  {/* Edit/Delete buttons for unvalidated bugs */}
                  {task.status === 'In Progress' && !bug.validation?.validation_status && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBugId(bug.bug_id);
                          setEditBugDescription(bug.bug_description);
                          setEditBugSteps(bug.steps_to_reproduce || '');
                          setEditBugSeverity(bug.severity);
                          // Set context from evidence if available
                          if (bug.evidence && bug.evidence.length > 0 && bug.evidence[0].context) {
                            setEditBugContext(bug.evidence[0].context as GWTContext);
                          } else {
                            setEditBugContext('then'); // Default
                          }
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Edit bug report"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBugReport(bug.bug_id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete bug report"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                  
                  <span className="text-gray-400 text-xs ml-auto">
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
                
                {/* Display Evidence (when available) */}
                {bug.evidence && bug.evidence.length > 0 ? (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <h4 className="text-xs text-gray-400 mb-1">Evidence:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {bug.evidence.map(evidence => (
                        <a 
                          key={evidence.evidence_id}
                          href={evidence.screenshot_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block relative border border-gray-700 rounded-md overflow-hidden group"
                        >
                          <img 
                            src={evidence.screenshot_url} 
                            alt={`Evidence ${evidence.step_number}`} 
                            className="h-20 w-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs">Step {evidence.step_number}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-gray-700 text-gray-500 text-sm italic">
                    No evidence attached to this bug report.
                  </div>
                )}
                
                {/* Validation and Revision Section */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {bug.validation?.validation_status && (
                        <>
                          <span className="text-xs text-gray-400">Status: </span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            bug.validation.validation_status === 'Valid' ? 'bg-green-500/20 text-green-300' :
                            bug.validation.validation_status === 'Invalid' ? 'bg-red-500/20 text-red-300' :
                            bug.validation.validation_status === 'Needs More Info' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {bug.validation.validation_status}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Show revision button if task is in revision and bug needs more info */}
                    {(task.status === 'Revision Required' || 
                     task.revision_status === 'In Progress' || 
                     task.revision_status === 'Requested') && (
                      bug.validation?.validation_status === 'Needs More Info' && (
                        <button
                          onClick={() => setSelectedBugForRevision(bug)}
                          className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white text-xs rounded"
                        >
                          Revise This Bug
                        </button>
                      )
                    )}
                  </div>
                  
                  {/* Validation Comments */}
                  {bug.validation?.comments && (
                    <div className="mt-2">
                      <h4 className="text-xs text-gray-400 mb-1">QA Comments:</h4>
                      <p className="text-gray-300 text-sm bg-[#001333] p-2 rounded">
                        {bug.validation.comments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center text-gray-400 gap-2 justify-center py-8">
            <AlertCircle size={18} />
            <span>No bug reports have been submitted for this task.</span>
          </div>
        )}
      </div>
    </div>
  </div>
);
}