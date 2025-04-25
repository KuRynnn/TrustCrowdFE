// ✅ File: src/app/bug-reports/[id]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useBugReportDetail } from "@/hooks/UseBugReports";
import { useBugValidationList } from "@/hooks/UseBugValidations";
import Link from "next/link";
import { CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

export default function BugReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { report, isLoading, error } = useBugReportDetail(id as string);
  const { validations, isLoading: isLoadingValidations } = useBugValidationList(id as string);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Valid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Invalid':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'Needs More Info':
        return <HelpCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-900/30 text-green-300';
      case 'Invalid':
        return 'bg-red-900/30 text-red-300';
      case 'Needs More Info':
        return 'bg-yellow-900/30 text-yellow-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading bug report...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  if (!report) return <div className="p-8 text-center">Bug report not found.</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Bug Detail</h1>
        <Link
          href={`/bug-reports/${id}/edit`}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2">Bug Details</h2>
          
          <p className="text-sm text-gray-400">Description:</p>
          <p className="text-white font-medium">{report.bug_description}</p>

          <p className="text-sm text-gray-400">Steps to Reproduce:</p>
          <pre className="bg-gray-700 p-3 text-white rounded text-sm whitespace-pre-wrap">
            {report.steps_to_reproduce}
          </pre>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Severity</p>
              <p className="text-orange-300 font-medium">{report.severity}</p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-purple-300 font-medium">
                {report.validation_status || "Pending"}
              </p>
            </div>
          </div>

          {report.screenshot_url && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Screenshot</p>
              <img
                src={report.screenshot_url}
                alt="Bug Screenshot"
                className="rounded border border-gray-600"
              />
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Validation Status</h2>
            {validations && validations.length === 0 && (
              <Link
                href={`/bug-validations/new?bug_id=${id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Validate Bug
              </Link>
            )}
          </div>
          
          {isLoadingValidations ? (
            <div className="text-center py-8 text-gray-400">Loading validations...</div>
          ) : validations && validations.length > 0 ? (
            <div className="space-y-4">
              {validations.map((validation) => (
                <div key={validation.validation_id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1.5 w-fit ${getStatusClass(validation.validation_status)}`}>
                        {getStatusIcon(validation.validation_status)}
                        {validation.validation_status}
                      </span>
                      <p className="text-sm text-gray-400 mt-2">
                        Validated by: {validation.qa_specialist?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {validation.validated_at 
                          ? `on ${new Date(validation.validated_at).toLocaleDateString()}`
                          : "Not validated yet"}
                      </p>
                    </div>
                    <Link
                      href={`/bug-validations/${validation.validation_id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Comments:</p>
                    <p className="text-white text-sm bg-gray-700 p-2 rounded">
                      {validation.comments}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>This bug has not been validated yet.</p>
              <p className="mt-2">QA specialists can validate this bug to determine if it's a valid issue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
