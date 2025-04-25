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

  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        setIsLoading(true);
        const data = await testCaseService.getTestCaseById(test_id as string);
        setTestCase(data);
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
          <h1 className="text-2xl font-bold text-white">{testCase.test_title}</h1>
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

        <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-md space-y-4">
          <div>
            <h2 className="text-gray-300 text-sm mb-1">Test Steps</h2>
            <p className="text-white whitespace-pre-wrap">{testCase.test_steps}</p>
          </div>

          <div>
            <h2 className="text-gray-300 text-sm mb-1">Expected Result</h2>
            <p className="text-white whitespace-pre-wrap">{testCase.expected_result}</p>
          </div>

          <div>
            <h2 className="text-gray-300 text-sm mb-1">Priority</h2>
            <p className="text-white">{testCase.priority}</p>
          </div>

          <div>
            <h2 className="text-gray-300 text-sm mb-1">Created By</h2>
            <p className="text-white">{testCase.qa_specialist?.name || 'Unknown QA Specialist'}</p>
          </div>

          <div>
            <h2 className="text-gray-300 text-sm mb-1">Created At</h2>
            <p className="text-white">{new Date(testCase.created_at).toLocaleString()}</p>
          </div>

          <div>
            <h2 className="text-gray-300 text-sm mb-1">Updated At</h2>
            <p className="text-white">{new Date(testCase.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}