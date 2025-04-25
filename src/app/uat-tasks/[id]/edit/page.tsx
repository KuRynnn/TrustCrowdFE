'use client';

import { useParams } from 'next/navigation';
import { useUATTaskDetail } from '@/hooks/UseUATTasks';
import UATTaskForm from '@/components/organisms/uat-tasks/UATTaskForm';
import { Loader2 } from 'lucide-react';

export default function EditUATTaskPage() {
  const { id } = useParams();
  const { task, isLoading, error } = useUATTaskDetail(id as string);
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
        <p>Loading UAT task...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading UAT task: {error.message}
      </div>
    );
  }
  
  if (!task) {
    return <div className="p-8 text-center">UAT task not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Edit UAT Task: {task.test_case?.test_title || 'N/A'}
      </h1>
      <UATTaskForm initialData={task} isEditing={true} />
    </div>
  );
}
