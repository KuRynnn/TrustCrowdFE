'use client';

import { useParams } from 'next/navigation';
import { useBugValidationDetail } from '@/hooks/UseBugValidations';
import BugValidationForm from '@/components/organisms/bug-validation/BugValidationForm';
import { Loader2 } from 'lucide-react';

export default function EditBugValidationPage() {
  const { id } = useParams();
  const { validation, isLoading, error } = useBugValidationDetail(id as string);
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
        <p>Loading validation...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading validation: {error.message}
      </div>
    );
  }
  
  if (!validation) {
    return <div className="p-8 text-center">Validation not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Edit Bug Validation
      </h1>
      <BugValidationForm initialData={validation} isEditing={true} />
    </div>
  );
}
