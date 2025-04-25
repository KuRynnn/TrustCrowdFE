"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { testCaseService } from "@/services/TestCaseService";
import { TestCase } from "@/types/TestCase";

export default function TestCasesTable({ applicationId }: { applicationId?: string }) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTestCases();
  }, [applicationId]);
  
  const fetchTestCases = async () => {
    try {
      setIsLoading(true);
      let data: TestCase[];
      
      if (applicationId) {
        data = await testCaseService.getTestCasesByApplication(applicationId);
      } else {
        data = await testCaseService.getAllTestCases();
      }
      
      setTestCases(data);
    } catch (err) {
      setError("Failed to load test cases. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this test case?")) {
      try {
        await testCaseService.deleteTestCase(id);
        fetchTestCases();
      } catch (err) {
        console.error("Failed to delete test case:", err);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-200">Loading test cases...</span>
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
              QA Specialist
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {testCases.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                No test cases found. Create a new test case to get started.
              </td>
            </tr>
          ) : (
            testCases.map((testCase) => (
              <tr key={testCase.test_id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div>
                      <div className="text-sm font-medium text-white">{testCase.test_title}</div>
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        {testCase.test_steps.split('\n')[0]}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {testCase.application?.app_name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {testCase.qa_specialist?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    testCase.priority === 'High' ? 'bg-red-900/30 text-red-300' :
                    testCase.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-blue-900/30 text-blue-300'
                  }`}>
                    {testCase.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/test-cases/${testCase.test_id}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/test-cases/${testCase.test_id}/edit`}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(testCase.test_id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
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
