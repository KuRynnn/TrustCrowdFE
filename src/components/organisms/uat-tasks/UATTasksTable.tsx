// src/components/organisms/uat-tasks/UATTasksTable.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Edit, Trash2, Loader2, Play, CheckCircle, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uatTaskService } from "@/services/UatTaskService";
import { UATTask } from "@/types/UATTask";

interface UATTasksTableProps {
  applicationId?: string;
  testCaseId?: string;
  workerId?: string;
}

export default function UATTasksTable({ applicationId, testCaseId, workerId }: UATTasksTableProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<UATTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const isQASpecialist = user?.role === 'qa_specialist';
  
  useEffect(() => {
    fetchTasks();
  }, [applicationId, testCaseId, workerId]);
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      let data: UATTask[];
      
      if (applicationId) {
        data = await uatTaskService.getTasksByApplication(applicationId);
      } else if (testCaseId) {
        // Since getTasksByTestCase doesn't exist, we need to handle this differently
        // Option 1: Fetch all tasks and filter by test ID
        const allTasks = await uatTaskService.getAllTasks();
        data = allTasks.filter(task => task.test_id === testCaseId);
        
        // Option 2: If you have a backend endpoint for this, add it to your service
        // and use it here
      } else if (workerId) {
        data = await uatTaskService.getTasksByCrowdworker(workerId);
      } else {
        data = await uatTaskService.getAllTasks();
      }
      
      setTasks(data);
    } catch (err) {
      setError("Failed to load UAT tasks. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this UAT task?")) {
      try {
        setProcessingTaskId(id);
        await uatTaskService.deleteTask(id);
        fetchTasks();
      } catch (err) {
        console.error("Failed to delete UAT task:", err);
      } finally {
        setProcessingTaskId(null);
      }
    }
  };
  
  const handleStartTask = async (id: string) => {
    try {
      setProcessingTaskId(id);
      await uatTaskService.startTask(id);
      fetchTasks();
    } catch (err) {
      console.error("Failed to start UAT task:", err);
    } finally {
      setProcessingTaskId(null);
    }
  };
  
  const handleCompleteTask = async (id: string) => {
    try {
      setProcessingTaskId(id);
      await uatTaskService.completeTask(id);
      fetchTasks();
    } catch (err) {
      console.error("Failed to complete UAT task:", err);
    } finally {
      setProcessingTaskId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-200">Loading UAT tasks...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }
  
  return (
    <div className="rounded-lg overflow-hidden shadow-xl">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800/60">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Test Case
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Application
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Crowdworker
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Duration
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                No UAT tasks found. Create a new UAT task to get started.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.task_id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {task.test_case?.test_title || "N/A"}
                      </div>
                      {task.bug_reports_count !== undefined && (
                        <div className="text-xs text-gray-400 mt-1">
                          Bug Reports: <span className="text-red-300">{task.bug_reports_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {task.application?.app_name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {task.crowdworker?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'Completed' ? 'bg-green-900/30 text-green-300' :
                    task.status === 'In Progress' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-blue-900/30 text-blue-300'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {task.duration ? `${task.duration} min` : 
                   (task.started_at && !task.completed_at ? 'In progress' : 'Not started')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/uat-tasks/${task.task_id}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/uat-tasks/${task.task_id}/edit`}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    {task.status === 'Assigned' && (
                      <button
                        onClick={() => handleStartTask(task.task_id)}
                        disabled={processingTaskId === task.task_id}
                        className={`text-gray-400 hover:text-green-400 transition-colors ${
                          processingTaskId === task.task_id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                    {task.status === 'In Progress' && (
                      <button
                        onClick={() => handleCompleteTask(task.task_id)}
                        disabled={processingTaskId === task.task_id}
                        className={`text-gray-400 hover:text-green-400 transition-colors ${
                          processingTaskId === task.task_id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {isQASpecialist && task.status === 'Completed' && (
                      <Link
                        href={`/qa-specialist/uat-tasks/${task.task_id}/validate`}
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                        title="Validate Task"
                      >
                        <ClipboardCheck className="w-5 h-5" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(task.task_id)}
                      disabled={processingTaskId === task.task_id}
                      className={`text-gray-400 hover:text-red-400 transition-colors ${
                        processingTaskId === task.task_id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}