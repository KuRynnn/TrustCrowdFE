// src/app/qa-specialist/applications/[id]/test-cases/[test_id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { testCaseService } from "@/services/TestCaseService";
import { TestCase } from "@/types/TestCase";
import Link from "next/link";
import QASpecialistSidebar from "@/components/organisms/sidebar/QASpecialistSidebar";
import { useAuth } from "@/context/AuthContext";

export default function QATestCaseDetailPage() {
  const { id, test_id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);  // For UAT tasks related to this test case

  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        setIsLoading(true);
        const data = await testCaseService.getTestCaseById(test_id as string);
        setTestCase(data);
        
        // If the test case has UAT tasks, store them
        if (data.uat_tasks && Array.isArray(data.uat_tasks)) {
          setTasks(data.uat_tasks);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load test case details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      if (user.role !== 'qa_specialist') {
        router.push('/dashboard');
        return;
      }
      fetchTestCase();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [test_id, user, authLoading, router]);

  const handleDelete = async () => {
    if (!testCase || !user || user.role !== 'qa_specialist') return;
    
    // Verify user owns this test case
    if (user.qa_id !== testCase.qa_id) {
      setError("You don't have permission to delete this test case.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this test case?")) {
      setIsDeleting(true);
      try {
        // Using the role check to access qa_id safely
        if (user.role === 'qa_specialist') {
          await testCaseService.deleteTestCase(test_id as string, user.qa_id);
        }
        router.push(`/qa-specialist/applications/${id}`);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          setError("You don't have permission to delete this test case.");
        } else {
          setError("Failed to delete test case. Please try again.");
        }
        setIsDeleting(false);
      }
    }
  };

  // Format priority with capitalized first letter
  const formatPriority = (priority: string): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

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
          <div className="bg-red-900/50 text-red-400 p-4 rounded-lg">
            {error}
            <div className="mt-2">
              <button 
                onClick={() => router.push(`/qa-specialist/applications/${id}`)}
                className="underline text-blue-400"
              >
                Return to application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        {/* Sidebar */}
        <div className="w-64">
          <QASpecialistSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6 text-white text-center">
          Test case not found.
        </div>
      </div>
    );
  }

  // Check ownership using the same approach as in ApplicationForm
  const isOwner = user?.role === 'qa_specialist' && user.qa_id === testCase.qa_id;

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <QASpecialistSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{testCase.test_title}</h1>
            <div className="flex items-center mt-2 space-x-3 text-sm">
              <span className={`px-2 py-1 rounded-full ${
                testCase.priority === 'High' ? 'bg-red-900/30 text-red-300' :
                testCase.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                'bg-blue-900/30 text-blue-300'
              }`}>
                {formatPriority(testCase.priority)} Priority
              </span>
              
              <span className="text-gray-400">•</span>
              
              <span className="text-gray-300">
                Created by: {testCase.qa_specialist?.name || 'Unknown'}
              </span>
              
              <span className="text-gray-400">•</span>
              
              <span className="text-gray-300">
                {new Date(testCase.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Link
              href={`/qa-specialist/applications/${id}`}
              className="text-gray-300 hover:text-blue-400"
            >
              Back to Application
            </Link>
            
            {isOwner && (
              <>
                <Link
                  href={`/qa-specialist/applications/${id}/test-cases/${test_id}/edit`}
                  className="text-blue-400 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-400 hover:underline disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>
        
        {!isOwner && (
          <div className="mb-4 text-yellow-300 bg-yellow-900/30 p-2 rounded text-sm">
            You are viewing a test case created by another QA specialist. You cannot edit or delete it.
          </div>
        )}
        
        <div className="mb-6">
          <div className="text-lg font-medium mb-2 text-purple-300">GWT (Given-When-Then)</div>
          <div className="bg-[#1a1a2e] overflow-hidden rounded-lg shadow-md border border-gray-700 divide-y divide-gray-700">
            {/* Given section */}
            <div className="p-4">
              <div className="flex items-center">
                <div className="w-20 h-8 bg-blue-900/30 flex items-center justify-center rounded-md">
                  <span className="text-blue-400 font-medium text-sm">GIVEN</span>
                </div>
                <div className="ml-4 text-gray-300 flex-grow">
                  <div className="whitespace-pre-wrap">{testCase.given_context}</div>
                </div>
              </div>
            </div>
            
            {/* When section */}
            <div className="p-4">
              <div className="flex items-start">
                <div className="w-20 h-8 bg-green-900/30 flex items-center justify-center rounded-md">
                  <span className="text-green-400 font-medium text-sm">WHEN</span>
                </div>
                <div className="ml-4 text-gray-300 flex-grow">
                  <div className="whitespace-pre-wrap">{testCase.when_action}</div>
                </div>
              </div>
            </div>
            
            {/* Then section */}
            <div className="p-4">
              <div className="flex items-start">
                <div className="w-20 h-8 bg-purple-900/30 flex items-center justify-center rounded-md">
                  <span className="text-purple-400 font-medium text-sm">THEN</span>
                </div>
                <div className="ml-4 text-gray-300 flex-grow">
                  <div className="whitespace-pre-wrap">{testCase.then_result}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Test details section */}
        <div className="mb-6">
          <div className="text-lg font-medium mb-2 text-gray-300">Test Case Details</div>
          <div className="bg-[#1a1a2e] p-4 rounded-lg shadow-md border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Test ID</div>
                <div className="text-white font-mono text-sm mt-1">{testCase.test_id}</div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm">Application</div>
                <div className="text-white mt-1">{testCase.application?.app_name || 'Unknown Application'}</div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm">Priority</div>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    testCase.priority === 'High' ? 'bg-red-900/30 text-red-300' :
                    testCase.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-blue-900/30 text-blue-300'
                  }`}>
                    {formatPriority(testCase.priority)}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm">QA Specialist</div>
                <div className="text-white mt-1">{testCase.qa_specialist?.name || 'Unknown'}</div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm">Created At</div>
                <div className="text-white mt-1">{new Date(testCase.created_at).toLocaleString()}</div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm">Updated At</div>
                <div className="text-white mt-1">{new Date(testCase.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* UAT Tasks section */}
        {tasks.length > 0 && (
          <div>
            <div className="text-lg font-medium mb-2 text-gray-300">Related UAT Tasks</div>
            <div className="bg-[#1a1a2e] rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1a1a3a]">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Task ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {tasks.map((task) => (
                    <tr key={task.task_id} className="hover:bg-[#1a1a4a]">
                      <td className="px-4 py-3 text-sm font-mono">
                        <Link href={`/qa-specialist/uat-tasks/${task.task_id}`} className="text-blue-400 hover:underline">
                          {task.task_id.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                          task.status === 'in progress' ? 'bg-blue-900/30 text-blue-300' :
                          task.status === 'verified' ? 'bg-purple-900/30 text-purple-300' :
                          task.status === 'rejected' ? 'bg-red-900/30 text-red-300' :
                          task.status === 'revision required' ? 'bg-yellow-900/30 text-yellow-300' :
                          'bg-gray-900/30 text-gray-300'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {task.assigned_to || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Not completed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}