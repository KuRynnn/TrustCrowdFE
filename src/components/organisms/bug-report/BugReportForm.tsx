// ✅ File: src/components/organisms/bug-report/BugReportForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SEVERITY_OPTIONS } from "@/constants";
import { BugReportService } from "@/services/BugReportService";
import { CreateBugReportData, UpdateBugReportData, BugReport } from "@/types/BugReport";

interface BugReportFormProps {
  initialData?: BugReport;
  isEditing?: boolean;
}

export default function BugReportForm({ initialData, isEditing = false }: BugReportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateBugReportData>({
    task_id: initialData?.task_id || "",
    worker_id: initialData?.worker_id || "",
    bug_description: initialData?.bug_description || "",
    steps_to_reproduce: initialData?.steps_to_reproduce || "",
    severity: initialData?.severity || "Medium",
    screenshot_url: initialData?.screenshot_url || "",
  });

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
      } else {
        await BugReportService.create(formData);
      }
      router.push("/bug-reports");
    } catch (err: any) {
      setErrors({ general: err.message || "Unexpected error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {errors.general && <div className="bg-red-500/20 text-red-300 p-3 rounded">{errors.general}</div>}

      <div>
        <label className="text-sm text-gray-200">Task ID *</label>
        <input
          name="task_id"
          value={formData.task_id}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
        />
        {errors.task_id && <p className="text-sm text-red-500">{errors.task_id}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-200">Worker ID *</label>
        <input
          name="worker_id"
          value={formData.worker_id}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
        />
        {errors.worker_id && <p className="text-sm text-red-500">{errors.worker_id}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-200">Bug Description *</label>
        <textarea
          name="bug_description"
          value={formData.bug_description}
          onChange={handleChange}
          rows={4}
          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
        />
        {errors.bug_description && <p className="text-sm text-red-500">{errors.bug_description}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-200">Steps to Reproduce *</label>
        <textarea
          name="steps_to_reproduce"
          value={formData.steps_to_reproduce}
          onChange={handleChange}
          rows={4}
          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
        />
        {errors.steps_to_reproduce && <p className="text-sm text-red-500">{errors.steps_to_reproduce}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-200">Severity *</label>
        <select
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
        >
          {SEVERITY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-200">Screenshot URL</label>
        <input
          name="screenshot_url"
          value={formData.screenshot_url || ""}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
        />
      </div>

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
    </form>
  );
}
