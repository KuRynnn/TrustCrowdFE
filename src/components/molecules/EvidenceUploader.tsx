// src/components/molecules/EvidenceUploader.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { XCircle, Camera, Plus, Trash } from 'lucide-react';
import { TestEvidence } from '@/types/TestEvidence';
import { TestEvidenceService } from '@/services/TestEvidenceService';

interface EvidenceUploaderProps {
  bugId?: string;
  taskId?: string;
  existingEvidence?: TestEvidence[];
  stepNumber?: number; // New prop to set the initial step number
  onEvidenceUpdated: () => void;
  onCancel?: () => void; // Added callback for cancellation
}

export default function EvidenceUploader({
  bugId,
  taskId,
  existingEvidence = [],
  stepNumber, // Accept the step number prop
  onEvidenceUpdated,
  onCancel
}: EvidenceUploaderProps) {
  // Initialize currentStep with stepNumber if provided, otherwise calculate it
  const [currentStep, setCurrentStep] = useState(() => {
    if (stepNumber !== undefined) return stepNumber;
    return determineNextStepNumber(existingEvidence);
  });
  
  const [stepDescription, setStepDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // New state for GWT context
  const [context, setContext] = useState<'given' | 'when' | 'then'>('when');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update currentStep if stepNumber prop changes
  useEffect(() => {
    if (stepNumber !== undefined) {
      setCurrentStep(stepNumber);
    }
  }, [stepNumber]);

  // Find the next step number (max + 1)
  function determineNextStepNumber(evidence: TestEvidence[]) {
    if (evidence.length === 0) return 1;
    const maxStep = Math.max(...evidence.map(e => e.step_number));
    return maxStep + 1;
  }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!screenshotFile || !stepDescription.trim()) {
      setError('Please provide both a screenshot and a step description');
      return;
    }

    if (!bugId && !taskId) {
      setError('Missing bug or task ID for evidence upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      formData.append('step_number', currentStep.toString());
      formData.append('step_description', stepDescription.trim());
      
      // Add context for task evidence
      if (taskId) {
        formData.append('context', context);
      }
      
      if (notes.trim()) formData.append('notes', notes.trim());
      
      // Debug logging
      console.log('Uploading evidence with:');
      console.log('- TaskID:', taskId);
      console.log('- BugID:', bugId);
      console.log('- Step Number:', currentStep);
      console.log('- Description:', stepDescription);
      console.log('- Context:', context);
      
      // Upload to appropriate endpoint
      if (bugId) {
        await TestEvidenceService.uploadBugEvidence(bugId, formData);
      } else if (taskId) {
        await TestEvidenceService.uploadTaskEvidence(taskId, formData);
      }

      // Reset form and notify parent component
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setStepDescription('');
      setNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent
      onEvidenceUpdated();
    } catch (err: any) {
      console.error('Failed to upload evidence:', err);
      setError(err.message || 'Failed to upload evidence');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;
    
    try {
      await TestEvidenceService.deleteEvidence(evidenceId);
      onEvidenceUpdated();
    } catch (err: any) {
      console.error('Failed to delete evidence:', err);
      alert('Failed to delete evidence: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Evidence */}
      {existingEvidence.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-white font-medium">Uploaded Evidence</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingEvidence.sort((a, b) => a.step_number - b.step_number).map(evidence => (
              <div key={evidence.evidence_id} className="bg-[#0a1e3b] border border-gray-700 rounded-md overflow-hidden">
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <div>
                    <span className="text-white font-medium">Step {evidence.step_number}</span>
                    <p className="text-gray-400 text-sm mt-1">{evidence.step_description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvidence(evidence.evidence_id)}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Delete evidence"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                <a 
                  href={evidence.screenshot_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={evidence.screenshot_url} 
                    alt={`Step ${evidence.step_number}`} 
                    className="max-h-48 w-full object-cover"
                  />
                </a>
                {evidence.notes && (
                  <div className="p-3 text-gray-300 text-sm">
                    <p className="text-xs text-gray-500 mb-1">Notes:</p>
                    {evidence.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Evidence Uploader */}
      <div className="bg-[#0a1e3b] border border-gray-700 rounded-md p-4">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Plus size={16} />
          Add Evidence for Step {currentStep}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Context Selection - Only show for task evidence */}
          {taskId && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Evidence Context
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => setContext('given')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    context === 'given' 
                      ? 'bg-blue-900/40 border-blue-500 text-blue-300' 
                      : 'border-gray-700 text-gray-400 hover:border-blue-500/50'
                  }`}
                >
                  <span>GIVEN</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setContext('when')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    context === 'when' 
                      ? 'bg-green-900/40 border-green-500 text-green-300' 
                      : 'border-gray-700 text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <span>WHEN</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setContext('then')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                    context === 'then' 
                      ? 'bg-purple-900/40 border-purple-500 text-purple-300' 
                      : 'border-gray-700 text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  <span>THEN</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {context === 'given' && 'Evidence of initial setup or context before actions are performed'}
                {context === 'when' && 'Evidence of actions being performed during testing'}
                {context === 'then' && 'Evidence of test results or outcomes after actions'}
              </p>
            </div>
          )}
        
          {/* Screenshot Upload */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Screenshot <span className="text-red-400">*</span>
            </label>
            
            {screenshotPreview ? (
              <div className="relative border border-gray-700 rounded-md overflow-hidden">
                <img 
                  src={screenshotPreview} 
                  alt="Evidence screenshot" 
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
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-md p-6 cursor-pointer hover:border-gray-500 transition-colors"
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

          {/* Step Description */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Step Description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={stepDescription}
              onChange={(e) => setStepDescription(e.target.value)}
              placeholder="e.g., Clicked the login button"
              className="w-full px-3 py-2 bg-[#001333] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5460ff]"
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about this step..."
              className="w-full px-3 py-2 bg-[#001333] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5460ff]"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            {/* Cancel Button - Only show if onCancel is provided */}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
            
            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isUploading || !screenshotFile || !stepDescription.trim()}
              className="px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] disabled:opacity-50 flex items-center gap-1 ml-auto"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <span>Upload Evidence</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}