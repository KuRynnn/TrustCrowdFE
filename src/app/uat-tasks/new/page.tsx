'use client';

import { useSearchParams } from 'next/navigation';
import UATTaskForm from '@/components/organisms/uat-tasks/UATTaskForm';

export default function NewUATTaskPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('app_id');
  const testCaseId = searchParams.get('test_id');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Create New UAT Task</h1>
      <UATTaskForm 
        applicationId={applicationId || undefined} 
        testCaseId={testCaseId || undefined} 
      />
    </div>
  );
}
