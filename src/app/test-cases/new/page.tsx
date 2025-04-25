'use client';

import { useSearchParams } from 'next/navigation';
import TestCaseForm from '@/components/organisms/test-cases/TestCaseForm';

export default function NewTestCasePage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('app_id');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Test Case</h1>
      <TestCaseForm applicationId={applicationId || undefined} />
    </div>
  );
}
