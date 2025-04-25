// src/app/crowdworker/tasks/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import { UATTask } from '@/types/UATTask';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, AlertTriangle, Filter, XCircle, ListFilter } from 'lucide-react';

export default function CrowdworkerTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams.get('app');
  
  const [tasks, setTasks] = useState<UATTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<UATTask[]>([]);
  const [appName, setAppName] = useState<string | null>(null);

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

  // Fetch worker's tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!workerId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get all tasks for this worker
        const workerTasks = await uatTaskService.getTasksByCrowdworker(workerId);
        
        // Filter by application ID if provided
        if (appId) {
          const appTasks = workerTasks.filter(task => task.app_id === appId);
          setTasks(appTasks);
          
          // Set application name if available
          if (appTasks.length > 0 && appTasks[0].application?.app_name) {
            setAppName(appTasks[0].application.app_name);
          }
        } else {
          setTasks(workerTasks);
        }
      } catch (err: any) {
        console.error("Failed to load tasks:", err);
        setError(err.message || 'Failed to load your tasks');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (workerId) {
      fetchTasks();
    }
  }, [workerId, appId]);

  // Apply status filter whenever tasks or statusFilter changes
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

  // Function to clear all filters
  const clearFilters = () => {
    setStatusFilter(null);
    if (appId) {
      // Remove app parameter from URL
      router.push('/crowdworker/tasks');
    }
  };

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

  if (authLoading || (user?.role === 'crowdworker' && !workerId) || isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading your tasks...</p>
          </div>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {appId ? `Tasks for ${appName || 'Application'}` : 'My Testing Tasks'}
            </h1>
            <p className="text-gray-400">
              {appId ? `All tasks for this specific application` : 'All testing tasks assigned to you'}
            </p>
          </div>
          <Link
            href="/crowdworker/applications"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Back to My Applications
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                <AlertTriangle size={24} className="text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Assigned</p>
                <p className="text-2xl font-bold text-white">{assignedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl">
            <div className="flex items-center">
              <div className="bg-yellow-500/20 p-3 rounded-full mr-4">
                <Clock size={24} className="text-yellow-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-white">{inProgressCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#001333] p-4 rounded-xl shadow-xl">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-full mr-4">
                <CheckCircle size={24} className="text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#001333] p-4 rounded-xl shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ListFilter size={20} className="text-gray-300 mr-2" />
              <h2 className="text-lg font-semibold text-gray-200">Filters</h2>
            </div>
            {(statusFilter || appId) && (
              <button 
                onClick={clearFilters}
                className="flex items-center text-sm text-gray-400 hover:text-white"
              >
                <XCircle size={16} className="mr-1" />
                Clear All Filters
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === null
                  ? 'bg-[#5460ff] text-white'
                  : 'bg-[#0a1e3b] text-gray-300 hover:bg-[#0a1e3b]/80'
              }`}
            >
              All
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
              Assigned
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
              In Progress
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
              Completed
            </button>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-[#001333] p-8 rounded-xl shadow-xl text-center">
            <h2 className="text-xl font-semibold text-white mb-2">No tasks found</h2>
            <p className="text-gray-400 mb-6">
              {statusFilter 
                ? `You don't have any ${statusFilter} tasks at the moment.` 
                : "You don't have any testing tasks at the moment."}
            </p>
            <Link
              href="/crowdworker/applications/available"
              className="px-6 py-3 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] font-medium"
            >
              Find Applications to Test
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
                    <p className="text-sm text-gray-400 mb-2">
                      Application: {task.application?.app_name || 'Unknown Application'}
                    </p>
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
                  <div>
                    <Link
                      href={`/crowdworker/tasks/${task.task_id}`}
                      className="px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] inline-block"
                    >
                      {task.status === 'Assigned' ? 'Start Testing' : 
                       task.status === 'In Progress' ? 'Continue Testing' : 
                       'View Details'}
                    </Link>
                  </div>
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
      </div>
    </div>
  );
}