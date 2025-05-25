// src/components/organisms/bug-report/BugReportForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SEVERITY_OPTIONS } from "@/constants";
import { BugReportService } from "@/services/BugReportService";
import { CreateBugReportData, UpdateBugReportData, BugReport } from "@/types/BugReport";
import { TestEvidenceService } from "@/services/TestEvidenceService";
import { TestEvidence } from "@/types/TestEvidence";
import EvidenceUploader from "@/components/molecules/EvidenceUploader";

interface BugReportFormProps {
  initialData?: BugReport;
  isEditing?: boolean;
}

export default function BugReportForm({ initialData, isEditing = false }: BugReportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdBugId, setCreatedBugId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<TestEvidence[]>([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  const [formData, setFormData] = useState<CreateBugReportData>({
    task_id: initialData?.task_id || "",
    worker_id: initialData?.worker_id || "",
    bug_description: initialData?.bug_description || "",
    steps_to_reproduce: initialData?.steps_to_reproduce || "",
    severity: initialData?.severity || "Medium",
    screenshot_url: initialData?.screenshot_url || "",
  });

  // Fetch existing evidence if editing
  useEffect(() => {
    if (isEditing && initialData?.bug_id) {
      const fetchEvidence = async () => {
        setIsLoadingEvidence(true);
        try {
          const data = await TestEvidenceService.getBugEvidence(initialData.bug_id);
          setEvidence(data);
        } catch (err) {
          console.error("Failed to fetch evidence:", err);
        } finally {
          setIsLoadingEvidence(false);
        }
      };
      
      fetchEvidence();
    }
  }, [isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.task_id.trim()) newErrors.task_id = "Task ID is required";
    if (!formData.worker_id.trim()) newErrors.worker_id = "Worker ID is required";
    if (!formData.bug_description.trim()) newErrors.bug_description = "Description is required";
    if (!formData.steps_to_reproduce.trim()) newErrors.steps_to_reproduce = "Steps to reproduce are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        await BugReportService.update(initialData.bug_id, formData as UpdateBugReportData);
        // Stay on the page to allow evidence upload
        setCreatedBugId(initialData.bug_id);
      } else {
        // Create new bug report
        const newBugReport = await BugReportService.create(formData);
        // Stay on the page with the created bug ID to allow evidence upload
        setCreatedBugId(newBugReport.bug_id);
      }
      
      // Don't navigate away immediately so user can add evidence
      if (!createdBugId) {
        alert("Bug report submitted! Please add evidence for each step.");
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Unexpected error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshEvidence = async () => {
    if (createdBugId || (initialData && initialData.bug_id)) {
      setIsLoadingEvidence(true);
      try {
        const bugId = createdBugId || initialData!.bug_id;
        const data = await TestEvidenceService.getBugEvidence(bugId);
        setEvidence(data);
      } catch (err) {
        console.error("Failed to refresh evidence:", err);
      } finally {
        setIsLoadingEvidence(false);
      }
    }
  };

  const handleFinish = () => {
    router.push("/bug-reports");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {createdBugId && (
        <div className="bg-green-500/20 text-green-300 p-4 rounded-md mb-6">
          <h3 className="font-bold mb-2">Bug Report Submitted Successfully</h3>
          <p>Your bug report has been submitted. Please add evidence for each step below.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && <div className="bg-red-500/20 text-red-300 p-3 rounded">{errors.general}</div>}

        <div>
          <label className="text-sm text-gray-200">Task ID *</label>
          <input
            name="task_id"
            value={formData.task_id}
            onChange={handleChange}
            disabled={!!createdBugId}
            className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 disabled:opacity-70"
          />
          {errors.task_id && <p className="text-sm text-red-500">{errors.task_id}</p>}
        </div>

        <div>
          <label className="text-sm text-gray-200">Worker ID *</label>
          <input
            name="worker_id"
            value={formData.worker_id}
            onChange={handleChange}
            disabled={!!createdBugId}
            className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 disabled:opacity-70"
          />
          {errors.worker_id && <p className="text-sm text-red-500">{errors.worker_id}</p>}
        </div>

        <div>
          <label className="text-sm text-gray-200">Bug Description *</label>
          <textarea
            name="bug_description"
            value={formData.bug_description}
            onChange={handleChange}
            disabled={!!createdBugId}
            rows={4}
            className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 disabled:opacity-70"
          />
          {errors.bug_description && <p className="text-sm text-red-500">{errors.bug_description}</p>}
        </div>

        <div>
          <label className="text-sm text-gray-200">Steps to Reproduce *</label>
          <textarea
            name="steps_to_reproduce"
            value={formData.steps_to_reproduce}
            onChange={handleChange}
            disabled={!!createdBugId}
            rows={4}
            className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 disabled:opacity-70"
          />
          {errors.steps_to_reproduce && <p className="text-sm text-red-500">{errors.steps_to_reproduce}</p>}
        </div>

        <div>
          <label className="text-sm text-gray-200">Severity *</label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            disabled={!!createdBugId}
            className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 disabled:opacity-70"
          >
            {SEVERITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {!createdBugId && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (isEditing ? "Updating..." : "Submitting...") : isEditing ? "Update Bug Report" : "Submit Bug Report"}
            </button>
          </div>
        )}
      </form>

      {/* Evidence Section - shown after bug report is created or when editing */}
      {(createdBugId || isEditing) && (
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Bug Evidence</h2>
          
          {isLoadingEvidence ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading evidence...</p>
            </div>
          ) : (
            <EvidenceUploader 
              bugId={createdBugId || initialData?.bug_id}
              existingEvidence={evidence}
              onEvidenceUpdated={refreshEvidence}
            />
          )}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-green-600 rounded-md text-white font-medium hover:bg-green-700"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}