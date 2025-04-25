'use client';

import { useParams } from 'next/navigation';
import { useTestCaseDetail } from '@/hooks/UseTestCases';
import TestCaseForm from '@/components/organisms/test-cases/TestCaseForm';

export default function EditTestCasePage() {
  const { id } = useParams();
  const { testCase, isLoading, error } = useTestCaseDetail(id as string);
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading test case...</div>;
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading test case: {error.message}
      </div>
    );
  }
  
  if (!testCase) {
    return <div className="p-8 text-center">Test case not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Edit Test Case: {testCase.test_title}
      </h1>
      <TestCaseForm initialData={testCase} isEditing={true} />
    </div>
  );
}
