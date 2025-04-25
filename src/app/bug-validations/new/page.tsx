'use client';

import { useSearchParams } from 'next/navigation';
import BugValidationForm from '@/components/organisms/bug-validation/BugValidationForm';

export default function NewBugValidationPage() {
  const searchParams = useSearchParams();
  const bugReportId = searchParams.get('bug_id');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Validate Bug Report</h1>
      <BugValidationForm bugReportId={bugReportId || undefined} />
    </div>
  );
}
