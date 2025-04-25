// src/components/applications/ApplicationsTable.tsx
"use client";

import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Application } from "@/types/Application";

interface ApplicationsTableProps {
  data: Application[];
  isLoading: boolean;
  error: Error | null;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  showClientColumn?: boolean;
  hideActions?: boolean;
}

export default function ApplicationsTable({
  data,
  isLoading,
  error,
  onDelete,
  onStatusChange,
  showClientColumn = true,
  hideActions = false,
}: ApplicationsTableProps) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      onDelete?.(id);
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-900/30 text-green-300';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-300';
      case 'completed':
        return 'bg-blue-900/30 text-blue-300';
      case 'on-hold':
        return 'bg-red-900/30 text-red-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-200">Loading applications...</span>
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
    <div className="rounded-lg overflow-hidden shadow-xl">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800/60">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Application
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Platform
            </th>
            {showClientColumn && (
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Client
              </th>
            )}
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Status
            </th>
            {!hideActions && (
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                No applications found.
              </td>
            </tr>
          ) : (
            data.map((app) => (
              <tr key={app.app_id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{app.app_name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    <a
                      href={app.app_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {app.app_url}
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/30 text-indigo-300">
                    {app.platform}
                  </span>
                </td>
                {showClientColumn && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {app.client?.name || "N/A"}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusClassName(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                {!hideActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-3">
                      <Link
                        href={`/client/application/${app.app_id}`}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/client/application/${app.app_id}/edit`}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(app.app_id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}