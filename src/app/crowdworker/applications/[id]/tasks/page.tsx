// src/app/crowdworker/applications/[id]/tasks/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import { useApplicationDetail } from '@/hooks/UseApplications';
import { UATTask } from '@/types/UATTask';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';
import Link from 'next/link';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ApplicationTasksPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { application, isLoading: isLoadingApp } = useApplicationDetail(id as string);
  
  const [tasks, setTasks] = useState<UATTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<UATTask[]>([]);
  
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
      if (!id || !workerId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get tasks for this application that belong to this worker
        const appTasks = await uatTaskService.getTasksByApplication(id as string);
        const workerAppTasks = appTasks.filter(task => task.worker_id === workerId);
        setTasks(workerAppTasks);
      } catch (err: any) {
        console.error("Failed to fetch application tasks:", err);
        setError(err.message || "Failed to load tasks for this application");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && workerId) {
      fetchApplicationTasks();
    }
  }, [id, workerId]);

  // Apply status filter
  useEffect(() => {
    if (statusFilter) {
      setFilteredTasks(tasks.filter(task => task.status === statusFilter));
    } else {
      setFilteredTasks(tasks);
    }
  }, [tasks, statusFilter]);

  // Calculate task counts by status
  const assignedCount = tasks.filter(task => task.status === 'Assigned').length;
  const inProgressCount = tasks.filter(task => task.status === 'In Progress').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedCount / totalTasks) * 100) 
    : 0;

  // Function to get task status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={18} className="text-green-300" />;
      case 'In Progress':
        return <Clock size={18} className="text-yellow-300" />;
      case 'Assigned':
        return <AlertTriangle size={18} className="text-blue-300" />;
      default:
        return null;
    }
  };

  if (authLoading || isLoadingApp || (user?.role === 'crowdworker' && !workerId) || isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading application tasks...</p>
          </div>
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
        <div className="flex-1 p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>Application not found</p>
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

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <CrowdworkerSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-white">
              {application.app_name}: Testing Tasks
            </h1>
            <Link
              href={`/crowdworker/applications/${application.app_id}`}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
            >
              Back to Application Details
            </Link>
          </div>
          <p className="text-gray-400">Complete all test cases to finish testing this application</p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Application Progress */}
        <div className="bg-[#001333] p-6 rounded-xl shadow-xl mb-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Testing Progress</h2>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Overall Progress</span>
              <span className="text-gray-300">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#0a1e3b] rounded-full h-2">
              <div className="bg-[#5460ff] h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0a1e3b] p-3 rounded-md text-center">
              <p className="text-blue-300 mb-1">Assigned</p>
              <p className="text-2xl font-bold text-white">{assignedCount}</p>
            </div>
            <div className="bg-[#0a1e3b] p-3 rounded-md text-center">
              <p className="text-yellow-300 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-white">{inProgressCount}</p>
            </div>
            <div className="bg-[#0a1e3b] p-3 rounded-md text-center">
              <p className="text-green-300 mb-1">Completed</p>
              <p className="text-2xl font-bold text-white">{completedCount}</p>
            </div>
          </div>
        </div>

        {/* Task Filters */}
        <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-3">Filter Tasks</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === null
                  ? 'bg-[#5460ff] text-white'
                  : 'bg-[#0a1e3b] text-gray-300 hover:bg-[#0a1e3b]/80'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('Assigned')}
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                statusFilter === 'Assigned'
                  ? 'bg-[#5460ff] text-white'
                  : 'bg-[#0a1e3b] text-gray-300 hover:bg-[#0a1e3b]/80'
              }`}
            >
              <AlertTriangle size={14} className="mr-1" />
              Not Started ({assignedCount})
            </button>
            <button
              onClick={() => setStatusFilter('In Progress')}
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                statusFilter === 'In Progress'
                  ? 'bg-[#5460ff] text-white'
                  : 'bg-[#0a1e3b] text-gray-300 hover:bg-[#0a1e3b]/80'
              }`}
            >
              <Clock size={14} className="mr-1" />
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('Completed')}
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                statusFilter === 'Completed'
                  ? 'bg-[#5460ff] text-white'
                  : 'bg-[#0a1e3b] text-gray-300 hover:bg-[#0a1e3b]/80'
              }`}
            >
              <CheckCircle size={14} className="mr-1" />
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-[#001333] p-8 rounded-xl shadow-xl text-center">
            <h2 className="text-xl font-semibold text-white mb-2">No tasks found</h2>
            <p className="text-gray-400 mb-6">
              {statusFilter 
                ? `You don't have any ${statusFilter} tasks for this application.` 
                : "You don't have any tasks for this application."}
            </p>
            <Link
              href="/crowdworker/applications"
              className="px-6 py-3 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] font-medium"
            >
              View All Applications
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div key={task.task_id} className="bg-[#001333] p-4 rounded-xl shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold text-white">
                        {task.test_case?.test_title || 'Unnamed Test Case'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                        task.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.test_case?.priority && (
                      <div className="mb-2">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                          task.test_case.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                          task.test_case.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {task.test_case.priority} Priority
                        </span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/crowdworker/tasks/${task.task_id}`}
                    className="px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] inline-block"
                  >
                    {task.status === 'Assigned' ? 'Start Testing' : 
                     task.status === 'In Progress' ? 'Continue Testing' : 
                     'View Details'}
                  </Link>
                </div>
                
                {task.test_case?.test_steps && (
                  <div className="mb-3">
                    <h4 className="text-gray-400 mb-1 text-sm">Test Steps:</h4>
                    <p className="text-white text-sm bg-[#0a1e3b] p-3 rounded line-clamp-2 whitespace-pre-wrap">
                      {task.test_case.test_steps}
                    </p>
                  </div>
                )}
                
                {task.started_at && (
                  <div className="flex gap-4 text-xs text-gray-400 mt-3">
                    <div>
                      <span className="block">Started:</span>
                      <span className="text-gray-300">
                        {new Date(task.started_at).toLocaleDateString()} {new Date(task.started_at).toLocaleTimeString()}
                      </span>
                    </div>
                    {task.completed_at && (
                      <div>
                        <span className="block">Completed:</span>
                        <span className="text-gray-300">
                          {new Date(task.completed_at).toLocaleDateString()} {new Date(task.completed_at).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/crowdworker/applications"
            className="px-4 py-2 bg-[#001333] text-white rounded-md hover:bg-[#0a1e3b]"
          >
            ← Back to My Applications
          </Link>
          <Link
            href="/crowdworker/tasks"
            className="px-4 py-2 bg-[#001333] text-white rounded-md hover:bg-[#0a1e3b]"
          >
            View All My Tasks →
          </Link>
        </div>
      </div>
    </div>
  );
}