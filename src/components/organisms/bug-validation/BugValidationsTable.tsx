"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Edit, Trash2, Loader2, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { bugValidationService } from "@/services/BugValidationService";
import { BugValidation } from "@/types/BugValidation";

interface BugValidationsTableProps {
  bugId?: string;
  qaId?: string;
  applicationId?: string;
}

export default function BugValidationsTable({ bugId, qaId, applicationId }: BugValidationsTableProps) {
  const [validations, setValidations] = useState<BugValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingValidationId, setProcessingValidationId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchValidations();
  }, [bugId, qaId, applicationId]);
  
  const fetchValidations = async () => {
    try {
      setIsLoading(true);
      let data: BugValidation[];
      
      if (bugId) {
        data = await bugValidationService.getValidationsByBugReport(bugId);
      } else if (qaId) {
        data = await bugValidationService.getValidationsByQASpecialist(qaId);
      } else if (applicationId) {
        data = await bugValidationService.getValidationsByApplication(applicationId);
      } else {
        data = await bugValidationService.getAllValidations();
      }
      
      setValidations(data);
    } catch (err) {
      setError("Failed to load bug validations. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this validation?")) {
      try {
        setProcessingValidationId(id);
        await bugValidationService.deleteValidation(id);
        fetchValidations();
      } catch (err) {
        console.error("Failed to delete validation:", err);
      } finally {
        setProcessingValidationId(null);
      }
    }
  };
  
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-200">Loading validations...</span>
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
              Bug Report
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              QA Specialist
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Validated At
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {validations.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                No bug validations found.
              </td>
            </tr>
          ) : (
            validations.map((validation) => (
              <tr key={validation.validation_id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {validation.bug_report?.bug_description 
                          ? `${validation.bug_report.bug_description.substring(0, 50)}${validation.bug_report.bug_description.length > 50 ? "..." : ""}`
                          : "N/A"}
                      </div>
                      {validation.bug_report?.severity && (
                        <div className="text-xs text-gray-400 mt-1">
                          Severity: <span className={`px-1.5 py-0.5 rounded text-xs ${
                            validation.bug_report.severity === 'Critical' ? 'bg-red-900/30 text-red-300' :
                            validation.bug_report.severity === 'High' ? 'bg-orange-900/30 text-orange-300' :
                            validation.bug_report.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                            'bg-blue-900/30 text-blue-300'
                          }`}>{validation.bug_report.severity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {validation.qa_specialist?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1.5 w-fit ${getStatusClass(validation.validation_status)}`}>
                    {getStatusIcon(validation.validation_status)}
                    {validation.validation_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {validation.validated_at 
                    ? new Date(validation.validated_at).toLocaleString() 
                    : "Not validated yet"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/bug-validations/${validation.validation_id}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/bug-validations/${validation.validation_id}/edit`}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(validation.validation_id)}
                      disabled={processingValidationId === validation.validation_id}
                      className={`text-gray-400 hover:text-red-400 transition-colors ${
                        processingValidationId === validation.validation_id ? 'opacity-50 cursor-not-allowed' : ''
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
