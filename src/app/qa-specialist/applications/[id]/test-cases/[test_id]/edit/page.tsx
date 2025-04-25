// src/app/qa-specialist/applications/[id]/test-cases/[test_id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { testCaseService } from "@/services/TestCaseService";
import { TestCasePriority } from "@/constants";
import { TestCase } from "@/types/TestCase";
import QASpecialistSidebar from "@/components/organisms/sidebar/QASpecialistSidebar";

export default function EditTestCasePage() {
  const { id: app_id, test_id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    test_title: "",
    test_steps: "",
    expected_result: "",
    priority: "Medium" as TestCasePriority,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testCase, setTestCase] = useState<TestCase | null>(null);

  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        const testCase: TestCase = await testCaseService.getTestCaseById(test_id as string);
        setTestCase(testCase);
        setForm({
          test_title: testCase.test_title,
          test_steps: testCase.test_steps,
          expected_result: testCase.expected_result,
          priority: testCase.priority,
        });
        
        // Check if the current user is the creator of this test case
        if (user?.role === 'qa_specialist' && user.qa_id !== testCase.qa_id) {
          setError("You don't have permission to edit this test case.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load test case.");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "qa_specialist") return;
    
    // Verify user owns this test case
    if (user.qa_id !== testCase?.qa_id) {
      setError("You don't have permission to update this test case.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      // Correctly typed through conditional check
      if (user.role === 'qa_specialist') {
        await testCaseService.updateTestCase(test_id as string, {
          app_id: app_id as string,
          qa_id: user.qa_id,
          ...form,
        });
      }
      router.push(`/qa-specialist/applications/${app_id}`);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("You don't have permission to update this test case.");
      } else {
        setError("Failed to update test case. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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

  // Check if user is the owner using conditional logic
  const isOwner = user?.role === 'qa_specialist' && user.qa_id === testCase?.qa_id;

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <QASpecialistSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Test Case</h1>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-4 mb-4 rounded-lg">
            {error}
            {error.includes("permission") && (
              <div className="mt-2">
                <button 
                  onClick={() => router.push(`/qa-specialist/applications/${app_id}`)}
                  className="underline text-blue-400"
                >
                  Return to application
                </button>
              </div>
            )}
          </div>
        )}

        {(!error || !error.includes("permission")) && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#1a1a2e] p-6 rounded-lg shadow-md">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Test Title</label>
              <input
                type="text"
                name="test_title"
                value={form.test_title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-[#212145] text-white border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Test Steps</label>
              <textarea
                name="test_steps"
                value={form.test_steps}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 rounded bg-[#212145] text-white border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Expected Result</label>
              <textarea
                name="expected_result"
                value={form.expected_result}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 rounded bg-[#212145] text-white border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-[#212145] text-white border border-gray-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !isOwner}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Update Test Case"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}