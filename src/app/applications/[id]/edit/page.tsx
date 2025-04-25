// src/app/applications/[id]/edit/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useApplicationDetail } from '@/hooks/UseApplications';
import ApplicationForm from '@/components/organisms/applications/ApplicationForm';

export default function EditApplicationPage() {
  const { id } = useParams();
  const { application, isLoading, error } = useApplicationDetail(id as string);
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading application...</div>;
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading application: {error.message}
      </div>
    );
  }
  
  if (!application) {
    return <div className="p-8 text-center">Application not found</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Edit Application: {application.app_name}
      </h1>
      <ApplicationForm initialData={application} isEditing={true} />
    </div>
  );
}