'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { ClipboardCheck, Eye, AlertTriangle } from 'lucide-react';
import QASpecialistSidebar from '@/components/organisms/sidebar/QASpecialistSidebar';

export default function TaskValidationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        // Get all completed tasks that need validation
        const allTasks = await uatTaskService.getTasksByStatus('Completed');
        setTasks(allTasks);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      if (user.role !== 'qa_specialist') {
        router.push('/dashboard');
        return;
      }
      fetchTasks();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [router, user, authLoading]);

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

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <QASpecialistSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Task Validations</h1>
          <p className="text-gray-400">
            Review and validate completed UAT tasks. All bug reports must be validated before you can validate a task.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-[#1a1a2e] rounded-lg p-8 text-center">
            <ClipboardCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Tasks to Validate</h2>
            <p className="text-gray-400 mb-6">
              There are no completed tasks that need validation at this time.
            </p>
            <Link
              href="/uat-tasks"
              className="px-4 py-2 bg-[#4c0e8f] rounded-md text-white font-medium hover:bg-[#3a0b6b]"
            >
              View All Tasks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.task_id} className="bg-[#1a1a2e] rounded-lg overflow-hidden shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {task.testCase?.test_title || 'Unnamed Task'}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-300">
                      {task.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Application:</p>
                    <p className="text-white">{task.application?.app_name || 'N/A'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Crowdworker:</p>
                    <p className="text-white">{task.crowdworker?.name || 'N/A'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Bug Reports:</p>
                    <p className="text-white">
                      {task.bug_reports_count || 0} {task.bug_reports_count === 1 ? 'report' : 'reports'}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Completed:</p>
                    <p className="text-white">
                      {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  {task.bug_reports_count > 0 && (
                    <div className="bg-yellow-900/20 text-yellow-300 p-3 rounded-md mb-4 flex items-start">
                      <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        All bug reports must be validated before validating this task.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/uat-tasks/${task.task_id}`}
                      className="px-3 py-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/qa-specialist/uat-tasks/${task.task_id}/validate`}
                      className="px-3 py-2 bg-[#4c0e8f] rounded-md text-white hover:bg-[#3a0b6b] transition-colors"
                    >
                      <ClipboardCheck className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}