// src/app/crowdworker/applications/[id]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useApplicationDetail } from '@/hooks/UseApplications';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';
import { UATTask } from '@/types/UATTask';

// Define a type that matches what's coming back from the API
interface PartialApplication {
  app_id: string;
  app_name: string;
  app_url: string;
  platform?: string; 
  description?: string;
  status?: string;
  created_at?: string;
  client?: {
    name: string;
    company?: string;
  };
}

export default function CrowdworkerApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { application, isLoading, error, progress, isLoadingProgress } = useApplicationDetail(id as string);
  const { user, loading: authLoading } = useAuth();
  const [isTaking, setIsTaking] = useState(false);
  const [appTasks, setAppTasks] = useState<UATTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskCreated, setTaskCreated] = useState(false);
  const [workerId, setWorkerId] = useState<string | undefined>(undefined);
  const [tasksCreatedCount, setTasksCreatedCount] = useState<number>(0);
  const [creatingTaskProgress, setCreatingTaskProgress] = useState<number>(0);

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

  // Fetch application tasks
  useEffect(() => {
    const fetchApplicationTasks = async () => {
      if (!application) return;
      
      try {
        setIsLoadingTasks(true);
        setTaskError(null);
        
        const tasks = await uatTaskService.getTasksByApplication(application.app_id);
        setAppTasks(tasks);
      } catch (err: any) {
        console.error("Failed to fetch application tasks:", err);
        setTaskError(err.message || "Failed to load tasks for this application");
      } finally {
        setIsLoadingTasks(false);
      }
    };

    if (application) {
      fetchApplicationTasks();
    }
  }, [application]);

  // Updated handleTakeTask to create a task for each test case
  const handleTakeTask = async () => {
    if (!workerId || !application) return;
    
    // Check if application has test cases
    if (!application.test_cases || application.test_cases.length === 0) {
      alert("This application has no test cases to assign.");
      return;
    }

    setIsTaking(true);
    setCreatingTaskProgress(0);
    
    try {
      const newTasks: UATTask[] = [];
      const totalTestCases = application.test_cases.length;
      
      // Create a task for each test case
      for (let i = 0; i < application.test_cases.length; i++) {
        const testCase = application.test_cases[i];
        
        // Update progress
        setCreatingTaskProgress(Math.round(((i) / totalTestCases) * 100));
        
        // Create the task
        const newTask = await uatTaskService.createTask({
          app_id: application.app_id,
          test_id: testCase.test_id,
          worker_id: workerId,
          status: "Assigned"
        });
        
        newTasks.push(newTask);
      }
      
      // Update UI state after all tasks are created
      setTasksCreatedCount(newTasks.length);
      setTaskCreated(true);
      setAppTasks([...appTasks, ...newTasks]);
      setCreatingTaskProgress(100);
      
      // Show success message
      alert(`Successfully assigned ${newTasks.length} test tasks for this application!`);
      
      // IMPORTANT CHANGE: Redirect to the application tasks page
      setTimeout(() => {
        router.push(`/crowdworker/applications/${application.app_id}/tasks`);
      }, 1500);
    } catch (err: any) {
      alert(`Failed to take tasks: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTaking(false);
    }
  };

  // Check if user already has a task for this application
  const userHasTask = workerId && appTasks.some(task => task.worker_id === workerId);

  if (authLoading || isLoading || (user?.role === 'crowdworker' && !workerId)) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading application...</p>
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
            <p>{error.message}</p>
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

  if (!application) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        
        <div className="flex-1 p-6 text-white text-center">
          Application not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <CrowdworkerSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{application.app_name}</h1>
            <p className="text-gray-400">Application Details and Testing Information</p>
          </div>
          <Link
            href={userHasTask ? "/crowdworker/applications" : "/crowdworker/applications/available"}
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Back to {userHasTask ? "My Applications" : "Available Applications"}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#001333] p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Application Info</h2>
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
                <dt className="text-gray-400">Client:</dt>
                <dd className="col-span-2 text-white">
                  {application.client?.name || 'N/A'}
                  {application.client?.company && ` (${application.client.company})`}
                </dd>
              </div>
              <div className="col-span-3">
                <dt className="text-gray-400 mb-2">Description:</dt>
                <dd className="text-white bg-[#0a1e3b] p-3 rounded">{application.description || 'No description provided.'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#001333] p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Testing Progress</h2>
            {isLoadingProgress ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : progress ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Overall Progress</span>
                    <span className="text-gray-300">{progress.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-[#0a1e3b] rounded-full h-2">
                    <div className="bg-[#5460ff] h-2 rounded-full" style={{ width: `${progress.percentage || 0}%` }}></div>
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

        {/* Test Cases Section */}
        {application.test_cases && application.test_cases.length > 0 && (
          <div className="bg-[#001333] p-6 rounded-xl shadow-xl mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Test Cases</h2>
            <div className="space-y-4">
              {application.test_cases.map(testCase => (
                <div key={testCase.test_id} className="p-4 bg-[#0a1e3b] rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 text-white">{testCase.test_title}</h3>
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      testCase.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                      testCase.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {testCase.priority} Priority
                    </span>
                  </div>
                  <div className="mb-3">
                    <h4 className="text-gray-400 mb-1 text-sm">Test Steps:</h4>
                    <p className="text-white text-sm bg-[#001333] p-3 rounded whitespace-pre-wrap">
                      {testCase.test_steps || 'No steps provided'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-1 text-sm">Expected Result:</h4>
                    <p className="text-white text-sm bg-[#001333] p-3 rounded">
                      {testCase.expected_result || 'No expected result provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UAT Tasks Section */}
        {workerId && userHasTask && (
          <div className="bg-[#001333] p-6 rounded-xl shadow-xl mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">You're Already Testing This Application</h2>
            <p className="text-gray-300 mb-4">
              You already have {appTasks.filter(task => task.worker_id === workerId).length} testing tasks assigned for this application.
            </p>
            
            <div className="flex justify-center">
              <Link
                href={`/crowdworker/applications/${application.app_id}/tasks`}
                className="px-6 py-3 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] font-medium"
              >
                View My Testing Tasks
              </Link>
            </div>
          </div>
        )}

        {/* Take Task Button */}
        {workerId && !userHasTask && !taskCreated && (
          <div className="bg-[#001333] p-6 rounded-xl shadow-xl mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Take Testing Assignment</h2>
            <p className="text-gray-300 mb-4">
              By taking this testing assignment, you will be assigned to test all {application.test_cases?.length || 0} test cases for this application.
            </p>
            
            <div className="flex justify-center mt-4">
              <button
                disabled={isTaking}
                onClick={handleTakeTask}
                className="px-6 py-3 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] disabled:opacity-50 font-medium"
              >
                {isTaking ? (
                  <span className="flex items-center">
                    <span className="mr-2">Creating Tasks ({creatingTaskProgress}%)</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  </span>
                ) : (
                  `Start Testing This Application (${application.test_cases?.length || 0} test cases)`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success Message - Updated */}
        {taskCreated && (
          <div className="bg-green-500/20 text-green-300 p-6 rounded-xl shadow-xl mb-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Testing Assignment Successfully Created!</h3>
            <p className="mb-3">
              {tasksCreatedCount} test {tasksCreatedCount === 1 ? 'task' : 'tasks'} have been assigned to you.
            </p>
            <p className="mb-6">Redirecting you to your tasks...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-300 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}