// src/app/qa-specialist/applications/[id]/test-cases/new/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { testCaseService } from "@/services/TestCaseService";
import { TestCasePriority } from "@/constants";
import QASpecialistSidebar from "@/components/organisms/sidebar/QASpecialistSidebar";

export default function CreateTestCasePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    test_title: "",
    test_steps: "",
    expected_result: "",
    priority: "Medium" as TestCasePriority,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "qa_specialist") return;
    setIsSubmitting(true);
    setError(null);
    try {
      await testCaseService.createTestCase({
        app_id: id as string,
        qa_id: user.qa_id,
        ...form,
      });
      router.push(`/qa-specialist/applications/${id}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to create test case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0e0b1e] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
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
        <h1 className="text-2xl font-bold text-white mb-6">Create New Test Case</h1>

        {error && <div className="text-red-400 mb-4">{error}</div>}

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
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#4c0e8f] text-white rounded hover:bg-[#3a0b6b] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Create Test Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}