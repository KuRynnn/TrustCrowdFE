// ✅ File: src/components/organisms/bug-report/BugReportsTable.tsx

"use client";

import Link from "next/link";
import { useBugReports } from "@/hooks/UseBugReports";
import { Loader2, Eye, Edit } from "lucide-react";
import { SEVERITY_OPTIONS } from "@/constants";

export default function BugReportsTable() {
  const { reports, isLoading, error } = useBugReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-300">Loading bug reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
        {error.message}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Bug</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Severity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {reports.map((bug) => (
            <tr key={bug.bug_id} className="hover:bg-gray-800/40 transition-colors">
              <td className="px-6 py-4">
                <div className="text-white text-sm font-medium">{bug.bug_description}</div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-orange-300 font-semibold">
                  {bug.severity}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-blue-300">
                  {bug.uat_task?.task_title || "-"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs px-2 py-1 rounded-full bg-purple-800/30 text-purple-300">
                  {bug.validation_status || "Pending"}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <Link
                  href={`/bug-reports/${bug.bug_id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                <Link
                  href={`/bug-reports/${bug.bug_id}/edit`}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <Edit className="w-5 h-5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
