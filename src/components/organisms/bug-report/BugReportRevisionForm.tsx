// src/components/organisms/bug-report/BugReportRevisionForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SEVERITY_OPTIONS } from "@/constants";
import { BugReportService } from "@/services/BugReportService";
import { BugReport } from "@/types/BugReport";
import { Camera, XCircle, Bug } from 'lucide-react';

interface BugReportRevisionFormProps {
  originalBug: BugReport;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function BugReportRevisionForm({ 
  originalBug, 
  onCancel,
  onSuccess 
}: BugReportRevisionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize with the original bug's data
  const [formData, setFormData] = useState({
    original_bug_id: originalBug.bug_id,
    bug_description: originalBug.bug_description,
    steps_to_reproduce: originalBug.steps_to_reproduce,
    severity: originalBug.severity,
    screenshot_url: originalBug.screenshot_url,
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    originalBug.screenshot_url || null
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setScreenshotFile(file);
  };
  
  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setFormData(prev => ({ ...prev, screenshot_url: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.bug_description.trim()) {
      newErrors.bug_description = "Description is required";
    }
    if (!formData.steps_to_reproduce.trim()) {
      newErrors.steps_to_reproduce = "Steps to reproduce are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      // Create the bug report revision
      const revisedBug = await BugReportService.createRevision(
        originalBug.bug_id, 
        formData
      );
      
      // If there's a new screenshot, upload it
      if (screenshotFile && revisedBug.bug_id) {
        try {
          const formData = new FormData();
          formData.append('screenshot', screenshotFile);
          await BugReportService.uploadScreenshot(revisedBug.bug_id, formData);
        } catch (uploadErr) {
          console.error("Failed to upload screenshot:", uploadErr);
        }
      }
      
      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setErrors({ 
        general: err.message || "Unexpected error creating bug revision" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-900/30 border border-amber-700 p-4 rounded-md mb-6">
        <h3 className="text-amber-300 font-medium mb-2 flex items-center gap-2">
          <Bug size={16} />
          Revising Bug Report
        </h3>
        <p className="text-amber-200 text-sm">
          Update this bug report based on the QA specialist's feedback.
        </p>
      </div>

      {errors.general && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded">{errors.general}</div>
      )}

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

      {/* Screenshot Upload */}
      <div>
        <label className="text-sm text-gray-200">Screenshot (Optional)</label>
        
        {screenshotPreview ? (
          <div className="relative border border-gray-700 rounded-md overflow-hidden mt-2">
            <img 
              src={screenshotPreview} 
              alt="Bug screenshot" 
              className="max-h-60 max-w-full object-contain mx-auto"
            />
            <button
              type="button"
              onClick={handleRemoveScreenshot}
              className="absolute top-2 right-2 p-1 bg-red-900/80 text-white rounded-full hover:bg-red-800"
            >
              <XCircle size={20} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-md p-6 cursor-pointer hover:border-gray-500 transition-colors mt-2"
          >
            <Camera size={32} className="text-gray-500 mb-2" />
            <p className="text-gray-500 text-sm">Click to upload a screenshot</p>
            <p className="text-gray-600 text-xs mt-1">PNG, JPG up to 10MB</p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleScreenshotChange}
          accept="image/png, image/jpeg"
          className="hidden"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-amber-600 rounded-md text-white font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Revision"}
        </button>
      </div>
    </form>
  );
}