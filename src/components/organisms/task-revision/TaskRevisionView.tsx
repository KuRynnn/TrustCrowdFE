// src/components/organisms/task-revision/TaskRevisionView.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UATTask } from '@/types/UATTask';
import { useAuth } from '@/context/AuthContext';
import { uatTaskService } from '@/services/UatTaskService';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface TaskRevisionViewProps {
  task: UATTask;
  onRevisionStarted?: () => void;
}

export default function TaskRevisionView({ task, onRevisionStarted }: TaskRevisionViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isStartingRevision, setIsStartingRevision] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle starting the revision
  const handleStartRevision = async () => {
    if (!task || !user || user.role !== 'crowdworker') return;
    
    setIsStartingRevision(true);
    setError(null);
    
    try {
      await uatTaskService.startRevision(task.task_id);
      
      // Either reload the page or notify the parent component
      if (onRevisionStarted) {
        onRevisionStarted();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error("Error starting revision:", err);
      setError(err.message || 'Failed to start revision');
    } finally {
      setIsStartingRevision(false);
    }
  };

  // Don't render anything if no revision is required
  if (!task.revision_status || task.revision_status === 'None') {
    return null;
  }

  return (
    <div className="bg-amber-900/30 border border-amber-700 p-4 rounded-xl shadow-lg mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <AlertTriangle size={24} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-amber-300 mb-2">
            This task requires revision
          </h2>

          {task.revision_comments && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-amber-200 mb-1">QA Specialist Comments:</h3>
              <div className="bg-black/30 p-3 rounded-md text-white whitespace-pre-wrap">
                {task.revision_comments}
              </div>
            </div>
          )}

          <div className="mt-4">
            {task.revision_status === 'Requested' ? (
              <button
                onClick={handleStartRevision}
                disabled={isStartingRevision}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md disabled:opacity-50 flex items-center gap-1"
              >
                {isStartingRevision ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Starting Revision...</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    <span>Start Revision</span>
                  </>
                )}
              </button>
            ) : task.revision_status === 'In Progress' ? (
              <div className="px-4 py-2 bg-amber-800/50 text-amber-300 rounded-md flex items-center gap-1">
                <Clock size={16} />
                <span>Revision in progress</span>
              </div>
            ) : (
              <div className="px-4 py-2 bg-green-800/50 text-green-300 rounded-md flex items-center gap-1">
                <CheckCircle size={16} />
                <span>Revision completed</span>
              </div>
            )}

            {error && (
              <div className="mt-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}